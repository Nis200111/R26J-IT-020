"use client";

import {
  CheckCircle2,
  XCircle,
  Leaf,
  Shield,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FlaskConical,
  BarChart3,
  Award,
  ChevronDown,
  ChevronUp,
  Sprout,
  AlertOctagon,
  BookOpen
} from "lucide-react";
import { useState, useEffect } from "react";

function AnimatedConfidence({ value, isHealthy }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start * 10) / 10);
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span
      className={`text-5xl font-bold tabular-nums tracking-tight ${isHealthy ? "text-emerald-600" : "text-red-500"
        }`}
    >
      {display.toFixed(1)}
      <span className="text-2xl font-medium text-zinc-400">%</span>
    </span>
  );
}

const DISEASE_INFO = {
  Rust: {
    description:
      "Rust is a fungal disease that causes orange-brown pustules on leaf surfaces, reducing photosynthesis and weakening the plant.",
  },
  Rot: {
    description:
      "Rot is caused by fungal or bacterial pathogens that break down leaf tissue, leading to soft, discolored, and decaying areas.",
  },
  Anthracnose: {
    description:
      "Anthracnose is a fungal disease causing dark, sunken lesions on leaves, stems, and fruits, often in warm, humid conditions.",
  },
  "Bacterial Leaf Spot": {
    description:
      "Bacterial Leaf Spot causes water-soaked spots that turn brown with yellow halos, spreading rapidly in wet environments.",
  },
};

const REMEDIES_DATA = {
  Anthracnose: {
    title: "1. Anthracnose (අළු/කළු පුල්ලි රෝගය)",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "පත්‍රයට ජලය ඉසීම වළකින්න.",
      "සුදු ලූනු සාරය ජලය සමඟ මිශ්‍ර කර ඉසින්න.",
      "හිතකර ජෛව දිලීර නාශක (Trichoderma viride) පසට එක් කරන්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "බෝඩෝ මිශ්‍රණය 0.25% (Bordeaux Mixture) ශාකයට ඉසීම සහ පසට යෙදීම සිදු කරන්න.",
      "දැඩි ආසාදනවලදී Chlorothalonil හෝ Mancozeb අඩංගු දිලීර නාශකයක් යොදන්න."
    ],
    hasChemical: true
  },
  "Bacterial Leaf Spot": {
    title: "2. Bacterial Leaf Spot (බැක්ටීරියා පත්‍ර ලප රෝගය)",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "වගා බිමේ වාතාශ්‍රය හොඳින් පවත්වා ගන්න.",
      "ආසාදිත පත්‍ර නෙලීමෙන් පසු වහාම වත්තෙන් ඉවත් කර පුළුස්සා දමන්න.",
      "තඹ සල්ෆේට් (මල්කැක්කම්) සහ හුණු මිශ්‍ර කර සාදාගන්නා සාම්ප්‍රදායික බෝඩෝ මිශ්‍රණය (Bordeaux Mixture) බුලත් සහ කෝමාරිකා දෙකටම එකසේ ගැලපෙන විශිෂ්ට බැක්ටීරියා නාශකයකි."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "Copper Oxychloride 50% WP ද්‍රාවණය පත්‍රවල උඩ මෙන්ම විශේෂයෙන්ම යටි පැත්තද හොඳින් තෙත් වන සේ සති 2කට වරක් ඉසින්න."
    ],
    hasChemical: true
  },
  Rot: {
    title: "3. Rot Diseases (කුණුවීමේ රෝග - Foot/Stem/Leaf Rot)",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "වගා පාත්තිවල ජලය රැඳී සිටීමට ඉඩ නොදෙන්න (හොඳ ජලවහනයක් පවත්වා ගන්න).",
      "වේලන ලද කොහොඹ පුන්නක්කු (කොහොඹ ඇටවලින් කොහොඹ තෙල් මිරිකා හැරියාට පස්සේ ඉතිරි වන රොඩු කොටස වේලලා සකස් කරගන්නා වටිනා කාබනික පොහොරක් සහ ස්වාභාවික පළිබෝධ/දිලීර නාශකයක්.) පසට එකතු කරන්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "Ridomil Gold (mefenoxam + mancozeb) හෝ Copper Oxychloride 0.25% දියරයෙන් ශාකය පාමුල පස හොඳින් තෙත් කරන්න (Soil drenching)."
    ],
    hasChemical: true
  },
  Rust: {
    title: "4. Rust Diseases (මලකඩ රෝගය)",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "උදෑසන කාලයේදී පමණක් ශාකයට ජලය දමන්න (එවිට දහවල් වනවිට පත්‍ර වේලේ).",
      "මලකඩ වැළඳුණු කෝමාරිකා පිති හෝ බුලත් කොළ කපා ඉවත් කර, සිනිඳු නව පත්‍ර වර්ධනය වීමට ඉඩ හරින්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "අවශ්‍ය නම් Mancozeb වැනි ආරක්ෂක දිලීර නාශකයක් නව වර්ධනයන් (New flushes) මතට ඉසිය හැක."
    ],
    hasChemical: true
  },
  Healthy: {
    title: "5. Healthy Plant Maintenance (නීරෝගී ශාක පාලනය)",
    organicTitle: "නඩත්තු උපදෙස් (Maintenance Guidelines):",
    organic: [
      "වගාවේ පිරිසිදුකම දිගටම පවත්වා ගන්න.",
      "නිසි පරිදි කාබනික පොහොර යොදමින් ශාකයේ ස්වාභාවික ප්‍රතිශක්තිය වර්ධනය කරන්න.",
      "නව පැල සිටුවීමේදී රෝගවලින් තොර නීරෝගී දඬු/පැති පැල පමණක් භාවිත කරන්න."
    ],
    chemicalTitle: null,
    chemical: [],
    hasChemical: false
  }
};

