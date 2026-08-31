"use client";

import { ShieldAlert } from "lucide-react";
import { AGE_GROUPS, CONDITIONS, MEDICATIONS, DOSAGE_FORMS, OTHER } from "./models";

/**
 * The clarification questionnaire. Shown when the assistant decides a query is
 * safety-sensitive and it does not yet know the user's health context.
 *
 * The dropdowns list exactly the categories the risk classifier was trained on,
 * plus an "other" option that opens a free-text box. A user whose condition is
 * not on the list used to have no honest choice here: leaving "none" selected
 * made the classifier score a healthy person and answer "Safe". Typing it in
 * instead lets the backend see a category it does not know, so it returns
 * "Caution" and says why, rather than guessing.
 */
export default function HealthContextForm({ followups, form, onChange, onSubmit, loading }) {
  const usesOther = form.patient_condition === OTHER || form.medication_context === OTHER;

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

        <div>
          <Select label="Condition" value={form.patient_condition} options={CONDITIONS}
            onChange={(v) => onChange({ ...form, patient_condition: v })} />
          {form.patient_condition === OTHER && (
            <TextInput
              placeholder="Type your condition, e.g. asthma"
              value={form.patient_condition_other}
              onChange={(v) => onChange({ ...form, patient_condition_other: v })}
            />
          )}
        </div>

        <div>
          <Select label="Medication" value={form.medication_context} options={MEDICATIONS}
            onChange={(v) => onChange({ ...form, medication_context: v })} />
          {form.medication_context === OTHER && (
            <TextInput
              placeholder="Type your medication, e.g. levothyroxine"
              value={form.medication_context_other}
              onChange={(v) => onChange({ ...form, medication_context_other: v })}
            />
          )}
        </div>

        <Select label="Dosage form" value={form.dosage_form} options={DOSAGE_FORMS}
          onChange={(v) => onChange({ ...form, dosage_form: v })} />
      </div>

      {/* Set expectations before the answer arrives, so "Caution" does not look
          like a fault. The risk model genuinely cannot score this input. */}
      {usesOther && (
        <p className="mt-3 text-xs leading-relaxed text-amber-200/80">
          The risk model was not trained on this, so it will not predict a risk level
          for you. You will get a Caution answer based only on what the knowledge base
          records for the herb, and a reminder to check with a practitioner.
        </p>
      )}

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
        {options.map((o) => (
          <option key={o} value={o}>{o === OTHER ? "other (not listed)" : o}</option>
        ))}
      </select>
    </label>
  );
}

/** Free-text box shown under a dropdown that is set to "other". */
function TextInput({ value, placeholder, onChange }) {
  return (
    <input
      type="text"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full rounded-xl border border-amber-500/30 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-amber-500/60"
    />
  );
}
