import { UserRound } from "lucide-react";

/** Compact summary of the health profile the assistant is currently using. */
export default function HealthContextChip({ healthContext, onReset }) {
  const parts = [
    healthContext.age_group,
    healthContext.patient_condition,
    healthContext.medication_context,
    healthContext.dosage_form,
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-between gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs">
      <span className="flex min-w-0 items-center gap-2 text-zinc-400">
        <UserRound className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="truncate">
          <b className="font-bold text-zinc-300">Health profile:</b> {parts.join(" · ")}
        </span>
      </span>
      <button
        onClick={onReset}
        className="shrink-0 font-bold text-[#c5a880] transition-colors hover:text-[#b0936b]"
      >
        Reset
      </button>
    </div>
  );
}
