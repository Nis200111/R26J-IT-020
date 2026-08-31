# RAG-Based Sri Lankan Herb Knowledge Assistant

Research component of **Bio-Heritage AI: Multi-Modal Framework for Preserving Sri Lankan Indigenous Medical Knowledge** — Member 2.

A **Health-Context-Aware Retrieval-Augmented Generation (RAG)** assistant that answers questions about Sri Lankan medicinal herbs — usage, dosage, medicinal properties and contraindications — from a verified herb knowledge base rather than a language model's memory, to reduce hallucinated medical information.

Unlike a general chatbot, it **refuses to give safety advice until it knows who is asking**. A question such as *"Is Kohomba safe during pregnancy?"* triggers follow-up health questions before any answer is produced.

---

## What this component does

| Stage | Technique |
|---|---|
| Spelling correction | difflib fuzzy match over a 3,471-name herb lexicon |
| Out-of-scope filter | rejects greetings and off-topic questions |
| Intent classification | TF-IDF + Linear SVM → `herb-disease`, `herb-property`, `dosage`, `contraindication` |
| Health-context clarification | rule-based; asks only the questions the query has not already answered |
| Retrieval | hybrid — FAISS semantic search (`all-MiniLM-L6-v2`) **plus** exact herb-name lookup |
| Re-ranking | relevance boost when the query names a herb explicitly |
| Risk classification | Random Forest → Safe / Caution / Contraindicated, explained per prediction with **SHAP** |
| Answer generation | **Llama 3.2 via Ollama**, under strict grounding rules |

The whole pipeline runs **offline** — no data leaves the machine.

---

## Results

| Component | Metric | Result |
|---|---|---|
| Intent classifier | test accuracy / macro-F1 | **95.03% / 94.88%** |
| | unseen phrasing (template-level split) | 86.58% |
| | hand-written real-world queries | 60.00% |
| Contraindication risk | test accuracy | **89.78%** |
| | 5-fold cross-validation | 90.65% ± 0.68% |
| Health-context detection | recall (safety) / F1 | **82.35% / 84.85%** |
| | adaptivity (redundant questions skipped) | 100% |
| RAG pipeline | faithfulness | **96.02%** |
| | hallucination rate | 3.98% |
| | context recall | 88.75% |

Figures for each are saved in `notebooks/*.png`.

### Honest notes on these numbers

- The intent classifier's **95.03% query-level score** is flattered by the split: randomly splitting queries puts the same phrasing templates in both training and test, so the model only has to recognise a phrasing it has already seen. The **86.58% template-level score** is the meaningful one — it holds out whole templates and measures generalisation to phrasings the model has never seen. Both are reported in notebook 02.
- The training set contains ~10% **deliberately ambiguous queries** (e.g. *"is X good for diabetes"*, which is defensibly both `herb-disease` and `contraindication`). This imposes a theoretical accuracy ceiling of ~94.9%, reflecting real annotation uncertainty.
- **Faithfulness is threshold-sensitive.** With the support threshold at 0.50 it is 96.02%; at 0.60 it is 86.47%. The reported figure should always be quoted with its threshold.
- **Context precision (34.50%) and answer relevancy (55.45%) are understated** by the local metric implementation, which compares a short question or ground-truth string against a full herb record. They are recorded in notebook 05 but should not be read as retrieval quality.

### Known limitations

- The health-context detector uses a **keyword list**, so it misses paraphrases outside it — *"toddler"*, *"nursing mother"*, *"expecting"*, *"chemo"*. Six such misses are documented in notebook 06. An embedding-based detector would generalise.
- **Negation and correction queries** (*"not Gotukola, I want a list of herbs"*) are misclassified; the intent classifier has no notion of a correction.
- The **intent** and **contraindication risk** datasets are generated, because the herb knowledge base contains no query labels or patient records. Their metrics validate the pipeline, not clinical accuracy. The **herb knowledge base itself is collected from verified sources** and is not synthetic.

---

## Dataset

`data/sri_lankan_herb_knowledge_base.csv` — 1,550 herb records, 18 columns, collected from field surveys, traditional texts, research papers, expert interviews and reference databases (see `source` / `source_type`).

```
herb_id, herb_name_sinhala, herb_name_english, herb_name_latin, family, synonyms,
treatment_for, parts_used_in_treatment, description, dosage, contraindications,
compounds, native_distribution, conservation_status, edible_parts,
medical_properties, source, source_type
```

---

## Setup

### Requirements

