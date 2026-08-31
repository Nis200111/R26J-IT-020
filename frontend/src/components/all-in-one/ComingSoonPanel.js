import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Placeholder for the models that are not wired into this page yet.
 * Links out to the member's existing standalone page so the work is reachable,
 * or to its separate deployment when the model is marked `external`.
 */
export default function ComingSoonPanel({ model }) {
  const Icon = model.icon;
  // next/link would still client-route an absolute URL badly here, so external
  // deployments get a plain anchor that navigates in place.
  const LinkTag = model.external ? "a" : Link;
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-500">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="font-serif text-2xl font-light text-zinc-200">{model.name}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{model.blurb}</p>
      <p className="mt-5 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        {model.external ? "Runs as a separate app" : "Not connected here yet"}
      </p>
      <LinkTag
        href={model.href}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a880] transition-colors hover:text-[#b0936b]"
      >
        Open the {model.name} {model.external ? "app" : "page"}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </LinkTag>
    </div>
  );
}
