"use client";

import Link from "next/link";

export default function AllInOneError({ reset }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-center">
      <h2 className="mb-2 font-serif text-xl font-semibold text-zinc-100">
        This feature ran into a problem
      </h2>
      <p className="mb-4 text-zinc-400">
        This page is temporarily unavailable. Other pages are not affected.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-[#c5a880] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-[#b0936b]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-zinc-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
