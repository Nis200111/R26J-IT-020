"use client";

import { ShieldAlert } from "lucide-react";
import { AGE_GROUPS, CONDITIONS, MEDICATIONS, DOSAGE_FORMS } from "./models";

/**
 * The clarification questionnaire. Shown when the assistant decides a query is
 * safety-sensitive and it does not yet know the user's health context.
 *
 * Dropdowns only, deliberately — the risk classifier was trained on a fixed set
 * of categories, so free text would ask it to predict on something it has never
 * seen.
 */
export default function HealthContextForm({ followups, form, onChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-5"
    >
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-bold text-amber-100">A few safety details first</h3>
      </div>

      {followups?.length > 0 && (
        <ul className="mt-3 mb-4 list-disc space-y-1 pl-5 text-xs leading-relaxed text-zinc-400">
          {followups.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Age group" value={form.age_group} options={AGE_GROUPS}
          onChange={(v) => onChange({ ...form, age_group: v })} />
        <Select label="Condition" value={form.patient_condition} options={CONDITIONS}
          onChange={(v) => onChange({ ...form, patient_condition: v })} />
        <Select label="Medication" value={form.medication_context} options={MEDICATIONS}
          onChange={(v) => onChange({ ...form, medication_context: v })} />
        <Select label="Dosage form" value={form.dosage_form} options={DOSAGE_FORMS}
          onChange={(v) => onChange({ ...form, dosage_form: v })} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-[#c5a880] px-5 py-2 text-sm font-bold text-zinc-950 transition-colors hover:bg-[#b0936b] disabled:opacity-40"
      >
        {loading ? "Working…" : "Continue"}
      </button>
    </form>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-zinc-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
