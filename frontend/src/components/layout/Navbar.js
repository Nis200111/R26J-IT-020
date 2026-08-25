"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Leaf, Database, Menu, X, Globe, Check, ChevronRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("English");

  const languagesList = [
    { label: "English", code: "en" },
    { label: "Sinhala", code: "si" },
    { label: "Tamil", code: "ta" },
    { label: "French", code: "fr" },
    { label: "German", code: "de" },
    { label: "Chinese", code: "zh-CN" },
    { label: "Japanese", code: "ja" },
    { label: "Hindi", code: "hi" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const googtrans = getCookie("googtrans");
    if (googtrans) {
      const parts = googtrans.split("/");
      const activeCode = parts[parts.length - 1];
      const activeLang = languagesList.find((l) => l.code === activeCode);
      if (activeLang) setCurrentLang(activeLang.label);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageSelect = (label, code) => {
    setCurrentLang(label);
    setIsLangModalOpen(false);

    if (code === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${code}; path=/;`;
    }

    const googleSelect = document.querySelector(".goog-te-combo");
    if (googleSelect) {
      try {
        googleSelect.value = code;
        googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
      } catch {
        // Google Translate widget not ready — cookie above still applies on reload.
      }
    }

    setTimeout(() => {
      window.location.reload();
    }, 150);
  };

  const isBannerPage = pathname === "/";

  const navContainerClass = !isScrolled && isBannerPage
    ? "bg-transparent border-transparent text-white"
    : "bg-white/90 border-b border-zinc-200 backdrop-blur-md text-zinc-800 shadow-sm";

  const linkClass = !isScrolled && isBannerPage
    ? "text-zinc-200 hover:text-[#c5a880] transition-colors"
    : "text-zinc-650 hover:text-emerald-600 transition-colors";

  const logoTextClass = !isScrolled && isBannerPage ? "text-white" : "text-zinc-900";

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${navContainerClass}`}>
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Leaf className="h-5.5 w-5.5 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
                  <Database className="h-3 w-3 text-amber-500 absolute -bottom-1 -right-1" />
                </div>
                <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${logoTextClass}`}>
                  Bio-Heritage <span className="text-emerald-500">AI</span>
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-baseline space-x-8 text-xs uppercase tracking-wider font-bold">
                <Link href="/" className={linkClass}>Home</Link>
                <Link href="/about" className={linkClass}>About</Link>
                <Link href="/#research-modules" className={linkClass}>Research</Link>
                <Link href="/contact" className={linkClass}>Contact</Link>
              </div>

              <button
                onClick={() => setIsLangModalOpen(true)}
                className={`flex items-center gap-2 border-l border-zinc-200/50 pl-6 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${!isScrolled && isBannerPage ? "text-zinc-200 hover:text-[#c5a880]" : "text-zinc-600 hover:text-emerald-650"}`}
              >
                <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{currentLang}</span>
              </button>


            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white text-zinc-800 animate-fade-in">
            <div className="space-y-3 px-4 pb-4 pt-3 sm:px-6 text-xs uppercase tracking-wider font-bold">
              <Link href="/" className="block rounded-md px-3 py-2 hover:bg-zinc-50">Home</Link>
              <Link href="/about" className="block rounded-md px-3 py-2 hover:bg-zinc-50">About</Link>
              <Link href="/#research-modules" className="block rounded-md px-3 py-2 hover:bg-zinc-50">Research</Link>
              <Link href="/contact" className="block rounded-md px-3 py-2 hover:bg-zinc-50">Contact</Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsLangModalOpen(true);
                }}
                className="w-full flex items-center gap-2 border-t border-zinc-100 pt-3 px-3 text-xs font-bold uppercase text-zinc-600 hover:text-emerald-650"
              >
                <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Language: {currentLang}</span>
              </button>


            </div>
          </div>
        )}
      </nav>

      <div
        id="google_translate_element"
        style={{ opacity: 0, position: "absolute", top: "-10px", left: "-10px", width: "1px", height: "1px", overflow: "hidden", pointerEvents: "none" }}
      ></div>

      {isLangModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative border border-zinc-100 text-zinc-900 animate-scale-up text-left">
            <button
              onClick={() => setIsLangModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-650 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold tracking-tight text-zinc-900">Select your language</h3>

            <div className="mt-6 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current Language</span>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-semibold text-[#c5a880]">
                  {currentLang}
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            <div className="mt-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-4">All languages</span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-6 max-h-72 overflow-y-auto pr-2">
                {languagesList.map((lang) => {
                  const isActive = currentLang === lang.label;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.label, lang.code)}
                      className={`flex items-center justify-between text-left text-xs transition-all w-full py-1.5 focus:outline-none ${isActive ? "text-[#c5a880] font-bold" : "text-zinc-600 hover:text-zinc-900"}`}
                    >
                      <span className="truncate">{lang.label}</span>
                      {isActive ? (
                        <Check className="h-3.5 w-3.5 text-[#c5a880]" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
