"""
Tests for risk_fusion.py. Run from the services/ folder:
    python test_risk_fusion.py
Needs only pandas; no models, index or Ollama.
"""
import os
import pandas as pd
from risk_fusion import parse_contraindications, fuse

CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data",
                   "sri_lankan_herb_knowledge_base.csv")
kb = pd.read_csv(CSV, encoding="utf-8-sig").fillna("")


def ctx(cond="none", med="none", age="adult"):
    return {"patient_condition": cond, "medication_context": med,
            "age_group": age, "dosage_form": "powder", "herb_name": "x"}


def ml(level, unknown=None):
    r = {"risk_level": level}
    if unknown:
        r["unknown_context"] = unknown
    return r


def rec_with(flag_text):
    return {"contraindications": flag_text}


def test_parser_covers_entire_kb():
    unknown = set()
    for t in kb["contraindications"]:
        _, u = parse_contraindications(t)
        unknown.update(u)
    assert not unknown, f"Unparsed statements: {unknown}"


def test_override_ml_safe_when_kb_says_avoid_pregnancy():
    r = fuse(ml("Safe"), rec_with("Avoid during pregnancy unless advised by a qualified practitioner"),
             ctx(cond="pregnancy"))
    assert r["risk_level"] == "Contraindicated" and r["provenance"] == "kb-override"


def test_same_context_different_herb_gives_different_risk():
    a = fuse(ml("Caution"), rec_with("Avoid during pregnancy unless advised by a qualified practitioner"),
             ctx(cond="pregnancy"))
    b = fuse(ml("Caution"), rec_with("Prolonged high-dose use may cause loose stools"),
             ctx(cond="pregnancy"))
    assert a["risk_level"] != b["risk_level"]


def test_kb_never_lowered_by_ml():
    r = fuse(ml("Safe"), rec_with("Avoid with anticoagulant medication"), ctx(med="anticoagulant"))
    assert r["risk_level"] == "Contraindicated"


def test_children_flag():
    r = fuse(ml("Safe"), rec_with("Not recommended for children under 5 years"), ctx(age="child"))
    assert r["risk_level"] == "Contraindicated"


def test_unrelated_flag_does_not_escalate():
    r = fuse(ml("Safe"), rec_with("Use with caution in liver disease"), ctx(cond="pregnancy"))
    assert r["risk_level"] == "Safe"


def test_ml_only_is_labelled_unsupported():
    r = fuse(ml("Caution"), rec_with("Avoid immediately before surgery"), ctx(cond="diabetes"))
    assert r["risk_level"] == "Caution" and r["provenance"] == "ml-only"


def test_unknown_condition_abstains_when_record_silent():
    r = fuse(ml("Caution", unknown={"patient_condition": "asthma"}),
             rec_with("May cause gastric irritation in high doses"), ctx(cond="asthma"))
    assert r["abstained"] and r["provenance"] == "abstain"


def test_low_confidence_abstains_only_with_stated_concerns():
    r = fuse(ml("Caution"), rec_with("May cause gastric irritation in high doses"),
             ctx(cond="diabetes"), proba_max=0.4)
    assert r["abstained"]
    r2 = fuse(ml("Caution"), rec_with("May cause gastric irritation in high doses"),
              ctx(), proba_max=0.4)
    assert not r2["abstained"]


def test_general_notes_never_escalate():
    r = fuse(ml("Safe"), rec_with("Avoid immediately before surgery; May cause allergic skin reaction in sensitive individuals"),
             ctx())
    assert r["risk_level"] == "Safe" and len(r["general_notes"]) == 2


if __name__ == "__main__":
    tests = [v for k, v in dict(globals()).items() if k.startswith("test_")]
    for t in tests:
        t()
        print("PASS", t.__name__)
    print(f"\n{len(tests)} tests passed")
