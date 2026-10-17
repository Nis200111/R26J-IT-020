"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, Leaf, Sparkles } from "lucide-react";

export default function ImageUploader({ onImageSelected }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelected(file, e.target?.result);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
        isDragging
          ? "border-emerald-500 bg-emerald-50/80 scale-[1.01] shadow-lg shadow-emerald-500/10"
          : "border-zinc-300 bg-gradient-to-b from-zinc-50/50 to-white hover:border-emerald-500/80 hover:bg-emerald-50/30 hover:shadow-md"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {/* Floating badge */}
      <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
        <Sparkles className="h-3 w-3" />
        AI Ready
      </div>

      {/* Upload icon container with soft glowing ring on hover */}
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-300 shadow-sm ${
          isDragging
            ? "bg-emerald-600 text-white scale-110 shadow-emerald-200"
            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-105 group-hover:shadow-md"
        }`}
      >
        <Upload className="h-9 w-9 transition-transform group-hover:-translate-y-0.5" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <p className="text-lg sm:text-xl font-bold text-zinc-800 group-hover:text-emerald-950 transition-colors">
          Drop your leaf specimen here
        </p>
        <p className="text-sm sm:text-base text-zinc-500">
          or <span className="font-bold text-emerald-700 underline underline-offset-4 decoration-emerald-300 group-hover:decoration-emerald-500">click to browse</span> from your device
        </p>
        <p className="text-xs sm:text-sm text-zinc-600 font-medium pt-1">
          ඖෂධීය පත්‍රයේ ඡායාරූපය Drag & Drop කරන්න හෝ Browse කර තෝරන්න
        </p>
        <p className="text-xs text-zinc-400 pt-1">
          Supports PNG, JPG, WEBP · High resolution recommended
        </p>
      </div>

      {/* Helpful tips pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 group-hover:bg-white group-hover:shadow-xs transition-all">
          <Leaf className="h-3.5 w-3.5 text-emerald-600" />
          <span>Single leaf on clear background</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 group-hover:bg-white group-hover:shadow-xs transition-all">
          <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
          <span>Good natural lighting</span>
        </div>
      </div>
    </label>
  );
}