const PROB_BAR_COLORS = {
  Healthy: "bg-emerald-500",
  Rust: "bg-orange-500",
  Rot: "bg-amber-600",
  Anthracnose: "bg-purple-500",
  Bacterial_Leaf_Spot: "bg-rose-500",
};

const GRADE_STYLES = {
  A: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  B: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-500",
    ring: "ring-amber-200",
  },
  C: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-500",
    ring: "ring-orange-200",
  },
  D: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-500",
    ring: "ring-red-200",
  },
};

export default function ResultDisplay({ result, originalImage, onReset }) {
  const isHealthy = result.isHealthy;
  const diseaseLabel = result.diseaseName || result.label;
  const grade = result.qualityGrade;
  const gradeStyle = grade ? GRADE_STYLES[grade.grade] || GRADE_STYLES.C : null;

  const [isRemediesOpen, setIsRemediesOpen] = useState(false);

  // Match the prediction label to key in REMEDIES_DATA
  const remedyKey = isHealthy ? "Healthy" : diseaseLabel;
  const remedyInfo = REMEDIES_DATA[remedyKey] || REMEDIES_DATA[result.label] || REMEDIES_DATA["Healthy"];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-down">
      {/* Hero verdict card */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-8 transition-all ${isHealthy
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30"
            : "border-red-200 bg-gradient-to-br from-red-50 via-white to-amber-50/30"
          }`}
      >
        {/* Decorative glow */}
        <div
          className={`absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl opacity-20 ${isHealthy ? "bg-emerald-400" : "bg-red-400"
            }`}
        />

        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          {/* Icon */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm ${isHealthy
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
              }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <XCircle className="h-8 w-8" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isHealthy
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {isHealthy ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {isHealthy ? "Healthy" : diseaseLabel}
              </span>
              {!isHealthy && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Disease Detected
                </span>
              )}
            </div>

            <h2
              className={`font-serif text-2xl font-bold leading-snug ${isHealthy ? "text-emerald-900" : "text-red-900"
                }`}
            >
              {isHealthy
                ? "Leaf Approved for Ayurvedic Production"
                : `${diseaseLabel} Detected — Leaf Rejected`}
            </h2>

            <p
              className={`text-sm leading-relaxed font-light ${isHealthy ? "text-emerald-700" : "text-red-700"
                }`}
            >
              {result.suitability}
            </p>
          </div>
        </div>
      </div>

      {/* Ayurvedic Medicinal Suitability (AMS) Quality Grade */}
      {grade && gradeStyle && (
        <div
          className={`rounded-2xl border-2 ${gradeStyle.border} ${gradeStyle.bg} p-6 shadow-sm`}
        >
          <div className="flex items-start gap-5">
            {/* Grade badge */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${gradeStyle.badge} shadow-lg ring-4 ${gradeStyle.ring}`}
            >
              <span className="text-2xl font-bold text-white">
                {grade.grade}
              </span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Award className={`h-4 w-4 ${gradeStyle.text}`} />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${gradeStyle.text}`}
                >
                  Ayurvedic Medicinal Suitability Grade
                </span>
              </div>

              <h3 className={`text-lg font-bold ${gradeStyle.text}`}>
                Grade {grade.grade} — {grade.title}
              </h3>

              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${gradeStyle.badge} text-white`}
              >
                {grade.status}
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                {grade.description}
              </p>
            </div>
          </div>

          {/* Grade scale visualization */}
          <div className="mt-5 pt-4 border-t border-zinc-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Quality Scale
            </p>
            <div className="flex gap-1">
              {[
                { g: "A", label: "Premium", color: "bg-emerald-500" },
                { g: "B", label: "Acceptable", color: "bg-amber-500" },
                { g: "C", label: "Uncertain", color: "bg-orange-500" },
                { g: "D", label: "Rejected", color: "bg-red-500" },
              ].map((item) => (
                <div key={item.g} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${item.g === grade.grade
                        ? `${item.color} shadow-sm scale-y-150`
                        : "bg-zinc-200"
                      }`}
                  />
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span
                      className={`text-[9px] font-bold ${item.g === grade.grade
                          ? "text-zinc-800"
                          : "text-zinc-400"
                        }`}
                    >
                      {item.g}
                    </span>
                    <span
                      className={`text-[8px] hidden sm:inline ${item.g === grade.grade
                          ? "text-zinc-600 font-semibold"
                          : "text-zinc-400"
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disease info card (only for diseased) */}
      {!isHealthy && DISEASE_INFO[diseaseLabel] && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">
              About {diseaseLabel}
            </p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              {DISEASE_INFO[diseaseLabel].description}
            </p>
          </div>
        </div>
      )}

      {/* Image + Confidence grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Original image */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Uploaded Specimen
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-sm aspect-square">
            <img
              src={originalImage}
              alt="Uploaded leaf"
              className="h-full w-full object-cover"
            />
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-500/60 rounded-tl-sm" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-500/60 rounded-tr-sm" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-500/60 rounded-bl-sm" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-500/60 rounded-br-sm" />
          </div>
        </div>

        {/* Confidence & Details */}
        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            AI Analysis
          </p>

          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex-1">
            {/* Confidence score */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-1">
                Model Confidence
              </p>
              <AnimatedConfidence
                value={result.confidence}
                isHealthy={isHealthy}
              />
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isHealthy ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Classification */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
              <Leaf
                className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-500" : "text-red-400"
                  }`}
              />
              <div>
                <p className="text-xs font-bold text-zinc-800">
                  Classification
                </p>
                <p
                  className={`text-sm font-semibold ${isHealthy ? "text-emerald-600" : "text-red-600"
                    }`}
                >
                  {isHealthy ? "Healthy" : diseaseLabel}
                </p>
              </div>
            </div>

            {/* Suitability */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
              <Shield
                className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-500" : "text-red-400"
                  }`}
              />
              <div>
                <p className="text-xs font-bold text-zinc-800">
                  Ayurvedic Suitability
                </p>
                <p
                  className={`text-xs font-medium ${isHealthy ? "text-emerald-600" : "text-red-600"
                    }`}
                >
                  {isHealthy ? "Approved for Production" : "Not Suitable"}
                </p>
              </div>
            </div>

            {/* Model */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
              <FlaskConical className="h-5 w-5 shrink-0 text-zinc-400" />
              <div>
                <p className="text-xs font-bold text-zinc-800">Model</p>
                <p className="text-xs text-zinc-500">EfficientNetB4 v3</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Probabilities */}
      {result.allProbabilities && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-zinc-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              All Class Probabilities
            </p>
          </div>
          <div className="space-y-3">
            {Object.entries(result.allProbabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([className, prob]) => {
                const displayName = className.replace(/_/g, " ");
                const isTop =
                  displayName === (isHealthy ? "Healthy" : diseaseLabel);
                return (
                  <div key={className}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-semibold ${isTop ? "text-zinc-900" : "text-zinc-500"
                          }`}
                      >
                        {displayName}
                        {isTop && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-600">
                            Predicted
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-xs font-bold tabular-nums ${isTop ? "text-zinc-900" : "text-zinc-400"
                          }`}
                      >
                        {prob.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isTop
                            ? PROB_BAR_COLORS[className] || "bg-zinc-400"
                            : "bg-zinc-300"
                          }`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────── */}
      {/* COLLAPSIBLE ACCORDION: Treatment & Management Guidelines */}
      {/* ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30 overflow-hidden shadow-sm transition-all">
        <button
          onClick={() => setIsRemediesOpen(!isRemediesOpen)}
          className="w-full flex items-center justify-between p-5 text-left font-bold text-zinc-800 hover:bg-emerald-50/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">
                View Ayurvedic Remedies & Treatment Guidelines
              </p>
              <p className="text-xs font-normal text-zinc-500">
                {remedyInfo.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-full px-3 py-1 shadow-xs">
            {isRemediesOpen ? (
              <>
                Hide Details <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View Guidelines ⬇️ <ChevronDown className="h-4 w-4" />
              </>
            )}
          </div>
        </button>

        {isRemediesOpen && (
          <div className="p-5 pt-0 border-t border-emerald-100/80 space-y-5 animate-fade-in">
            {/* Organic & Cultural Recommendations */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Sprout className="h-4 w-4 text-emerald-600" />
                <span>{remedyInfo.organicTitle}</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-zinc-700 leading-relaxed">
                {remedyInfo.organic.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Chemical Controls (Optional) */}
            {remedyInfo.hasChemical && remedyInfo.chemical.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  <span>{remedyInfo.chemicalTitle}</span>
                </div>
                <ul className="space-y-1.5 pl-6 list-disc text-xs text-zinc-700 leading-relaxed">
                  {remedyInfo.chemical.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Withholding Period Warning Box (Red Warning Label) */}
            {remedyInfo.hasChemical && (
              <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 mt-3">
                <AlertOctagon className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-900 uppercase tracking-wider">
                    අස්වනු තහනම් කාලය පිළිබඳ විශේෂ අනතුරු ඇඟවීම (Withholding Period Warning)
                  </p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed font-medium">
                    රසායනික ද්‍රව්‍ය / දිලීර නාශක යොදූ පසු **දින 30-45ක්** යනතුරු අස්වැන්න ආයුර්වේද ඖෂධ නිෂ්පාදනයට හෝ පරිභෝජනය සඳහා යොදා නොගන්න!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suitability message banner */}
      <div
        className={`flex items-center gap-4 rounded-2xl border p-5 ${isHealthy
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
          }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isHealthy ? "bg-emerald-100" : "bg-red-100"
            }`}
        >
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <p
            className={`text-sm font-bold ${isHealthy ? "text-emerald-800" : "text-red-800"
              }`}
          >
            {isHealthy
              ? "✅ Quality Verified — Safe for Ayurvedic Medicine Production"
              : "⚠️ Quality Warning — Do Not Use for Ayurvedic Medicine Production"}
          </p>
          <p
            className={`text-xs mt-0.5 ${isHealthy ? "text-emerald-600" : "text-red-600"
              }`}
          >
            {isHealthy
              ? "This leaf has passed the AI health screening and is certified for medicinal use."
              : `${diseaseLabel} detected. This leaf must be discarded to maintain medicinal quality standards.`}
          </p>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 self-start rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-sm"
      >
        <RotateCcw className="h-4 w-4" />
        Analyze Another Leaf
      </button>
    </div>
  );
}
