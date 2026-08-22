import { MapPin, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PageHeader eyebrow="Get in Touch" title="Contact" accent="Us" />
      <div className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="space-y-4 text-sm text-zinc-600">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#c5a880] mt-0.5 shrink-0" />
              <p>SLIIT Faculty of Computing,<br />New Kandy Road, Malabe, Sri Lanka.</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#c5a880] shrink-0" />
              <p>info@bioheritage.ai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
