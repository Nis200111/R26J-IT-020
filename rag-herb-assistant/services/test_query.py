"""
Interactive command-line tester for the Herb RAG assistant.

Run:  python services/test_query.py

Features:
- Session memory: your health context is collected ONCE and remembered for
  the whole chat, so follow-up questions are never repeated.
- Persistent sessions: that context is also saved to data/session_context.json,
  so it survives closing the program and is reloaded next time you start.
- Every query is logged to data/query_log.csv (timestamp, query, intent, risk)
  for later usage analysis.

Commands:
  profile  - show the health context currently remembered
  reset    - forget the saved health context (this run AND the saved file)
  quit     - exit
"""

import csv
import json
import os
from datetime import datetime

from rag_pipeline import HerbRAGPipeline

_HERE = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.normpath(os.path.join(_HERE, "..", "data", "query_log.csv"))
SESSION_PATH = os.path.normpath(os.path.join(_HERE, "..", "data", "session_context.json"))


# ---------------------------------------------------------------------------
# Persistent session storage
# ---------------------------------------------------------------------------
def load_session():
    """Read the saved health context from disk, or None if there isn't one."""
    if not os.path.exists(SESSION_PATH):
        return None
    try:
        with open(SESSION_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("health_context")
    except (json.JSONDecodeError, OSError):
        # Corrupted or unreadable file - behave as if no session was saved.
        return None


def save_session(ctx):
    """Write the health context to disk so the next run can reuse it."""
    payload = {"saved_at": datetime.now().isoformat(timespec="seconds"),
               "health_context": ctx}
    with open(SESSION_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def clear_session():
    """Delete the saved session file, if it exists."""
    if os.path.exists(SESSION_PATH):
        os.remove(SESSION_PATH)


def describe_context(ctx):
    """One-line human-readable summary of a health context."""
    if not ctx:
        return "(none saved)"
    return (f"age={ctx.get('age_group')}, condition={ctx.get('patient_condition')}, "
            f"medication={ctx.get('medication_context')}, "
            f"dosage form={ctx.get('dosage_form')}")


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
    print("Commands: 'profile' = show saved context, 'reset' = clear it, 'quit' = exit.")

    # Chat memory: reloaded from disk so it survives restarts.
    session_context = load_session()
    last_herb = None  # herb from the previous turn, for "tell me more about that"
    if session_context:
        print(f"\n  [Loaded saved health profile: {describe_context(session_context)}]")
        print("  [Type 'reset' if this is not you.]")
    print()

    while True:
        query = input("You: ").strip()
        if query.lower() in ("quit", "exit", "q", ""):
            print("Goodbye!")
            break
        if query.lower() == "profile":
            print(f"  [Current health context: {describe_context(session_context)}]\n")
            continue
        if query.lower() == "reset":
            session_context = None
            clear_session()
            print("  [Health context cleared from memory and disk. "
                  "You will be asked again next time.]\n")
            continue

        # Pass the remembered context so follow-ups are not repeated, and the
        # last herb so "tell me more about that" works.
        result = pipe.answer_query(query, health_context=session_context,
                                   last_herb=last_herb)

        # Tell the user if we corrected a misspelled herb name.
        if result.get("corrections"):
            for typed, proper in result["corrections"]:
                print(f"\n  [Did you mean '{proper}'? Showing results for '{proper}'.]")

        if result.get("followed_up_on"):
            print(f"\n  [Continuing about {result['followed_up_on']}.]")

        # Off-topic query: answer politely, no questionnaire.
        if result["type"] == "out_of_scope":
            print(f"\nAssistant: {result['answer']}\n")
            log_query(query, None, None, "out_of_scope")
            continue

        # Health context needed and not yet collected -> ask ONCE, then reuse.
        if result["type"] == "need_context":
            print(f"\n  [Intent detected: {result['intent']}]")
            session_context = ask_context_interactively(result["followup_questions"])
            save_session(session_context)   # persist for future runs
            print("  [Saved. You will not be asked again, even after restart.]")
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

        # Remember the top herb so the next turn can say "more about that".
        if result["sources"]:
            last_herb = result["sources"][0]["herb"] or result["sources"][0]["herb_english"]

        log_query(query, result["intent"],
                  risk["risk_level"] if risk else None, result["type"])


if __name__ == "__main__":
    main()
