"use client";

export default function AdminError({ reset }) {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-2">This page ran into a problem</h2>
      <p className="text-zinc-500 mb-4">The admin dashboard is temporarily unavailable. Other pages are not affected.</p>
      <button onClick={reset} className="rounded-full bg-[#c5a880] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#b0936b]">
        Try again
      </button>
    </div>
  );
}
