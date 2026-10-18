"""
Risk-fusion evaluation (no Ollama, no FAISS search needed)
----------------------------------------------------------
Run from backend/rag_herb_assistant/services/ :
    python evaluate_fusion.py

For every herb in the knowledge base and every one of 10 user contexts
(15,500 cases) it compares:
    ML-only  : the Random Forest risk level (the old system)
    Fused    : risk_fusion.fuse()  (the new system)
against an EXPECTED level read directly from the herb's raw
`contraindications` text with an independent keyword rule (not the parser).

Reported honestly:
  * under-warning = predicted level LOWER than expected (the unsafe error)
  * over-warning  = predicted level HIGHER than expected
  * The expected level comes from the same KB the fusion layer reads, so the
    fused result is a CONSISTENCY check by design. The meaningful finding is
    how often the ML-only model under-warns, because it never sees the herb's
    record. Say exactly this in the viva.

Outputs: data/fusion_eval_summary.csv, data/fusion_eval_cases.csv,
         notebooks/fusion_eval.png
"""
import os
import sys
import pickle
import collections

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from rag_pipeline import HerbRAGPipeline, RISK_MODEL_PATH, FEAT_ENC_PATH, \
    TARGET_ENC_PATH, FEAT_COLS_PATH, CSV_PATH
from health_context_checker import build_health_context
from risk_fusion import fuse, LEVELS

RANK = {l: i for i, l in enumerate(LEVELS)}

# 10 user contexts: (label, patient_condition, medication_context, age_group)
CONTEXTS = [
    ("healthy adult", "none", "none", "adult"),
    ("pregnancy", "pregnancy", "none", "adult"),
    ("breastfeeding", "breastfeeding", "none", "adult"),
    ("kidney disease", "kidney disease", "none", "adult"),
    ("liver disease", "liver disease", "none", "adult"),
    ("diabetes", "diabetes", "none", "adult"),
    ("on anticoagulant", "none", "anticoagulant", "adult"),
    ("on antidiabetic", "none", "antidiabetic", "adult"),
    ("on antihypertensive", "none", "antihypertensive", "adult"),
    ("child", "none", "none", "child"),
]

# Independent expected-level rule on the RAW text (keywords, not the parser).
def expected_level(text: str, cond: str, med: str, age: str) -> str:
    t = (text or "").lower()
    lvl = "Safe"
    def up(x):
        nonlocal lvl
        if RANK[x] > RANK[lvl]:
            lvl = x
    if cond == "pregnancy" and "pregnan" in t:
        up("Contraindicated")
    if cond == "breastfeeding" and "breastfeeding" in t:
        up("Caution")
    if cond == "kidney disease" and "kidney" in t:
        up("Caution")
    if cond == "liver disease" and "liver" in t:
        up("Caution")
    if cond == "diabetes" and "blood sugar" in t:
        up("Caution")
    if med == "anticoagulant" and "anticoagulant" in t:
        up("Contraindicated")
    if med == "antidiabetic" and "antidiabetic" in t:
        up("Caution")
    if med == "antihypertensive" and "antihypertensive" in t:
        up("Caution")
    if age == "child" and "children" in t:
        up("Contraindicated")
    return lvl


def load_pipeline_light():
    """Build the pipeline object WITHOUT the embedder/FAISS (not needed here)."""
    p = HerbRAGPipeline.__new__(HerbRAGPipeline)
    with open(RISK_MODEL_PATH, "rb") as f: p.risk_model = pickle.load(f)
    with open(FEAT_ENC_PATH, "rb") as f: p.feature_encoders = pickle.load(f)
    with open(TARGET_ENC_PATH, "rb") as f: p.target_encoder = pickle.load(f)
    with open(FEAT_COLS_PATH, "rb") as f: p.feature_columns = pickle.load(f)
    p._shap_explainer = None
    # Per-case SHAP would take hours over 15,500 cases and is not needed here.
    p._explain_risk = lambda X, pred, ctx: []
    return p


