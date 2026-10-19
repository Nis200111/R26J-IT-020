# BIO-HERITAGE AI: COMPLETE RESEARCH MASTER BRIEF (A TO Z)
## Multi-Modal Framework for Preserving Sri Lankan Indigenous Medical Knowledge

> **Document Purpose:** This document contains the exhaustive, definitive, A-to-Z technical specification of all three research components, system architectures, datasets, algorithms, and evaluation metrics. You can directly copy and paste sections of this document or provide the entire file to Claude AI / LLMs to generate thesis chapters, research papers, diagrams, presentations, or documentation without any factual inaccuracies.

---

# SECTION 1: EXECUTIVE PROJECT SUMMARY & METADATA

- **Project Title:** BIO-HERITAGE AI: MULTI-MODAL FRAMEWORK FOR PRESERVING SRI LANKAN INDIGENOUS MEDICAL KNOWLEDGE
- **Project Type:** Undergraduate Final Year Honours Degree Research Project (IT4010)
- **Institution:** Sri Lanka Institute of Information Technology (SLIIT), Sri Lanka
- **Faculty & Department:** Faculty of Computing | Department of Information Technology
- **Degree Program:** Bachelor of Science Honours in Information Technology
- **Group ID:** RP26-IT-20
- **Supervisor:** Ms. Thisara Shyamalee
- **Academic Year / Date:** October 2026
- **Research Partners & Domain Consultants:**
  - Gampaha Wickramarachchi University of Indigenous Medicine, Yakkala, Sri Lanka
  - Traditional Ayurvedic Medical Practitioners and Herbal Gatherers of Haldummulla, Uva Province, Sri Lanka

### Core Research Team:
1. **Member 1 (Lead Author / User):** Ariyarathna L.M.N.R. (`IT22547774`)
   - *Component:* AI-Driven Botanical Plant Authentication and Adulterant Detection Engine
2. **Member 2:** Rajawardhana M.B.G.T.N. (`IT22238412`)
   - *Component:* Health-Context-Aware RAG Sri Lankan Herb Knowledge Assistant
3. **Member 3:** Darmasena M.S.T. (`IT22194558`)
   - *Component:* Medicinal Foliar Pathology Identification, Quality Health Scoring & Management System

---

# SECTION 2: FUNDAMENTAL ARCHITECTURAL PRINCIPLE (CRITICAL)

> ⚠️ **MANDATORY ARCHITECTURAL RULE FOR CLAUDE AI:**
> The three components are **NOT a sequential data pipeline** where Member 1's output feeds into Member 2 or Member 3.
> - **They are 3 INDEPENDENT, SPECIALIZED MICROSERVICES.**
> - **They operate on 3 COMPLETELY SEPARATE, UNCOUPLED DATASETS.**
> - **They handle 3 DISTINCT DATA MODALITIES** (Taxonomic Plant Photos vs. Clinical Pharmacopoeial Text vs. Pathological Leaf Disease Images).
> - **Why are they in one project?** Because they unite under a **Single Umbrella Platform ("Bio-Heritage AI Web Portal")** to solve the complete end-to-end safety lifecycle of Sri Lankan Ayurvedic medicine:
>   1. **Field Collection Stage (Member 1):** Verifies if the plant is the genuine medicinal species or a poisonous weed.
>   2. **Clinical Consumption Stage (Member 2):** Ensures safe dosage, checks contraindications (pregnancy, medications), and eliminates LLM hallucinations.
>   3. **Raw Material Processing Stage (Member 3):** Screens leaves for fungal/bacterial diseases, assigns an Ayurvedic Medicinal Suitability (AMS) grade, and enforces agrochemical withholding periods.

---

# SECTION 3: COMPONENT 1 — BOTANICAL PLANT AUTHENTICATION & ADULTERANT DETECTION

### Researcher:
- **Lead Researcher:** Ariyarathna L.M.N.R. (Student ID: `IT22547774`)

### 1. Problem Addressed:
- In Sri Lanka, commercial herbal gathering is done by rural collectors whose botanical taxonomic knowledge is declining.
- Many potent Ayurvedic medicinal plants closely resemble toxic wild weeds or inert adulterants (morphological lookalikes).
- Accidental adulteration or substitution causes toxic poisoning in patients, dilutes remedy potency, and threatens the credibility of Ayurvedic medicine.
- Standard commercial vision apps (PlantNet, iNaturalist) fail on Sri Lankan endemic flora, force closed-set guesses on unknown weeds, and lack safety calibration.

