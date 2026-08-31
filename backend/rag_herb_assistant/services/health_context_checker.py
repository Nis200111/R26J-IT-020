"""
Health-Context-Aware Clarification Module (adaptive version)
------------------------------------------------------------
Bio-Heritage AI: RAG-Based Sri Lankan Herb Knowledge Assistant

This rule-based module decides whether a user query needs personal health
context, and then asks ONLY the follow-up questions that are:
  (a) relevant to the query's intent, and
  (b) not already answered inside the query itself.

This avoids redundant questions (e.g. it will NOT ask "Are you pregnant?"
when the query already says "during pregnancy"), which makes the
clarification behaviour smarter and more responsible.
"""

# ---------------------------------------------------------------------------
# 1. Keywords used to DETECT what the user already told us in their query.
# ---------------------------------------------------------------------------
KNOWN_CONTEXT_KEYWORDS = {
    "pregnancy":   ["pregnant", "pregnancy"],
    "breastfeeding": ["breastfeeding", "breast feeding", "lactating"],
    "diabetes":    ["diabetes", "diabetic", "blood sugar"],
    "hypertension": ["hypertension", "blood pressure"],
    "kidney disease": ["kidney", "renal"],
    "liver disease": ["liver", "hepatic"],
    "heart disease": ["heart", "cardiac"],
    "medication":  ["medication", "medicine", "insulin", "metformin",
                     "warfarin", "blood thinner", "anticoagulant", "tablet", "drug"],
    "age":         ["child", "children", "baby", "infant", "elderly", "old age"],
}

# Any of these words makes an otherwise-general query safety-sensitive.
SAFETY_KEYWORDS = [kw for kws in KNOWN_CONTEXT_KEYWORDS.values() for kw in kws] + [
    "dose", "dosage", "how much", "how many", "safe", "side effect",
    "side-effect", "risk", "contraindication", "interaction", "surgery",
]

SAFETY_SENSITIVE_INTENTS = {"dosage", "contraindication", "herb-disease"}

# ---------------------------------------------------------------------------
# 2. The pool of possible follow-up questions (each has a key).
# ---------------------------------------------------------------------------
QUESTION_POOL = {
    "purpose":     "Are you asking for general knowledge or personal use?",
    "age":         "What is your age group? (child / adult / elderly)",
    "pregnancy":   "Are you pregnant or breastfeeding?",
    "conditions":  "Do you have any conditions such as diabetes, kidney disease, "
                   "liver disease, or hypertension? If yours is not listed, "
                   "choose 'other' and type it in.",
    "medication":  "Are you currently taking any medication? "
                   "(e.g. insulin, metformin, blood thinners — choose 'other' "
                   "to type one that is not listed)",
    "dosage_form": "What dosage form are you considering? "
                   "(herbal tea / powder / capsule / decoction)",
    "herb_or_disease": "Which specific herb or disease are you asking about?",
}

# ---------------------------------------------------------------------------
# 3. Which questions each intent cares about (in order).
# ---------------------------------------------------------------------------
INTENT_QUESTION_PLAN = {
    "dosage":         ["purpose", "age", "pregnancy", "conditions", "medication", "dosage_form"],
    "contraindication": ["age", "pregnancy", "conditions", "medication"],
    "herb-disease":   ["purpose", "age", "conditions", "medication", "herb_or_disease"],
    "herb-property":  ["purpose"],  # only if a safety keyword appeared
}


def detect_known_context(query: str) -> dict:
    """Return {context_name: True} for everything the query already states."""
    q = (query or "").lower()
    found = {}
    for name, kws in KNOWN_CONTEXT_KEYWORDS.items():
        if any(kw in q for kw in kws):
            found[name] = True
    return found


def requires_health_context(query: str, intent: str) -> bool:
    """True if the query needs follow-up health questions first."""
    if intent in SAFETY_SENSITIVE_INTENTS:
        return True
    q = (query or "").lower()
    return any(kw in q for kw in SAFETY_KEYWORDS)


def get_followup_questions(query: str, intent: str) -> list:
    """
    Adaptive: return only the questions that are relevant to the intent AND
    not already answered inside the query.
    """
    if not requires_health_context(query, intent):
        return []

    known = detect_known_context(query)
    plan = INTENT_QUESTION_PLAN.get(intent, ["purpose"])

    questions = []
    for key in plan:
        # Skip a question if the query already gave us that information.
        if key == "pregnancy" and ("pregnancy" in known or "breastfeeding" in known):
            continue
        if key == "age" and "age" in known:
            continue
        if key == "medication" and "medication" in known:
            continue
        if key == "conditions" and any(
            c in known for c in ("diabetes", "hypertension", "kidney disease",
                                 "liver disease", "heart disease")
        ):
            continue
        questions.append(QUESTION_POOL[key])
    return questions


def _clean(value, default):
    """
    Normalise one answer.

    The condition and medication fields can now carry free text typed by a user
    whose situation is not on the dropdown ("Asthma ", "thyroid  disease"), so
    whitespace and case are levelled out here. That keeps "Asthma" and "asthma"
    from looking like two different unknown categories downstream, while still
    leaving the value unrecognised by the classifier's encoders — which is the
    point: predict_risk must be able to tell that it cannot score this.
    """
    text = " ".join(str(value or "").split()).lower()
    return text or default


def build_health_context(answers: dict) -> dict:
    """Map collected answers to the 5 features the risk classifier expects."""
    return {
        "herb_name": answers.get("herb_name", "unknown"),
        "patient_condition": _clean(answers.get("patient_condition"), "none"),
        "medication_context": _clean(answers.get("medication_context"), "none"),
        "age_group": _clean(answers.get("age_group"), "adult"),
        "dosage_form": _clean(answers.get("dosage_form"), "powder"),
    }


if __name__ == "__main__":
    tests = [
        ("What is Gotukola used for?", "herb-property"),
        ("Is Kohomba safe during pregnancy?", "contraindication"),
        ("What is the dosage of Iramusu?", "dosage"),
        ("Which herbs are good for diabetes?", "herb-disease"),
        ("Can I take Gotukola with my diabetes medication?", "contraindication"),
    ]
    for q, intent in tests:
        need = requires_health_context(q, intent)
        print(f"[{intent}] '{q}'")
        print(f"    health context required: {need}")
        if need:
            known = detect_known_context(q)
            if known:
                print(f"    already known from query: {list(known.keys())}")
            for i, question in enumerate(get_followup_questions(q, intent), 1):
                print(f"    {i}. {question}")
        print()
