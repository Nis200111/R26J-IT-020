/* eslint-disable @next/next/no-img-element */
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
  BookOpen,
  Info,
  Check,
  ShieldAlert,
  ArrowRight
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
      className={`text-5xl sm:text-6xl font-extrabold tabular-nums tracking-tight ${isHealthy ? "text-emerald-600" : "text-rose-600"
        }`}
    >
      {display.toFixed(1)}
      <span className="text-2xl sm:text-3xl font-semibold text-zinc-400 ml-1">%</span>
    </span>
  );
}

const DISEASE_INFO = {
  Rust: {
    sinhalaName: "මලකඩ රෝගය",
    description:
      "Rust is a fungal disease that causes orange-brown pustules on leaf surfaces, reducing photosynthesis, draining plant nutrients, and weakening the entire medicinal herb.",
  },
  Rot: {
    sinhalaName: "කුණුවීමේ රෝගය (Foot / Stem / Leaf Rot)",
    description:
      "Rot is caused by destructive fungal or bacterial pathogens that break down leaf tissue, leading to soft, discolored, and decaying necrotic areas unfit for human or medicinal consumption.",
  },
  Anthracnose: {
    sinhalaName: "අළු / කළු පුල්ලි රෝගය",
    description:
      "Anthracnose is a fungal disease causing dark, sunken lesions on leaves, stems, and veins, accelerating leaf fall and spreading rapidly in humid environments.",
  },
  "Bacterial Leaf Spot": {
    sinhalaName: "බැක්ටීරියා පත්‍ර ලප රෝගය",
    description:
      "Bacterial Leaf Spot causes water-soaked spots that turn brown with characteristic yellow halos, spreading fast through water splashes and destroying active medicinal phytochemicals.",
  },
};

