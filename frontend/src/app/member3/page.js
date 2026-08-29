"use client";

import { useState, useCallback } from "react";
import { Camera, Upload, Microscope, Leaf, Shield, ChevronRight } from "lucide-react";
import ImageUploader from "@/components/features/member3/ImageUploader";
import CameraCapture from "@/components/features/member3/CameraCapture";
import ResultDisplay from "@/components/features/member3/ResultDisplay";
import PageHeader from "@/components/layout/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function analyzeLeaf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/member3/predict`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.message || "Analysis failed.");
  return data;
}

export default function PlantDiseaseDetectionPage() {
  const [tab, setTab] = useState("upload");
  const [showCamera, setShowCamera] = useState(false);
  const [state, setState] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleImageReady = useCallback(async (file, prev) => {
    setPreview(prev);
    setShowCamera(false);
    setState("analyzing");
    setErrorMsg(null);
    try {
      const res = await analyzeLeaf(file);
      setResult(res);
      setState("done");
    } catch (err) {
      setState("idle");
      setErrorMsg(err.message || "Analysis failed. Please try again.");
    }
  }, []);

  const reset = () => {
    setState("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Member 3 · Leaf Health Classification"
        title="Medicinal Leaf"
        accent="Health Detection"
        image="/herbs_banner.png"
        description="Upload or capture a medicinal leaf image. Our EfficientNetB4 deep learning model classifies whether the leaf is healthy or diseased, determining its suitability for Ayurvedic medicine production."
      />

      <div className="container mx-auto px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex flex-wrap gap-3">
            {[
              { icon: <Microscope className="h-3.5 w-3.5" />, text: "EfficientNetB4 Classifier" },
              { icon: <Leaf className="h-3.5 w-3.5" />, text: "Healthy vs Diseased Detection" },
              { icon: <Shield className="h-3.5 w-3.5" />, text: "Ayurvedic Quality Verification" },
            ].map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a880]/40 bg-[#f5f2eb] px-3 py-1.5 text-xs font-medium text-[#8a6d3b]"
              >
                {p.icon} {p.text}
              </span>
            ))}
          </div>

          {state === "idle" && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 mb-6">
                {["upload", "camera"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {t === "upload" ? <Upload className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                    {t === "upload" ? "Upload Image" : "Use Camera"}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
              )}

              {tab === "upload" ? (
                <ImageUploader onImageSelected={handleImageReady} />
              ) : (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f5f2eb]">
                    <Camera className="h-9 w-9 text-[#c5a880]" />
                  </div>
                  <div className="text-center">
                    <p className="font-serif font-semibold text-zinc-800">Open Camera</p>
                    <p className="mt-1 text-sm text-zinc-500">Capture a real-time photo of the medicinal leaf</p>
                  </div>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="rounded-full bg-[#c5a880] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b0936b] transition-all"
                  >
                    Open Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {state === "analyzing" && preview && (
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
              <div className="relative h-48 w-48 overflow-hidden rounded-2xl">
                <img src={preview} alt="Analyzing" className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#c5a880] border-t-transparent" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-serif text-xl font-bold text-zinc-900">Analyzing Leaf Health...</p>
                <p className="mt-2 text-sm text-zinc-500">Running EfficientNetB4 classification model</p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {["Preprocessing image (224×224)", "Running EfficientNetB4 inference", "Computing AMS Quality Grade", "Preparing analysis report"].map(
                  (step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#c5a880] animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                      <span className="text-xs text-zinc-500">{step}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {state === "done" && result && preview && (
            <ResultDisplay result={result} originalImage={preview} onReset={reset} />
          )}

          <div className="mt-6 pt-6 border-t border-zinc-200">
            <a href="/#research-modules" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Back to Research Modules <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {showCamera && <CameraCapture onCapture={handleImageReady} onClose={() => setShowCamera(false)} />}
    </div>
  );
}
