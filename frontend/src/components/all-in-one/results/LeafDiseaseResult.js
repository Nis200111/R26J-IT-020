import { ShieldCheck, ShieldAlert } from "lucide-react";

/**
 * Result card for Member 3 (leaf disease detection).
 *
 * NOTE ON UNITS: this endpoint returns `confidence` and `allProbabilities`
 * already as percentages (0-100). Member 1 returns 0-1 floats. Each result card
 * handles its own units - never normalise these in shared code.
 */
export default function LeafDiseaseResult({ data }) {
  const healthy = data.isHealthy;
  const Icon = healthy ? ShieldCheck : ShieldAlert;
  const badge = healthy
    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
    : "bg-amber-500/10 text-amber-300 border-amber-500/30";

  const probs = Object.entries(data.allProbabilities || {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${badge}`}>
          <Icon className="h-3.5 w-3.5" />
          {healthy ? "Healthy" : (data.diseaseName || data.label || "").replace(/_/g, " ")}
        </span>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          {typeof data.confidence === "number" ? `${data.confidence.toFixed(1)}% confidence` : ""}
        </span>
      </div>

      {data.suitability && (
        <p className="mb-4 text-sm leading-relaxed text-zinc-200">{data.suitability}</p>
      )}

      {probs.length > 0 && (
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            All class probabilities
          </p>
          <ul className="space-y-2">
            {probs.map(([name, pct], i) => (
              <li key={name}>
                <div className="mb-1 flex items-baseline justify-between text-xs">
                  <span className={i === 0 ? "text-zinc-200" : "text-zinc-500"}>
                    {name.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {Number(pct).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={i === 0 ? "h-full bg-[#c5a880]" : "h-full bg-zinc-700"}
                    style={{ width: `${Math.max(0, Math.min(100, Number(pct)))}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
        Classified with EfficientNetB4. This is an automated screening aid, not a
        substitute for expert inspection.
      </p>
    </div>
  );
}
