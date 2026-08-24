import Link from "next/link";

export default function IntentSection() {
  return (
    <Link href="#" className="block outline-none h-full">
      <section
        tabIndex={0}
        className="group relative cursor-pointer rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-full flex flex-col"
      >
        <div className="flex flex-col gap-5 text-left h-full">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-emerald-600 group-hover:bg-emerald-100/50 group-hover:text-emerald-700 transition-all duration-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-800 group-hover:text-emerald-800 transition-colors duration-300">
              Intent Classification &amp; NLU
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-600 transition-colors duration-300">
            Natural Language Understanding engine optimized for interpreting indigenous medical queries and classifying user intent with high precision.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">INDIGENOUS DOMAIN ADAPTATION</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">QUERY INTENT MAPPING</span>
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0">
            EXPLORE NLU ENGINE
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </section>
    </Link>
  );
}