const REMEDIES_DATA = {
  Anthracnose: {
    title: "Anthracnose (අළු/කළු පුල්ලි රෝගය)",
    subtitle: "දිලීර ආසාදනය පාලනය සහ පත්‍ර ආරක්ෂණ මාර්ගෝපදේශ",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "පත්‍ර මතට කෙලින්ම ජලය ඉසීමෙන් වළකින්න (පත්‍ර නිතර තෙත්ව පැවතීම දිලීර බීජාණු ව්‍යාප්තියට හේතු වේ).",
      "ස්වාභාවික දිලීර නාශකයක් ලෙස සුදු ලූනු සාරය ජලය සමඟ මිශ්‍ර කර ශාක පත්‍රවලට ඉසින්න.",
      "හිතකර ක්ෂුද්‍ර ජීවී ජෛව දිලීර නාශකයක් වන ට්‍රයිකොඩර්මා (Trichoderma viride) පසට එක් කරන්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "සාම්ප්‍රදායික බෝඩෝ මිශ්‍රණය 0.25% (Bordeaux Mixture) ශාකයට ඉසීම සහ පාමුල පසට යෙදීම සිදු කරන්න.",
      "දැඩි ආසාදන අවස්ථාවලදී පමණක් Chlorothalonil හෝ Mancozeb අඩංගු නිර්දේශිත දිලීර නාශකයක් යොදන්න."
    ],
    hasChemical: true
  },
  "Bacterial Leaf Spot": {
    title: "Bacterial Leaf Spot (බැක්ටීරියා පත්‍ර ලප රෝගය)",
    subtitle: "බැක්ටීරියා පැතිරීම වැළැක්වීම සහ පත්‍ර ආරක්ෂාව",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "වගා බිමේ ශාක අතර හොඳින් හිරු එළිය සහ වාතාශ්‍රය ලැබෙන සේ පරතරය පවත්වා ගන්න.",
      "ආසාදිත පත්‍ර නෙලීමෙන් පසු වහාම වගා බිමෙන් ඉවත් කර පුළුස්සා විනාශ කර දමන්න.",
      "තඹ සල්ෆේට් (මල්කැක්කම්) සහ හුණු මිශ්‍ර කර සාදාගන්නා සාම්ප්‍රදායික බෝඩෝ මිශ්‍රණය (Bordeaux Mixture) බුලත් සහ කෝමාරිකා දෙකටම එකසේ ගැලපෙන විශිෂ්ට බැක්ටීරියා නාශකයකි."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "Copper Oxychloride 50% WP ද්‍රාවණය පත්‍රවල උඩ මෙන්ම විශේෂයෙන්ම යටි පැත්තද හොඳින් තෙත් වන සේ සති 2කට වරක් ඉසින්න."
    ],
    hasChemical: true
  },
  Rot: {
    title: "Rot Diseases (කුණුවීමේ රෝග - Foot/Stem/Leaf Rot)",
    subtitle: "ජලවහනය හා පාංශු දිලීර මර්දන උපදෙස්",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "වගා පාත්තිවල ජලය කිසිසේත්ම රැඳී සිටීමට ඉඩ නොදෙන්න; උස් පාත්ති සහ හොඳ ජලවහනයක් සහතික කරන්න.",
      "වේලන ලද කොහොඹ පුන්නක්කු (කොහොඹ ඇටවලින් තෙල් මිරිකා ගත් පසු ඉතිරිවන රොඩු වේලලා සකස් කළ ස්වාභාවික පළිබෝධ/දිලීර නාශක කාබනික පොහොර) පසට එකතු කරන්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "Ridomil Gold (mefenoxam + mancozeb) හෝ Copper Oxychloride 0.25% දියරයෙන් ශාකය පාමුල පස හොඳින් තෙත් කරන්න (Soil drenching)."
    ],
    hasChemical: true
  },
  Rust: {
    title: "Rust Diseases (මලකඩ රෝගය)",
    subtitle: "දිලීර මලකඩ පැල්ලම් මර්දනය හා නව පත්‍ර ආරක්ෂාව",
    organicTitle: "කාබනික සහ වගා පාලන නිර්දේශ (Organic & Cultural Management):",
    organic: [
      "උදෑසන කාලයේදී පමණක් ශාකයට ජලය දමන්න (එවිට දහවල් වනවිට පත්‍ර හොඳින් වියළී දිලීර බෝවීම වළකී).",
      "මලකඩ රෝගය වැළඳුණු ආසාදිත කෝමාරිකා පිති හෝ බුලත් කොළ කපා වහාම ඉවත් කර, නීරෝගී නව පත්‍ර වර්ධනයට ඉඩ හරින්න."
    ],
    chemicalTitle: "රසායනික පාලන ක්‍රම (Chemical Control - Optional):",
    chemical: [
      "අවශ්‍ය නම් පමණක් Mancozeb වැනි ආරක්ෂිත දිලීර නාශකයක් ශාකයේ නව වර්ධනයන් (New flushes) මතට ඉසින්න."
    ],
    hasChemical: true
  },
  Healthy: {
    title: "Healthy Plant Maintenance (නීරෝගී ශාක පාලනය)",
    subtitle: "ආයුර්වේද ඖෂධීය ගුණ උපරිමව තබාගැනීමේ ක්‍රමවේද",
    organicTitle: "නඩත්තු සහ ආරක්ෂණ උපදෙස් (Maintenance Guidelines):",
    organic: [
      "වගාවේ පිරිසිදුකම සහ වල් මර්ධනය නොකඩවා දිගටම පවත්වා ගන්න.",
      "නිසි පරිදි දිරාපත් වූ කාබනික කොම්පෝස්ට් පොහොර යොදමින් ශාකයේ ස්වාභාවික ප්‍රතිශක්තිය හා පත්‍ර සාරය වර්ධනය කරන්න.",
      "නව පැල සිටුවීමේදී රෝගවලින් තොර සහතික කළ නීරෝගී දඬු සහ පැල පමණක් භාවිත කරන්න."
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
    bg: "bg-emerald-50/80",
    border: "border-emerald-300",
    text: "text-emerald-800",
    badge: "bg-emerald-600",
    ring: "ring-emerald-200",
    accent: "bg-emerald-100",
  },
  B: {
    bg: "bg-amber-50/80",
    border: "border-amber-300",
    text: "text-amber-800",
    badge: "bg-amber-600",
    ring: "ring-amber-200",
    accent: "bg-amber-100",
  },
  C: {
    bg: "bg-orange-50/80",
    border: "border-orange-300",
    text: "text-orange-800",
    badge: "bg-orange-600",
    ring: "ring-orange-200",
    accent: "bg-orange-100",
  },
  D: {
    bg: "bg-rose-50/80",
    border: "border-rose-300",
    text: "text-rose-800",
    badge: "bg-rose-600",
    ring: "ring-rose-200",
    accent: "bg-rose-100",
  },
};

