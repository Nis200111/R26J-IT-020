import Link from "next/link";
import { Leaf } from "lucide-react";

export default function ExplainSection() {
  return (
    <Link href="/member3" className="block outline-none h-full">
      <section
        tabIndex={0}
        className="group relative cursor-pointer rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-full flex flex-col"
      >
        <div className="flex flex-col gap-5 text-left h-full">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-emerald-600 group-hover:bg-emerald-100/50 group-hover:text-emerald-700 transition-all duration-300">
              <Leaf className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-800 group-hover:text-emerald-800 transition-colors duration-300">
              Medicinal Leaf Health Detection
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-600 transition-colors duration-300">
            AI-powered leaf health classification using EfficientNetB4 deep learning — determines whether a medicinal leaf is healthy or diseased to verify its suitability for Ayurvedic medicine production.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">EFFICIENTNETB4 CLASSIFIER</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">HEALTHY vs DISEASED DETECTION</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">AYURVEDIC QUALITY VERIFICATION</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0">
            ANALYZE A LEAF
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </section>
    </Link>
  );
}