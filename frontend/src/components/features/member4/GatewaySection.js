export default function GatewaySection() {
  return (
    <section 
      tabIndex={0}
      className="group relative cursor-pointer rounded-xl border border-zinc-800/50 bg-[#0a101f] p-8 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-amber-500/30 hover:bg-[#0d1526] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-all duration-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 group-hover:text-amber-500 transition-colors duration-500">
            System Gateway
          </h2>
        </div>

        <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-300">
          Centralized gateway managing API traffic, system health monitoring, and secure access to the heritage AI microservices.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">API TRAFFIC MANAGEMENT</span>
          </div>
          <div className="flex items-start gap-3">
            <svg className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">REAL-TIME MONITORING</span>
          </div>
        </div>
      </div>
    </section>
  );
}
