"use client";

/**
 * Member 1 — AI Botanical Scanner.
 *
 * What changed from the previous version of this page:
 *
 *   - The staged 3.6-second fake pipeline is gone. The loading state now shows
 *     the real request, and the response carries its own elapsed time.
 *   - The four "Quick Sandbox" buttons that returned hardcoded Genuine/Adulterant
 *     verdicts are gone. In their place, real specimen photos that go through the
 *     real endpoint.
 *   - "Model Pipeline Status" polls /api/member1/health instead of showing a
 *     hardcoded READY. "Pharmacognosy Matcher" is removed — no such component
 *     exists in the project.
 *   - The image quality checklist actually measures the photo.
 *   - Top 5 candidates instead of top 2, and a Grad-CAM overlay showing where
 *     the model looked.
 *   - Export produces a real printable report.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    UploadCloud, Camera, CheckSquare, Search, FileText, AlertTriangle, Info,
    Image as ImageIcon, Check, Loader2, Flame, ChevronRight, X, Activity,
    ArrowLeftRight, History, GitBranch, Volume2, Share2,
} from "lucide-react";

import CameraCapture from "@/components/features/member1/CameraCapture";
import { analyzeImage, downscaleToDataUrl } from "@/lib/imageQuality";
import { PLANTS, getPlant, displayName } from "@/data/plants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* Real specimen photos that already exist in public/plants/.
   Add more as you photograph the remaining species. */
const SAMPLES = [
    { file: "Ahu.jpg", label: "Ahu" },
    { file: "Girapala.jpg", label: "Girapala" },
    { file: "beheth anoda.jpg", label: "Beheth anoda" },
    { file: "binkohomba.jpg", label: "Bin kohomba" },
];

const pct = (v) => `${(v * 100).toFixed(1)}%`;