export default function ResultDisplay({ result, originalImage, onReset }) {
  const isHealthy = result.isHealthy;
  const diseaseLabel = result.diseaseName || result.label;
  const grade = result.qualityGrade;
  const gradeStyle = grade ? GRADE_STYLES[grade.grade] || GRADE_STYLES.C : null;

  // Open remedies section by default so farmers/users see vital treatments clearly!
  const [isRemediesOpen, setIsRemediesOpen] = useState(true);

  // Match the prediction label to key in REMEDIES_DATA
  const remedyKey = isHealthy ? "Healthy" : diseaseLabel;
  const remedyInfo = REMEDIES_DATA[remedyKey] || REMEDIES_DATA[result.label] || REMEDIES_DATA["Healthy"];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-down">
      {/* ──────────────────────────────────────────── */}
      {/* 1. HERO VERDICT CARD */}
      {/* ──────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-6 sm:p-8 transition-all shadow-sm ${isHealthy
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40"
          : "border-rose-300 bg-gradient-to-br from-rose-50 via-white to-amber-50/40"
          }`}
      >
        {/* Decorative blur glow */}
        <div
          className={`absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-25 pointer-events-none ${isHealthy ? "bg-emerald-500" : "bg-rose-500"
            }`}
        />

        <div className="relative flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          {/* Main Status Icon */}
          <div
            className={`flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl shadow-md ring-4 ${isHealthy
              ? "bg-emerald-500 text-white ring-emerald-100"
              : "bg-rose-500 text-white ring-rose-100"
              }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-9 w-9 sm:h-11 sm:w-11" />
            ) : (
              <XCircle className="h-9 w-9 sm:h-11 sm:w-11" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-xs ${isHealthy
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
              >
                {isHealthy ? (
                  <Sparkles className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {isHealthy ? "Healthy Leaf Verified" : diseaseLabel}
              </span>

              {!isHealthy && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 border border-amber-300 shadow-xs">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Disease Detected
                </span>
              )}

              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                Confidence: {result.confidence?.toFixed(1)}%
              </span>
            </div>

            <h2
              className={`font-serif text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${isHealthy ? "text-emerald-950" : "text-rose-950"
                }`}
            >
              {isHealthy
                ? "Healthy Appearance Predicted (Visual Screening)"
                : `${diseaseLabel} Detected — Expert Review Recommended`}
            </h2>

            <p
              className={`text-base sm:text-lg leading-relaxed font-normal ${isHealthy ? "text-emerald-800" : "text-rose-800"
                }`}
            >
              {result.suitability || (isHealthy
                ? "Classified as healthy based on visible image features. Visual screening completed; medicinal suitability is not verified."
                : `Visual disease indicators of ${diseaseLabel} detected. Disease Predicted — Expert Review Recommended.`)}
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────── */}
      {/* 2. PROPOSED VISUAL LEAF-CONDITION GRADE */}
      {/* ──────────────────────────────────────────── */}
      {grade && gradeStyle && (
        <div
          className={`rounded-3xl border-2 ${gradeStyle.border} ${gradeStyle.bg} p-6 sm:p-7 shadow-sm transition-all`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Grade Badge */}
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl ${gradeStyle.badge} text-white shadow-lg ring-4 ${gradeStyle.ring}`}
            >
              <div className="text-center">
                <span className="text-3xl sm:text-4xl font-black tracking-tight block leading-none">
                  {grade.grade}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
                  Grade
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Award className={`h-4 w-4 ${gradeStyle.text}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${gradeStyle.text}`}>
                  Proposed Visual Leaf-Condition Grade
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${gradeStyle.badge} text-white`}
                >
                  {grade.status === "Approved" || grade.status === "Healthy Appearance Predicted"
                    ? "Healthy Appearance Predicted"
                    : grade.status === "Strictly Rejected"
                      ? "Disease Predicted — Expert Review Recommended"
                      : grade.status}
                </span>
              </div>

              <h3 className={`text-xl sm:text-2xl font-bold ${gradeStyle.text}`}>
                Grade {grade.grade} — {grade.title === "Premium Medicinal Quality" ? "High-Confidence Healthy Prediction" : grade.title === "Acceptable Medicinal Quality" ? "Moderate-Confidence Healthy Prediction" : grade.title.startsWith("Rejected") ? `Disease Predicted — ${diseaseLabel}` : grade.title}
              </h3>

              {/* Explicit Scope Sub-Clarification */}
              <p className="text-xs sm:text-sm font-semibold text-zinc-700 bg-white/70 rounded-xl p-2.5 border border-zinc-200/60">
                Based on the predicted leaf condition and model confidence. This grade does not certify medicinal quality or safety.
              </p>

              <p className="text-sm sm:text-base text-zinc-700 leading-relaxed font-normal">
                {grade.description}
              </p>
            </div>
          </div>

          {/* Scientific Threshold & Confidence Banding Clarification */}
          <div className="mt-5 rounded-2xl bg-white/85 border border-zinc-200/90 p-4 sm:p-5 text-xs sm:text-sm text-zinc-600 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 text-xs sm:text-sm">
              <Info className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Heuristic Confidence Band Clarification (85% &amp; 65% Thresholds):</span>
            </div>
            <p className="leading-relaxed font-medium text-zinc-800">
              &ldquo;The 85% and 65% thresholds are heuristic cut-offs used to separate healthy predictions into confidence bands. They are not clinically or pharmacologically validated limits.&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[12px]">
              <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-200/70">
                <span className="font-bold text-emerald-900">Grade A (&gt;85%):</span>
                <span className="ml-1 text-zinc-700">ඉහළ confidence සහිත Healthy prediction.</span>
              </div>
              <div className="bg-amber-50/80 rounded-xl p-2.5 border border-amber-200/70">
                <span className="font-bold text-amber-900">Grade B (65%–85%):</span>
                <span className="ml-1 text-zinc-700">මධ්‍යම confidence සහිත Healthy prediction.</span>
              </div>
              <div className="bg-orange-50/80 rounded-xl p-2.5 border border-orange-200/70">
                <span className="font-bold text-orange-900">Grade C (≤65%):</span>
                <span className="ml-1 text-zinc-700">අවිනිශ්චිත Healthy prediction; manual review අවශ්‍යයි.</span>
              </div>
              <div className="bg-rose-50/80 rounded-xl p-2.5 border border-rose-200/70">
                <span className="font-bold text-rose-900">Grade D (Disease):</span>
                <span className="ml-1 text-zinc-700">Disease-predicted leaf; expert inspection අවශ්‍යයි.</span>
              </div>
            </div>

          </div>

          {/* Grade Scale Bar */}
          <div className="mt-5 pt-4 border-t border-zinc-300/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Confidence Band Classification
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                Current: <strong className="text-zinc-800">Grade {grade.grade}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { g: "A", label: "Grade A", sub: "High Conf", color: "bg-emerald-500", ring: "ring-emerald-400" },
                { g: "B", label: "Grade B", sub: "Mod Conf", color: "bg-amber-500", ring: "ring-amber-400" },
                { g: "C", label: "Grade C", sub: "Uncertain", color: "bg-orange-500", ring: "ring-orange-400" },
                { g: "D", label: "Grade D", sub: "Disease Pred", color: "bg-rose-500", ring: "ring-rose-400" },
              ].map((item) => {
                const isActive = item.g === grade.grade;
                return (
                  <div
                    key={item.g}
                    className={`rounded-xl p-2.5 text-center transition-all ${isActive
                      ? "bg-white shadow-md ring-2 " + item.ring
                      : "bg-white/50 opacity-70"
                      }`}
                  >
                    <div
                      className={`h-2.5 w-full rounded-full mb-1.5 ${isActive ? item.color : "bg-zinc-200"
                        }`}
                    />
                    <p className={`text-xs font-bold ${isActive ? "text-zinc-900" : "text-zinc-500"}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                      {item.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ──────────────────────────────────────────── */}
      {/* 3. DISEASE INFO CARD (If Diseased) */}
      {/* ──────────────────────────────────────────── */}
      {!isHealthy && DISEASE_INFO[diseaseLabel] && (
        <div className="flex items-start gap-4 rounded-3xl border-2 border-amber-300 bg-amber-50/80 p-5 sm:p-6 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-200/70 text-amber-800">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base sm:text-lg font-bold text-amber-950">
                About {diseaseLabel}
              </h4>
              {DISEASE_INFO[diseaseLabel].sinhalaName && (
                <span className="text-xs sm:text-sm font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  ({DISEASE_INFO[diseaseLabel].sinhalaName})
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-amber-900 leading-relaxed font-normal">
              {DISEASE_INFO[diseaseLabel].description}
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────── */}
      {/* 4. SPECIMEN & AI ANALYSIS GRID */}
      {/* ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Specimen Card */}
        <div className="flex flex-col gap-2 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-emerald-600" />
              Uploaded Specimen
            </span>
            <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
              224 × 224 Input
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-inner aspect-square bg-zinc-900/5 mt-1">
            <img
              src={originalImage}
              alt="Uploaded leaf"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {/* Viewfinder corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-500/80 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-500/80 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-500/80 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-500/80 rounded-br-sm pointer-events-none" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="rounded-full bg-black/60 backdrop-blur-xs px-3 py-1 text-[11px] font-semibold text-white">
                Live Scan Complete
              </span>
            </div>
          </div>
        </div>

        {/* AI Confidence & Diagnostic Details */}
        <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                AI Model Confidence
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                EfficientNetB4 v3
              </span>
            </div>

            <div className="my-3">
              <AnimatedConfidence
                value={result.confidence}
                isHealthy={isHealthy}
              />
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-100 p-0.5 border border-zinc-200">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isHealthy ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key diagnostics breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
              <div className="flex items-center gap-2.5">
                <Leaf
                  className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-600" : "text-rose-500"
                    }`}
                />
                <span className="text-xs font-semibold text-zinc-600">
                  Detected Condition
                </span>
              </div>
              <span
                className={`text-sm font-bold ${isHealthy ? "text-emerald-700" : "text-rose-700"
                  }`}
              >
                {isHealthy ? "Healthy" : diseaseLabel}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
              <div className="flex items-center gap-2.5">
                <Shield
                  className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-600" : "text-rose-500"
                    }`}
                />
                <span className="text-xs font-semibold text-zinc-600">
                  Visual Screening Assessment
                </span>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold ${isHealthy ? "text-emerald-700" : "text-rose-700"
                  }`}
              >
                {isHealthy ? "Healthy Appearance Predicted" : "Disease Predicted — Review Advised"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="h-5 w-5 shrink-0 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-600">
                  Deep Learning Backbone
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-700">
                EfficientNetB4 (AMS v3)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────── */}
      {/* 5. ALL CLASS PROBABILITIES */}
      {/* ──────────────────────────────────────────── */}
      {result.allProbabilities && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Class Probability Distribution
              </h4>
            </div>
            <span className="text-xs text-zinc-400">Softmax Scores</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(result.allProbabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([className, prob]) => {
                const displayName = className.replace(/_/g, " ");
                const isTop =
                  displayName === (isHealthy ? "Healthy" : diseaseLabel);
                return (
                  <div key={className} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold flex items-center gap-2 ${isTop ? "text-zinc-900 font-bold" : "text-zinc-600"
                          }`}
                      >
                        {displayName}
                        {isTop && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                            Top Prediction
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-sm font-bold tabular-nums ${isTop ? "text-zinc-900" : "text-zinc-400"
                          }`}
                      >
                        {prob.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isTop
                          ? PROB_BAR_COLORS[className] || "bg-emerald-500"
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
      {/* 6. VITAL: AYURVEDIC REMEDIES & TREATMENT FUNCTION */}
      {/* (ENHANCED FOR MAXIMUM CLARITY AND LARGE LEGIBLE FONTS) */}
      {/* ──────────────────────────────────────────── */}
      <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40 overflow-hidden shadow-md transition-all">
        {/* Accordion Toggle Header */}
        <button
          onClick={() => setIsRemediesOpen(!isRemediesOpen)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-emerald-50/80 cursor-pointer focus:outline-none"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  <Sprout className="h-3.5 w-3.5" />
                  Ayurvedic Advisory
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {remedyInfo.title}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 mt-1">
                Ayurvedic Remedies & Treatment Guidelines
              </h3>
              <p className="text-sm sm:text-base font-medium text-emerald-800 mt-0.5">
                ආයුර්වේද ප්‍රතිකාර, කාබනික සහ වගා නිර්දේශ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800 bg-white border border-emerald-300 rounded-full px-4 py-2 shadow-xs shrink-0">
            {isRemediesOpen ? (
              <>
                <span> (Hide)</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>විස්තර බලන්න (View)</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </div>
        </button>

        {isRemediesOpen && (
          <div className="p-5 sm:p-8 pt-2 border-t border-emerald-200/80 space-y-6 animate-fade-in">
            {/* Condition Header Subtitle */}
            <div className="rounded-2xl bg-white/80 border border-emerald-200/80 p-4 shadow-2xs">
              <p className="text-base sm:text-lg font-bold text-emerald-950">
                {remedyInfo.title}
              </p>
              {remedyInfo.subtitle && (
                <p className="text-sm sm:text-base text-zinc-600 mt-0.5">
                  {remedyInfo.subtitle}
                </p>
              )}
            </div>

            {/* SECTION 1: Organic & Cultural Recommendations */}
            <div className="rounded-2xl bg-white border border-emerald-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Sprout className="h-5 w-5" />
                </div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-emerald-900">
                  {remedyInfo.organicTitle}
                </h4>
              </div>

              <div className="space-y-3">
                {remedyInfo.organic.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl bg-emerald-50/40 border border-emerald-100 p-3.5 sm:p-4 transition-all hover:bg-emerald-50/70"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-base sm:text-[17px] text-zinc-800 leading-relaxed font-normal">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Chemical Controls (Optional) */}
            {remedyInfo.hasChemical && remedyInfo.chemical.length > 0 && (
              <div className="rounded-2xl bg-white border border-purple-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-purple-100">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-purple-950">
                    {remedyInfo.chemicalTitle}
                  </h4>
                </div>

                <div className="space-y-3">
                  {remedyInfo.chemical.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl bg-purple-50/40 border border-purple-100 p-3.5 sm:p-4 transition-all hover:bg-purple-50/70"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-base sm:text-[17px] text-zinc-800 leading-relaxed font-normal">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: WITHHOLDING PERIOD WARNING (RED CALLOUT) */}
            {remedyInfo.hasChemical && (
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-5 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                    <AlertOctagon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md">
                      ආරක්ෂක අනතුරු ඇඟවීම · Safety Notice
                    </span>
                    <h5 className="text-base sm:text-lg font-bold text-rose-950 mt-1">
                      අස්වනු තහනම් කාලය පිළිබඳ විශේෂ අනතුරු ඇඟවීම (Withholding Period Warning)
                    </h5>
                  </div>
                </div>

                <div className="pl-0 sm:pl-12">
                  <p className="text-base sm:text-[17px] text-rose-950 leading-relaxed font-normal">
                    රසායනික ද්‍රව්‍ය හෝ දිලීර නාශක යෙදීමෙන් පසු{" "}
                    <span className="inline-block bg-rose-600 text-white font-extrabold px-2.5 py-0.5 rounded-lg text-sm sm:text-base mx-1 shadow-xs">
                      දින 30 — 45 ක්
                    </span>{" "}
                    ගතවනතුරු කිසිදු අස්වැන්නක් ආයුර්වේද ඖෂධ නිෂ්පාදනයට හෝ ආහාර පරිභෝජනය සඳහා යොදා නොගන්න!
                  </p>
                  <p className="text-xs sm:text-sm text-rose-800 mt-2 font-medium">
                    රසායනික අවශේෂ (Chemical Residues) ඖෂධීය සංයුතියට අහිතකර බැවින් මෙම කාල සීමාව දැඩිව පිළිපදින්න.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────── */}
      {/* 7. VISUAL SCREENING SUMMARY BANNER */}
      {/* ──────────────────────────────────────────── */}
      <div
        className={`flex items-start sm:items-center gap-4 rounded-3xl border-2 p-5 sm:p-6 shadow-sm ${isHealthy
          ? "border-emerald-300 bg-emerald-50/90"
          : "border-rose-300 bg-rose-50/90"
          }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${isHealthy ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
        >
          {isHealthy ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <AlertTriangle className="h-7 w-7" />
          )}
        </div>
        <div className="flex-1">
          <p
            className={`text-base sm:text-lg font-bold ${isHealthy ? "text-emerald-950" : "text-rose-950"
              }`}
          >
            {isHealthy
              ? " Visual Screening Completed — Medicinal Suitability Not Certified"
              : " Disease Predicted — Expert Inspection Recommended"}
          </p>
          <p
            className={`text-sm sm:text-base mt-1 leading-relaxed ${isHealthy ? "text-emerald-800" : "text-rose-800"
              }`}
          >
            {isHealthy
              ? "This leaf was classified as healthy based on visible image features. Computer vision evaluates superficial features only and does not verify biochemical active compounds, chemical residues, or pharmacological efficacy."
              : `Visual indicators of ${diseaseLabel} were predicted from surface image features. Physical inspection and expert review are recommended before discarding or handling.`}
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────── */}
      {/* 8. RESET BUTTON */}
      {/* ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm sm:text-base font-bold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-400 hover:shadow-md cursor-pointer active:scale-98"
        >
          <RotateCcw className="h-5 w-5 text-zinc-600" />
          Analyze Another Leaf (වෙනත් පත්‍රයක් පරීක්ෂා කරන්න)
        </button>
      </div>
    </div>
  );
}
