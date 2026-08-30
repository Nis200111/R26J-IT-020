"use client";

/**
 * Member 1 — Batch identification.
 *
 * Drop many photographs, run them all through the same endpoint one at a time,
 * and get a table you can sort, filter and export as CSV.
 *
 * Two reasons this earns its place:
 *   - A demo where twenty specimens are processed and summarised reads very
 *     differently from one where a single photo is uploaded.
 *   - The CSV is the evidence file for your write-up. Coverage, mean confidence
 *     and the count of flagged results are numbers you can quote.
 *
 * Requests are sequential on purpose. The model holds the GPU (or CPU) for each
 * inference; firing twenty at once queues them anyway and makes the progress bar
 * meaningless.
 */

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud, Download, X, Loader2, CheckCircle2, AlertTriangle, Play, Trash2,
} from "lucide-react";

import { displayName } from "@/data/plants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_FILES = 40;

const pct = (v) => `${(v * 100).toFixed(1)}%`;

export default function BatchScanner() {
  const [items, setItems] = useState([]);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("all");
  const [dragging, setDragging] = useState(false);
  const cancelled = useRef(false);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList || [])
      .filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) return;

    setItems((prev) => {
      const room = MAX_FILES - prev.length;
      return [
        ...prev,
        ...incoming.slice(0, room).map((file) => ({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
          state: "queued",       // queued | running | done | error
          result: null,
          error: null,
        })),
      ];
    });
  }, []);

  const run = useCallback(async () => {
    cancelled.current = false;
    setRunning(true);

    // Read current queue once; new drops during a run are picked up next time.
    const queue = items.filter((i) => i.state === "queued");

    for (const item of queue) {
      if (cancelled.current) break;
      setItems((prev) => prev.map((i) =>
        i.id === item.id ? { ...i, state: "running" } : i));

      try {
        const form = new FormData();
        form.append("file", item.file);
        const res = await fetch(`${API_URL}/api/member1/predict`, {
          method: "POST", body: form,
        });

        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try { const b = await res.json(); if (b?.detail) msg = b.detail; } catch { /* */ }
          throw new Error(msg);
        }

        const data = await res.json();
        setItems((prev) => prev.map((i) =>
          i.id === item.id ? { ...i, state: "done", result: data } : i));
      } catch (err) {
        setItems((prev) => prev.map((i) =>
          i.id === item.id ? { ...i, state: "error", error: String(err.message || err) } : i));
      }
    }

    setRunning(false);
  }, [items]);

  const done = items.filter((i) => i.state === "done");
  const flagged = done.filter((i) =>
    i.result.status !== "high" || i.result.confusableWith);
  const meanConfidence = done.length
    ? done.reduce((a, i) => a + i.result.confidence, 0) / done.length : 0;

  const visible = items.filter((i) => {
    if (filter === "all") return true;
    if (filter === "flagged") return i.state === "done" && (i.result.status !== "high" || i.result.confusableWith);
    if (filter === "confident") return i.state === "done" && i.result.status === "high" && !i.result.confusableWith;
    return true;
  });

  const exportCsv = () => {
    const head = ["filename", "predicted_species", "confidence", "second_species",
                  "second_confidence", "margin", "status", "confusable_with", "inference_ms"];
    const rows = done.map((i) => [
      i.file.name, i.result.label, i.result.confidence, i.result.secondLabel,
      i.result.secondConfidence, i.result.margin, i.result.status,
      i.result.confusableWith || "", i.result.elapsedMs,
    ]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_identification_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
  };

  const queued = items.filter((i) => i.state === "queued").length;

  return (
    <div className="w-full px-4 lg:px-12 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Batch Identification</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Process many specimens at once and export the results. Every photograph goes through
          the same endpoint as a single upload.
        </p>
      </div>

      {/* drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all mb-6 ${
          dragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"}`}>
        <UploadCloud className={`w-9 h-9 mx-auto mb-3 ${dragging ? "text-emerald-500" : "text-slate-300"}`} />
        <p className="text-sm font-semibold text-slate-700 mb-1">
          Drag photographs here, or
          <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer ml-1 underline">
            browse
            <input type="file" multiple accept="image/*" className="hidden"
                   onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </p>
        <p className="text-[11px] text-slate-400">
          Up to {MAX_FILES} images · {items.length} added
          {items.length >= MAX_FILES && " · limit reached"}
        </p>
      </div>

      {/* controls */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={run} disabled={running || !queued}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "Identifying…" : `Identify ${queued} photo${queued === 1 ? "" : "s"}`}
          </button>

          {running && (
            <button onClick={() => { cancelled.current = true; }}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
              Stop after this one
            </button>
          )}

          <button onClick={exportCsv} disabled={!done.length}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-3.5 h-3.5" /> Export CSV ({done.length})
          </button>

          <button onClick={clearAll} disabled={running}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>

          <div className="ml-auto flex gap-1.5">
            {[["all", `All ${items.length}`],
              ["confident", `Confident ${done.length - flagged.length}`],
              ["flagged", `Needs review ${flagged.length}`]].map(([k, text]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                  filter === k ? "bg-slate-800 text-white border-slate-800"
                               : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* summary */}
      {done.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Summary value={done.length} label="Identified" />
          <Summary value={pct(meanConfidence)} label="Mean confidence" />
          <Summary value={flagged.length} label="Need review"
                   tone={flagged.length ? "amber" : "emerald"} />
          <Summary value={`${Math.round(done.reduce((a, i) => a + (i.result.elapsedMs || 0), 0) / done.length)} ms`}
                   label="Mean inference" />
        </div>
      )}

      {/* table */}
      {items.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          No photographs added yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[48rem]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["", "File", "Prediction", "Confidence", "Runner-up", "Verdict", ""].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2.5 w-14">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.preview} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 max-w-[12rem] truncate" title={i.file.name}>
                      {i.file.name}
                    </td>
                    <td className="px-4 py-2.5 text-xs italic text-slate-800">
                      {i.state === "done" ? displayName(i.result.label)
                        : i.state === "error" ? <span className="text-red-600 not-italic">{i.error}</span>
                        : <span className="text-slate-400 not-italic">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs tabular-nums">
                      {i.state === "done" ? (
                        <span className={
                          i.result.status === "high" ? "text-emerald-600 font-semibold"
                          : i.result.status === "moderate" ? "text-amber-600 font-semibold"
                          : "text-red-600 font-semibold"}>
                          {pct(i.result.confidence)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] italic text-slate-400">
                      {i.state === "done"
                        ? `${displayName(i.result.secondLabel)} ${pct(i.result.secondConfidence)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Verdict item={i} />
                    </td>
                    <td className="px-4 py-2.5 w-10">
                      {!running && (
                        <button onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}
                          aria-label={`Remove ${i.file.name}`}
                          className="text-slate-300 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done.length > 0 && (
        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed max-w-3xl">
          &quot;Needs review&quot; covers anything below the high-confidence threshold, anything
          where the top two candidates are close together, and anything flagged as a measured
          look-alike pair. It is not a statement that the identification is wrong — only that a
          person should look at it.
        </p>
      )}
    </div>
  );
}

function Verdict({ item }) {
  if (item.state === "queued")
    return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Queued</span>;
  if (item.state === "running")
    return <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />;
  if (item.state === "error")
    return <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Failed</span>;

  const r = item.result;
  if (r.confusableWith)
    return <Pill tone="amber" text={`look-alike: ${displayName(r.confusableWith)}`} icon={AlertTriangle} />;
  if (r.status === "low") return <Pill tone="red" text="not identified" icon={AlertTriangle} />;
  if (r.status === "moderate") return <Pill tone="amber" text="verify" icon={AlertTriangle} />;
  return <Pill tone="emerald" text="confident" icon={CheckCircle2} />;
}

function Pill({ tone, text, icon: Icon }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
}

function Summary({ value, label, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <p className={`text-2xl font-bold tabular-nums ${
        tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "text-slate-800"}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
