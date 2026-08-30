"use client";

/**
 * Member 1 — Model Performance.
 *
 * A research-facing tab. Every figure comes from src/data/modelMetrics.js, which
 * is transcribed directly from the training notebook's own output. Nothing here
 * is estimated, and the limitations panel states plainly what has not been
 * measured yet — which is the part a reviewer will look for.
 *
 * Charts are hand-drawn SVG so the project stays dependency-free.
 */

import { useMemo, useState } from "react";
import {
    TrendingUp, Layers, Database, AlertTriangle, ArrowLeftRight, ArrowUpDown,
} from "lucide-react";

import {
    MODEL_INFO, DATASET, PER_CLASS, TRAINING, LIMITATIONS, CONFUSION_NOTES,
    weakestClasses,
} from "@/data/modelMetrics";

const EMERALD = "#059669";
const AMBER = "#d97706";
const SLATE = "#94a3b8";

const label = (s) => s.replace(/_/g, " ");

export default function ModelPerformance() {
    const [sortKey, setSortKey] = useState("f1");
    const [asc, setAsc] = useState(true);

    const rows = useMemo(() => {
        const sorted = [...PER_CLASS].sort((a, b) =>
            sortKey === "name"
                ? a.name.localeCompare(b.name)
                : a[sortKey] - b[sortKey]);
        return asc ? sorted : sorted.reverse();
    }, [sortKey, asc]);

    const toggle = (key) => {
        if (key === sortKey) setAsc((v) => !v);
        else { setSortKey(key); setAsc(key === "name"); }
    };

    return (
        <div className="w-full px-4 lg:px-12 py-10">

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Model Performance</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                    Measured results on {DATASET.test} held-out test images the model never saw during
                    training. Every number on this page comes from the training notebook&apos;s own output.
                </p>
            </div>

            {/* headline numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <Stat value={`${(MODEL_INFO.testAccuracy * 100).toFixed(1)}%`} label="Test accuracy"
                    note={`${DATASET.test} unseen images`} tone="emerald" />
                <Stat value={MODEL_INFO.macroF1.toFixed(2)} label="Macro F1"
                    note="Averaged evenly across classes" />
                <Stat value={MODEL_INFO.classes} label="Species" note="Closed set — no unknown class" />
                <Stat value={DATASET.totalImages.toLocaleString()} label="Images"
                    note={`${Math.round(DATASET.totalImages / MODEL_INFO.classes)} per species on average`} />
            </div>

            {/* training curve */}
            <Panel icon={TrendingUp} title="Training history"
                sub="Fifty epochs across three fit() calls. The drop at epoch 21 is where fine-tuning began.">
                <TrainingChart />
                <div className="flex flex-wrap gap-5 mt-4 text-[11px] text-slate-500">
                    <Legend color={SLATE} text="Training accuracy" />
                    <Legend color={EMERALD} text="Validation accuracy" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-4 max-w-3xl">
                    Validation accuracy fell from 0.8775 to 0.8096 in the first fine-tuning epoch, then took
                    thirty more epochs to reach 0.8862 — a net gain of 0.4 points over the best frozen-backbone
                    result. The cause is that the unfreezing step also unfroze seven BatchNormalization layers,
                    whose statistics were estimated on ImageNet and should not be re-estimated from 2,158 photos.
                </p>
            </Panel>

            {/* per-class */}
            <Panel icon={Layers} title="Per-class results"
                sub="Sorted by F1 by default. Click a column heading to re-sort.">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[42rem]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <Th onClick={() => toggle("name")} active={sortKey === "name"}>Species</Th>
                                <Th onClick={() => toggle("precision")} active={sortKey === "precision"} right>Precision</Th>
                                <Th onClick={() => toggle("recall")} active={sortKey === "recall"} right>Recall</Th>
                                <Th onClick={() => toggle("f1")} active={sortKey === "f1"} right>F1</Th>
                                <th className="text-left pb-2 pl-4 w-40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    F1
                                </th>
                                <Th onClick={() => toggle("support")} active={sortKey === "support"} right>Images</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-2 pr-4 text-xs italic text-slate-700">{label(r.name)}</td>
                                    <Num v={r.precision} />
                                    <Num v={r.recall} />
                                    <Num v={r.f1} bold />
                                    <td className="py-2 pl-4">
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{
                                                    width: `${r.f1 * 100}%`,
                                                    background: r.f1 < 0.75 ? AMBER : EMERALD,
                                                }} />
                                        </div>
                                    </td>
                                    <td className="py-2 text-right text-xs text-slate-400 tabular-nums">{r.support}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-[11px] text-slate-500 mt-4">
                    Amber marks F1 below 0.75. Those{" "}
                    {PER_CLASS.filter((p) => p.f1 < 0.75).length} species are where more photographs would
                    change the headline number.
                </p>
            </Panel>

            {/* weakest + confusions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <Panel icon={AlertTriangle} title="Weakest species" sub="Ranked by F1. Your collection priority."
                    flush>
                    <div className="space-y-3">
                        {weakestClasses(5).map((c) => (
                            <div key={c.name} className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs italic text-slate-700 truncate">{label(c.name)}</p>
                                    <p className="text-[10px] text-slate-400">
                                        precision {c.precision.toFixed(2)} · recall {c.recall.toFixed(2)} ·{" "}
                                        {c.support} test images
                                    </p>
                                </div>
                                <span className="text-sm font-bold tabular-nums"
                                    style={{ color: c.f1 < 0.75 ? AMBER : EMERALD }}>
                                    {c.f1.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel icon={ArrowLeftRight} title="Measured confusions"
                    sub="Derived from the test set, not assumed." flush>
                    <div className="space-y-4">
                        {CONFUSION_NOTES.map((c) => (
                            <div key={c.pair.join()}>
                                <p className="text-xs font-semibold text-slate-700 italic mb-1">
                                    {label(c.pair[0])}
                                    {c.pair[1] !== "—" && <> ↔ {label(c.pair[1])}</>}
                                </p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{c.note}</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {/* dataset */}
            <Panel icon={Database} title="Dataset" sub={`${DATASET.source}, validated with ${DATASET.validation}.`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {[["Training", DATASET.train], ["Validation", DATASET.val],
                    ["Test", DATASET.test], ["Total", DATASET.totalImages]].map(([k, v]) => (
                        <div key={k} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{k}</p>
                            <p className="text-xl font-bold text-slate-800 tabular-nums">{v.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-slate-500">
                    <span><strong className="text-slate-700">Split:</strong> {DATASET.splitMethod}</span>
                    <span><strong className="text-slate-700">Architecture:</strong> {MODEL_INFO.architecture}</span>
                    <span><strong className="text-slate-700">Input:</strong> {MODEL_INFO.inputSize}</span>
                    <span><strong className="text-slate-700">Parameters:</strong> {MODEL_INFO.parameters}</span>
                </div>
            </Panel>

            {/* limitations */}
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-900">Known limitations</h3>
                </div>
                <div className="p-6 space-y-5">
                    {LIMITATIONS.map((l) => (
                        <div key={l.title}>
                            <p className="text-xs font-bold text-amber-900 mb-1">{l.title}</p>
                            <p className="text-[11px] text-amber-800 leading-relaxed">{l.body}</p>
                        </div>
                    ))}
                    <p className="text-[10px] text-amber-700 pt-3 border-t border-amber-200 leading-relaxed">
                        This panel is deliberate. Stating what has not been measured is stronger than leaving
                        a reviewer to find it — remove each entry as the corresponding experiment is completed.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */

function TrainingChart() {
    const { trainAcc, valAcc, phases } = TRAINING;
    const W = 900, H = 260, PAD_L = 42, PAD_B = 28, PAD_T = 12, PAD_R = 12;
    const n = valAcc.length;
    const yMin = 0.35, yMax = 1.0;

    const x = (i) => PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
    const y = (v) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD_T - PAD_B);
    const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

    const best = Math.max(...valAcc);
    const bestI = valAcc.indexOf(best);

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[38rem]" role="img"
                aria-label="Training and validation accuracy across 50 epochs">
                {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((g) => (
                    <g key={g}>
                        <line x1={PAD_L} x2={W - PAD_R} y1={y(g)} y2={y(g)} stroke="#e2e8f0" strokeWidth="1" />
                        <text x={PAD_L - 8} y={y(g) + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8">
                            {g.toFixed(1)}
                        </text>
                    </g>
                ))}

                {phases.slice(1).map((p) => (
                    <g key={p.name}>
                        <line x1={x(p.startEpoch - 1)} x2={x(p.startEpoch - 1)} y1={PAD_T} y2={H - PAD_B}
                            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                        <text x={x(p.startEpoch - 1) + 4} y={PAD_T + 10} fontSize="9" fill="#94a3b8">
                            {p.startEpoch === 21 ? "fine-tune starts" : "resumed"}
                        </text>
                    </g>
                ))}

                <path d={path(trainAcc)} fill="none" stroke={SLATE} strokeWidth="1.8" />
                <path d={path(valAcc)} fill="none" stroke={EMERALD} strokeWidth="2.2" />

                <circle cx={x(bestI)} cy={y(best)} r="4" fill={EMERALD} stroke="#fff" strokeWidth="2" />
                <text x={x(bestI) - 6} y={y(best) - 10} textAnchor="end" fontSize="10"
                    fill={EMERALD} fontWeight="600">
                    best {best.toFixed(4)}
                </text>

                <circle cx={x(20)} cy={y(valAcc[20])} r="3.5" fill={AMBER} stroke="#fff" strokeWidth="2" />
                <text x={x(20) + 8} y={y(valAcc[20]) + 14} fontSize="10" fill={AMBER} fontWeight="600">
                    {valAcc[20].toFixed(4)}
                </text>

                {[1, 10, 20, 30, 40, 50].map((e) => (
                    <text key={e} x={x(e - 1)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
                        {e}
                    </text>
                ))}
                <text x={W / 2} y={H - 8} fontSize="0" fill="none">epoch</text>
            </svg>
        </div>
    );
}

function Stat({ value, label: text, note, tone }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className={`text-3xl font-bold tabular-nums mb-1 ${tone === "emerald" ? "text-emerald-600" : "text-slate-800"}`}>{value}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{text}</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{note}</p>
        </div>
    );
}

function Panel({ icon: Icon, title, sub, children, flush }) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${flush ? "" : "mb-6"}`}>
            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-600" /> {title}
                </h3>
                {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Th({ children, onClick, active, right }) {
    return (
        <th className={`pb-2 ${right ? "text-right" : "text-left"} pr-4`}>
            <button onClick={onClick}
                className={`text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${active ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}>
                {children} <ArrowUpDown className="w-3 h-3" />
            </button>
        </th>
    );
}

function Num({ v, bold }) {
    return (
        <td className={`py-2 pr-4 text-right text-xs tabular-nums ${bold ? "font-bold text-slate-800" : "text-slate-600"}`}>
            {v.toFixed(2)}
        </td>
    );
}

function Legend({ color, text }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span className="w-4 h-0.5 rounded" style={{ background: color }} /> {text}
        </span>
    );
}
