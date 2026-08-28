"use client";

import Link from "next/link";
import { ArrowLeft, Plus, X, Sparkles } from "lucide-react";

/** Status dot next to each model: green = working, red = last call failed, grey = untried. */
function StatusDot({ state }) {
  const cls =
    state === "ok" ? "bg-emerald-400"
      : state === "error" ? "bg-red-400"
      : "bg-zinc-600";
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cls}`} />;
}

export default function Sidebar({
  models, selectedId, onSelect, health, onNewChat, open, onClose,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`absolute inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2 font-serif text-base text-zinc-100">
            <Sparkles className="h-4 w-4 text-[#c5a880]" />
            Bio-Heritage
          </span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3">
          <button
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Models */}
        <p className="px-6 pb-2 pt-6 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
          Research modules
        </p>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {models.map((m) => {
            const Icon = m.icon;
            const active = m.id === selectedId;
            const state = !m.enabled ? "idle" : health[m.id]?.ok === false ? "error"
              : health[m.id]?.ok ? "ok" : "idle";
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active
                    ? "bg-zinc-800 text-zinc-50"
                    : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
                <StatusDot state={state} />
              </button>
            );
          })}
        </nav>

        {/* Back to the normal site */}
        <div className="border-t border-zinc-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-800/70 hover:text-zinc-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Bio-Heritage AI
          </Link>
        </div>
      </aside>
    </>
  );
}
