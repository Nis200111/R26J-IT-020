"""
RAG Pipeline - the core "brain" of the assistant
------------------------------------------------
Bio-Heritage AI: RAG-Based Sri Lankan Herb Knowledge Assistant

This module connects every component into one pipeline:

  user query
     -> 1. SVM intent classification
     -> 2. health-context requirement check (+ follow-up questions)
     -> 3. FAISS semantic retrieval
     -> 4. herb relevance re-ranking
     -> 5. contraindication risk classification (Random Forest)
     -> 6. grounded answer generation with Llama 3.2 via Ollama

It loads all the artifacts produced by notebooks 01-04. The Streamlit app
(Day 5) imports this module, so all the logic lives in one place.
"""

import os
import json
import pickle

import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer

from health_context_checker import (
    requires_health_context,
    get_followup_questions,
    build_health_context,
)

# ---------------------------------------------------------------------------
# Paths (resolved relative to this file, so it works from anywhere)
# ---------------------------------------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
_BASE = os.path.normpath(os.path.join(_HERE, ".."))
INDEX_PATH = os.path.join(_BASE, "indexes", "sl_herb_faiss.index")
META_PATH = os.path.join(_BASE, "indexes", "herb_metadata.pkl")
INTENT_MODEL_PATH = os.path.join(_BASE, "models", "intent_classifier.pkl")
RISK_MODEL_PATH = os.path.join(_BASE, "models", "herb_risk_random_forest_model.pkl")
FEAT_ENC_PATH = os.path.join(_BASE, "models", "feature_label_encoders.pkl")
TARGET_ENC_PATH = os.path.join(_BASE, "models", "target_label_encoder.pkl")
FEAT_COLS_PATH = os.path.join(_BASE, "models", "feature_columns.pkl")

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
OLLAMA_MODEL = "llama3.2"

FALLBACK_ANSWER = ("Verified information is not available in the current "
                   "knowledge base for this question.")


