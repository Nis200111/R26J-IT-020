"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import UserBubble from "./UserBubble";
import ErrorNotice from "./ErrorNotice";
import HerbAnswerResult from "./results/HerbAnswerResult";
import LeafDiseaseResult from "./results/LeafDiseaseResult";
import PlantAuthResult from "./results/PlantAuthResult";
import { getModel } from "./models";

/** Result body for a thread entry, chosen by which model produced it. */
function ResultBody({ member, data }) {
  switch (member) {
    case "member1":
      return <PlantAuthResult data={data} />;
    case "member2":
      return <HerbAnswerResult data={data} />;
    case "member3":
      return <LeafDiseaseResult data={data} />;
    default:
      // Only member2 is wired up so far; the others land here when added.
      return <pre className="overflow-x-auto text-xs text-zinc-400">{JSON.stringify(data, null, 2)}</pre>;
  }
}

export default function MessageList({ messages, loading, onRetry }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        if (m.role === "user") {
          return <UserBubble key={m.id} text={m.text} imageUrl={m.imageUrl} />;
        }
        if (m.role === "error") {
          return <ErrorNotice key={m.id} message={m.message} onRetry={onRetry} />;
        }

        const model = getModel(m.member);
        const Icon = model.icon;
        return (
          <div key={m.id} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <Icon className="h-3.5 w-3.5" />
              {model.name}
            </div>
            <ResultBody member={m.member} data={m.data} />
          </div>
        );
      })}

      {loading && (
        <div className="flex items-center gap-2 px-1 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Retrieving herb records…
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
