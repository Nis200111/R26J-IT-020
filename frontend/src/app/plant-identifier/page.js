"use client";

import { useState } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlantIdentifierPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  }

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/member1/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.message || "Prediction failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Could not reach the plant authentication service. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Member 1 · Botanical Classification"
        title="Medicinal Plant"
        accent="Authentication"
        image="/welcome_art.png"
        description="Upload a photo of a medicinal plant to identify its species and check for adulterants or toxic look-alikes, backed by a Deep Learning botanical classification model."
      />

      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm mb-4"
          />

          {preview && (
            <img
              src={preview}
              alt="Selected plant"
              className="w-full max-h-64 object-contain rounded-2xl mb-4 border border-zinc-200"
            />
          )}

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className="w-full rounded-full bg-[#c5a880] py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#b0936b] disabled:opacity-50"
          >
            {loading ? "Identifying..." : "Identify Plant"}
          </button>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-serif font-semibold text-zinc-900">{result.label}</p>
                <p className="text-sm text-zinc-500">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-100">
            <a href="/#research-modules" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              Back to Research Modules <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
