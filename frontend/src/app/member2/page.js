"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Send, Loader2, ShieldAlert, ShieldCheck, Info, BookOpen } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// These options match exactly what the contraindication risk classifier was
// trained on, plus OTHER for everything it was not. Picking OTHER opens a text
// box; what the user types is sent as-is, and the backend answers with Caution
// and an explanation rather than scoring a category it has never seen. Without
// it, a user with (say) asthma had to leave "none" selected and was told the
// herb was Safe for a condition they never got to mention.
const OTHER = "other";
const AGE_GROUPS = ["child", "adult", "elderly"];
const CONDITIONS = [
  "none", "pregnancy", "breastfeeding", "diabetes",
  "hypertension", "kidney disease", "liver disease", "heart disease", OTHER,
];
const MEDICATIONS = [
  "none", "antidiabetic", "antihypertensive", "anticoagulant", "antibiotics",
  OTHER,
];
const DOSAGE_FORMS = ["herbal tea", "powder", "capsule", "decoction"];

/** Questionnaire state -> the 4 fields the API expects. */
function toHealthContext(form) {
  const pick = (value, typed) =>
    value === OTHER ? (typed || "").trim().toLowerCase() || OTHER : value;

  return {
    age_group: form.age_group,
    patient_condition: pick(form.patient_condition, form.patient_condition_other),
    medication_context: pick(form.medication_context, form.medication_context_other),
    dosage_form: form.dosage_form,
  };
}

