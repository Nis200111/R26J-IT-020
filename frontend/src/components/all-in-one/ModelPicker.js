"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Model selector that sits inside the composer, like the model dropdown in the
 * Claude composer. Hand-rolled popover (no UI library in this project):
 * closes on outside mousedown and on Escape.
 */
export default function ModelPicker({ models, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = models.find((m) => m.id === selectedId) || models[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
      >
        <span className="max-w-[10rem] truncate">{selected.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full right-0 z-30 mb-2 w-72 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 py-1 shadow-2xl"
        >
          {models.map((m) => {
            const Icon = m.icon;
            const active = m.id === selectedId;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={active}
                onClick={() => { onSelect(m.id); setOpen(false); }}
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm text-zinc-100">{m.name}</span>
                    {!m.enabled && (
                      <span className="shrink-0 rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        soon
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {m.subtitle}
                  </span>
                </span>
                {active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#c5a880]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
