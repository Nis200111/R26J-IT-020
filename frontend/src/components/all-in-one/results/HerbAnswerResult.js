import { ShieldCheck, ShieldAlert, Info, CornerDownRight } from "lucide-react";
import { RISK_STYLES } from "../models";

/**
 * Pulls the "Safety note: ..." paragraph out of the answer so it can be shown
 * last and in a quieter, smaller style. The model often writes it mid-answer,
 * ahead of details such as edible parts, which buries the rest of the answer.
 */
function splitSafetyNote(answer) {
  const isNote = (p) => /^\**\s*safety note\b/i.test(p.trim());
  const paragraphs = String(answer ?? "").split(/\n\s*\n/);
  return {
    body: paragraphs.filter((p) => !isNote(p)).join("\n\n").trim(),
    note: paragraphs.filter(isNote).join("\n\n").trim(),
  };
}

/**
 * Renders one answer from the RAG herb assistant (Member 2).
 *
 * Dark port of the layout used on src/app/member2/page.js, plus the outOfScope
 * case that page ignores.
 */
export default function HerbAnswerResult({ data }) {
  const riskCls = data.riskLevel ? RISK_STYLES[data.riskLevel] : null;
  const RiskIcon = data.riskLevel === "Safe" ? ShieldCheck : ShieldAlert;
  const { body, note } = splitSafetyNote(data.answer);

  return (
    <div>
      {/* Spelling correction, e.g. "kohoba" -> "Kohomba" */}
      {data.corrections?.length > 0 && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
          <Info className="h-3.5 w-3.5" />
          Showing results for <b className="text-zinc-300">{data.corrections[0][1]}</b>
        </p>
      )}

      {/* Resolved follow-up, e.g. "tell me more about that" */}
      {data.followedUpOn && (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
          <CornerDownRight className="h-3.5 w-3.5" />
          Continuing about <b className="text-zinc-300">{data.followedUpOn}</b>
        </p>
      )}

      {/* Badges */}
      {(data.intent || riskCls) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {data.intent && (
            <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {data.intent}
            </span>
          )}
          {riskCls && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${riskCls}`}
            >
              <RiskIcon className="h-3.5 w-3.5" />
              {data.riskLevel}
            </span>
          )}
        </div>
      )}

      {/* SHAP: which parts of the health context drove this risk level.
          Computed per prediction, so it changes with the user's context. */}
      {data.riskExplanation?.length > 0 && (
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Why this risk level
          </p>
          <ul className="space-y-1">
            {data.riskExplanation.map((e, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-zinc-400">
                  {e.feature.replace(/_/g, " ")}
                  {e.value ? <span className="text-zinc-200"> — {e.value}</span> : null}
                </span>
                {typeof e.impact === "number" && (
                  <span className={`shrink-0 font-mono text-[11px] ${
                    e.impact >= 0 ? "text-amber-300" : "text-emerald-300"
                  }`}>
                    {e.impact >= 0 ? "+" : ""}{e.impact.toFixed(3)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shown when the user's condition is outside the classifier's training data */}
      {data.riskWarning && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200">
          {data.riskWarning}
        </p>
      )}

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {body}
      </div>

      {/* Safety note: always last, and smaller/quieter than the answer itself. */}
      {note && (
        <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-zinc-500">
          {note}
        </p>
      )}

      {data.outOfScope && (
        <p className="mt-3 text-xs text-zinc-500">
          This question was outside the herb knowledge base, so no records were retrieved.
        </p>
      )}

      {/*
        Retrieved sources — hidden by request. The data is still returned by the
        API (data.sources), so uncommenting this block restores it. Worth turning
        back on for a demo: it is the visible evidence that answers come from the
        knowledge base rather than the language model's own memory.

      {data.sources?.length > 0 && (
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Retrieved sources
          </p>
          <ul className="space-y-1.5">
            {data.sources.map((s, i) => (
              <li key={i} className="text-xs leading-relaxed text-zinc-500">
                <b className="text-zinc-300">{s.herb}</b>
                {s.herbEnglish ? ` (${s.herbEnglish})` : ""} — {s.source}
                <span className="text-zinc-600"> · {s.sourceType} · {s.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      */}
    </div>
  );
}