class HerbRAGPipeline:
    def __init__(self):
        # Embedding model + FAISS index
        self.embedder = SentenceTransformer(EMBED_MODEL_NAME)
        self.index = faiss.read_index(INDEX_PATH)
        with open(META_PATH, "rb") as f:
            self.metadata = pickle.load(f)

        # Intent classifier
        with open(INTENT_MODEL_PATH, "rb") as f:
            self.intent_model = pickle.load(f)

        # Contraindication risk classifier + encoders
        with open(RISK_MODEL_PATH, "rb") as f:
            self.risk_model = pickle.load(f)
        with open(FEAT_ENC_PATH, "rb") as f:
            self.feature_encoders = pickle.load(f)
        with open(TARGET_ENC_PATH, "rb") as f:
            self.target_encoder = pickle.load(f)
        with open(FEAT_COLS_PATH, "rb") as f:
            self.feature_columns = pickle.load(f)

    # ----- 1. Intent -------------------------------------------------------
    def classify_intent(self, query: str) -> str:
        return self.intent_model.predict([query])[0]

    # ----- 2. Health context ----------------------------------------------
    def needs_health_context(self, query: str, intent: str) -> bool:
        return requires_health_context(query, intent)

    def followup_questions(self, query: str, intent: str) -> list:
        return get_followup_questions(query, intent)

    # ----- 3. Retrieval ----------------------------------------------------
    def retrieve(self, query: str, k: int = 8) -> list:
        q_emb = self.embedder.encode(
            [query], convert_to_numpy=True, normalize_embeddings=True
        ).astype("float32")
        scores, idxs = self.index.search(q_emb, k)
        results = []
        for score, i in zip(scores[0], idxs[0]):
            rec = dict(self.metadata[i])
            rec["semantic_score"] = float(score)
            results.append(rec)
        return results

    # ----- 4. Re-ranking ---------------------------------------------------
    def rerank(self, query: str, candidates: list, top_n: int = 4) -> list:
        """Boost candidates whose herb name / uses / properties overlap the query."""
        q_tokens = set(query.lower().split())
        for c in candidates:
            text = " ".join([
                str(c.get("herb_name_english", "")),
                str(c.get("herb_name_sinhala", "")),
                str(c.get("treatment_for", "")),
                str(c.get("medical_properties", "")),
            ]).lower()
            overlap = sum(1 for t in q_tokens if len(t) > 2 and t in text)
            c["rerank_score"] = c["semantic_score"] + 0.1 * overlap
        ranked = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
        return ranked[:top_n]

    # ----- 5. Risk classification -----------------------------------------
    def predict_risk(self, health_context: dict) -> dict:
        """health_context has the 5 feature keys. Returns risk level + top factors."""
        ctx = build_health_context(health_context)
        row = []
        for col in self.feature_columns:
            le = self.feature_encoders[col]
            val = ctx.get(col, "none")
            # unseen category -> fall back to the first known class
            if val not in le.classes_:
                val = le.classes_[0]
            row.append(le.transform([val])[0])
        X = pd.DataFrame([row], columns=self.feature_columns)
        pred = self.risk_model.predict(X)[0]
        level = self.target_encoder.inverse_transform([pred])[0]

        # simple explanation via feature importance for this prediction
        importances = self.risk_model.feature_importances_
        order = np.argsort(importances)[::-1]
        top_factors = [self.feature_columns[i] for i in order[:2]]
        return {"risk_level": level, "top_factors": top_factors}

    # ----- 6. Answer generation -------------------------------------------
    def _build_prompt(self, query, records, health_context, risk):
        context_text = "\n\n".join(
            f"Herb: {r.get('herb_name_english')} ({r.get('herb_name_sinhala')})\n"
            f"Used for: {r.get('treatment_for')}\n"
            f"Dosage: {r.get('dosage')}\n"
            f"Contraindications: {r.get('contraindications')}\n"
            f"Properties: {r.get('medical_properties')}\n"
            f"Source: {r.get('source')}"
            for r in records
        )
        safety = ""
        if risk:
            safety = (f"\nSafety risk level for this user context: {risk['risk_level']} "
                      f"(main factors: {', '.join(risk['top_factors'])}).")
        return (
            "You are a Sri Lankan medicinal herb knowledge assistant.\n"
            "Answer the user's question ONLY using the herb records provided below.\n"
            "If the answer is not in the records, reply exactly: "
            f"\"{FALLBACK_ANSWER}\"\n"
            "Always add a short safety note telling the user to consult a qualified "
            "Ayurvedic or medical practitioner for personal use.\n\n"
            f"=== HERB RECORDS ===\n{context_text}\n{safety}\n\n"
            f"=== USER QUESTION ===\n{query}\n\n=== ANSWER ==="
        )

    def generate_answer(self, query, records, health_context=None, risk=None) -> str:
        prompt = self._build_prompt(query, records, health_context, risk)
        try:
            import ollama
            resp = ollama.chat(
                model=OLLAMA_MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp["message"]["content"].strip()
        except Exception as e:
            # Fallback so the app still works without Ollama installed/running.
            top = records[0] if records else None
            if not top:
                return FALLBACK_ANSWER
            note = ("\n\n[Note: Llama 3.2 / Ollama is not available, so this is a "
                    "template answer built directly from the retrieved records.]")
            return (
                f"Based on the knowledge base, {top.get('herb_name_english')} "
                f"({top.get('herb_name_sinhala')}) is traditionally used for: "
                f"{top.get('treatment_for')}. Dosage: {top.get('dosage')} "
                f"Please consult a qualified Ayurvedic or medical practitioner "
                f"before personal use." + note
            )

    # ----- Orchestrator ----------------------------------------------------
    def answer_query(self, query, health_context=None):
        """
        Full pipeline. If the query needs health context and none is supplied,
        returns the follow-up questions instead of a final answer.
        """
        intent = self.classify_intent(query)
        needs_ctx = self.needs_health_context(query, intent)

        if needs_ctx and health_context is None:
            return {
                "type": "need_context",
                "intent": intent,
                "followup_questions": self.followup_questions(query, intent),
            }

        candidates = self.retrieve(query, k=8)
        records = self.rerank(query, candidates, top_n=4)

        risk = None
        if needs_ctx and health_context is not None:
            hc = dict(health_context)
            hc.setdefault("herb_name", records[0].get("herb_name_english", "unknown"))
            risk = self.predict_risk(hc)

        answer = self.generate_answer(query, records, health_context, risk)
        return {
            "type": "answer",
            "intent": intent,
            "answer": answer,
            "risk": risk,
            "sources": [
                {"herb": r.get("herb_name_english"), "source": r.get("source"),
                 "score": round(r.get("rerank_score", 0), 3)}
                for r in records
            ],
        }


if __name__ == "__main__":
    print("Loading pipeline (first run downloads the embedding model)...")
    pipe = HerbRAGPipeline()
    print("Loaded.\n")

    # 1) General query -> should answer directly
    print(">>> Query: 'What is Gotukola used for?'")
    out = pipe.answer_query("What is Gotukola used for?")
    print(json.dumps(out, indent=2)[:1200], "\n")

    # 2) Safety query with no context -> should ask follow-ups
    print(">>> Query: 'Is Kohomba safe during pregnancy?' (no context yet)")
    out = pipe.answer_query("Is Kohomba safe during pregnancy?")
    print(json.dumps(out, indent=2), "\n")

    # 3) Same query WITH health context -> should answer + risk level
    print(">>> Same query WITH health context provided")
    ctx = {"patient_condition": "pregnancy", "medication_context": "none",
           "age_group": "adult", "dosage_form": "herbal tea"}
    out = pipe.answer_query("Is Kohomba safe during pregnancy?", health_context=ctx)
    print(json.dumps(out, indent=2)[:1500])
