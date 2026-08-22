import PageHeader from "@/components/layout/PageHeader";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader
        eyebrow="Our Story"
        title="About"
        accent="Bio-Heritage AI"
        image="/royal_court.png"
        description="A research project preserving Sri Lankan indigenous medical knowledge through multi-modal artificial intelligence."
      />
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-600 mb-4 leading-relaxed font-light text-sm">
            Bio-Heritage AI is a multi-modal AI framework for preserving Sri Lankan indigenous
            medical knowledge, combining plant authentication, disease detection, natural
            language understanding, and system infrastructure built by our 4-member research team.
          </p>
          <p className="text-zinc-400 text-xs">Add team member names and roles here.</p>
        </div>
      </div>
    </div>
  );
}