export default function ScannerWorkbench() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [reportImage, setReportImage] = useState(null);
    const [quality, setQuality] = useState(null);
    const [status, setStatus] = useState("idle");     // idle | analyzing | success
    const [result, setResult] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [health, setHealth] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [wipe, setWipe] = useState(65);        // heat-map compare slider, 0-100
    const [history, setHistory] = useState([]);
    const timerRef = useRef(null);

    // Load history from localStorage on mount to avoid hydration mismatch
    useEffect(() => {
        try {
            const saved = localStorage.getItem("scanner_history");
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (e) {}
    }, []);

    // Persist history to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("scanner_history", JSON.stringify(history));
        } catch (e) {}
    }, [history]);

    const handleShare = () => {
        if (!result || result.transportError) return;
        const conf = (result.confidence * 100).toFixed(1);
        const text = `මම මේ ශාකය Bio Heritage AI හරහා ස්කෑන් කළා. මෙය ${conf}% ක විශ්වාසයකින් "${displayName(result.label)}" ලෙස හඳුනාගෙන ඇත.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const handleSpeak = () => {
        if (!result || result.transportError) return;
        
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const text = result.status === "low" 
            ? "මෙම ශාකය පද්ධතියට හඳුනාගැනීමට අපහසුයි. කරුණාකර වෛද්‍ය උපදෙස් ලබාගන්න."
            : `හඳුනාගත් ශාකය ${displayName(result.label)}. කරුණාකර වෛද්‍ය උපදෙස් ලබාගන්න.`;
            
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "si-LK"; // Sinhala
        
        // Sometimes the volume is 0 or rate is weird
        utterance.volume = 1;
        utterance.rate = 1;

        utterance.onerror = (e) => {
            console.error("Speech synthesis failed:", e);
            alert("ඔබගේ Web Browser එක Sinhala Voice සඳහා සහය නොදක්වයි. කරුණාකර Chrome හෝ Edge හි අලුත්ම සංස්කරණයක් භාවිතා කරන්න.");
        };

        window.speechSynthesis.speak(utterance);
    };

    /* ---------------- backend health ---------------- */
    useEffect(() => {
        let alive = true;
        const check = async () => {
            try {
                const res = await fetch(`${API_URL}/api/member1/health`, { cache: "no-store" });
                const data = await res.json();
                if (alive) setHealth({ reachable: true, ...data });
            } catch {
                if (alive) setHealth({ reachable: false });
            }
        };
        check();
        const id = setInterval(check, 20000);
        return () => { alive = false; clearInterval(id); };
    }, []);

    /* ---------------- picking a photo ---------------- */
    const acceptFile = useCallback(async (selected) => {
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setStatus("idle");
        setQuality(null);
        setShowCamera(false);

        const [q, dataUrl] = await Promise.all([
            analyzeImage(selected),
            downscaleToDataUrl(selected),
        ]);
        setQuality(q);
        setReportImage(dataUrl);
    }, []);

    /* Paste an image straight from the clipboard — Ctrl+V after a screenshot or a
       copy from the file manager. Cheap to support, and people expect it now. */
    useEffect(() => {
        const onPaste = (e) => {
            const item = Array.from(e.clipboardData?.items || [])
                .find((it) => it.type.startsWith("image/"));
            if (!item) return;
            const blob = item.getAsFile();
            if (blob) acceptFile(new File([blob], "pasted-image.png", { type: blob.type }));
        };
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, [acceptFile]);

    const loadSample = useCallback(async (name) => {
        try {
            const res = await fetch(encodeURI(`/plants/${name}`));
            const blob = await res.blob();
            await acceptFile(new File([blob], name, { type: blob.type || "image/jpeg" }));
        } catch {
            setResult({ transportError: `Could not load the sample photo ${name}.` });
            setStatus("success");
        }
    }, [acceptFile]);

    /* ---------------- prediction ---------------- */
    const authenticate = useCallback(async () => {
        if (!file) return;
        setStatus("analyzing");
        setResult(null);
        setElapsed(0);

        const started = performance.now();
        timerRef.current = setInterval(
            () => setElapsed(Math.round(performance.now() - started)), 100);

        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(`${API_URL}/api/member1/predict?explain=true`, {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                let message = `The identification service returned ${res.status}.`;
                try {
                    const body = await res.json();
                    if (body?.detail) message = body.detail;
                } catch { /* non-JSON error body */ }
                setResult({ transportError: message });
            } else {
                const data = await res.json();
                setResult(data);
                setHistory((prev) => [
                    {
                        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        thumb: preview,
                        name: file.name,
                        label: data.label,
                        confidence: data.confidence,
                        status: data.status,
                        at: new Date().toLocaleTimeString(),
                    },
                    ...prev,
                ].slice(0, 12));
            }
        } catch {
            setResult({
                transportError:
                    `Could not reach the identification service at ${API_URL}. ` +
                    "Check that the backend is running.",
            });
        } finally {
            clearInterval(timerRef.current);
            setStatus("success");
        }
    }, [file, preview]);

    const reset = () => {
        setFile(null); setPreview(null); setReportImage(null);
        setResult(null); setQuality(null); setStatus("idle");
    };

    /* ---------------- printable report ---------------- */
    const exportReport = () => {
        if (!result || result.transportError) return;
        const win = window.open("", "_blank", "width=900,height=1100");
        if (!win) return;

        const rows = (result.predictions || []).map(
            (p, i) => `<tr${i === 0 ? ' class="top"' : ""}>
        <td><i>${p.name}</i></td><td class="n">${pct(p.confidence)}</td></tr>`).join("");

        const warnings = [];
        if (result.status === "low")
            warnings.push("Confidence below the reliability threshold. Not a usable identification.");
        if (result.status === "moderate")
            warnings.push("Moderate confidence. Manual verification recommended.");
        if (result.confusableWith)
            warnings.push(`Flagged as a known confusable pair with ${displayName(result.confusableWith)}.`);
        if (quality?.verdict === "poor")
            warnings.push("Photo quality checks failed — the result may be unreliable.");

        win.document.write(`<!doctype html><html><head><meta charset="utf-8">
<title>Botanical species identification report</title>
<style>
  body{font:13px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:760px;margin:32px auto;padding:0 24px}
  h1{font-size:20px;margin:0 0 2px} .sub{color:#666;font-size:11px;margin:0 0 24px}
  .grid{display:flex;gap:16px;margin-bottom:24px}.grid img{width:230px;border:1px solid #ddd;border-radius:6px}
  table{border-collapse:collapse;width:100%;margin:8px 0 24px}
  th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eee;font-size:12px}
  th{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#666}
  td.n{text-align:right;font-variant-numeric:tabular-nums}
  tr.top td{font-weight:700;background:#f4faf6}
  .verdict{padding:12px 14px;border-left:4px solid #059669;background:#f0fdf4;margin-bottom:20px}
  .verdict.warn{border-color:#d97706;background:#fffbeb}
  .verdict.bad{border-color:#dc2626;background:#fef2f2}
  ul{margin:6px 0 0;padding-left:18px} li{font-size:12px;margin-bottom:3px}
  footer{margin-top:28px;padding-top:12px;border-top:1px solid #ddd;color:#666;font-size:10px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#666;margin:0 0 4px}
</style></head><body>
<h1>Botanical Species Identification Report</h1>
<p class="sub">Bio Heritage AI &middot; Member 1 &middot; ${new Date().toLocaleString()}</p>
<div class="grid">
  ${reportImage ? `<div><h2>Specimen</h2><img src="${reportImage}" alt=""></div>` : ""}
  ${result.heatmap ? `<div><h2>Model attention</h2><img src="${result.heatmap}" alt=""></div>` : ""}
</div>
<div class="verdict ${result.status === "low" ? "bad" : result.status === "moderate" || result.confusableWith ? "warn" : ""}">
  <strong>${displayName(result.label)}</strong> &mdash; ${pct(result.confidence)} confidence
  ${warnings.length ? `<ul>${warnings.map((w) => `<li>${w}</li>`).join("")}</ul>` : ""}
</div>
<h2>All candidates</h2>
<table><thead><tr><th>Species</th><th class="n">Confidence</th></tr></thead><tbody>${rows}</tbody></table>
<footer>
  EfficientNetB0, 21-class classifier, 86.9% test accuracy.
  Decision thresholds: high &ge; ${result.thresholds?.high}, low &lt; ${result.thresholds?.low}.
  Inference ${result.elapsedMs} ms.<br>
  This report is generated by an automated classifier and is not a substitute for
  examination by a qualified taxonomist. Do not use it as the sole basis for any
  medicinal preparation.
</footer>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
        win.document.close();
    };

    /* ---------------- derived ---------------- */
    const banner = (() => {
        if (!result) return null;
        if (result.transportError)
            return { tone: "bad", title: "SERVICE UNAVAILABLE", body: result.transportError };
        if (result.status === "low")
            return {
                tone: "bad", title: "NOT CONFIDENTLY IDENTIFIED",
                body: `Best guess is ${displayName(result.label)} at ${pct(result.confidence)}, `
                    + `which is below the reliability threshold. This happens with a plant outside `
                    + `the 21 trained species, a poor photo, or an unrelated image.`,
            };
        if (result.confusableWith)
            return {
                tone: "warn", title: "POSSIBLE SPECIES CONFUSION",
                body: `${displayName(result.label)} is a measured confusable pair with `
                    + `${displayName(result.confusableWith)} (second candidate at `
                    + `${pct(result.secondConfidence)}). Verify before use.`,
            };
        if (result.status === "moderate")
            return {
                tone: "warn", title: "LIKELY MATCH — VERIFY MANUALLY",
                body: `Confidence is ${pct(result.confidence)} with a `
                    + `${pct(result.margin)} margin over the next candidate.`,
            };
        return {
            tone: "good", title: "RELIABLE SPECIES MATCH",
            body: "No measured confusable species flagged, and confidence is above threshold.",
        };
    })();

    const lookAlike = result?.confusableWith ? getPlant(result.confusableWith) : null;
    const predicted = result?.label ? getPlant(result.label) : null;

    return (
        <div className="w-full px-4 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ================= LEFT: CONTROLS ================= */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* 1. Uploader */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-emerald-600" /> 1. Select Specimen
                        </h3>

                        <label
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault(); setDragging(false);
                                acceptFile(e.dataTransfer.files?.[0]);
                            }}
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all mb-4 ${dragging
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300"}`}>
                            <ImageIcon className={`w-8 h-8 mb-2 ${dragging ? "text-emerald-500" : "text-slate-400"}`} />
                            <p className="mb-1 text-xs font-semibold text-slate-600">
                                {dragging ? "Drop the photo here" : "Drag a photo here, or click to browse"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                JPG, PNG or WebP &middot; up to 12 MB &middot; or press Ctrl+V to paste
                            </p>
                            <input type="file" className="hidden" accept="image/*"
                                onChange={(e) => acceptFile(e.target.files?.[0])} />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowCamera(true)}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                <Camera className="w-4 h-4" /> Use Camera
                            </button>
                            <button onClick={authenticate}
                                disabled={!file || status === "analyzing" || health?.status === "model_unavailable"}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200">
                                Identify <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Real quality checks */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-2">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> PHOTO QUALITY CHECK
                        </h3>

                        {!quality && (
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                Select a photo and it will be measured here before anything is sent to the model.
                            </p>
                        )}

                        {quality && (
                            <>
                                <p className={`text-[10px] font-bold mb-3 ${quality.verdict === "good" ? "text-emerald-600"
                                    : quality.verdict === "fair" ? "text-amber-600" : "text-red-600"}`}>
                                    {quality.verdict === "good" ? "Good — safe to identify"
                                        : quality.verdict === "fair" ? "Usable, but could be better"
                                            : "Poor — retaking the photo is worth the minute"}
                                </p>
                                <div className="space-y-2">
                                    {quality.checks.map((c) => (
                                        <div key={c.id} className="flex items-start gap-2.5">
                                            <div className={`w-4 h-4 rounded flex items-center justify-center mt-0.5 shrink-0 text-white ${c.ok ? "bg-emerald-500" : c.warn ? "bg-amber-500" : "bg-red-500"}`}>
                                                {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            </div>
                                            <div>
                                                <span className="text-xs text-slate-700">{c.label}</span>
                                                <span className="text-[10px] text-slate-400 ml-1.5">{c.detail}</span>
                                                {!c.ok && (
                                                    <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{c.hint}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 3. Real sample specimens */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-emerald-500" /> SAMPLE SPECIMENS
                        </h3>
                        <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                            Real photographs from the dataset. These go through the same endpoint as an
                            upload — nothing here is simulated.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {SAMPLES.map((s) => (
                                <button key={s.file} onClick={() => loadSample(s.file)}
                                    className="text-left rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all bg-slate-50 hover:bg-white overflow-hidden group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={encodeURI(`/plants/${s.file}`)} alt=""
                                        className="w-full h-16 object-cover" />
                                    <div className="p-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                                        {s.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Session history */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-2">
                                    <History className="w-3.5 h-3.5 text-emerald-500" /> THIS SESSION
                                </h3>
                                <button onClick={() => setHistory([])}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {history.map((h) => (
                                    <div key={h.id} className="flex items-center gap-2.5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={h.thumb} alt="" className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] italic text-slate-700 truncate">{displayName(h.label)}</p>
                                            <p className="text-[9px] text-slate-400">{h.at}</p>
                                        </div>
                                        <span className={`text-[11px] font-bold tabular-nums shrink-0 ${h.status === "high" ? "text-emerald-600"
                                            : h.status === "moderate" ? "text-amber-600" : "text-red-600"}`}>
                                            {(h.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                                Saved securely in your browser. Available across sessions.
                            </p>
                        </div>
                    )}

                    {/* 5. Real model status */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" /> MODEL STATUS
                        </h3>

                        {health === null && <p className="text-[10px] text-slate-400">Checking…</p>}

                        {health && (
                            <div className="space-y-3">
                                <StatusRow
                                    ok={health.reachable && health.status === "ok"}
                                    label={health.model || "Classifier"}
                                    value={!health.reachable ? "UNREACHABLE"
                                        : health.status === "ok" ? "READY" : "NO MODEL"} />
                                <StatusRow ok={!!health.explainAvailable} label="Grad-CAM explanation"
                                    value={health.explainAvailable ? "AVAILABLE" : "OFF"} />
                                <StatusRow ok={!!health.calibrated} label="Calibrated thresholds"
                                    value={health.calibrated ? "LOADED" : "DEFAULTS"} />

                                {!health.reachable && (
                                    <p className="text-[10px] text-red-600 leading-relaxed">
                                        No response from {API_URL}. Start the backend with{" "}
                                        <code className="bg-red-50 px-1 rounded">uvicorn main:app --reload</code>.
                                    </p>
                                )}
                                {health.error && (
                                    <p className="text-[10px] text-red-600 leading-relaxed break-words">{health.error}</p>
                                )}
                                {health.reachable && !health.calibrated && (
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        Using default thresholds. Run the calibration notebook and drop
                                        calibration.json next to the model to replace them.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= RIGHT: RESULTS ================= */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" /> 2. Identification Report
                            </h2>
                            {result?.elapsedMs && (
                                <span className="text-[10px] font-mono text-slate-400">
                                    {result.elapsedMs} ms inference
                                </span>
                            )}
                        </div>

                        {/* IDLE */}
                        {status === "idle" && (
                            <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                <Search className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-sm font-medium text-slate-400">
                                    {file ? "Ready — press Identify." : "Choose a photo, use the camera, or pick a sample."}
                                </p>
                            </div>
                        )}

                        {/* ANALYZING */}
                        {status === "analyzing" && (
                            <div className="flex-grow flex flex-col items-center justify-center border-2 border-slate-100 rounded-xl bg-slate-900">
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-5" />
                                <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
                                    Running EfficientNetB0
                                </p>
                                <p className="text-[11px] font-mono text-slate-500 mt-2">{elapsed} ms</p>
                            </div>
                        )}

                        {/* RESULT */}
                        {status === "success" && result && (
                            <div className="flex-grow flex flex-col">
                                {!result.transportError && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        {/* image + heat map */}
                                        <div>
                                            <div className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative select-none">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={preview} alt="Specimen"
                                                    className="absolute inset-0 w-full h-full object-cover" />
                                                {result.heatmap && (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img src={result.heatmap} alt="Model attention"
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }} />
                                                )}
                                                {result.heatmap && (
                                                    <div className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow"
                                                        style={{ left: `${wipe}%` }} />
                                                )}
                                                {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2",
                                                    "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"]
                                                    .map((cls) => (
                                                        <div key={cls} className={`absolute w-6 h-6 border-emerald-500 ${cls}`} />
                                                    ))}
                                            </div>

                                            {result.heatmap && (
                                                <>
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        <input type="range" min="0" max="100" value={wipe}
                                                            onChange={(e) => setWipe(Number(e.target.value))}
                                                            aria-label="Blend between the photograph and the model's attention map"
                                                            className="flex-1 accent-emerald-600 cursor-pointer" />
                                                        <span className="text-[10px] font-mono text-slate-400 w-16 text-right">
                                                            {wipe === 0 ? "photo" : wipe === 100 ? "heat map" : `${wipe}%`}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                                        Drag to wipe between the photograph and where the model looked. Warm
                                                        colours drove the prediction. If the heat sits on background rather
                                                        than plant structure, treat the result with suspicion.
                                                        {typeof result.attentionOffCentre === "number" && (
                                                            <>{" "}<strong className={result.attentionOffCentre > 0.55
                                                                ? "text-amber-600" : "text-slate-500"}>
                                                                {Math.round(result.attentionOffCentre * 100)}%
                                                            </strong>{" "}of attention fell outside the centre of the frame
                                                                {result.attentionOffCentre > 0.55
                                                                    ? " — high enough to suspect the model is reading something other than the plant."
                                                                    : "."}</>
                                                        )}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {/* candidates */}
                                        <div className="flex flex-col justify-center">
                                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                                                හඳුනාගත් ශාකය
                                            </p>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-3xl font-bold text-slate-800">
                                                    {predicted?.sinhalaName || displayName(result.label)}
                                                </h3>
                                                <button onClick={handleSpeak} title="Listen to result"
                                                    className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 flex items-center justify-center transition-all shadow-sm border border-emerald-100">
                                                    <Volume2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {predicted?.scientificName && (
                                                <p className="text-sm italic text-slate-600 mb-0.5">
                                                    {predicted.scientificName}
                                                </p>
                                            )}
                                            {predicted?.family && (
                                                <p className="text-xs text-slate-400 mb-5">
                                                    {predicted.family}
                                                </p>
                                            )}

                                            <div className="mb-6">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                                        ගැලපෙන ප්‍රතිශතය
                                                    </p>
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                                                        result.status === "high"
                                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                            : result.status === "moderate"
                                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                                : "bg-red-100 text-red-700 border border-red-200"}`}>
                                                        {result.status === "high"
                                                            ? (result.confidence >= 0.99 ? "Exact Match" : "Highly Confident")
                                                            : result.status === "moderate"
                                                                ? "Likely Match"
                                                                : "Low Confidence"}
                                                    </span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${result.status === "high" ? "bg-emerald-500"
                                                        : result.status === "moderate" ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${Math.max(2, result.confidence * 100)}%` }} />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <p className="text-[10px] text-slate-400">
                                                        {pct(result.margin)} ahead of the next candidate
                                                    </p>
                                                    <p className={`text-[10px] font-mono font-semibold ${result.status === "high" ? "text-emerald-600"
                                                        : result.status === "moderate" ? "text-amber-600" : "text-red-500"}`}>
                                                        Model Confidence: {pct(result.confidence)}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                                                All candidates
                                            </p>
                                            <div className="space-y-1.5">
                                                {result.predictions?.map((p, i) => (
                                                    <div key={p.label} className="flex items-center gap-2">
                                                        <span className={`text-[11px] w-40 truncate ${i === 0 ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                                                            {displayName(p.label)}
                                                        </span>
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : "bg-slate-300"}`}
                                                                style={{ width: `${Math.max(1, p.confidence * 100)}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-500 w-11 text-right tabular-nums">
                                                            {(p.confidence * 100).toFixed(1)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* banner */}
                                {banner && (
                                    <div className={`mb-8 p-5 rounded-xl border-2 relative overflow-hidden ${banner.tone === "good" ? "border-emerald-200 bg-emerald-50"
                                        : banner.tone === "warn" ? "border-amber-200 bg-amber-50"
                                            : "border-red-200 bg-red-50"}`}>
                                        <div className={`absolute top-0 left-0 w-2 h-full ${banner.tone === "good" ? "bg-emerald-500"
                                            : banner.tone === "warn" ? "bg-amber-500" : "bg-red-500"}`} />
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${banner.tone === "good" ? "bg-emerald-100" : banner.tone === "warn" ? "bg-amber-100" : "bg-red-100"}`}>
                                                {banner.tone === "good"
                                                    ? <Check className="w-5 h-5 text-emerald-600" />
                                                    : <AlertTriangle className={`w-5 h-5 ${banner.tone === "warn" ? "text-amber-600" : "text-red-600"}`} />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold mb-1 ${banner.tone === "good" ? "text-emerald-800"
                                                    : banner.tone === "warn" ? "text-amber-800" : "text-red-800"}`}>
                                                    {banner.title}
                                                </h4>
                                                <p className={`text-xs leading-relaxed ${banner.tone === "good" ? "text-emerald-700"
                                                    : banner.tone === "warn" ? "text-amber-700" : "text-red-700"}`}>
                                                    {banner.body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Validated Plant Information Card */}
                                {predicted && result.status !== "low" && !result.transportError && (
                                    <div className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/40 overflow-hidden">
                                        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                                            <Info className="w-3.5 h-3.5 text-emerald-600" />
                                            <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                                                Validated Plant Information
                                            </h4>
                                        </div>
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {predicted.uses?.length > 0 && (
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Medicinal Uses</p>
                                                    <ul className="space-y-1">
                                                        {predicted.uses.map((u, i) => (
                                                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                                                                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                                                                {u}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Parts Used</p>
                                                {predicted.partsUsed?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {predicted.partsUsed.map((p) => (
                                                            <span key={p} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-[11px] text-slate-400">—</p>}
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Habitat</p>
                                                <p className="text-[11px] text-slate-600 leading-relaxed">{predicted.habitat || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tamil Name</p>
                                                <p className="text-[11px] text-slate-600">{predicted.tamilName || "—"}</p>
                                            </div>
                                        </div>
                                        {predicted.toxicity && (
                                            <div className="mx-5 mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-1">Toxicity / Safety</p>
                                                <p className="text-[11px] text-amber-800 leading-relaxed">{predicted.toxicity}</p>
                                            </div>
                                        )}
                                        <p className="px-5 pb-4 text-[9px] text-slate-400 leading-relaxed">
                                            Source: Gampaha Wickramarachchi University of Indigenous Medicine &amp; Traditional Ayurvedic practitioners, Haldummulla. Not a substitute for professional medical advice.
                                        </p>
                                    </div>
                                )}

                                {/* how the verdict was reached */}
                                {!result.transportError && <DecisionTrace result={result} />}

                                {/* look-alike comparison */}
                                {result.confusableWith && (
                                    <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                                            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                Side-by-side comparison
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-slate-200">
                                            {[{ p: predicted, key: result.label, tag: "Predicted" },
                                            { p: lookAlike, key: result.confusableWith, tag: "Known look-alike" }]
                                                .map(({ p, key, tag }) => (
                                                    <div key={key} className="p-5">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">{tag}</p>
                                                        <div className="aspect-video rounded-lg bg-slate-100 overflow-hidden mb-3">
                                                            {p?.image ? (
                                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                                <img src={encodeURI(`/plants/${p.image}`)} alt=""
                                                                    className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 text-center px-3">
                                                                    No reference photo yet — add one to public/plants/
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold italic text-slate-800">{displayName(key)}</p>
                                                        <p className="text-[10px] text-slate-500 mb-2">{p?.family || "—"}</p>
                                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                                            {p?.howToTell || "Distinguishing features not documented yet."}
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                                            <p className="text-[11px] text-amber-800 leading-relaxed">
                                                Do not use either species in a medicinal preparation on the basis of this
                                                screen alone. Confirm with a qualified taxonomist.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-slate-100 flex gap-3 justify-end flex-wrap">
                                    <button onClick={handleShare} disabled={!!result.transportError}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/20 text-xs font-bold hover:bg-[#25D366]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                    <button onClick={exportReport} disabled={!!result.transportError}
                                        className="px-6 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                        Export report
                                    </button>
                                    <button onClick={reset}
                                        className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all">
                                        Identify another specimen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* System Scope and Safety Guidelines */}
                    <div className="mt-6 flex flex-col gap-0 rounded-xl border border-amber-200/80 bg-white shadow-sm overflow-hidden">
                        <div className="bg-amber-50 px-5 py-3 border-b border-amber-100 flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">
                                Important Safety & Usage Guidelines
                            </h4>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                    <strong>System Scope:</strong> This tool is designed for <strong>accurate identification</strong> of Sri Lankan medicinal plant species. It covers <strong>{PLANTS.length} species</strong> curated in consultation with Ayurvedic practitioners and domain experts at Gampaha Wickramarachchi University of Indigenous Medicine. <strong>Use this tool to identify the specific plant you are looking for, then verify the result with a qualified practitioner before any use.</strong>
                                </p>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    A low-confidence result (shown in red) indicates the plant is outside the system&apos;s trained scope — it does not imply the plant is safe or unsafe.
                                </p>
                            </div>

                            <div className="px-4 py-3 rounded-lg bg-red-50/50 border border-red-100">
                                <p className="text-[12px] text-red-900 leading-relaxed font-medium">
                                    <strong>අවධානයට:</strong> මෙම පද්ධතිය ශාක හඳුනාගැනීම සඳහා පමණක් නිර්මාණය කර ඇත. ශාකයක් හඳුනාගත් පසු, ඕනෑම ඖෂධීය හෝ ශාකීය භාවිතයකට පෙර <strong>සුදුසු ආයුර්වේද වෛද්‍යවරයෙකු හෝ ශාකවිද්‍යා විශේෂඥයෙකුගේ</strong> උපදෙස් ලබාගන්න. AI හඳුනාගැනීමක් පමණ සැලකිය යුතු හේතුවක් ලෙස ශාකයක් ගැනීමෙන් වලකින්න.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showCamera && (
                <CameraCapture
                    onCapture={(f) => acceptFile(f)}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </div>
    );
}

/**
 * Shows the actual rule that produced the verdict, with the real numbers.
 *
 * Worth having for two reasons: a user who is told "verify manually" deserves to
 * know why, and a panel asking "how did you decide the threshold?" gets a
 * concrete answer instead of a hand-wave.
 */
function DecisionTrace({ result }) {
    const t = result.thresholds || {};
    const steps = [
        {
            test: `top confidence ${pct(result.confidence)} ≥ low threshold ${pct(t.low ?? 0.4)}`,
            pass: result.confidence >= (t.low ?? 0.4),
            fail: "Below the floor — reported as not identified.",
        },
        {
            test: `top confidence ${pct(result.confidence)} ≥ high threshold ${pct(t.high ?? 0.75)}`,
            pass: result.confidence >= (t.high ?? 0.75),
            fail: "Between the thresholds — reported as a likely match needing verification.",
        },
        {
            test: `margin over runner-up ${pct(result.margin)} ≥ ${pct(t.margin ?? 0.15)}`,
            pass: result.margin >= (t.margin ?? 0.15),
            fail: "The top two candidates are close together, so the choice between them is not firm.",
        },
        {
            test: `runner-up ${displayName(result.secondLabel)} is a measured look-alike of ${displayName(result.label)}`,
            pass: !result.confusableWith,
            passText: "Not a recorded confusable pair.",
            fail: "Recorded as a confusable pair in the test-set confusion matrix — flagged.",
            invert: true,
        },
    ];

    return (
        <details className="mb-8 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <summary className="px-5 py-3 cursor-pointer text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100">
                <GitBranch className="w-3.5 h-3.5 text-slate-500" /> How this verdict was reached
            </summary>
            <div className="px-5 pb-5 pt-1 space-y-2.5">
                {steps.map((s) => (
                    <div key={s.test} className="flex items-start gap-2.5">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0 text-white ${s.pass ? "bg-emerald-500" : "bg-amber-500"}`}>
                            {s.pass ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        </span>
                        <div>
                            <p className="text-[11px] font-mono text-slate-700 leading-snug">{s.test}</p>
                            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                                {s.pass ? (s.passText || "Passed.") : s.fail}
                            </p>
                        </div>
                    </div>
                ))}
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 leading-relaxed">
                    Thresholds are currently the project defaults. Running the calibration notebook and
                    placing calibration.json beside the model replaces them with values derived from the
                    validation split.
                </p>
            </div>
        </details>
    );
}

function StatusRow({ ok, label, value }) {
    return (
        <div className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                <span className="truncate max-w-[11rem]">{label}</span>
            </div>
            <span className={`text-[9px] font-bold ${ok ? "text-slate-400" : "text-red-500"}`}>{value}</span>
        </div>
    );
}
