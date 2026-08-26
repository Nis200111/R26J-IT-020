"use client";

import WaterRipple from "./WaterRipple";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 bg-transparent">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[60px] fill-white dark:fill-black"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V120c47.72-20.7,103.42-41.1,152.87-52.22C210.75,55.71,273.89,65.3,321.39,56.44Z"></path>
        </svg>
      </div>

      <WaterRipple imageUrl="/footer-bg.png">
        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px]"></div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="col-span-1 lg:col-span-1">
              <h3 className="text-xl font-bold tracking-wider text-emerald-400 uppercase">Bio-Heritage AI</h3>
              <div className="mt-2.5 h-0.5 w-10 bg-emerald-500"></div>
              <p className="mt-4 text-xs leading-relaxed text-zinc-300 antialiased">
                Digitizing and preserving the timeless wisdom of Sri Lankan Indigenous
                Medical Knowledge through state-of-the-art Multi-Modal Artificial Intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Navigation</h4>
              <div className="mt-1 h-[1px] w-6 bg-emerald-500/50"></div>
              <ul className="mt-4 space-y-2 text-xs text-zinc-400">
                <li><a href="/" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">Home</a></li>
                <li><a href="/#research-modules" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">Our Research</a></li>
                <li><a href="/about" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">About Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Resources</h4>
              <div className="mt-1 h-[1px] w-6 bg-emerald-500/50"></div>
              <ul className="mt-4 space-y-2 text-xs text-zinc-400">
                <li><a href="/member1" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">Plant Identifier</a></li>
                <li><a href="/member3" className="hover:text-emerald-400 transition-all hover:translate-x-1 inline-block">Disease Detection</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Contact</h4>
              <div className="mt-1 h-[1px] w-6 bg-emerald-500/50"></div>
              <div className="mt-4 space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2">
                  <svg className="h-4 w-4 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>SLIIT Faculty of Computing,<br />New Kandy Road, Malabe, Sri Lanka.</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>info@bioheritage.ai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 text-center text-[10px] text-zinc-500">
            <p>© {new Date().getFullYear()} Bio Heritage AI Research Team. All rights reserved.</p>
          </div>
        </div>
      </WaterRipple>
    </footer>
  );
}
