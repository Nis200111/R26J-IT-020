"use client";

import { useEffect, useRef } from "react";
import { Plus, ArrowUp, Loader2 } from "lucide-react";
import ModelPicker from "./ModelPicker";

/**
 * The input box: autosizing textarea, a "+" attach button (inert until the
 * image models are wired up), the model picker and the send button.
 *
 * The frame never changes shape when you switch models — only the affordances
 * inside it change — so the layout does not jump.
 */
export default function Composer({
  model, models, value, onChange, onSubmit, onSelectModel, loading,
}) {
  const taRef = useRef(null);
  const canType = model.input === "text" && model.enabled;
  const canSend = canType && value.trim().length > 0 && !loading;

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

  const attachHint = !model.enabled
    ? `${model.name} is not connected here yet`
    : model.input === "text"
      ? `${model.name} reads text only`
      : "Attach an image";

  return (
    <div className="rounded-3xl border border-zinc-700 bg-zinc-900 shadow-lg transition-colors focus-within:border-zinc-600">
      <textarea
        ref={taRef}
        rows={1}
        value={value}
        disabled={!canType}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={model.enabled ? model.placeholder : `${model.name} — coming soon`}
        className="w-full resize-none bg-transparent px-5 pt-4 text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1">
        <button
          type="button"
          disabled
          title={attachHint}
          aria-label={attachHint}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>

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
    </div>
  );
}
