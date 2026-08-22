import PageHeader from "@/components/layout/PageHeader";
import { ChevronRight } from "lucide-react";

export default function Member4Page() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Member 4 · Infrastructure"
        title="System"
        accent="Gateway"
        description="Centralized gateway managing API traffic, system health monitoring, and secure access to the heritage AI microservices — coming soon."
      />
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <h2 className="font-serif text-xl font-bold text-zinc-900 mb-2">Coming Soon</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Member 4&apos;s component is still in progress. This page will be replaced with the
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