def main():
    pipe = load_pipeline_light()
    kb = pd.read_csv(CSV_PATH, encoding="utf-8-sig").fillna("")
    # Batch scoring: one predict()/predict_proba() call for all 15,500 cases.
    # (Calling the 200-tree forest once per case, with n_jobs=-1, spawns a
    # thread pool every time and takes hours.)
    pipe.risk_model.n_jobs = 1
    cases = []
    for _, rec in kb.iterrows():
        record = rec.to_dict()
        for label, cond, med, age in CONTEXTS:
            hc = {"herb_name": record["herb_name_english"],
                  "patient_condition": cond, "medication_context": med,
                  "age_group": age, "dosage_form": "powder"}
            cases.append((record, label, cond, med, age, build_health_context(hc)))

    enc_rows, unknown = [], []
    for record, label, cond, med, age, ctx in cases:
        row, unk = [], {}
        for col in pipe.feature_columns:
            le = pipe.feature_encoders[col]
            val = ctx.get(col, "none")
            if val not in le.classes_:
                if col != "herb_name":      # same rule as predict_risk
                    unk[col] = val
                val = le.classes_[0]
            row.append(le.transform([val])[0])
        enc_rows.append(row)
        unknown.append(unk)

    X = pd.DataFrame(enc_rows, columns=pipe.feature_columns)
    preds = pipe.risk_model.predict(X)
    probas = pipe.risk_model.predict_proba(X).max(axis=1)
    levels = pipe.target_encoder.inverse_transform(preds)
    print(f"Scored {len(X)} cases in one batch.")

    rows = []
    for (record, label, cond, med, age, ctx), lvl, pm, unk in zip(
            cases, levels, probas, unknown):
        if unk:
            ml = {"risk_level": "Caution", "unknown_context": unk}
        else:
            ml = {"risk_level": lvl, "proba_max": float(pm)}
        fz = fuse(ml, record, ctx, proba_max=ml.get("proba_max"))
        exp = expected_level(record["contraindications"], cond, med, age)
        rows.append({
            "herb_id": record["herb_id"], "context": label, "expected": exp,
            "ml_only": ml["risk_level"], "fused": fz["risk_level"],
            "provenance": fz["provenance"], "abstained": fz["abstained"],
            "proba_max": ml.get("proba_max"),
        })

    df = pd.DataFrame(rows)
    out = []
    for name in ("ml_only", "fused"):
        diff = df[name].map(RANK) - df["expected"].map(RANK)
        unsafe_cases = df["expected"] != "Safe"
        out.append({
            "system": name,
            "cases": len(df),
            "exact_match_%": round(100 * (diff == 0).mean(), 2),
            "under_warning_%": round(100 * (diff < 0).mean(), 2),
            "over_warning_%": round(100 * (diff > 0).mean(), 2),
            "missed_Contraindicated_%": round(100 * (
                (df["expected"] == "Contraindicated") & (diff < 0)).sum()
                / max(1, (df["expected"] == "Contraindicated").sum()), 2),
            "missed_any_risk_%": round(100 * (
                unsafe_cases & (diff < 0)).sum() / max(1, unsafe_cases.sum()), 2),
        })
    summary = pd.DataFrame(out)
    print(summary.to_string(index=False))
    print("\nExpected-level distribution:", df["expected"].value_counts().to_dict())
    print("Fusion provenance:", df["provenance"].value_counts().to_dict())

    # Per-context under-warning for the ML-only model (the headline table).
    df["ml_under"] = df["ml_only"].map(RANK) < df["expected"].map(RANK)
    per_ctx = (df[df["expected"] != "Safe"].groupby("context")["ml_under"]
               .mean().mul(100).round(1))
    print("\nML-only under-warning % by context (cases where KB flags a risk):")
    print(per_ctx.to_string())

    data_dir = os.path.normpath(os.path.join(HERE, "..", "data"))
    nb_dir = os.path.normpath(os.path.join(HERE, "..", "notebooks"))
    summary.to_csv(os.path.join(data_dir, "fusion_eval_summary.csv"), index=False)
    df.to_csv(os.path.join(data_dir, "fusion_eval_cases.csv"), index=False)

    # Simple chart: under-warning by context, ML-only vs fused.
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    flagged = df[df["expected"] != "Safe"].copy()
    flagged["fused_under"] = flagged["fused"].map(RANK) < flagged["expected"].map(RANK)
    g = flagged.groupby("context")[["ml_under", "fused_under"]].mean().mul(100)
    ax = g.plot(kind="barh", figsize=(8, 5), color=["#c0504d", "#4f81bd"])
    ax.set_xlabel("% of KB-flagged cases under-warned")
    ax.set_title("Under-warning: ML-only vs evidence-grounded fusion")
    ax.legend(["ML-only", "Fused"])
    plt.tight_layout()
    plt.savefig(os.path.join(nb_dir, "fusion_eval.png"), dpi=150)
    print("\nSaved summary, cases and chart.")


if __name__ == "__main__":
    main()