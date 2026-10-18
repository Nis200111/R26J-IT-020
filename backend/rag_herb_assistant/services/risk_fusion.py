"""
Evidence-Grounded Risk Fusion
-----------------------------
Bio-Heritage AI: RAG-Based Sri Lankan Herb Knowledge Assistant

Research problem
    The Random Forest risk classifier scores five categorical inputs
    (herb, condition, medication, age group, dosage form). Its labels were
    produced by a herb-independent scoring rule, so it cannot tell that
    Herb A is recorded as unsafe in pregnancy while Herb B is not.
    Meanwhile the knowledge base (KB) holds exactly that herb-specific
    evidence in its `contraindications` field, but it only reached the LLM
    prompt as free text; it never influenced the risk level.

Contribution
    1. parse_contraindications(): turn the KB's contraindication text into
       structured flags (code, severity, applies-to).
    2. evidence_for_context(): match those flags against the user's own
       health context -> an evidence-based risk level.
    3. fuse(): combine the ML level and the KB evidence under one rule:

           final_level = max(ml_level, kb_evidence_level)

       The ML score may RAISE caution but can never LOWER what a verified
       record says. Where neither source can support an answer, the module
       abstains ("insufficient evidence") instead of guessing.

This is a neuro-symbolic safety layer: statistical model for generalisation,
verified record as the authority. It is an educational research prototype and
does not constitute medical advice.
"""

import re

LEVELS = ["Safe", "Caution", "Contraindicated"]
_RANK = {lvl: i for i, lvl in enumerate(LEVELS)}

# ---------------------------------------------------------------------------
# 1. Parsing: KB statement -> structured flag
# ---------------------------------------------------------------------------
# Each rule: (regex, code, severity, applies_to)
#   applies_to is the user-context value that makes the flag relevant, as
#   (field, value). None means a general adverse-effect note that is not tied
#   to a stated condition (shown as information, never raises the level).
_RULES = [
    (r"avoid during pregnancy",            "pregnancy",       "Contraindicated", ("patient_condition", "pregnancy")),
    (r"caution while breastfeeding",       "breastfeeding",   "Caution",         ("patient_condition", "breastfeeding")),
    (r"caution in chronic kidney disease", "kidney_disease",  "Caution",         ("patient_condition", "kidney disease")),
    (r"caution in liver disease",          "liver_disease",   "Caution",         ("patient_condition", "liver disease")),
    (r"avoid with anticoagulant",          "anticoagulant",   "Contraindicated", ("medication_context", "anticoagulant")),
    (r"interact with antihypertensive",    "antihypertensive","Caution",         ("medication_context", "antihypertensive")),
    (r"enhance the effect of antidiabetic","antidiabetic",    "Caution",         ("medication_context", "antidiabetic")),
    (r"monitor blood sugar",               "blood_sugar",     "Caution",         ("patient_condition", "diabetes")),
    (r"not recommended for children",      "children",        "Contraindicated", ("age_group", "child")),
    (r"avoid immediately before surgery",  "surgery",         "Info",            None),
    (r"gastric irritation",                "gastric",         "Info",            None),
    (r"loose stools",                      "loose_stools",    "Info",            None),
    (r"allergic skin reaction",            "allergy",         "Info",            None),
]
_COMPILED = [(re.compile(p, re.I), c, s, a) for p, c, s, a in _RULES]


def parse_contraindications(text: str):
    """
    Split a KB contraindications string into structured flags.

    Returns (flags, unrecognised). `unrecognised` lists statements no rule
    matched, so coverage can be audited rather than silently assumed.
    """
    flags, unknown = [], []
    for stmt in re.split(r";|\.\s", str(text or "")):
        stmt = stmt.strip(" .")
        if not stmt:
            continue
        matched = False
        for rx, code, sev, applies in _COMPILED:
            if rx.search(stmt):
                flags.append({"code": code, "severity": sev,
                              "applies_to": applies, "text": stmt})
                matched = True
        if not matched:
            unknown.append(stmt)
    return flags, unknown


