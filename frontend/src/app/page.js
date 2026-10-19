"use client";

import { useState, useEffect } from "react";
import RagSection from "@/components/features/member1/RagSection";
import IntentSection from "@/components/features/member2/IntentSection";
import ExplainSection from "@/components/features/member3/ExplainSection";
import GatewaySection from "@/components/features/member4/GatewaySection";
import { Compass, MapPin, Building, BedDouble, ChevronRight, Award, CheckCircle2 } from "lucide-react";

export default function Home() {
  const slideshowImages = ["/hero_massage.png", "/stupas_sunset.png", "/herbs_banner.png"];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 3500); // Changed to 3.5 seconds so it moves faster automatically!
    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  return (
    <div className="flex flex-col gap-0 bg-[#faf9f6] text-zinc-800">

      {/* 1. HERO SECTION: Automated Background Slideshow */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-center text-white">
        {slideshowImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{ backgroundImage: `url(${img})`, opacity: currentSlide === index ? 0.65 : 0 }}
          ></div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/30 to-zinc-950/60 z-1"></div>

        <div className="container relative z-10 px-6 max-w-4xl space-y-4">
          <div className="mb-2 flex items-center gap-3 justify-center">
            <div className="h-[1px] w-6 bg-[#c5a880]"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c5a880]">Bio-Heritage AI</span>
            <div className="h-[1px] w-6 bg-[#c5a880]"></div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.2]">
            BIO HERITAGE AI MULTI MODAL FRAMEWORK FOR PRESERVING SRI LANKAN INDIGENOUS MEDICAL KNOWLEDGE
          </h1>


          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <a href="#research-modules" className="rounded-full bg-[#c5a880] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#b0936b] shadow-lg">
              Explore Research
            </a>
            {/* <a href="#locations" className="rounded-full border border-white/30 bg-black/10 backdrop-blur-sm px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-white/10 hover:border-white/50">
              Our Locations
            </a> */}
          </div>
        </div>

        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6 items-center">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="relative focus:outline-none flex items-center justify-center h-8 w-8 group"
            >
              {currentSlide === index ? (
                <>
                  <span className="absolute h-[22px] w-[22px] rounded-full border border-[#c5a880] opacity-80"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c5a880]"></span>
                </>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-all duration-300"></span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 2. SECTION: Welcome to Bio-Heritage AI */}
      <section className="bg-white py-20 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 flex justify-center">
              <div className="relative h-80 w-80 rounded-full overflow-hidden border-8 border-[#faf9f6] shadow-md">
                <img src="/welcome_art.png" alt="Ayurveda Watercolor Art" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="md:col-span-6 text-left space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a880] font-mono">Anuradhapura Legacy</span>
                <div className="h-[1px] w-8 bg-[#c5a880]"></div>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 leading-tight">
                Welcome to <br />
                <span className="italic font-light text-emerald-700">Bio-Heritage AI</span>
              </h2>
              <p className="text-zinc-650 leading-relaxed font-light text-sm">
                Bio-Heritage AI is a premier center of traditional healing, providing authentic Ayurvedic medical treatments for chronic ailments, rejuvenations, and wellness. Rooted in Sri Lanka&apos;s ancient indigenous medical heritage, we combine natural treatments with research-grade AI tools to classify, transcribe, and validate traditional healing pathways.
              </p>
              <div className="pt-2">
                <a href="#research-modules" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
                  Read More About Research <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: CORE FRAMEWORK COMPONENTS */}
      <section id="research-modules" className="container mx-auto px-6 py-24 max-w-6xl text-center scroll-mt-6">
        <div className="mb-12 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Research &amp; Technology</span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 mt-2">Core Framework Components</h2>
          <p className="mt-3 text-sm text-zinc-500 font-light">
            Developed by our 4-member research team, each specializing in a critical AI domain to protect and digitize indigenous knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <RagSection />
          <IntentSection />
          <ExplainSection />
          <GatewaySection />
        </div>
      </section>

      {/* 4. SECTION: Sunset Dagoba Panorama Banner with overlapping Treatment Cards */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("/stupas_sunset.png")' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 z-1"></div>

        <div className="container relative z-10 px-6 max-w-5xl py-20 text-center">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a880]">Indigenous Heritage</span>
            <h2 className="font-serif text-3xl font-bold mt-1">Holistic Therapy &amp; Consultations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white text-zinc-800 shadow-xl border border-zinc-100 space-y-3">
              <h4 className="font-serif text-lg font-bold text-emerald-800">Panchakarma Detoxification</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Cleanse the body of toxins through customized treatments like Shirodhara, Vamana, and Virechana to restore biological equilibrium.
              </p>
              <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a880] hover:text-[#b0936b]">
                Explore Details <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-white text-zinc-800 shadow-xl border border-zinc-100 space-y-3">
              <h4 className="font-serif text-lg font-bold text-emerald-800">Ayurveda Consultations</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Speak directly with specialized Ayurvedic doctors to identify doshic imbalances and design custom herbal remedies.
              </p>
              <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a880] hover:text-[#b0936b]">
                Book Session <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: Pulse Diagnosis / Nadi Pariksha */}
      <section className="bg-white py-20 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6">
              <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
                <img src="/plant_authentication.png" alt="Botanical Plant Authentication" className="w-full object-cover" />
              </div>
            </div>

            <div className="md:col-span-6 text-left space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Botanical Species Identification</span>
              <h3 className="font-serif text-3xl font-bold text-zinc-950">Botanical Species Identification</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Our EfficientNetV2B0 deep learning framework accurately authenticates Sri Lankan medicinal herb species from photographic inputs, detecting adulteration risks and ensuring raw material purity for Ayurvedic medicine preparation.
              </p>
              <ul className="space-y-2.5 text-xs font-light text-zinc-650">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Identifies authentic medicinal plant species with high confidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Flags common herbal adulterants to preserve Ayurvedic remedy safety</span>
                </li>
              </ul>
              <div className="pt-2">
                <a href="/member1" className="rounded-full bg-[#c5a880] px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#b0936b] transition-all shadow-sm">
                  Authenticate Plant Species →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: Member 2 Herb Assistant RAG & NLU */}
      <section className="bg-[#faf9f6] py-20 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 text-left space-y-6 order-2 md:order-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Herb Knowledge Assistant</span>
              <h3 className="font-serif text-3xl font-bold text-zinc-950">Health-Context-Aware RAG &amp; NLU Herb Assistant</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                For generations, Sri Lankan kings maintained dedicated herbal gardens and royal hospitals (Arogyasala) to care for the community. Bio-Heritage AI preserves this royal lineage of Hela Vedakama, combining century-old palm leaf manuscript formulas with modern neural networks to verify botanical authenticity.
              </p>
              <div className="pt-2">
                <a href="/all-in-one" className="rounded-full bg-[#c5a880] px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#b0936b] transition-all shadow-sm">
                  Launch Herb Assistant →
                </a>
              </div>
            </div>

            <div className="md:col-span-6 order-1 md:order-2">
              <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
                <img src="/member2_herb_rag_assistant.png" alt="Health-Context-Aware RAG & NLU Herb Assistant" className="w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: Member 3 Leaf Health Detection */}
      <section className="bg-white py-20 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6">
              <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
                <img src="/leaf_health_detection.png" alt="Medicinal Leaf Health Detection" className="w-full object-cover" />
              </div>
            </div>

            <div className="md:col-span-6 text-left space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Leaf Health Screening</span>
              <h3 className="font-serif text-3xl font-bold text-zinc-950">Medicinal Leaf Health Detection &amp; Quality Verification</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Our EfficientNetB4 deep learning model classifies whether medicinal leaves are healthy or affected by infections (Anthracnose, Bacterial Leaf Spot, Rot, Rust), computing an Ayurvedic Medicinal Suitability (AMS) grade to verify raw material safety.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a href="/member3" className="rounded-full bg-[#c5a880] px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#b0936b] transition-all shadow-sm">
                  Analyze Leaf Health →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: Accreditations (Badges) */}
      <section className="bg-[#faf9f6] py-12 border-b border-zinc-200/50">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 tracking-widest">Our Accreditations &amp; Certifications</div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center opacity-60">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <Award className="h-6 w-6 text-emerald-600" /> ISO 9001:2015
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <Award className="h-6 w-6 text-emerald-600" /> WHO GMP Certified
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <Award className="h-6 w-6 text-emerald-600" /> Organic Certified
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <Award className="h-6 w-6 text-emerald-600" /> Sri Lanka Health Min. Approved
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION: Our Locations */}
      <section id="locations" className="py-20 border-b border-zinc-200/50">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="mb-12 text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Explore Centers</span>
            <h2 className="font-serif text-3xl font-bold text-zinc-950 mt-1">Our Locations</h2>
            <div className="h-0.5 w-12 bg-[#c5a880] mx-auto mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-[#c5a880] hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#f5f2eb] text-[#c5a880] flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-zinc-800">Ayurveda Hospital - Anuradhapura</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Our main clinical facility offering intensive treatments, pulse diagnosis, and chronic ailment management in the historic capital.
              </p>
              <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c5a880] hover:text-[#b0936b]">
                LEARN MORE <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-[#c5a880] hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#f5f2eb] text-[#c5a880] flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-zinc-800">Wellness Resort - Mihintale</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                A peaceful retreat nestled in the sacred hills of Mihintale, focusing on Panchakarma, meditation, and detox plans.
              </p>
              <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c5a880] hover:text-[#b0936b]">
                LEARN MORE <ChevronRight className="h-3 w-3" />
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-[#c5a880] hover:shadow-md transition-all duration-300 space-y-4">
              <div className="h-10 w-10 rounded-full bg-[#f5f2eb] text-[#c5a880] flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-zinc-800">Ayurveda Retreat - Anuradhapura</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Premium accommodation suites combined with personalized organic herbal diet plans and yoga for daily rejuvenation.
              </p>
              <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c5a880] hover:text-[#b0936b]">
                LEARN MORE <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. RESEARCH OBJECTIVE BANNER */}
      <section className="py-16 bg-[#f5f2eb]/60 border-t border-b border-zinc-200/40">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-white border border-zinc-200/60 shadow-sm space-y-4 max-w-3xl mx-auto hover:border-amber-500 hover:shadow transition-all duration-300">
            <h2 className="font-serif text-2xl font-bold text-zinc-850">Our Academic Mission</h2>
            <p className="text-sm text-zinc-650 leading-relaxed font-light">
              &ldquo;Our goal is to create a bridge between ancient wisdom and modern technology, ensuring that the heritage of Sri Lankan Indigenous Medicine (Ayurveda/Deshiya Chikitsa) is accurately documented, validated, and preserved through cutting-edge Artificial Intelligence.&rdquo;
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
