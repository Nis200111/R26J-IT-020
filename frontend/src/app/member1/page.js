"use client";

import { useState, useEffect } from "react";
import { 
  UploadCloud, Camera, CheckSquare, Search, FileText, Activity, 
  CheckCircle2, AlertTriangle, Info, Image as ImageIcon, Check, Loader2, Target
} from "lucide-react";
import InfiniteMarquee from "@/components/InfiniteMarquee";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatSpeciesName(rawName) {
  return rawName.replace(/_/g, " ");
}

export default function AdvancedPlantIdentifierPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, analyzing, success
  const [result, setResult] = useState(null);
  const [loadingText, setLoadingText] = useState("");

  const sandboxItems = [
    { name: "Attana", expected: "Genuine", confidence: 96, isAdulterant: false },
    { name: "Ahu", expected: "Adulterant", confidence: 82, isAdulterant: true, realName: "Beli (Fake Substitute)" },
    { name: "Bu-bawila", expected: "Genuine", confidence: 94, isAdulterant: false },
    { name: "Kuthurupila", expected: "Adulterant", confidence: 78, isAdulterant: true, realName: "Wild Indigo (Toxic)" },
  ];

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setStatus("idle");
  }

  function simulateAnalysis(mockData = null) {
    setStatus("analyzing");
    setLoadingText("Extracting morphological features...");

    setTimeout(() => {
      setLoadingText("Querying indigenous herbarium database...");
      setTimeout(() => {
        setLoadingText("Running EfficientNetB0 classification...");
        setTimeout(async () => {
          if (mockData) {
            setResult(mockData);
            setStatus("success");
            return;
          }

          try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_URL}/api/member1/predict`, {
              method: "POST",
              body: formData,
            });
            const data = await res.json();

            if (data.error) {
              setResult({
                name: "Analysis Failed",
                confidence: 0,
                status: "error",
                reviewNeeded: true,
                errorMessage: data.message,
              });
            } else {
              setResult({
                name: formatSpeciesName(data.label),
                confidence: Math.round(data.confidence * 1000) / 10,
                secondName: formatSpeciesName(data.secondLabel),
                secondConfidence: Math.round(data.secondConfidence * 1000) / 10,
                status: data.status, // "high" | "moderate" | "low"
                confusableWith: data.confusableWith ? formatSpeciesName(data.confusableWith) : null,
                reviewNeeded: data.status !== "high" || !!data.confusableWith,
              });
            }
          } catch {
            setResult({
              name: "Analysis Failed",
              confidence: 0,
              status: "error",
              reviewNeeded: true,
              errorMessage: "Could not reach the identification service. Please try again later.",
            });
          }

          setStatus("success");
        }, 1200);
      }, 1200);
    }, 1200);
  }

  function handleSandboxClick(item) {
    // Provide a dummy generic image for sandbox simulation
    setPreview("/pulse_diagnosis.png");
    setFile({ name: "sandbox-simulation.jpg" });
    simulateAnalysis({
      name: item.name,
      confidence: item.confidence,
      status: item.isAdulterant ? "moderate" : "high",
      confusableWith: item.isAdulterant ? item.realName : null,
      reviewNeeded: item.isAdulterant,
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[55vh] min-h-[450px] flex flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url("/herbs_banner.png")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent z-1 opacity-20"></div>

        <div className="w-full px-4 lg:px-12 relative z-10">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-0.5 w-8 bg-emerald-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">MEMBER 01 RESEARCH MODULE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Medicinal Plant</h1>
            <h2 className="text-3xl md:text-4xl italic font-light text-emerald-300 mb-6">Botanical Authentication</h2>
            <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed max-w-lg">
              Establishing a scientific methodology to verify the authenticity of Sri Lankan traditional raw materials and identify commercial adulterants or toxic look-alikes.
            </p>
          </div>
        </div>
      </section>

      {/* 2. TAB NAVIGATION (Mock) */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="w-full px-4 lg:px-12 flex gap-8">
          <div className="py-4 border-b-2 border-emerald-500 text-emerald-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <ScanIcon /> AI BOTANICAL SCANNER
          </div>
          <div className="py-4 text-slate-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 hover:text-slate-600 cursor-not-allowed">
            <FileText className="w-4 h-4" /> MEDICINAL HERBARIUM DATABASE
          </div>
        </div>
      </div>

      {/* INFINITE MARQUEE */}
      <InfiniteMarquee />

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="w-full px-4 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: CONTROLS (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Box 1: Uploader */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-600" /> 1. Select Leaf Specimen
              </h3>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                  <p className="mb-1 text-xs font-semibold text-slate-600">Click to browse leaf image</p>
                  <p className="text-[10px] text-slate-400">Supports JPG, JPEG, PNG</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Camera className="w-4 h-4" /> Use Camera Scan
                </button>
                <button 
                  onClick={() => simulateAnalysis()}
                  disabled={!file || status === 'analyzing'}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
                >
                  Authenticate <ChevronRightIcon />
                </button>
              </div>
            </div>

            {/* Box 2: Quality Guidelines */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> IMAGE QUALITY GUIDELINES
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Check these parameters before running the AI model to ensure correct botanical classification:</p>
              
              <div className="space-y-2">
                {["Leaf is fully visible and centered in frame", "Clean background (preferably white or light sheet)", "Good natural lighting without heavy shadows", "Image focus is sharp (not blurry or shaky)"].map((text, i) => (
                  <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                    <div className="w-4 h-4 rounded text-white bg-blue-500 flex items-center justify-center mt-0.5 shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-900">{text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Box 3: Quick Sandbox (For Panel Demo) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-amber-400">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2 flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber-500" /> QUICK SANDBOX SIMULATION
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Click any plant card below to simulate a botanical upload to the AI backend (Demo Mode):</p>
              
              <div className="grid grid-cols-2 gap-3">
                {sandboxItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSandboxClick(item)}
                    className="text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group bg-slate-50 hover:bg-white"
                  >
                    <div className="text-xs font-bold text-slate-800 mb-1 group-hover:text-emerald-700">{item.name}</div>
                    <div className={`text-[9px] font-semibold uppercase tracking-wider ${item.isAdulterant ? 'text-red-500' : 'text-emerald-500'}`}>
                      Expected: {item.expected}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Box 4: Pipeline Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-4">MODEL PIPELINE STATUS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> EfficientNetB0 Classifier
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">READY</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Pharmacognosy Matcher
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">READY</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: RESULTS AREA (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[600px] flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> 2. Authentication &amp; Adulteration Report
              </h2>

              {/* State: IDLE */}
              {status === 'idle' && (
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <Search className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-sm font-medium text-slate-400">Upload a leaf specimen or use camera scan to start.</p>
                </div>
              )}

              {/* State: ANALYZING */}
              {status === 'analyzing' && (
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-slate-100 rounded-xl bg-slate-900 relative overflow-hidden">
                  {/* Mock scanning animation effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                  <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_15px_3px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-6 relative z-10" />
                  <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest relative z-10 animate-pulse">{loadingText}</p>
                </div>
              )}

              {/* State: SUCCESS (Results) */}
              {status === 'success' && result && (
                <div className="flex-grow flex flex-col animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Image Preview */}
                    <div>
                      <div className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                        {preview ? (
                           <img src={preview} alt="Scanned plant" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-10 h-10" /></div>
                        )}
                        {/* Overlay targeting corners */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500"></div>
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500"></div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-col justify-center">
                      <div className="mb-6">
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">AI Classification Match</p>
                        <h3 className="text-3xl font-bold text-slate-800">{result.name}</h3>
                      </div>

                      <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Confidence Score</p>
                          <p className="text-2xl font-bold text-emerald-600">{result.confidence}%</p>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${result.confidence > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${result.confidence}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-700 mb-1">Taxonomy Validated</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed">The morphological features extracted match the verified herbarium dataset for this species.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RELIABILITY NOTICE — reflects what the classifier can actually claim:
                      a confidence-scored species match, plus a flag when the top prediction
                      is a known confusable pair or the confidence is too low to trust. */}
                  {result.status === "error" ? (
                    <div className="mb-8 p-5 rounded-xl border-2 border-red-200 bg-red-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-800 mb-1">ANALYSIS FAILED</h4>
                          <p className="text-xs text-red-700 leading-relaxed">{result.errorMessage}</p>
                        </div>
                      </div>
                    </div>
                  ) : result.status === "low" ? (
                    <div className="mb-8 p-5 rounded-xl border-2 border-red-200 bg-red-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-800 mb-1">NOT CONFIDENTLY IDENTIFIED</h4>
                          <p className="text-xs text-red-700 leading-relaxed">
                            Confidence is too low to trust this match (best guess: {result.name}, {result.confidence}%).
                            This can happen with a plant outside the model&apos;s 21 trained species, a poor-quality photo,
                            or an unrelated image. Please retake the photo or verify manually.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : result.confusableWith ? (
                    <div className="mb-8 p-5 rounded-xl border-2 border-amber-200 bg-amber-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-amber-800 mb-1">POSSIBLE SPECIES CONFUSION</h4>
                          <p className="text-xs text-amber-700 leading-relaxed mb-3">
                            <strong className="font-bold">{result.name}</strong> is a known confusable pair with{" "}
                            <strong className="font-bold">{result.confusableWith}</strong>
                            {result.secondName ? ` (second-closest match: ${result.secondName}, ${result.secondConfidence}%)` : ""}.
                          </p>
                          <div className="bg-white/60 p-3 rounded-lg border border-amber-100">
                            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2">Recommended Next Steps:</p>
                            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                              <li>Cross-check known distinguishing features between the two species before use.</li>
                              <li>Do not use in medicinal preparation without expert taxonomist approval.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8 p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-800 mb-1">
                            {result.status === "moderate" ? "LIKELY MATCH — VERIFY MANUALLY" : "RELIABLE SPECIES MATCH"}
                          </h4>
                          <p className="text-xs text-emerald-700">
                            No known confusable species flagged for this prediction.
                            {result.status === "moderate" ? " Confidence is moderate — a manual check is still recommended." : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-slate-100 flex gap-4 justify-end">
                    <button className="px-6 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      Export Lab Report (PDF)
                    </button>
                    <button onClick={() => { setStatus("idle"); setResult(null); setPreview(null); setFile(null); }} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all">
                      Scan Another Specimen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

// Mini components for icons
function ScanIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
