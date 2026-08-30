import { Microscope, BookOpen, Leaf, Server } from "lucide-react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Registry of the four research components.
 *
 * `enabled` marks which models this page actually calls. Only Member 2 is wired
 * up for now; the others appear in the switcher so the UI is complete, but
 * select into a "coming soon" panel. To wire one up later: flip `enabled`, add
 * a call in api.js, and add a result card in results/.
 *
 * `input` describes what the composer should accept: "text", "image" or "none".
 */
export const MODELS = [
  {
    id: "member2",
    name: "Herb Assistant",
    subtitle: "RAG + NLU",
    input: "text",
    icon: BookOpen,
    endpoint: "/api/member2/ask",
    href: "/member2",
    blurb: "Ask about Sri Lankan medicinal herbs — uses, dosage, properties and safety.",
    placeholder: "Ask about a Sri Lankan medicinal herb…",
    enabled: true,
  },
  {
    id: "member1",
    name: "Plant Authentication",
    subtitle: "Adulterant detection",
    input: "image",
    icon: Microscope,
    endpoint: "/api/member1/predict",
    href: "/member1",
    blurb: "Identify a herb species from a photograph and flag likely adulterants.",
    placeholder: "Attach a plant photo to authenticate",
    enabled: true,
  },
  {
    id: "member3",
    name: "Leaf Disease Detection",
    subtitle: "Health screening",
    input: "image",
    icon: Leaf,
    endpoint: "/api/member3/predict",
    href: "/member3",
    blurb: "Check whether a leaf is healthy and suitable for Ayurvedic preparation.",
    placeholder: "Attach a leaf photo to diagnose",
    enabled: true,
  },
  {
    id: "member4",
    name: "System Gateway",
    subtitle: "Infrastructure",
    input: "none",
    icon: Server,
    endpoint: "/api/member4/predict",
    href: "/member4",
    blurb: "Centralised gateway for API traffic and service health monitoring.",
    placeholder: "This module takes no input",
    enabled: false,
  },
];

export const DEFAULT_MODEL_ID = "member2";

export const getModel = (id) => MODELS.find((m) => m.id === id) || MODELS[0];

/**
 * Health-context options.
 *
 * These MUST stay exactly in sync with the categories the contraindication risk
 * classifier was trained on (see notebook 04). Free text would ask the model to
 * predict on a category it has never seen, so these are dropdowns only.
 *
 * Duplicated from src/app/member2/page.js on purpose — they are unexported
 * locals there, and extracting them would mean editing a working page.
 */
export const AGE_GROUPS = ["child", "adult", "elderly"];
export const CONDITIONS = [
  "none", "pregnancy", "breastfeeding", "diabetes",
  "hypertension", "kidney disease", "liver disease", "heart disease",
];
export const MEDICATIONS = [
  "none", "antidiabetic", "antihypertensive", "anticoagulant", "antibiotics",
];
export const DOSAGE_FORMS = ["herbal tea", "powder", "capsule", "decoction"];

export const DEFAULT_HEALTH_FORM = {
  age_group: "adult",
  patient_condition: "none",
  medication_context: "none",
  dosage_form: "powder",
};

/** Dark-theme ports of the risk badge styles used on the member2 page. */
export const RISK_STYLES = {
  Safe: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Caution: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Contraindicated: "bg-red-500/10 text-red-300 border-red-500/30",
};
