# Plant Identifier (Member 1 Component)

Frontend module for **"Medicinal Plant Botanical Authentication"** — scientific identification of Sri Lankan medicinal plants, with a focus on detecting toxic/commercial adulterant look-alikes.

## Research Context

- **Core problem:** In Sri Lanka's Ayurveda industry, genuine medicinal plants are sometimes substituted with visually similar but toxic or ineffective look-alikes.
- **Research gap:** Existing plant-ID apps (PlantNet, Google Lens, iNaturalist) get high accuracy but confuse visually similar species, force unknown plants into known classes, and give no toxicity/adulterant warning.
- **This research's focus:**
  - Expert-validated real-world dataset — 21 plants, 3,095 images (leaves, flowers, stems), collected at Haldummulla Medicinal Plant Garden and validated with Wickramarachchi Ayurveda University.
  - Fine-grained identification of visually similar species.
  - Unknown / out-of-distribution (OOD) plant detection.
  - Model: EfficientNetB0 (transfer learning), ~86% validation accuracy, 21-class classification + confidence score.

Source docs for this research live outside the repo at `D:\4ys1\researcn-the-new-one` (`About-My-Component`, `flow-my-component.pdf`, `my-model`, `model-images`, `proofe-document`).

## What this page does

`page.js` (`AdvancedPlantIdentifierPage`) implements the "Diagnostic Workbench" UI described in the research flow:

1. **Specimen upload** — drag/click file upload (image preview via `URL.createObjectURL`); a "Use Camera Scan" button is present but not wired up yet.
2. **Image quality guidelines** — static checklist (centered leaf, clean background, good lighting, sharp focus).
3. **Quick Sandbox Simulation** — four demo buttons (`Attana`, `Ahu`, `Bu-bawila`, `Kuthurupila`) that simulate a genuine vs. adulterant result without needing a real upload, for panel/demo purposes.
4. **Authentication report** — on "Authenticate", `simulateAnalysis()` runs a staged fake pipeline (`setTimeout` chain with loading text) and then renders:
   - Classification name + confidence bar
   - "Taxonomy Validated" info box
   - Adulterant warning block (red) with required human-verification steps, or a "Genuine Specimen Probable" block (green)
   - Export/"Scan Another Specimen" actions (export is not implemented)
5. **Model Knowledge Base marquee** (`../../components/InfiniteMarquee.js`) — scrolling strip of the trained species (images sourced from `frontend/public/plants/`).

## Current status / limitations

- **No real model inference yet.** `simulateAnalysis()` is a mock: sandbox clicks use hardcoded results, and real uploads get a `Math.random()`-based fake result. There is no API call to the trained Keras model (`plant_model_best.keras` / `plant_model_finetuned_best.keras` in `my-model/`).
- Toxicity meter, distinguishing tips, and comparative features grid described in the research flow chart are **not yet implemented** in this page (only the adulterant/genuine banner exists).
- Camera capture and PDF report export buttons are present but non-functional.
- Herbarium database / search-by-plant-card section (Phase 07 of the design) is not implemented here.

## Next steps (per the research plan)

1. Wire the "Authenticate" button to a real inference endpoint that loads the trained model and returns class + confidence.
2. Replace mocked sandbox/random results with actual predictions.
3. Add scientific name, family, toxicity meter, distinguishing tips, and the comparison grid to the results panel.
4. Implement camera capture and report export.
5. Build the digital herbarium database section (searchable cards for all 21 plants).
