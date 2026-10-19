/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Camera, Upload, Microscope, Leaf, Shield, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
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
      setErrorMsg(err.message || "Analysis failed. Please verify backend connection and try again.");
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
        eyebrow="MEMBER 3 · MEDICINAL LEAF HEALTH DETECTION"
        title="Medicinal Leaf"
        accent="Health Detection"
        image="/herbs_banner.png"
        description="Upload or capture a medicinal leaf image. Our EfficientNetB4 deep learning model classifies whether the leaf exhibits healthy or diseased visual features, proposing a heuristic visual leaf-condition grade for research screening."
      />

      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Feature highlights pills */}
          <div className="mb-6 flex flex-wrap gap-2.5 sm:gap-3">
            {[
              { icon: <Microscope className="h-4 w-4 text-emerald-700" />, text: "EfficientNetB4 Classifier" },
              { icon: <Leaf className="h-4 w-4 text-emerald-700" />, text: "Healthy vs Diseased Detection" },
              { icon: <Shield className="h-4 w-4 text-emerald-700" />, text: "Proposed Visual Leaf-Condition Grading" },
            ].map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-900 shadow-2xs transition-all hover:border-emerald-300"
              >
                {p.icon}
                <span>{p.text}</span>
              </span>
            ))}
          </div>

          {/* Idle / Input State */}
          {state === "idle" && (
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm">
              {/* Tab Selector */}
              <div className="flex gap-1.5 rounded-2xl bg-zinc-100/90 p-1.5 mb-6 border border-zinc-200/60 max-w-md mx-auto">
                <button
                  onClick={() => setTab("upload")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    tab === "upload"
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Upload Specimen</span>
                </button>
                <button
                  onClick={() => setTab("camera")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    tab === "camera"
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Camera className="h-4 w-4 text-emerald-600" />
                  <span>Use Live Camera</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-2xs">
                  <span className="font-bold">Error:</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {tab === "upload" ? (
                <ImageUploader onImageSelected={handleImageReady} />
              ) : (
                <div className="flex flex-col items-center gap-5 py-12 px-4 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-sm">
                    <Camera className="h-10 w-10" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <p className="font-serif text-xl font-bold text-zinc-900">
                      Open Camera Viewfinder
                    </p>
                    <p className="text-sm text-zinc-500">
                      Capture a real-time high-resolution photograph of the medicinal leaf specimen.
                    </p>
                    <p className="text-xs text-zinc-600 font-medium pt-1">
                      කැමරාව භාවිතයෙන් පත්‍රයේ ඡායාරූපයක් ලබාගෙන ක්ෂණිකව පරීක්ෂා කරන්න
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  >
                    <Camera className="h-4 w-4" />
                    Launch Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analyzing / Processing State */}
          {state === "analyzing" && preview && (
            <div className="flex flex-col items-center gap-8 rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm text-center">
              <div className="relative h-56 w-56 sm:h-64 sm:w-64 overflow-hidden rounded-3xl border-2 border-emerald-300 shadow-md">
                <img
                  src={preview}
                  alt="Analyzing leaf"
                  className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-2xs flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent shadow-lg" />
                    <Sparkles className="absolute h-8 w-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* Animated scanning line overlay */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-bounce" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
                  Analyzing Leaf Health...
                </h3>
                <p className="text-sm sm:text-base text-zinc-500 font-medium">
                  Running EfficientNetB4 deep neural network for Ayurvedic pathogen screening
                </p>
                <p className="text-xs sm:text-sm text-emerald-800 font-semibold">
                  ඖෂධීය පත්‍රයේ සෞඛ්‍ය තත්ත්වය සහ ආයුර්වේද යෝග්‍යතාවය පරීක්ෂා කරමින් පවතී...
                </p>
              </div>

              {/* Progress Step Checklist */}
              <div className="flex flex-col gap-2.5 w-full max-w-sm text-left rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4">
                {[
                  "Preprocessing specimen image (224×224)",
                  "Running EfficientNetB4 neural inference",
                  "Computing AMS (Ayurvedic Medicinal Suitability) Grade",
                  "Preparing remedies and treatment advisory",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse shrink-0"
                      style={{ animationDelay: `${i * 0.25}s` }}
                    />
                    <span className="text-xs sm:text-sm font-medium text-zinc-700">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results State */}
          {state === "done" && result && preview && (
            <ResultDisplay result={result} originalImage={preview} onReset={reset} />
          )}

          {/* Bottom Module Navigation */}
          <div className="mt-8 pt-6 border-t border-zinc-200/80 flex items-center justify-between">
            <Link
              href="/#research-modules"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span>← Back to Research Modules</span>
            </Link>
            <span className="text-xs text-zinc-400 font-medium">
              Member 3 · Herbal Quality Assurance
            </span>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleImageReady}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
