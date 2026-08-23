# RAG-Based Sri Lankan Herb Knowledge Assistant

Research component of **Bio-Heritage AI: Multi-Modal Framework for Preserving Sri Lankan Indigenous Medical Knowledge**.

A **Health-Context-Aware Retrieval-Augmented Generation (RAG)** assistant that answers questions about Sri Lankan medicinal herbs — usage, dosage, medicinal properties, and contraindications — using a verified herb knowledge base instead of relying on an LLM's memory, to reduce hallucinated medical information.

## What this component does
1. **Intent classification** (TF-IDF + Linear SVM) — labels a query as `herb-disease`, `herb-property`, `dosage`, or `contraindication`.
2. **Health-context clarification** — asks follow-up safety questions when a query depends on the user's health context (pregnancy, medication, chronic disease, etc.).
3. **Semantic retrieval** (Sentence-Transformers `all-MiniLM-L6-v2` + FAISS) over the herb knowledge base.
4. **Contraindication risk classification** (Random Forest) — predicts Safe / Caution / Contraindicated, with **SHAP** explainability.
5. **Grounded answer generation** with **Llama 3.2 via Ollama**.
6. **Evaluation** with RAGAS and standard classification metrics.

## Dataset
`data/sri_lankan_herb_knowledge_base.csv` — 1,550 herb records, 18 columns:

```
herb_id, herb_name_sinhala, herb_name_english, herb_name_latin, family, synonyms,
treatment_for, parts_used_in_treatment, description, dosage, contraindications,
compounds, native_distribution, conservation_status, edible_parts,
medical_properties, source, source_type
```

## Folder structure
```
rag-herb-assistant/
├── data/         # herb knowledge base CSV (source data)
├── notebooks/    # 01 preprocessing, 02 intent classifier, 03 FAISS index (04, 05 to come)
├── chunks/       # generated herb_chunks.json (git-ignored)
├── indexes/      # generated FAISS index + metadata (git-ignored)
├── models/       # trained model .pkl files (git-ignored)
├── app/          # Streamlit app (to come)
└── requirements.txt
```

Generated files (chunks/indexes/models) are git-ignored — recreate them by running the notebooks in order.

## How to run
```bash
pip install -r requirements.txt
jupyter notebook
```
Run the notebooks in order:
1. `notebooks/01_dataset_preprocessing.ipynb` → `chunks/herb_chunks.json`
2. `notebooks/03_faiss_index_creation.ipynb` → FAISS index + metadata
3. `notebooks/02_intent_classifier_training.ipynb` → `models/intent_classifier.pkl`

Llama 3.2 answer generation requires [Ollama](https://ollama.com):
```bash
ollama pull llama3.2
```
