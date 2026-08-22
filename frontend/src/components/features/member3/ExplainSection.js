"use client";

import Link from "next/link";
import { Leaf, ScanSearch, FlaskConical, ArrowRight } from "lucide-react";

export default function ExplainSection() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-900/20 pointer-events-none rounded-2xl" />

      {/* Header */}
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
          <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Member 3 · Sahan
          </span>
          <h3 className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Medicinal Plant Disease Detection
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="relative z-10 mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        AI-powered dual-stage analysis that classifies plant diseases and
        quantifies infection spread at the pixel level — producing a{" "}
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          Medicinal Quality Score
        </span>{" "}
        to ensure only potent leaves reach production.
      </p>

      {/* Feature pills */}
      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        {[
          { icon: <ScanSearch className="h-3.5 w-3.5" />, label: "EfficientNetB4 Classifier" },
          { icon: <FlaskConical className="h-3.5 w-3.5" />, label: "U-Net Segmentation" },
          { icon: <Leaf className="h-3.5 w-3.5" />, label: "Quality Scoring" },
        ].map((pill) => (
          <span
            key={pill.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
          >
            {pill.icon}
            {pill.label}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-6">
        <Link
          href="/plant-disease-detection"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 hover:gap-3 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          Analyze a Plant
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}