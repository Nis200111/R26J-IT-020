import Link from "next/link";
import { Leaf, ArrowRight, ShieldCheck, Microscope, Sparkles } from "lucide-react";

export default function ExplainSection() {
  return (
    <Link href="/member3" className="block outline-none h-full">
      <section
        tabIndex={0}
        className="group relative cursor-pointer rounded-3xl border border-zinc-200/90 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-full flex flex-col justify-between"
      >
        <div className="flex flex-col gap-5 text-left">
          {/* Header & Icon */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-xs">
                <Leaf className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Research Component 03
                </span>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-emerald-950 transition-colors duration-300">
                  Medicinal Leaf Health Detection
                </h2>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-zinc-600 group-hover:text-zinc-700 transition-colors duration-300">
            AI-powered leaf health classification using EfficientNetB4 deep neural networks — accurately determines whether a medicinal herb leaf is healthy or diseased, verifying its suitability for Ayurvedic drug formulation.
          </p>

          {/* Capability checklist */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Microscope className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-zinc-700">
                EfficientNetB4 Deep Classifier
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-zinc-700">
                Healthy vs. Diseased Screening
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-zinc-700">
                Ayurvedic Remedies & Quality Verification
              </span>
            </div>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-all">
          <span className="uppercase tracking-wider">Analyze Leaf Specimen</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </section>
    </Link>
  );
}