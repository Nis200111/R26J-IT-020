"use client";

import { useCallback, useState } from "react";
import { Upload, ImageIcon } from "lucide-react";

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
      className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
        isDragging
          ? "border-emerald-500 bg-emerald-50"
          : "border-zinc-300 bg-zinc-50 hover:border-emerald-400 hover:bg-emerald-50/50"
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

      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
          isDragging ? "bg-emerald-100" : "bg-zinc-200 group-hover:bg-emerald-100"
        }`}
      >
        <Upload className={`h-7 w-7 transition-colors ${isDragging ? "text-emerald-600" : "text-zinc-500 group-hover:text-emerald-600"}`} />
      </div>

      <div>
        <p className="text-base font-semibold text-zinc-700">Drop your leaf image here</p>
        <p className="mt-1 text-sm text-zinc-500">
          or <span className="font-medium text-emerald-600">click to browse</span>
        </p>
        <p className="mt-2 text-xs text-zinc-400">PNG, JPG, WEBP — up to 10MB</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <ImageIcon className="h-3.5 w-3.5" />
        <span>Best results with clear, well-lit leaf photos</span>
      </div>
    </label>
  );
}
