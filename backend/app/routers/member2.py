"""
Member 2 - Health-Context-Aware RAG Sri Lankan Herb Knowledge Assistant.

Wraps the pipeline in ../../rag_herb_assistant/services/ and exposes it at
/api/member2. Unlike member1/member3 (image in, one prediction out), this is a
conversational endpoint with a two-step flow:

  1. POST /api/member2/ask with a query.
     - If the question is safety-sensitive, the reply has needsContext=true and
       carries the follow-up questions to show the user.
  2. POST the same query again with healthContext filled in to get the answer,
     its risk level, and the sources.

The pipeline is loaded lazily on the first request (it pulls in
sentence-transformers, a FAISS index and a Random Forest), so the backend and
the other members' endpoints still start instantly.
"""

import os
import sys
import threading

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# The RAG code keeps its own folder layout (indexes/, models/, data/ are found
# relative to services/), so we add that folder to sys.path instead of moving
# files around. This also means the notebooks and services/test_query.py keep
# working exactly as before.
SERVICES_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "rag_herb_assistant", "services")
)
if SERVICES_DIR not in sys.path:
    sys.path.insert(0, SERVICES_DIR)

_pipeline = None
_pipeline_error = None
_lock = threading.Lock()


def get_pipeline():
    """
    Build the pipeline once, on first use. Thread-safe.

    A failed load is retried on the next request rather than cached forever:
    the usual cause is a missing artifact (the FAISS index and .pkl models are
    git-ignored, so they go missing after a fresh clone or a branch switch).
    Once the files are back, the next request recovers on its own instead of
    needing the whole backend restarted. Failures are fast, so retrying costs
    little.
    """
    global _pipeline, _pipeline_error
    if _pipeline is not None:
        return _pipeline
    with _lock:
        if _pipeline is None:
            try:
                from rag_pipeline import HerbRAGPipeline
                _pipeline = HerbRAGPipeline()
                _pipeline_error = None
            except Exception as e:
                _pipeline_error = str(e)
    return _pipeline


class HealthContext(BaseModel):
    age_group: str = "adult"
    patient_condition: str = "none"
    medication_context: str = "none"
    dosage_form: str = "powder"


class AskRequest(BaseModel):
    query: str
    healthContext: HealthContext | None = None
    lastHerb: str | None = None


@router.get("/health")
def health():
    """Report whether the model files loaded, without forcing a load."""
    return {
        "loaded": _pipeline is not None,
        "error": _pipeline_error,
    }


@router.post("/ask")
async def ask(body: AskRequest):
    pipe = get_pipeline()
    if pipe is None:
        return {"error": True, "message": f"Assistant unavailable: {_pipeline_error}"}

    query = (body.query or "").strip()
    if not query:
        return {"error": True, "message": "Please enter a question."}

    try:
        ctx = body.healthContext.model_dump() if body.healthContext else None
        result = pipe.answer_query(query, health_context=ctx, last_herb=body.lastHerb)

        # The pipeline stopped to ask for health context.
        if result["type"] == "need_context":
            return {
                "error": False,
                "needsContext": True,
                "intent": result["intent"],
                "followupQuestions": result["followup_questions"],
                "corrections": result.get("corrections") or [],
            }

        risk = result.get("risk")
        return {
            "error": False,
            "needsContext": False,
            "outOfScope": result["type"] == "out_of_scope",
            "intent": result["intent"],
            "answer": result["answer"],
            "riskLevel": risk["risk_level"] if risk else None,
            "riskFactors": risk["top_factors"] if risk else [],
            "riskWarning": risk.get("warning") if risk else None,
            # Per-prediction SHAP contributions: [{feature, value, impact}]
            "riskExplanation": risk.get("explanation", []) if risk else [],
            "corrections": result.get("corrections") or [],
            "followedUpOn": result.get("followed_up_on"),
            "sources": [
                {
                    "herb": s["herb"],
                    "herbEnglish": s["herb_english"],
                    "herbLatin": s["herb_latin"],
                    "source": s["source"],
                    "sourceType": s["source_type"],
                    "score": s["score"],
                }
                for s in result.get("sources", [])
            ],
        }
    except Exception as e:
        return {"error": True, "message": f"Request failed: {str(e)}"}