const RISK_STYLES = {
  Safe: { icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  Caution: { icon: ShieldAlert, cls: "bg-amber-50 text-amber-800 border-amber-200" },
  Contraindicated: { icon: ShieldAlert, cls: "bg-red-50 text-red-800 border-red-200" },
};

export default function Member2Page() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastHerb, setLastHerb] = useState(null);

  // Health context is collected once and reused for the rest of the session.
  const [healthContext, setHealthContext] = useState(null);
  const [pendingQuery, setPendingQuery] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [form, setForm] = useState({
    age_group: "adult",
    patient_condition: "none",
    medication_context: "none",
    dosage_form: "powder",
    // Free text, used only while the matching dropdown is set to OTHER.
    patient_condition_other: "",
    medication_context_other: "",
  });

  async function callApi(q, ctx) {
    const res = await fetch(`${API_URL}/api/member2/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, healthContext: ctx, lastHerb }),
    });
    return res.json();
  }

  async function send(q, ctx) {
    setLoading(true);
    try {
      const data = await callApi(q, ctx);

      if (data.error) {
        setMessages((m) => [...m, { role: "error", text: data.message }]);
        return;
      }

      // The assistant needs health details before it will answer.
      if (data.needsContext) {
        setPendingQuery(q);
        setFollowups(data.followupQuestions || []);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", data }]);
      if (data.sources?.length) setLastHerb(data.sources[0].herb);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "error", text: `Could not reach the backend at ${API_URL}. Is it running?` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuery("");
    send(q, healthContext);
  }

  function submitContext(e) {
    e.preventDefault();
    const ctx = toHealthContext(form);
    setHealthContext(ctx);
    const q = pendingQuery;
    setPendingQuery(null);
    setFollowups([]);
    send(q, ctx);
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Member 2 · Natural Language Understanding"
        title="Herb Knowledge Assistant"
        accent="RAG + NLU"
        description="Ask about Sri Lankan medicinal herbs. Answers are retrieved from a verified knowledge base of 1,550 herb records, with intent classification and a safety check before any personal advice."
      />

      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Saved health profile */}
          {healthContext && (
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
              <span>
                <b className="text-zinc-800">Health profile:</b> {healthContext.age_group} ·{" "}
                {healthContext.patient_condition} · {healthContext.medication_context} ·{" "}
                {healthContext.dosage_form}
              </span>
              <button
                onClick={() => setHealthContext(null)}
                className="font-bold text-emerald-700 hover:text-emerald-800"
              >
                Reset
              </button>
            </div>
          )}

          {/* Conversation */}
          {messages.length === 0 && !pendingQuery && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
              <h2 className="font-serif text-lg font-bold text-zinc-900">Ask a question</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Try &ldquo;What is Gotukola used for?&rdquo;, &ldquo;What is the dosage of
                Iramusu?&rdquo;, or &ldquo;Is Kohomba safe during pregnancy?&rdquo;
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            if (m.role === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm text-white">
                    {m.text}
                  </div>
                </div>
              );
            }
            if (m.role === "error") {
              return (
                <div key={i} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {m.text}
                </div>
              );
            }

            const d = m.data;
            const risk = d.riskLevel ? RISK_STYLES[d.riskLevel] : null;
            const RiskIcon = risk?.icon;

            return (
              <div key={i} className="rounded-3xl border border-zinc-200 bg-white p-6">
                {/* Spelling correction / follow-up notices */}
                {d.corrections?.length > 0 && (
                  <p className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Info className="h-3.5 w-3.5" />
                    Showing results for <b>{d.corrections[0][1]}</b>
                  </p>
                )}
                {d.followedUpOn && (
                  <p className="mb-3 text-xs text-zinc-500">Continuing about <b>{d.followedUpOn}</b></p>
                )}

                {/* Intent + risk badges */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {d.intent && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                      {d.intent}
                    </span>
                  )}
                  {risk && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${risk.cls}`}>
                      <RiskIcon className="h-3.5 w-3.5" />
                      {d.riskLevel}
                    </span>
                  )}
                </div>

                {d.riskWarning && (
                  <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {d.riskWarning}
                  </p>
                )}

                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {d.answer}
                </div>

                {d.sources?.length > 0 && (
                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Retrieved sources
                    </p>
                    <ul className="space-y-1.5">
                      {d.sources.map((s, j) => (
                        <li key={j} className="text-xs text-zinc-500">
                          <b className="text-zinc-700">{s.herb}</b>
                          {s.herbEnglish ? ` (${s.herbEnglish})` : ""} — {s.source}{" "}
                          <span className="text-zinc-400">· {s.sourceType} · {s.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Health-context questionnaire */}
          {pendingQuery && (
            <form onSubmit={submitContext} className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6">
              <h3 className="font-serif text-base font-bold text-zinc-900">
                A few safety details first
              </h3>
              <ul className="mt-2 mb-4 list-disc space-y-1 pl-5 text-xs text-zinc-600">
                {followups.map((q, i) => <li key={i}>{q}</li>)}
              </ul>

              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Age group" value={form.age_group} options={AGE_GROUPS}
                  onChange={(v) => setForm({ ...form, age_group: v })} />

                <div>
                  <Select label="Condition" value={form.patient_condition} options={CONDITIONS}
                    onChange={(v) => setForm({ ...form, patient_condition: v })} />
                  {form.patient_condition === OTHER && (
                    <TextInput placeholder="Type your condition, e.g. asthma"
                      value={form.patient_condition_other}
                      onChange={(v) => setForm({ ...form, patient_condition_other: v })} />
                  )}
                </div>

                <div>
                  <Select label="Medication" value={form.medication_context} options={MEDICATIONS}
                    onChange={(v) => setForm({ ...form, medication_context: v })} />
                  {form.medication_context === OTHER && (
                    <TextInput placeholder="Type your medication, e.g. levothyroxine"
                      value={form.medication_context_other}
                      onChange={(v) => setForm({ ...form, medication_context_other: v })} />
                  )}
                </div>

                <Select label="Dosage form" value={form.dosage_form} options={DOSAGE_FORMS}
                  onChange={(v) => setForm({ ...form, dosage_form: v })} />
              </div>

              {/* Set expectations before the answer arrives, so "Caution" does
                  not read as a fault: the model genuinely cannot score this. */}
              {(form.patient_condition === OTHER || form.medication_context === OTHER) && (
                <p className="mt-3 text-xs leading-relaxed text-amber-800">
                  The risk model was not trained on this, so it will not predict a risk
                  level for you. You will get a Caution answer based only on what the
                  knowledge base records for the herb, and a reminder to check with a
                  practitioner.
                </p>
              )}

              <button type="submit" disabled={loading}
                className="mt-4 rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                {loading ? "Working…" : "Continue"}
              </button>
            </form>
          )}

          {loading && !pendingQuery && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Retrieving herb records…
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="sticky bottom-4 flex gap-2 rounded-full border border-zinc-200 bg-white p-2 shadow-sm">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about a Sri Lankan medicinal herb…"
              className="flex-1 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button type="submit" disabled={loading || !query.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="pb-8 text-center text-[11px] text-zinc-400">
            Information is retrieved from recorded traditional sources and is not medical advice.
            Consult a qualified Ayurvedic or medical practitioner before personal use.
          </p>
        </div>
      </div>
    </div>
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
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
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
      className="mt-2 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-amber-500"
    />
  );
}
