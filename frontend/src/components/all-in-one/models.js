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
 *
 * `external: true` means `href` points at a separately deployed app rather than
 * a route in this project, so it opens in a new tab.
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
    name: "Medical Plant Climate Forecasting",
    subtitle: "Infrastructure",
    input: "none",
    icon: Server,
    endpoint: "/api/member4/predict",
    href: "https://plant-woad.vercel.app/",
    external: true,
    blurb: "Predicted habitat suitability for medicinal plants across Sri Lanka from forecasted temperature and rainfall, 2026–2030.",
    placeholder: "This module takes no input",
    enabled: false,
  },
];

export const DEFAULT_MODEL_ID = "member2";

export const getModel = (id) => MODELS.find((m) => m.id === id) || MODELS[0];

/**
 * Health-context options.
 *
 * The listed values MUST stay exactly in sync with the categories the
 * contraindication risk classifier was trained on (see notebook 04).
 *
 * OTHER is the escape hatch for everything the classifier was never trained on
 * (asthma, thyroid disease, cancer, ...). Choosing it reveals a free-text box,
 * and whatever the user types is sent as-is. The backend recognises a value it
 * has no category for, refuses to guess, and returns "Caution" with a warning
 * instead — which is far safer than the alternative the user had before, which
 * was to leave "none" selected and be told the herb is Safe for a condition
 * they never got to mention.
 *
 * Duplicated from src/app/member2/page.js on purpose — they are unexported
 * locals there, and extracting them would mean editing a working page.
 */
export const OTHER = "other";

export const AGE_GROUPS = ["child", "adult", "elderly"];
export const CONDITIONS = [
  "none", "pregnancy", "breastfeeding", "diabetes",
  "hypertension", "kidney disease", "liver disease", "heart disease", OTHER,
];
export const MEDICATIONS = [
  "none", "antidiabetic", "antihypertensive", "anticoagulant", "antibiotics",
  OTHER,
];
export const DOSAGE_FORMS = ["herbal tea", "powder", "capsule", "decoction"];

export const DEFAULT_HEALTH_FORM = {
  age_group: "adult",
  patient_condition: "none",
  medication_context: "none",
  dosage_form: "powder",
  // Free text, used only while the matching dropdown is set to OTHER.
  patient_condition_other: "",
  medication_context_other: "",
};

/**
 * Turn the questionnaire state into the 4 fields the API expects, replacing an
 * "other" selection with what the user actually typed. A blank box still sends
 * "other", which the backend also treats as an unknown category rather than
 * silently downgrading it to "none".
 */
export function toHealthContext(form) {
  const pick = (value, typed) =>
    value === OTHER ? (typed || "").trim().toLowerCase() || OTHER : value;

  return {
    age_group: form.age_group,
    patient_condition: pick(form.patient_condition, form.patient_condition_other),
    medication_context: pick(form.medication_context, form.medication_context_other),
    dosage_form: form.dosage_form,
  };
}

/** Dark-theme ports of the risk badge styles used on the member2 page. */
export const RISK_STYLES = {
  Safe: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Caution: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Contraindicated: "bg-red-500/10 text-red-300 border-red-500/30",
};