### 2. Dataset Specification:
- **Species Covered:** 21 prioritized Sri Lankan indigenous medicinal plant species:
  1. *Abutilon indicum* (Aththikka / Anoda lookalike)
  2. *Andrographis paniculata* (Heen Binkohomba)
  3. *Boehmeria nivea*
  4. *Boerhavia diffusa* (Pitasudusarana)
  5. *Catharanthus roseus* (Mini-mal)
  6. *Datura metel* (Attana - highly toxic in improper dosage)
  7. *Euphorbia hirta* (Bu-dadakiriya)
  8. *Exallage auricularia* (Getakola)
  9. *Gymnema sylvestre* (Masbadda)
  10. *Morinda citrifolia* (Ahu)
  11. *Mucuna pruriens* (Wanduru Me)
  12. *Munronia pinnata* (Binkohomba)
  13. *Opuntia dillenii* (Katupathok)
  14. *Piper sarmentosum* (Maha midi / Thippili related)
  15. *Plectranthus amboinicus* (Kapparawalliya)
  16. *Premna serratifolia* (Maha midi)
  17. *Scoparia dulcis* (Wal koththamalli)
  18. *Sida cordata* (Pani bebila)
  19. *Stachys sp.*
  20. *Tephrosia purpurea* (Kathurupila)
  21. *Thespesia populnea* (Gansooriya)
- **Negative / Out-of-Distribution (OOD) Dataset:** Negative control images of non-medicinal tropical weeds, grasses, wild foliage, and background noise collected across wet-zone and dry-zone habitats (Haldummulla, Gampaha collections).

### 3. Model Architecture & Pipeline:
- **Base Architecture:** Transfer-learned **EfficientNetV2B0** (unrolled 273 flat layers, Keras 3 format: `model_v2_efficientnetv2b0.keras`).
- **Dynamic Backend:** Auto-detects TensorFlow, PyTorch, or JAX via `KERAS_BACKEND`.
- **Input Preprocessing (Strict Protocol):**
  - EXIF orientation transposition (handles mobile photo rotations).
  - Resized to `LOAD_SIZE = 256x256` using bilinear interpolation.
  - Tight center-crop to `IMG_SIZE = 224x224` to match training.
  - Fed as float32 in range `[0, 255]` (EfficientNetV2B0 rescales internally; do NOT divide by 255).
- **Test-Time Augmentation (TTA):** Averages predictions of original crop and its horizontal mirror: $p = 0.5 \times (f(x) + f(\text{flip}(x)))$.

### 4. Calibration & Out-of-Distribution (OOD) Safety Logic:
- **Calibrated Thresholds (`calibration.json`):**
  - `CONFIDENCE_HIGH = 0.81`: Calibrated on validation split targeting >95% precision on accepted predictions.
  - `CONFIDENCE_LOW = 0.40`: Rejection cutoff.
  - `MARGIN_LOW = 0.15`: Ambiguity margin cutoff ($p_{\text{top1}} - p_{\text{top2}}$).
- **Status Classification:**
  - **High Confidence (`status = "high"`):** $p_{\text{top1}} \ge 0.81$ and $\text{margin} \ge 0.15$. Specimen accepted for pharmaceutical use.
  - **Moderate Confidence (`status = "moderate"`):** $0.40 \le p_{\text{top1}} < 0.81$ or $\text{margin} < 0.15$. Flags secondary manual inspection.
  - **Low / Rejected (`status = "low"`):** $p_{\text{top1}} < 0.40$. Flags as **Out-of-Distribution (OOD) / Unidentified Weed**, triggering an immediate **"Visha Haranaya" (Detoxification / Toxic Weed Alert)**.
- **Botanical Confusion Pairs Handled:**
  - *Sida cordata* $\leftrightarrow$ *Abutilon indicum* (both Malvaceae family, morphologically identical heart-shaped serrated leaves).
  - *Boehmeria nivea* $\leftrightarrow$ *Boerhavia diffusa*.

### 5. Visual Explainability:
- **Grad-CAM (Gradient-weighted Class Activation Mapping):** Extracts gradients of top convolutional layer (`top_conv`) via TensorFlow GradientTape to produce 224x224 RGB heatmaps (COLORMAP_JET) highlighting venation and foliar serration.

