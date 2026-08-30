"use client";

import { useEffect, useRef } from "react";
import { Plus, ArrowUp, Loader2, X, ImageIcon } from "lucide-react";
import ModelPicker from "./ModelPicker";

/**
 * The input box: autosizing textarea, a "+" attach button, the model picker and
 * the send button.
 *
 * The frame never changes shape when you switch models - only the affordances
 * inside it change - so the layout does not jump. Which affordances are live is
 * driven entirely by `model.input`:
 *   "text"  -> textarea active, attach disabled   (member2)
 *   "image" -> attach active, textarea disabled   (member1, member3)
 *   "none"  -> both disabled                      (member4)
 */
export default function Composer({
  model, models, value, onChange, onSubmit, onSelectModel, loading,
  pending, onFile, onClearPending,
}) {
  const taRef = useRef(null);
  const fileRef = useRef(null);

  const wantsText = model.input === "text" && model.enabled;
  const wantsImage = model.input === "image" && model.enabled;

  const canSend = loading
    ? false
    : wantsText
      ? value.trim().length > 0
      : wantsImage
        ? !!pending
        : false;

  // Grow the textarea with its content, up to a cap.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    // reset so picking the same file twice still fires onChange
    e.target.value = "";
  }

  const attachHint = !model.enabled
    ? `${model.name} is not connected here yet`
    : wantsImage
      ? "Attach an image"
      : `${model.name} reads text only`;

  return (
    <div className="rounded-3xl border border-zinc-700 bg-zinc-900 shadow-lg transition-colors focus-within:border-zinc-600">
      {/* Attached image chip */}
      {pending && (
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pending.previewUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">
            {pending.name}
          </span>
          <button
            type="button"
            onClick={onClearPending}
            aria-label="Remove image"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <textarea
        ref={taRef}
        rows={1}
        value={value}
        disabled={!wantsText}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={model.enabled ? model.placeholder : `${model.name} — coming soon`}
        className="w-full resize-none bg-transparent px-5 pt-4 text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
        <button
          type="button"
          disabled={!wantsImage}
          onClick={() => fileRef.current?.click()}
          title={attachHint}
          aria-label={attachHint}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            wantsImage
              ? "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              : "text-zinc-500 opacity-40 cursor-not-allowed"
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex items-center gap-1">
          <ModelPicker models={models} selectedId={model.id} onSelect={onSelectModel} />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            aria-label="Send"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c5a880] text-zinc-950 transition-colors hover:bg-[#b0936b] disabled:opacity-30"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {wantsImage && !pending && (
        <p className="flex items-center justify-center gap-1.5 border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-600">
          <ImageIcon className="h-3 w-3" />
          Attach a photo, or drop one anywhere on this page
        </p>
      )}
    </div>
  );
}
