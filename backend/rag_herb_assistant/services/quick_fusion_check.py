"""
Quick check that risk fusion works inside the real pipeline.
Run from services/ :   python quick_fusion_check.py
"""
import json
import warnings
warnings.filterwarnings("ignore")

from rag_pipeline import HerbRAGPipeline

pipe = HerbRAGPipeline()

def ctx(cond="none", med="none", age="adult"):
    return {"patient_condition": cond, "medication_context": med,
            "age_group": age, "dosage_form": "herbal tea"}

cases = [
    # herb record says "Avoid during pregnancy" -> expect Contraindicated, kb-override
    ("Is Wadakaha safe during pregnancy?", ctx("pregnancy")),
    # Kohomba's record does NOT mention pregnancy -> expect Caution, ml-only
    ("Is Kohomba safe during pregnancy?", ctx("pregnancy")),
    # record says "Avoid with anticoagulant medication" -> expect Contraindicated
    ("Can I take Polpala? I take warfarin.", ctx("none", "anticoagulant")),
    # condition the classifier does not know -> expect abstain
    ("Can I take Gotukola? I have asthma.", ctx("asthma")),
]

for query, c in cases:
    out = pipe.answer_query(query, health_context=c)
    risk = out.get("risk") or {}
    fusion = risk.get("fusion") or {}
    print("=" * 70)
    print("QUERY       :", query)
    print("FINAL LEVEL :", risk.get("risk_level"))
    print("ML ONLY     :", risk.get("ml_risk_level"))
    print("PROVENANCE  :", fusion.get("provenance"))
    print("EVIDENCE    :", fusion.get("evidence"))
    print("EXPLANATION :", fusion.get("explanation"))
