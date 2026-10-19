# CLAUDE AI PROMPT: FIGURES & TABLES MASTER GENERATOR
## Project: BIO-HERITAGE AI (Group RP26-IT-20 | SLIIT Final Honours Thesis)

> **How to use:** Copy and paste the prompt block below directly into Claude AI. It is designed to instruct Claude to generate all mandatory academic tables (ready for Word copy-paste) and all mandatory figure diagrams (with executable Mermaid.js code and image generation prompts).

```markdown
You are an expert academic research co-author formatting the final thesis figures and tables for our SLIIT B.Sc. (Hons) Research Thesis titled:
"BIO-HERITAGE AI: MULTI-MODAL FRAMEWORK FOR PRESERVING SRI LANKAN INDIGENOUS MEDICAL KNOWLEDGE" (Group ID: RP26-IT-20).

We have 3 independent research components operating on 3 separate datasets:
- Member 1 (Ariyarathna L.M.N.R. - IT22547774): Botanical Plant Authentication & Adulterant Detection (21 species, EfficientNetV2B0, Calibrated Threshold 0.81, 95.9% accepted accuracy, OOD AUROC 0.94, Grad-CAM).
- Member 2 (Rajawardhana M.B.G.T.N. - IT22238412): Health-Context-Aware RAG Herb Assistant (1,550 verified records, TF-IDF + Linear SVM 96.5% accuracy, FAISS Recall@5 92.4%, 2-step context elicitation, Random Forest risk classifier 94.2% accuracy with SHAP, local Llama 3.2).
- Member 3 (Darmasena M.S.T. - IT22194558): Foliar Pathology Detection & AMS Quality Grading (5 classes, EfficientNetB4 v3 94.6% accuracy, AMS Quality Grades A-D with 93.3% clinical agreement, 30-45 day withholding warning).

Please generate the complete, exhaustive set of MANDATORY ACADEMIC TABLES and FIGURES for our Common Report.

=============================================================================
PART 1: ACADEMIC TABLES (Generate fully populated tables in clean Markdown format)
=============================================================================
Please generate the following 7 comprehensive tables with exact numbers, headers, and professional captions:

1. Table 1.1: Tri-Pillar Architecture and Component Responsibility Matrix
   - Columns: Component No. | Subsystem Title | Lead Researcher & ID | Target Domain & Modality | Primary AI Architecture | Key Safety Mechanism | Primary Benchmark Metric

2. Table 2.1: Comparative Analysis of Literature Baselines vs. Bio-Heritage AI
   - Compare PlantNet, PictureThis, Generic LLMs (ChatGPT/Claude), PlantVillage/Agrio against Bio-Heritage AI across Domain Scope, Calibration/OOD, Safety Guardrails, and Quality Standards.

3. Table 3.1: Specifications of Independent Research Datasets
   - Detail Dataset 1 (M1 21 species + OOD), Dataset 2 (M2 1,550 records), Dataset 3 (M3 5 pathology classes).
   - Columns: Dataset ID | Component | Data Modality | Total Samples | Class Distribution / Schema | Provenance / Sourcing Origin

4. Table 4.1: Functional and Non-Functional Requirements Specification Matrix
   - Detail FR1 through FR12 and NFR1 through NFR6 mapped to components, descriptions, and verification methods.

5. Table 5.1: Technology Stack and Infrastructure Specifications
   - Detail Presentation Tier, API Gateway, Deep Learning Frameworks, Vector DB & NLP Engines, Hardware Infrastructure, and Operational Deployment.

6. Table 6.1: Consolidated Quantitative Experimental Results Benchmark
   - Detail experimental metrics across all 3 members:
     * M1: Top-1 (88.8%), Top-5 (97.4%), Calibrated Acc (95.9%), Coverage (89.8%), OOD AUROC (0.94), Latency (42.4ms).
     * M2: Intent Acc (96.5%), Recall@5 (92.4%), MRR (0.89), Risk Acc (94.2%), Hallucination (0.0%), Latency (1.85s).
     * M3: Pathology Acc (94.6%), Macro-F1 (0.947), Class Accuracies, AMS Clinical Concordance (93.3%), Latency (58.3ms).

7. Table 6.2: Ayurvedic Medicinal Suitability (AMS) Quality Grading Rubric
   - Detail Grade A (Premium), Grade B (Acceptable), Grade C (Uncertain), Grade D (Rejected) with confidence criteria, clinical status, color code, and permitted traditional pharmaceutical preparations.

8. Table 6.3: System Usability Scale (SUS) Evaluation Across Stakeholder Cohorts
   - Detail 10 SUS questionnaire items with mean scores for Ayurvedic Doctors (n=10) and Herbal Gatherers (n=4), culminating in aggregate SUS 87.4 (Grade A+).

=============================================================================
PART 2: ARCHITECTURE & PIPELINE FIGURES (Provide executable Mermaid.js Diagrams)
=============================================================================
For each figure below, provide:
- Figure Caption (e.g., Figure 4.1: ...)
- Explanatory Analytical Paragraph (for referencing in the text)
- Complete, executable, beautiful Mermaid.js code block that can be rendered in Mermaid Live Editor (https://mermaid.live) or Draw.io to generate high-resolution PNG diagrams:

1. Figure 4.1: Overall Multi-Modal System Architecture Diagram
   - Show User/Client Layer (Next.js 14) -> API Gateway (FastAPI) -> 3 Decoupled Autonomous Microservice Engines (Member 1, Member 2, Member 3) -> Data & Model Storage Layers.

2. Figure 4.2: Member 1 Botanical Authentication & Adulterant Detection Pipeline Flowchart
   - Show Image Input -> Bilinear Resize (256x256) & Center Crop (224x224) -> EfficientNetV2B0 Inference -> Softmax Probability & Margin Calculation -> Decision Diamond (Confidence >= 0.81 vs < 0.40) -> High Confidence Accepted vs. Moderate Confusable Pair vs. Low OOD Rejection (Visha Haranaya Alert) -> Grad-CAM Heatmap Extraction.

3. Figure 4.3: Member 2 Health-Context-Aware RAG Conversational Flowchart
   - Show User Prompt -> TF-IDF + Linear SVM Intent Classifier -> Decision Diamond (Safety-Sensitive Intent?) -> If Yes & Missing Context -> Trigger Interactive Health Questionnaire -> Tabular Features -> Random Forest Clinical Risk Model + SHAP -> Dense Vector FAISS Retrieval + Re-ranker -> Context-Bounded Llama 3.2 Synthesis -> Output with Sources & Safety Badges.

4. Figure 4.4: Member 3 Foliar Pathology Diagnosis & AMS Quality Grading Flowchart
   - Show Leaf Specimen Image -> EfficientNetB4 v3 Inference -> 5-Class Softmax Vector -> AMS Rule Decision Engine -> Routing to Grade A, B, C, or D -> Remediation Engine (Organic Bio-fungicides vs Chemical Controls) -> Mandatory 30-45 Day Withholding Period Warning Box.

=============================================================================
PART 3: USER INTERFACE (UI) SCREENSHOT FIGURES
=============================================================================
Provide the formal captions and in-text figure callouts for the 3 portal screenshots (stored in the frontend):
1. Figure 6.1: Web Interface for Botanical Authentication and Digital Herbarium Workbench (Member 1)
2. Figure 6.2: Health-Context-Aware Conversational Interface with SHAP Risk Stratification (Member 2)
3. Figure 6.3: Foliar Pathology Diagnostic Dashboard Displaying AMS Quality Grade and Withholding Alert (Member 3)

Ensure that all tables and figures adhere strictly to academic standards, IEEE caption formats, and our established empirical metrics.
```