- **Python 3.11** — see the note below; 3.14 will not work for the full system.
- [Ollama](https://ollama.com) with Llama 3.2.
- ~3 GB free disk (models and dependencies).

### ⚠️ Python version matters

**TensorFlow has no wheel for Python 3.14**, so Members 1 and 3 cannot run on it, and `ragas` cannot be installed either. The project therefore uses a **Python 3.11 virtual environment** for the backend.

```bash
# from the repository root
py -3.11 -m venv .venv311
.venv311\Scripts\python -m pip install -r backend\requirements.txt
```

This component alone (Member 2) does run on 3.14; the constraint comes from the other modules sharing the same backend.

### 1. Install dependencies

```bash
cd backend
..\.venv311\Scripts\python -m pip install -r requirements.txt
```

### 2. Install the language model

```bash
ollama pull llama3.2
```

### 3. Build the model files — required

`indexes/`, `models/` and `chunks/` are **git-ignored**, so a fresh clone does not contain them and the assistant will fail with a FAISS *"could not open ... .index"* error until they exist.

Either run the notebooks in this order:

| Order | Notebook | Produces |
|---|---|---|
| 1 | `01_dataset_preprocessing.ipynb` | `chunks/herb_chunks.json` |
| 2 | `03_faiss_index_creation.ipynb` | `indexes/sl_herb_faiss.index`, `herb_metadata.pkl` |
| 3 | `02_intent_classifier_training.ipynb` | `models/intent_classifier.pkl` |
| 4 | `04_contraindication_risk_classifier.ipynb` | risk model + 3 encoder files |

…or copy an existing `chunks/`, `indexes/` and `models/` from a machine that has already built them (~22 MB, ~5 MB zipped). Notebook 03 downloads the embedding model on first run and needs internet once.

### 4. Run

```bash
# backend, from backend/
..\.venv311\Scripts\python -m uvicorn main:app --reload --port 8000

# frontend, from frontend/
npm install
npm run dev
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open **http://localhost:3000/all-in-one**.

> **The first question takes 30–60 seconds** while the embedding model, FAISS index and Random Forest load. Every question after that is fast. Send one throwaway query before a demo.

### Running fully offline

Everything runs without internet once set up. To stop sentence-transformers checking HuggingFace for updates:

```bash
$env:HF_HUB_OFFLINE=1
```

The frontend needs internet only for its first `npm install` and font fetch; after one build it runs offline too.

---

## Command-line testing

```bash
cd backend/rag_herb_assistant
..\..\.venv311\Scripts\python services/test_query.py
```

Commands: `profile` shows the remembered health context, `reset` clears it, `quit` exits. Health context is saved to `data/session_context.json` and reused across runs; queries are logged to `data/query_log.csv`. Both are git-ignored — they contain personal health data.

---

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/member2/ask` | Ask a question |
| `GET /api/member2/health` | Whether the pipeline has loaded |

**Request**

```json
{ "query": "Is Kohomba safe during pregnancy?",
  "healthContext": { "age_group": "adult", "patient_condition": "pregnancy",
                     "medication_context": "none", "dosage_form": "herbal tea" },
  "lastHerb": null }
```

`healthContext` may be `null`. If the question is safety-sensitive the reply is a request for context rather than an answer:

```json
{ "error": false, "needsContext": true, "intent": "contraindication",
  "followupQuestions": ["What is your age group? ..."] }
```

Send the same query again with `healthContext` filled in to get:

```json
{ "error": false, "needsContext": false, "intent": "contraindication",
  "answer": "...", "riskLevel": "Caution", "riskFactors": ["patient_condition"],
  "riskExplanation": [{ "feature": "patient_condition", "value": "pregnancy", "impact": 0.21 }],
  "sources": [{ "herb": "Kohomba", "herbEnglish": "Neem", "source": "...", "score": 0.96 }] }
```

`healthContext` values must come from the categories the risk classifier was trained on:

| Field | Allowed values |
|---|---|
| `age_group` | child, adult, elderly |
| `patient_condition` | none, pregnancy, breastfeeding, diabetes, hypertension, kidney disease, liver disease, heart disease |
| `medication_context` | none, antidiabetic, antihypertensive, anticoagulant, antibiotics |
| `dosage_form` | herbal tea, powder, capsule, decoction |

Anything outside these returns `Caution` with an explicit warning rather than a fabricated prediction.

> **All routers return HTTP 200 even on failure**, with `{"error": true, "message": "..."}`. Clients must branch on `data.error`, never on `res.ok`.

---

## Evaluation notebooks

| Notebook | Covers |
|---|---|
| `02_intent_classifier_training.ipynb` | Intent classification metrics, both splits, real-world test |
| `04_contraindication_risk_classifier.ipynb` | Risk classifier metrics, cross-validation, SHAP |
| `05_rag_evaluation.ipynb` | Faithfulness, answer relevancy, context precision/recall, hallucination rate |
| `06_health_context_evaluation.ipynb` | Clarification detection and adaptivity |

### A note on RAGAS

The five metrics in `05_rag_evaluation.ipynb` are therefore **implemented directly in the notebook**, following the RAGAS definitions but using the project's own `all-MiniLM-L6-v2` embeddings. They should be described as **"RAGAS-style metrics computed locally"**, never as RAGAS output — the numbers are not directly comparable to published RAGAS scores. Every formula and threshold is documented in the notebook.

`notebooks/run_real_ragas.py` will score the same saved dataset with the real library if run under a Python 3.11 environment with `ragas`, `langchain-ollama` and `langchain-huggingface` installed, using local Llama 3.2 as the judge.

---

## Folder structure

```
rag_herb_assistant/
├── data/         herb knowledge base CSV + generated evaluation datasets
├── notebooks/    01-06 + figures + run_real_ragas.py
├── services/     rag_pipeline.py, health_context_checker.py, test_query.py
├── chunks/       generated herb_chunks.json            (git-ignored)
├── indexes/      generated FAISS index + metadata      (git-ignored)
├── models/       trained .pkl model files              (git-ignored)
└── requirements.txt
```

The API layer lives at `backend/app/routers/member2.py`; the user interface at `frontend/src/app/all-in-one/` and `frontend/src/components/all-in-one/`.
