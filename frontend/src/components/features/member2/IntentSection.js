import Link from "next/link";

export default function IntentSection() {
  return (
    <Link href="/all-in-one" className="block outline-none h-full">
      <section
        tabIndex={0}
        className="group relative cursor-pointer rounded-2xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 h-full flex flex-col"
      >
        <div className="flex flex-col gap-5 text-left h-full">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-emerald-600 group-hover:bg-emerald-100/50 group-hover:text-emerald-700 transition-all duration-300">
              {/* open book - a knowledge base being consulted */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-800 group-hover:text-emerald-800 transition-colors duration-300">
              Herb Knowledge Assistant
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-600 transition-colors duration-300">
            A health-context-aware RAG assistant answering questions on Sri Lankan
            medicinal herbs from a verified knowledge base of 1,550 records &mdash; asking
            for your health context before giving any safety advice.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "RETRIEVAL-AUGMENTED GENERATION",
              "HEALTH-CONTEXT CLARIFICATION",
              "EXPLAINABLE SAFETY CLASSIFICATION",
            ].map((label) => (
              <div key={label} className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors duration-300">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0">
            ASK THE ASSISTANT
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </section>
    </Link>
  );
}
