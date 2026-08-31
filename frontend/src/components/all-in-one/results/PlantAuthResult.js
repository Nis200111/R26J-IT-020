import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

/**
 * Result card for Member 1 (plant authentication / adulterant detection).
 *
 * NOTE ON UNITS: this endpoint returns `confidence` as a FLOAT 0-1, whereas
 * member 3 returns a percentage 0-100. Each card converts its own units - never
 * normalise these in shared code.
 */
const STATUS = {
  high: {
    icon: ShieldCheck,
    cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    label: "Reliable match",
  },
  moderate: {
    icon: ShieldAlert,
    cls: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    label: "Likely match — verify manually",
  },
  low: {
    icon: AlertTriangle,
    cls: "bg-red-500/10 text-red-300 border-red-500/30",
    label: "Not confidently identified",
  },
};

const pretty = (name) => String(name || "").replace(/_/g, " ");

export default function PlantAuthResult({ data }) {
  const status = STATUS[data.status] || STATUS.low;
  const Icon = status.icon;
  const pct = (v) => (typeof v === "number" ? v * 100 : 0);   // 0-1 -> percent

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${status.cls}`}>
          <Icon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {/* Top prediction */}
      <p className="font-serif text-lg italic text-zinc-100">{pretty(data.label)}</p>
      <div className="mt-2 mb-4">
        <div className="mb-1 flex items-baseline justify-between text-xs">
          <span className="text-zinc-500">confidence</span>
          <span className="font-mono text-[11px] text-zinc-400">
            {pct(data.confidence).toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-[#c5a880]"
            style={{ width: `${Math.max(0, Math.min(100, pct(data.confidence)))}%` }}
          />
        </div>
      </div>

      {/* Runner-up - matters here because look-alike species are the whole problem */}
      {data.secondLabel && (
        <div className="border-t border-zinc-800 pt-3">
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-zinc-500">
              next closest — <span className="italic text-zinc-400">{pretty(data.secondLabel)}</span>
            </span>
            <span className="font-mono text-[11px] text-zinc-600">
              {pct(data.secondConfidence).toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-zinc-700"
              style={{ width: `${Math.max(0, Math.min(100, pct(data.secondConfidence)))}%` }}
            />
          </div>
        </div>
      )}

      {/* The adulterant warning - the reason this module exists */}
      {data.confusableWith && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200">
          <b>Possible species confusion.</b> This specimen is commonly mistaken for{" "}
          <span className="italic">{pretty(data.confusableWith)}</span>. Confirm with an
          expert before use in preparation.
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
        Automated botanical classification. Not a substitute for expert
        pharmacognosy verification.
      </p>
    </div>
  );
}
