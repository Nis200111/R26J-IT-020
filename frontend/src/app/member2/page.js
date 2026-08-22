import PageHeader from "@/components/layout/PageHeader";
import { ChevronRight } from "lucide-react";

export default function Member2Page() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Member 2 · Natural Language Understanding"
        title="Intent Classification"
        accent="& NLU"
        description="An NLU engine for interpreting indigenous medical queries and classifying user intent — coming soon."
      />
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <h2 className="font-serif text-xl font-bold text-zinc-900 mb-2">Coming Soon</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Member 2&apos;s model is still in progress. This page will be replaced with the
            real feature once it&apos;s ready.
          </p>
          <a href="/#research-modules" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
            Back to Research Modules <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