### 6. Quantitative Experimental Results:
- **Top-1 Test Accuracy:** 88.8%
- **Top-5 Test Accuracy:** 97.4%
- **Coverage at Calibrated Threshold (0.81):** 89.8% of specimens accepted
- **Accuracy on Accepted High-Confidence Predictions:** **95.9%**
- **OOD Rejection Performance (AUROC):** **0.94**
- **Inference Latency:** 42.4 ms (GPU) / 112.6 ms (CPU)

---

# SECTION 4: COMPONENT 2 — HEALTH-CONTEXT-AWARE RAG HERB KNOWLEDGE ASSISTANT

### Researcher:
- **Lead Researcher:** Rajawardhana M.B.G.T.N. (Student ID: `IT22238412`)

### 1. Problem Addressed:
- Public interest in natural remedies leads people to query commercial LLMs (ChatGPT, Claude) for herbal advice.
- General LLMs suffer from high hallucination rates (15%–35%) on regional Ayurvedic medicine, recommending toxic dosages and non-existent formulations.
- Existing LLM and RAG pipelines are **context-blind**: they give dosage advice without knowing if the patient is pregnant, a young child, suffering from renal failure, or taking synthetic prescription medications (e.g., Warfarin, Metformin).

### 2. Dataset Specification:
- **Knowledge Base Size:** 1,550 verified, structured Sri Lankan herbal knowledge records.
- **Authoritative Sources:**
  - Ayurvedic Pharmacopoeia of Sri Lanka (Volumes 1–3)
  - Department of Ayurveda Formulary & Compendium
  - Materia Medica of Sri Lanka
  - Peer-reviewed ethnobotanical and pharmacognostic research.
- **Record Structure:** Botanical binomial, Sinhala/Tamil folk names, active secondary metabolites, Ayurvedic energetics (Rasa, Guna, Virya, Vipaka, Prabhava), therapeutic indications, classical decoction recipes, standard dosages, contraindications, and known allopathic drug-herb interactions.

### 3. Model Architecture & Pipeline:
1. **Lightweight Intent Classifier:**
   - Architecture: Scikit-learn Pipeline chaining `TfidfVectorizer(ngram_range=(1,2))` with `LinearSVC(C=1.0)`.
   - Classes (4 intents): `herb-disease`, `herb-property`, `dosage`, `contraindication`.
   - Execution Time: 1.8 milliseconds | Accuracy: **96.5%** | Macro-F1: **0.96**.
2. **Dense Semantic Retrieval:**
   - Embeddings: `sentence-transformers/all-MiniLM-L6-v2` generating 384-dimensional dense vectors.
   - Vector Database: In-memory **FAISS** index (`faiss-cpu`, `IndexFlatIP` with normalized inner product).
   - Domain Re-Ranker: Re-ranks top FAISS candidate chunks by boosting exact matches of recognized botanical entities (+8.6% precision boost).
   - Metrics: Recall@5 = **92.4%** | Mean Reciprocal Rank (MRR) = **0.89**.
3. **Interactive 2-Step Health-Context Clarification:**
   - Step 1: User submits query. If the intent is safety-sensitive (`dosage`, `contraindication`) and lacks user health parameters, the pipeline intercepts execution and returns:
     `{ "needsContext": true, "followupQuestions": [...] }`.
   - Step 2: The UI prompts the user for 4 clinical parameters:
     - Age Group (Adult, Elderly, Child, Infant)
     - Patient Condition (None, Pregnancy, Lactating, Renal Disease, Hepatic Impairment)
     - Medication Context (None, Anticoagulant/Warfarin, Anti-hypertensive, Anti-diabetic)
     - Dosage Form (Powder, Decoction/Kashaya, Paste/Lepa, Medicated Oil/Taila)
4. **Multi-Factor Clinical Risk Stratification Model:**
   - Architecture: Tabular **Random Forest Classifier** (100 estimators, Scikit-learn).
   - Tiers: **Safe**, **Caution**, **Contraindicated**.
   - Performance: **94.2% Overall Accuracy** (Safe F1: 0.95, Caution F1: 0.92, Contraindicated F1: 0.96).
   - Explainability: **TreeSHAP** (SHapley Additive exPlanations) computing exact per-feature contributions (e.g., "Pregnancy contributes +0.62 to Contraindicated probability for Datura metel").
5. **Grounded Response Generation:**
   - Model: Quantized 4-bit **Llama 3.2** executing locally via **Ollama**.
   - Prompt Constraint: Grounded strictly to retrieved knowledge chunks with source citations.
   - Hallucination Rate: **0.0%** across 200 benchmark test queries (RAGAS Faithfulness: 0.98).