# ---------------------------------------------------------------------------
# 2. Matching the flags against the user's context
# ---------------------------------------------------------------------------
def evidence_for_context(flags, ctx: dict) -> dict:
    """
    ctx uses the same keys as health_context_checker.build_health_context.

    Returns {level, matched, informational}:
      level         - highest severity among flags that apply to THIS user
      matched       - the flags that apply
      informational - general adverse-effect notes (shown, never escalated)
    """
    matched, info = [], []
    for f in flags:
        if f["applies_to"] is None:
            info.append(f)
            continue
        field, value = f["applies_to"]
        if str(ctx.get(field, "")).strip().lower() == value:
            matched.append(f)

    level = "Safe"
    for f in matched:
        if _RANK.get(f["severity"], 0) > _RANK[level]:
            level = f["severity"]
    return {"level": level, "matched": matched, "informational": info}


# ---------------------------------------------------------------------------
# 3. Fusion and abstention
# ---------------------------------------------------------------------------
def _stated_concerns(ctx: dict):
    """Conditions/medications/age the user stated that could matter."""
    out = []
    if str(ctx.get("patient_condition", "none")) not in ("none", ""):
        out.append(("patient_condition", ctx["patient_condition"]))
    if str(ctx.get("medication_context", "none")) not in ("none", ""):
        out.append(("medication_context", ctx["medication_context"]))
    if str(ctx.get("age_group", "adult")) in ("child", "elderly"):
        out.append(("age_group", ctx["age_group"]))
    return out


def fuse(ml_risk: dict, record: dict, ctx: dict,
         proba_max: float = None, min_confidence: float = 0.55) -> dict:
    """
    Combine the ML risk result with the retrieved record's evidence.

    ml_risk    - output of HerbRAGPipeline.predict_risk()
    record     - the top retrieved KB record (a dict with 'contraindications')
    ctx        - build_health_context() output (what the user told us)
    proba_max  - classifier's top-class probability, if available
    min_confidence - below this, with no KB support, the module abstains

    Decision table (provenance field explains which branch fired):
      kb-override   KB evidence is stricter than the ML level  -> use KB level
      kb-confirmed  KB and ML agree on a non-Safe level        -> keep it
      ml-only       ML flags risk but the record is silent     -> keep ML level,
                    explicitly marked as unsupported by the KB
      abstain       user's context is unscorable (unknown to the classifier)
                    or ML is low-confidence, and the record is silent
                    -> "insufficient evidence", refer to a practitioner
      kb-silent     nothing flagged by either source           -> Safe, with a
                    note that absence of a record is not proof of safety
    """
    flags, unknown = parse_contraindications((record or {}).get("contraindications", ""))
    ev = evidence_for_context(flags, ctx)

    ml_level = ml_risk.get("risk_level", "Caution")
    unscorable = bool(ml_risk.get("unknown_context"))
    kb_level = ev["level"]

    # Unscorable context (e.g. "asthma"): the ML level is a placeholder
    # "Caution", not a prediction. Judge on the record alone.
    if unscorable:
        if ev["matched"]:
            final, prov = kb_level, "kb-confirmed"
        else:
            final, prov = "Caution", "abstain"
    elif _RANK[kb_level] > _RANK[ml_level]:
        final, prov = kb_level, "kb-override"
    elif kb_level != "Safe" and kb_level == ml_level:
        final, prov = ml_level, "kb-confirmed"
    elif ml_level != "Safe" and kb_level == "Safe":
        low_conf = proba_max is not None and proba_max < min_confidence
        if low_conf and _stated_concerns(ctx):
            final, prov = "Caution", "abstain"
        else:
            final, prov = ml_level, "ml-only"
    else:
        final, prov = "Safe", "kb-silent"

    notes = {
        "kb-override": "The knowledge-base record is stricter than the statistical model, so the record's level is used.",
        "kb-confirmed": "The knowledge-base record supports this level.",
        "ml-only": "Raised by the statistical model only; this herb's record does not mention your condition or medication.",
        "abstain": "Insufficient evidence: neither the record nor the model can support a reliable level for your situation. Please consult a qualified practitioner.",
        "kb-silent": "No concern is recorded for your situation. Absence of a record is not proof of safety.",
    }[prov]

    return {
        "risk_level": final,
        "ml_level": ml_level,
        "kb_level": kb_level,
        "provenance": prov,
        "abstained": prov == "abstain",
        "evidence": [f["text"] for f in ev["matched"]],
        "general_notes": [f["text"] for f in ev["informational"]],
        "unrecognised_statements": unknown,
        "explanation": notes,
    }
