"use client";

import { CheckCircle2, XCircle, Leaf, Shield, AlertTriangle, RotateCcw, Sparkles, FlaskConical, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

function AnimatedConfidence({ value, isHealthy }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = (value / (duration / step));
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
    <span className={`text-5xl font-bold tabular-nums tracking-tight ${isHealthy ? "text-emerald-600" : "text-red-500"}`}>
      {display.toFixed(1)}
      <span className="text-2xl font-medium text-zinc-400">%</span>
    </span>
  );
}

const DISEASE_INFO = {
  Rust: {
    description: "Rust is a fungal disease that causes orange-brown pustules on leaf surfaces, reducing photosynthesis and weakening the plant.",
  },
  Rot: {
    description: "Rot is caused by fungal or bacterial pathogens that break down leaf tissue, leading to soft, discolored, and decaying areas.",
  },
  Anthracnose: {
    description: "Anthracnose is a fungal disease causing dark, sunken lesions on leaves, stems, and fruits, often in warm, humid conditions.",
  },
  "Bacterial Leaf Spot": {
    description: "Bacterial Leaf Spot causes water-soaked spots that turn brown with yellow halos, spreading rapidly in wet environments.",
  },
};

const PROB_BAR_COLORS = {
  Healthy: "bg-emerald-500",
  Rust: "bg-orange-500",
  Rot: "bg-amber-600",
  Anthracnose: "bg-purple-500",
  Bacterial_Leaf_Spot: "bg-rose-500",
};

export default function ResultDisplay({ result, originalImage, onReset }) {
  const isHealthy = result.isHealthy;
  const diseaseLabel = result.diseaseName || result.label;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-down">

      {/* Hero verdict card */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 p-8 transition-all ${
          isHealthy
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30"
            : "border-red-200 bg-gradient-to-br from-red-50 via-white to-amber-50/30"
        }`}
      >
        {/* Decorative glow */}
        <div
          className={`absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl opacity-20 ${
            isHealthy ? "bg-emerald-400" : "bg-red-400"
          }`}
        />

        <div className="relative flex flex-col sm:flex-row items-start gap-6">
          {/* Icon */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
              isHealthy
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isHealthy ? <Sparkles className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {isHealthy ? "Healthy" : diseaseLabel}
              </span>
              {!isHealthy && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Disease Detected
                </span>
              )}
            </div>

            <h2 className={`font-serif text-2xl font-bold leading-snug ${isHealthy ? "text-emerald-900" : "text-red-900"}`}>
              {isHealthy
                ? "Leaf Approved for Ayurvedic Production"
                : `${diseaseLabel} Detected — Leaf Rejected`}
            </h2>

            <p className={`text-sm leading-relaxed font-light ${isHealthy ? "text-emerald-700" : "text-red-700"}`}>
              {result.suitability}
            </p>
          </div>
        </div>
      </div>

      {/* Disease info card (only for diseased) */}
      {!isHealthy && DISEASE_INFO[diseaseLabel] && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">About {diseaseLabel}</p>
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
              <p className="text-xs font-semibold text-zinc-500 mb-1">Model Confidence</p>
              <AnimatedConfidence value={result.confidence} isHealthy={isHealthy} />
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isHealthy ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>

            {/* Classification */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
              <Leaf className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-500" : "text-red-400"}`} />
              <div>
                <p className="text-xs font-bold text-zinc-800">Classification</p>
                <p className={`text-sm font-semibold ${isHealthy ? "text-emerald-600" : "text-red-600"}`}>
                  {isHealthy ? "Healthy" : diseaseLabel}
                </p>
              </div>
            </div>

            {/* Suitability */}
            <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
              <Shield className={`h-5 w-5 shrink-0 ${isHealthy ? "text-emerald-500" : "text-red-400"}`} />
              <div>
                <p className="text-xs font-bold text-zinc-800">Ayurvedic Suitability</p>
                <p className={`text-xs font-medium ${isHealthy ? "text-emerald-600" : "text-red-600"}`}>
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
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">All Class Probabilities</p>
          </div>
          <div className="space-y-3">
            {Object.entries(result.allProbabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([className, prob]) => {
                const displayName = className.replace(/_/g, " ");
                const isTop = displayName === (isHealthy ? "Healthy" : diseaseLabel);
                return (
                  <div key={className}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isTop ? "text-zinc-900" : "text-zinc-500"}`}>
                        {displayName}
                        {isTop && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-600">
                            Predicted
                          </span>
                        )}
                      </span>
                      <span className={`text-xs font-bold tabular-nums ${isTop ? "text-zinc-900" : "text-zinc-400"}`}>
                        {prob.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isTop ? (PROB_BAR_COLORS[className] || "bg-zinc-400") : "bg-zinc-300"
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

      {/* Suitability message banner */}
      <div
        className={`flex items-center gap-4 rounded-2xl border p-5 ${
          isHealthy
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isHealthy ? "bg-emerald-100" : "bg-red-100"
          }`}
        >
          {isHealthy ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <p className={`text-sm font-bold ${isHealthy ? "text-emerald-800" : "text-red-800"}`}>
            {isHealthy
              ? "✅ Quality Verified — Safe for Ayurvedic Medicine Production"
              : "⚠️ Quality Warning — Do Not Use for Ayurvedic Medicine Production"}
          </p>
          <p className={`text-xs mt-0.5 ${isHealthy ? "text-emerald-600" : "text-red-600"}`}>
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