---

# SECTION 5: COMPONENT 3 — FOLIAR PATHOLOGY DETECTION & AMS QUALITY SCORING

### Researcher:
- **Lead Researcher:** Darmasena M.S.T. (Student ID: `IT22194558`)

### 1. Problem Addressed:
- In Ayurvedic pharmacology, therapeutic efficacy is governed by the phytochemical purity of the leaves.
- Fungal/bacterial infections degrade active metabolites and produce dangerous microbial mycotoxins.
- Commercial herbal medicine has lacked automated, objective raw material quality screening.
- When farmers use chemical fungicides to control diseases, they fail to respect harvest withholding periods, introducing toxic pesticide residues into traditional medicines.

### 2. Dataset Specification:
- High-resolution photographic dataset of prominent Sri Lankan medicinal foliage (such as *Aloe vera* / Komarika and *Piper betle* / Bulath).
- **Five Health & Disease Classes:**
  1. **Healthy:** Clean foliage, vibrant green, free of lesions.
  2. **Anthracnose (අළු/කළු පුල්ලි රෝගය):** Sunken necrotic spots with yellow chlorotic rings.
  3. **Bacterial Leaf Spot (බැක්ටීරියා පත්‍ර ලප රෝගය):** Water-soaked brown lesions rapidly spreading in humidity.
  4. **Rot (කුණුවීමේ රෝග - Foot/Stem/Leaf Rot):** Soft, decomposing, decayed tissue breakdown.
  5. **Rust (මලකඩ රෝගය):** Orange-brown fungal pustules inhibiting photosynthesis.

### 3. Model Architecture & Pipeline:
- **Architecture:** Deep Convolutional Neural Network **EfficientNetB4 v3** (Keras 3 archive: `efficientnetb4_v3.keras`).
- **Input Dimension:** 224x224 RGB image tensors with standard EfficientNet normalization.
- **Inference Speed:** 58.3 milliseconds on CPU.
- **Diagnostic Performance:**
  - Overall Test Accuracy: **94.6%**
  - Macro-F1 Score: **0.947**
  - Class Accuracies: Healthy: 96.2%, Anthracnose: 93.8%, Bacterial Leaf Spot: 94.1%, Rot: 95.0%, Rust: 94.3%.

### 4. Novelty: Ayurvedic Medicinal Suitability (AMS) Quality Grading:
Maps multi-class prediction probabilities into standardized pharmaceutical suitability grades:
- **Grade A — Premium Medicinal Quality (Status: Approved):**
  - Condition: Predicted *Healthy* with confidence $> 85\%$.
  - Suitability: 100% approved for all Ayurvedic medicine production, including internal consumption (*Kashaya*, *Arishtam*).
- **Grade B — Acceptable Medicinal Quality (Status: Conditional Approval):**
  - Condition: Predicted *Healthy* with confidence between $65\%$ and $85\%$.
  - Suitability: Approved for external applications (*Lepa*, *Taila*) or processed extracts; manual review advised before internal consumption.
- **Grade C — Uncertain Quality (Status: Manual Review Required):**
  - Condition: Predicted *Healthy* with confidence $\le 65\%$.
  - Suitability: Requires inspection by an experienced Ayurvedic practitioner before any medicinal use.
- **Grade D — Rejected (Status: Strictly Rejected):**
  - Condition: Any disease detected (*Anthracnose*, *Bacterial Leaf Spot*, *Rot*, or *Rust*).
  - Suitability: **Strictly prohibited** from pharmaceutical preparation to prevent microbial contamination and toxic degradation. Must be discarded.
- **Clinical Concordance:** **93.3% agreement** with blind grading evaluations by certified Ayurvedic medical doctors.

### 5. Integrated Treatment Guidelines & Withholding Alert:
- **Organic & Cultural Management:**
  - Trichoderma viride biological bio-fungicide soil amendment.
  - Garlic extract spray mixed with water.
  - Dried Neem Cake (*Kohomba punnakku*) for soil conditioning and natural anti-fungal action.
  - Traditional Bordeaux mixture (0.25% Copper Sulphate + Lime).
- **Chemical Controls (Optional / Last Resort):**
  - Copper Oxychloride 50% WP, Mancozeb, Ridomil Gold (Mefenoxam + Mancozeb).
