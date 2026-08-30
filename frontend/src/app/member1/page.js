"use client";

/**
 * Member 1 — Medicinal Plant Botanical Authentication.
 *
 * Page shell only: hero, tab switch, marquee. The work lives in
 * components/features/member1/.
 *
 * The "Medicinal Herbarium Database" tab used to be `cursor-not-allowed` and did
 * nothing. It now switches views.
 */

import { useState } from "react";
import { ScanLine, Layers, FileText, BarChart3 } from "lucide-react";

import InfiniteMarquee from "@/components/InfiniteMarquee";
import ScannerWorkbench from "@/components/features/member1/ScannerWorkbench";
import BatchScanner from "@/components/features/member1/BatchScanner";
import HerbariumDatabase from "@/components/features/member1/HerbariumDatabase";
import ModelPerformance from "@/components/features/member1/ModelPerformance";

const TABS = [
  { id: "scanner", label: "AI Botanical Scanner", icon: ScanLine, Component: ScannerWorkbench },
  { id: "batch", label: "Batch Identification", icon: Layers, Component: BatchScanner },
  { id: "herbarium", label: "Medicinal Herbarium Database", icon: FileText, Component: HerbariumDatabase },
  { id: "performance", label: "Model Performance", icon: BarChart3, Component: ModelPerformance },
];

export default function MedicinalPlantAuthenticationPage() {
  const [tab, setTab] = useState("scanner");
  const Active = (TABS.find((t) => t.id === tab) || TABS[0]).Component;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans">

      {/* HERO */}
      <section className="relative h-[55vh] min-h-[450px] flex flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url("/herbs_banner.png")' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent z-[1] opacity-20" />

        <div className="w-full px-4 lg:px-12 relative z-10">
          <div className="max-w-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-0.5 w-8 bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                MEMBER 01 RESEARCH MODULE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Medicinal Plant</h1>
            <h2 className="text-3xl md:text-4xl italic font-light text-emerald-300 mb-6">
              Botanical Authentication
            </h2>
            <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed max-w-lg">
              Scientific identification of Sri Lankan medicinal plants, with confidence scoring
              and flagging of species the model is known to confuse.
            </p>
          </div>
        </div>
      </section>

      {/* TABS — top-16, not top-0: the site Navbar is `fixed top-0 z-50 h-16`,
          so a tab bar stuck at top-0 slides underneath it and disappears. */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-20 shadow-sm">
        <div className="w-full px-4 lg:px-12 flex gap-8 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`py-4 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-colors ${tab === id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-400 hover:text-slate-600"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {tab !== "performance" && <InfiniteMarquee />}

      <Active />
    </div>
  );
}
