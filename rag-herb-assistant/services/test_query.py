"""
Interactive command-line tester for the Herb RAG assistant.

Run:  python services/test_query.py

Features:
- Session memory: your health context is collected ONCE and remembered for
  the whole chat, so follow-up questions are never repeated.
- Type 'reset' to clear your saved health context (e.g. to test a new persona).
- Every query is logged to data/query_log.csv (timestamp, query, intent, risk)
  for later usage analysis.
- Type 'quit' to exit.
"""

import csv
import os
from datetime import datetime

from rag_pipeline import HerbRAGPipeline

_HERE = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.normpath(os.path.join(_HERE, "..", "data", "query_log.csv"))


def log_query(query, intent, risk_level, result_type):
    """Append one row of usage data for later analytics."""
    new_file = not os.path.exists(LOG_PATH)
    with open(LOG_PATH, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(["timestamp", "query", "intent", "risk_level", "result_type"])
        w.writerow([datetime.now().isoformat(timespec="seconds"),
                    query, intent or "", risk_level or "", result_type])


def ask_context_interactively(followups):
    """Show follow-up questions and collect answers from the user (once)."""
    print("\n  I need a few safety details first (asked only once per session):")
    for i, q in enumerate(followups, 1):
        print(f"    {i}. {q}")
    print("\n  (Answer the ones you can; press Enter to skip.)")
    ctx = {}
    ctx["age_group"] = input("  Age group (child/adult/elderly): ").strip() or "adult"
    ctx["patient_condition"] = input("  Condition (none/pregnancy/breastfeeding/diabetes/"
                                     "hypertension/kidney disease/liver disease/heart disease): ").strip() or "none"
    ctx["medication_context"] = input("  Medication (none/antidiabetic/antihypertensive/"
                                      "anticoagulant/antibiotics): ").strip() or "none"
    ctx["dosage_form"] = input("  Dosage form (herbal tea/powder/capsule/decoction): ").strip() or "powder"
    return ctx


def main():
    print("Loading the assistant (first run may take a few seconds)...")
    pipe = HerbRAGPipeline()
    print("Ready! Ask a question about Sri Lankan medicinal herbs.")
    print("Commands: 'reset' = clear saved health context, 'quit' = exit.\n")

    session_context = None  # <-- chat memory: remembered across questions

    while True:
        query = input("You: ").strip()
        if query.lower() in ("quit", "exit", "q", ""):
            print("Goodbye!")
            break
        if query.lower() == "reset":
            session_context = None
            print("  [Health context cleared. You will be asked again next time.]\n")
            continue

        # Pass the remembered context so follow-ups are not repeated.
        result = pipe.answer_query(query, health_context=session_context)

        # Tell the user if we corrected a misspelled herb name.
        if result.get("corrections"):
            for typed, proper in result["corrections"]:
                print(f"\n  [Did you mean '{proper}'? Showing results for '{proper}'.]")

        # Off-topic query: answer politely, no questionnaire.
        if result["type"] == "out_of_scope":
            print(f"\nAssistant: {result['answer']}\n")
            log_query(query, None, None, "out_of_scope")
            continue

        # Health context needed and not yet collected -> ask ONCE, then reuse.
        if result["type"] == "need_context":
            print(f"\n  [Intent detected: {result['intent']}]")
            session_context = ask_context_interactively(result["followup_questions"])
            result = pipe.answer_query(query, health_context=session_context)

        risk = result.get("risk")
        print("\n" + "=" * 60)
        print(f"Intent      : {result['intent']}")
        if risk:
            print(f"Risk level  : {risk['risk_level']} "
                  f"(factors: {', '.join(risk['top_factors'])})")
            if risk.get("warning"):
                print(f"  WARNING   : {risk['warning']}")
        print(f"\nAnswer:\n{result['answer']}")
        print("\nSources:")
        for s in result["sources"]:
            # Sinhala name first, then English / Latin.
            name = s["herb"] or s["herb_english"]
            others = ", ".join(x for x in (s["herb_english"], s["herb_latin"]) if x)
            label = f"{name} ({others})" if others else name
            print(f"   - {label}  [{s['source']} | {s['source_type']}]  "
                  f"score={s['score']}")
        print("=" * 60 + "\n")

        log_query(query, result["intent"],
                  risk["risk_level"] if risk else None, result["type"])


if __name__ == "__main__":
    main()
