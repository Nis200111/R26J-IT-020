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
import re
import json
import pickle
import difflib

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

# Words that must never be "corrected" into a herb name.
_STOPWORDS = {
    "what", "which", "where", "when", "about", "used", "uses", "using", "safe",
    "safety", "dose", "doses", "dosage", "take", "taking", "want", "know",
    "tell", "give", "good", "best", "help", "helps", "with", "from", "this",
    "that", "there", "they", "have", "has", "does", "doing", "your", "you",
    "can", "could", "should", "would", "herb", "herbs", "herbal", "plant",
    "plants", "medicine", "medicinal", "medication", "treatment", "disease",
    "diseases", "during", "while", "pregnant", "pregnancy", "breastfeeding",
    "diabetes", "diabetic", "kidney", "liver", "heart", "blood", "pressure",
    "child", "children", "adult", "elderly", "properties", "property",
    "contraindication", "contraindications", "side", "effects", "please",
    "the", "and", "for", "are", "is", "of", "in", "on", "to", "a", "an", "i",
}


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

        # Herb-name lexicon for spelling correction (Sinhala/English/Latin).
        # Sinhala herb names have many romanised spellings (Kohomba / Kohoba),
        # so we fuzzy-match query words against every known name.
        self._lexicon = {}       # lowercase name -> original name
        self._name_index = {}    # lowercase name -> [positions in metadata]
        for pos, rec in enumerate(self.metadata):
            for key in ("herb_name_sinhala", "herb_name_english", "herb_name_latin"):
                name = str(rec.get(key, "")).strip()
                if len(name) >= 4:
                    self._lexicon.setdefault(name.lower(), name)
                    self._name_index.setdefault(name.lower(), []).append(pos)
            for syn in str(rec.get("synonyms", "")).split(";"):
                syn = syn.strip()
                if len(syn) >= 4:
                    self._lexicon.setdefault(syn.lower(), syn)
                    self._name_index.setdefault(syn.lower(), []).append(pos)

    # ----- 0. Herb-name spelling correction --------------------------------
    HERB_MATCH_CUTOFF = 0.75  # similarity needed to accept a correction

    def correct_herb_names(self, query: str):
        """
        Fuzzy-match query words against the herb lexicon and fix misspellings
        (e.g. "kohoba" -> "Kohomba"). Returns (corrected_query, corrections)
        where corrections is a list of (typed_word, corrected_name).

        A word is only corrected when it is not already a known name, is not a
        common English/medical word, and is similar enough to exactly one herb.
        """
        words = re.findall(r"[A-Za-z]+", query)
        corrections = []
        corrected = query

        for w in words:
            wl = w.lower()
            if len(wl) < 4 or wl in _STOPWORDS or wl in self._lexicon:
                continue
            match = difflib.get_close_matches(
                wl, self._lexicon.keys(), n=1, cutoff=self.HERB_MATCH_CUTOFF
            )
            if match:
                proper = self._lexicon[match[0]]
                corrections.append((w, proper))
                corrected = re.sub(rf"\b{re.escape(w)}\b", proper, corrected)

        return corrected, corrections

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

    def lookup_by_name(self, query: str) -> list:
        """
        Hybrid (lexical) retrieval: return records for any herb explicitly
        named in the query.

        Pure semantic search can miss the named herb entirely -- in
        "Is Kohomba safe during pregnancy?" the words "safe during pregnancy"
        dominate the embedding and every herb has similar safety text, so the
        Kohomba record can fall outside the top-k. Looking the name up directly
        guarantees it reaches the re-ranker.
        """
        q_lower = query.lower()
        q_emb = self.embedder.encode(
            [query], convert_to_numpy=True, normalize_embeddings=True
        ).astype("float32")[0]

        hits, seen = [], set()
        for name, positions in self._name_index.items():
            if re.search(rf"\b{re.escape(name)}\b", q_lower):
                for pos in positions:
                    if pos in seen:
                        continue
                    seen.add(pos)
                    rec = dict(self.metadata[pos])
                    # true cosine score, so it ranks fairly against FAISS hits
                    vec = self.index.reconstruct(int(pos))
                    rec["semantic_score"] = float(np.dot(q_emb, vec))
                    hits.append(rec)
        return hits

    # ----- 4. Re-ranking ---------------------------------------------------
    def rerank(self, query: str, candidates: list, top_n: int = 4) -> list:
        """
        Re-order retrieved records by relevance to the query:
        - a strong boost when the query names this herb exactly, so a named
          herb always outranks merely similar ones;
        - a smaller boost for word overlap with uses / properties.
        """
        q_lower = query.lower()
        q_tokens = set(q_lower.split())
        for c in candidates:
            names = [str(c.get(k, "")).lower()
                     for k in ("herb_name_english", "herb_name_sinhala", "herb_name_latin")]
            name_hit = any(n and n in q_lower for n in names)

            text = " ".join(names + [
                str(c.get("treatment_for", "")),
                str(c.get("medical_properties", "")),
            ]).lower()
            overlap = sum(1 for t in q_tokens if len(t) > 2 and t in text)

            c["rerank_score"] = (c["semantic_score"]
                                 + (0.5 if name_hit else 0.0)
                                 + 0.1 * overlap)
        ranked = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
        return ranked[:top_n]

    # ----- 5. Risk classification -----------------------------------------
    def predict_risk(self, health_context: dict) -> dict:
        """
        health_context has the 5 feature keys. Returns risk level + top factors.

        Responsible-AI behaviour: if the user gives a condition/medication/age
        the model was never trained on (e.g. "cancer"), we do NOT silently map
        it to a known class. Instead we return "Caution" with an honest warning,
        because predicting on unknown input would be misleading in a
        safety-critical domain.
        """
        ctx = build_health_context(health_context)
        row = []
        unknown_inputs = {}
        for col in self.feature_columns:
            le = self.feature_encoders[col]
            val = ctx.get(col, "none")
            if val not in le.classes_:
                # herb_name has 1000+ classes; an unseen herb is not a safety
                # problem, so only flag the true safety features.
                if col != "herb_name":
                    unknown_inputs[col] = val
                val = le.classes_[0]
            row.append(le.transform([val])[0])

        if unknown_inputs:
            details = ", ".join(f"{k}='{v}'" for k, v in unknown_inputs.items())
            return {
                "risk_level": "Caution",
                "top_factors": list(unknown_inputs.keys()),
                "warning": (
                    f"The value(s) {details} are outside the system's training "
                    f"data, so an accurate risk prediction is not possible. "
                    f"Defaulting to 'Caution' — please consult a qualified "
                    f"medical or Ayurvedic practitioner."
                ),
            }

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
            f"Herb (Sinhala): {r.get('herb_name_sinhala')}\n"
            f"English name: {r.get('herb_name_english')}\n"
            f"Latin name: {r.get('herb_name_latin')}\n"
            f"Used for: {r.get('treatment_for')}\n"
            f"Dosage: {r.get('dosage')}\n"
            f"Contraindications: {r.get('contraindications')}\n"
            f"Properties: {r.get('medical_properties')}\n"
            f"Source: {r.get('source')} (type: {r.get('source_type')})"
            for r in records
        )
        safety = ""
        if risk:
            safety = (f"\nSafety risk level for this user context: {risk['risk_level']} "
                      f"(main factors: {', '.join(risk['top_factors'])}).")
        return (
            "You are a Sri Lankan medicinal herb knowledge assistant.\n"
            "Answer the user's question ONLY using the herb records provided below.\n"
            "Always name a herb with its SINHALA name first, followed by the "
            "English and Latin names in brackets, "
            "for example: 'Kohomba (English: Neem, Latin: Azadirachta indica)'.\n"
            "STRICT GROUNDING RULES:\n"
            "1. Every medical claim you make must be copied from the records. "
            "Do NOT add reasons, mechanisms, or effects that are not written "
            "there (for example, do not explain WHY a herb is unsafe unless the "
            "records say so).\n"
            "2. If the records do not mention the specific condition asked "
            "about, say exactly: 'The knowledge base does not record any "
            "specific contraindication for this condition.' Then list only the "
            "contraindications that ARE recorded, word for word.\n"
            "3. Never conclude that a herb is safe or unsafe for a condition "
            "that the records do not mention. Say the information is not "
            "recorded and refer the user to a practitioner.\n"
            "4. If the records are about completely different herbs than the "
            f"one asked about, reply exactly: \"{FALLBACK_ANSWER}\"\n"
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
                f"Based on the knowledge base, {top.get('herb_name_sinhala')} "
                f"(English: {top.get('herb_name_english')}) is traditionally used for: "
                f"{top.get('treatment_for')}. Dosage: {top.get('dosage')} "
                f"Please consult a qualified Ayurvedic or medical practitioner "
                f"before personal use." + note
            )

    # ----- Orchestrator ----------------------------------------------------
    OUT_OF_SCOPE_THRESHOLD = 0.30  # top FAISS score below this = not a herb question

    def is_out_of_scope(self, query: str) -> bool:
        """Greetings/off-topic queries retrieve nothing relevant (low score)."""
        top = self.retrieve(query, k=1)
        return (not top) or top[0]["semantic_score"] < self.OUT_OF_SCOPE_THRESHOLD

    def answer_query(self, query, health_context=None):
        """
        Full pipeline. If the query needs health context and none is supplied,
        returns the follow-up questions instead of a final answer.
        """
        # Fix misspelled herb names first ("kohoba" -> "Kohomba"), otherwise
        # semantic search has no correct name to anchor on.
        query, corrections = self.correct_herb_names(query)

        # Out-of-scope check BEFORE intent/health-context, so greetings like
        # "how are u?" don't trigger the safety questionnaire.
        if self.is_out_of_scope(query):
            return {
                "type": "out_of_scope",
                "intent": None,
                "corrections": corrections,
                "answer": ("I'm a Sri Lankan medicinal herb knowledge assistant. "
                           "Please ask me about herbs, their uses, dosage, "
                           "properties, or safety — for example: "
                           "'What is Gotukola used for?'"),
                "risk": None,
                "sources": [],
            }

        intent = self.classify_intent(query)
        needs_ctx = self.needs_health_context(query, intent)

        if needs_ctx and health_context is None:
            return {
                "type": "need_context",
                "intent": intent,
                "corrections": corrections,
                "followup_questions": self.followup_questions(query, intent),
            }

        # Hybrid retrieval: semantic (FAISS) + lexical (exact herb-name lookup),
        # so a herb named in the query can never be missed.
        candidates = self.retrieve(query, k=8)
        seen_ids = {c.get("herb_id") for c in candidates}
        for rec in self.lookup_by_name(query):
            if rec.get("herb_id") not in seen_ids:
                seen_ids.add(rec.get("herb_id"))
                candidates.append(rec)

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
            "corrections": corrections,
            "answer": answer,
            "risk": risk,
            "sources": [
                {"herb": r.get("herb_name_sinhala"),
                 "herb_english": r.get("herb_name_english"),
                 "herb_latin": r.get("herb_name_latin"),
                 "source": r.get("source"),
                 "source_type": r.get("source_type"),
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
