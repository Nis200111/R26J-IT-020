"""
Score the saved evaluation set with the REAL ragas library.

Why this is a standalone script and not a notebook cell
-------------------------------------------------------
`ragas` cannot be installed into this project's main Python (3.14) - several of
its dependencies have no CPython 3.14 wheels. So it lives in a separate 3.11
virtual environment, and this script is what runs there.

That works because Phase A of 05_rag_evaluation.ipynb already saved every
question, answer and retrieved context to data/rag_eval_dataset.csv. This script
only has to read that file and score it, so it needs none of the project's heavy
machinery - no FAISS, no pipeline, no .pkl models.

Setup (once)
------------
    py -3.11 -m venv .venv-ragas
    .venv-ragas\\Scripts\\pip install ragas langchain-ollama langchain-huggingface pandas

Run (with Ollama running)
-------------------------
    .venv-ragas\\Scripts\\python backend\\rag_herb_assistant\\notebooks\\run_real_ragas.py

Expect this to take 1-3 hours: every metric asks the local Llama several
questions per row, and a 3B model on CPU is slow. Results are written to
data/ragas_official_results.csv so a crash does not lose the run.
"""

import json
import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "..", "data"))
EVAL_CSV = os.path.join(DATA, "rag_eval_dataset.csv")
OUT_CSV = os.path.join(DATA, "ragas_official_results.csv")

JUDGE_MODEL = "llama3.2"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def main():
    if not os.path.exists(EVAL_CSV):
        sys.exit(f"Missing {EVAL_CSV}. Run Phase A of 05_rag_evaluation.ipynb first.")

    try:
        from ragas import evaluate, EvaluationDataset, SingleTurnSample
        from ragas.llms import LangchainLLMWrapper
        from ragas.embeddings import LangchainEmbeddingsWrapper
        from ragas.metrics import (faithfulness, answer_relevancy,
                                   context_precision, context_recall)
        from langchain_ollama import ChatOllama
        from langchain_huggingface import HuggingFaceEmbeddings
    except ImportError as e:
        sys.exit(
            f"ragas is not available in this interpreter ({sys.version.split()[0]}).\n"
            f"  {e}\n"
            "Run this with the 3.11 venv:\n"
            "  .venv-ragas\\Scripts\\python <this script>"
        )

    df = pd.read_csv(EVAL_CSV)
    print(f"Loaded {len(df)} evaluated questions from {EVAL_CSV}")

    samples = []
    for _, r in df.iterrows():
        contexts = json.loads(r["contexts"]) if isinstance(r["contexts"], str) else list(r["contexts"])
        samples.append(SingleTurnSample(
            user_input=str(r["question"]),
            response=str(r["answer"]),
            retrieved_contexts=[str(c) for c in contexts],
            reference=str(r["ground_truth"]),
        ))
    dataset = EvaluationDataset(samples=samples)

    # Local judge and local embeddings - nothing leaves the machine, and no
    # OpenAI key is needed. This is the whole point of using Ollama here.
    judge = LangchainLLMWrapper(ChatOllama(model=JUDGE_MODEL, temperature=0))
    embeddings = LangchainEmbeddingsWrapper(HuggingFaceEmbeddings(model_name=EMBED_MODEL))

    print(f"Judge: {JUDGE_MODEL} (via Ollama)   Embeddings: {EMBED_MODEL}")
    print("Scoring - this takes 1-3 hours on CPU.\n")

    result = evaluate(
        dataset=dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
        llm=judge,
        embeddings=embeddings,
    )

    scores = result.to_pandas()
    scores["intent"] = df["intent"].values
    # ragas has no hallucination metric; it is the complement of faithfulness.
    if "faithfulness" in scores:
        scores["hallucination_rate"] = 1 - scores["faithfulness"]
    scores.to_csv(OUT_CSV, index=False, encoding="utf-8")

    print("\n=== RAGAS results ===")
    print(result)
    print(f"\nPer-question scores saved -> {OUT_CSV}")

    metric_cols = [c for c in ("faithfulness", "answer_relevancy", "context_precision",
                               "context_recall", "hallucination_rate") if c in scores]
    print("\nMean scores (%):")
    for c in metric_cols:
        col = scores[c]
        if col.isna().all():
            print(f"  {c:22}   ALL NaN - the judge failed on this metric, do not report it")
        else:
            print(f"  {c:22} {col.mean()*100:6.2f}%   (NaN rows: {col.isna().sum()})")

    print("\nBy intent:")
    print((scores.groupby("intent")[metric_cols].mean() * 100).round(2).to_string())


if __name__ == "__main__":
    main()