- **Withholding Period Warning (අස්වනු තහනම් කාලය පිළිබඳ විශේෂ අනතුරු ඇඟවීම):**
  - **Mandatory 30–45 Day Withholding Period:** Leaves treated with synthetic chemical fungicides must NOT be harvested for Ayurvedic medicine or human consumption for at least 30 to 45 days post-application.

---

# SECTION 6: UNIFIED SYSTEM ARCHITECTURE & INTEGRATION

### 1. Technology Stack:
- **Frontend Presentation Layer:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React icons, HTML5 Canvas camera capture.
- **Backend API Gateway:** FastAPI (Python 3.11/3.14), asynchronous event loop, Pydantic data schemas, Uvicorn ASGI server.
- **Machine Learning Core:** Keras 3, TensorFlow 2.15, PyTorch fallback, Scikit-learn, OpenCV, Pillow.
- **Vector & NLP Engine:** HuggingFace `sentence-transformers`, `faiss-cpu`, Ollama (Llama 3.2 4-bit quantized), TreeSHAP.

### 2. Microservice Decoupling & API Structure:
- Each component operates under its own isolated router prefix:
  - `POST /api/member1/predict`: Image upload $\rightarrow$ Top-5 botanical species, confidence, margin, status, Grad-CAM heatmap.
  - `POST /api/member2/ask`: Conversational query $\rightarrow$ Intent, `needsContext` flag, questionnaire, risk level, SHAP explanations, grounded answer, sources.
  - `POST /api/member3/predict`: Leaf image upload $\rightarrow$ Disease label, confidence, all class probabilities, AMS Quality Grade (A–D), treatment guidelines, withholding alert.
- **Background Daemon Warmup:** Member 2's heavy FAISS and Sentence-Transformer dependencies initialize in a background daemon thread (`warm_up()`), ensuring the FastAPI server boots in under 1 second and Member 1 & Member 3 remain instantly accessible.

### 3. System Validation Results:
- **System Usability Scale (SUS) Score:** **87.4 / 100** (Grade A+, top 5th percentile) tested across 10 certified Ayurvedic physicians and 4 rural herbal collectors.
- **Concurrent Load Testing:** 50 simultaneous users, average latency 210 ms, 0.0% request failure rate.
- **Complete Offline Capability:** Fully executable without internet on local machines (Next.js client + local FastAPI + local Ollama LLM).

---

# SECTION 7: MASTER PROMPT TEMPLATE FOR CLAUDE AI

> **Instructions for the User:** When you want Claude AI to write or edit any chapter, section, or paper for your thesis, paste the following prompt along with this document.

```markdown
You are an expert academic research co-author specializing in Computer Science, Machine Learning, and Ayurvedic Ethnopharmacology. 

Please write the requested thesis chapter/section based strictly on the authoritative facts in the "BIO-HERITAGE AI: COMPLETE RESEARCH MASTER BRIEF (A TO Z)".

CRITICAL RULES TO ENFORCE:
1. The project consists of 3 INDEPENDENT research components operating on 3 SEPARATE datasets:
   - Member 1 (Ariyarathna L.M.N.R. - IT22547774): Botanical Plant Authentication (21 species, EfficientNetV2B0, Calibrated Threshold 0.81, OOD Rejection AUROC 0.94, Grad-CAM).
   - Member 2 (Rajawardhana M.B.G.T.N. - IT22238412): Health-Context-Aware RAG Herb Knowledge Assistant (1,550 records, TF-IDF + Linear SVM intent classifier, FAISS, 2-step context elicitation, Random Forest risk classifier with SHAP, Llama 3.2 via Ollama).
   - Member 3 (Darmasena M.S.T. - IT22194558): Foliar Pathology Detection & Quality Scoring (5 classes, EfficientNetB4 v3, AMS Quality Grading A-D, organic/chemical remedies, 30-45 day withholding warning).
2. DO NOT describe the system as a chained pipeline where Member 1 passes output to Member 2 or 3. They are decoupled microservices within a unified web portal.
3. Use formal, rigorous academic tone suitable for an IEEE publication and a SLIIT B.Sc. (Hons) undergraduate thesis.
4. Use exact numbers and metrics from the master brief (e.g., 88.8% accuracy, 95.9% accepted accuracy, 96.5% intent accuracy, 94.6% pathology accuracy, 87.4 SUS score).
```

---
*End of Master Brief. Created for Group RP26-IT-20, October 2026.*
