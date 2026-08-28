"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";

import Sidebar from "./Sidebar";
import Greeting from "./Greeting";
import Composer from "./Composer";
import MessageList from "./MessageList";
import ComingSoonPanel from "./ComingSoonPanel";
import HealthContextForm from "./HealthContextForm";
import HealthContextChip from "./HealthContextChip";
import { askMember2, getMember2Health } from "./api";
import {
  MODELS, DEFAULT_MODEL_ID, DEFAULT_HEALTH_FORM, getModel, API_URL,
} from "./models";

const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

export default function AllInOneChat() {
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Member 2 session memory: collected once, reused for the rest of the session.
  const [healthContext, setHealthContext] = useState(null);
  const [lastHerb, setLastHerb] = useState(null);
  const [pendingQuery, setPendingQuery] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [form, setForm] = useState(DEFAULT_HEALTH_FORM);

  const [health, setHealth] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const model = getModel(modelId);

  // This page paints over the whole viewport, so the document behind it must not
  // scroll. Save and restore the previous value, otherwise every other page
  // loses scrolling after a visit here.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Cheap check that does not force the pipeline to load.
  useEffect(() => {
    let cancelled = false;
    getMember2Health()
      .then((d) => {
        if (!cancelled) setHealth((h) => ({ ...h, member2: { ok: !d.error } }));
      })
      .catch(() => {
        if (!cancelled) {
          setHealth((h) => ({ ...h, member2: { ok: false, message: "Backend unreachable" } }));
        }
      });
    return () => { cancelled = true; };
  }, []);

  const push = useCallback((entry) => {
    setMessages((m) => [...m, { id: newId(), ...entry }]);
  }, []);

  /** Send a query to Member 2. `ctx` is passed explicitly so the questionnaire
   *  can submit the freshly chosen context without waiting for a state flush. */
  const runMember2 = useCallback(async (query, ctx) => {
    setLoading(true);
    try {
      const data = await askMember2({ query, healthContext: ctx, lastHerb });

      // Every router returns HTTP 200 on failure, so branch on data.error.
      if (data.error) {
        push({ role: "error", member: "member2", message: data.message });
        setHealth((h) => ({ ...h, member2: { ok: false, message: data.message } }));
        return;
      }

      setHealth((h) => ({ ...h, member2: { ok: true } }));

      // The assistant wants health details before it will answer.
      if (data.needsContext) {
        setPendingQuery(query);
        setFollowups(data.followupQuestions || []);
        return;
      }

      push({ role: "result", member: "member2", data });
      if (data.sources?.length) setLastHerb(data.sources[0].herb);
    } catch {
      push({
        role: "error",
        member: "member2",
        message: `Could not reach the backend at ${API_URL}. Is it running?`,
      });
      setHealth((h) => ({ ...h, member2: { ok: false, message: "Backend unreachable" } }));
    } finally {
      setLoading(false);
    }
  }, [lastHerb, push]);

  function handleSubmit() {
    const q = input.trim();
    if (!q || loading || !model.enabled) return;
    push({ role: "user", member: model.id, text: q });
    setInput("");
    runMember2(q, healthContext);
  }

  function submitContext(e) {
    e.preventDefault();
    const q = pendingQuery;
    setHealthContext(form);
    setPendingQuery(null);
    setFollowups([]);
    runMember2(q, form);
  }

  /** Re-send the most recent user message after a failure. */
  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser && !loading) runMember2(lastUser.text, healthContext);
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setLastHerb(null);
    setPendingQuery(null);
    setFollowups([]);
    setSidebarOpen(false);
  }

  function selectModel(id) {
    setModelId(id);
    setSidebarOpen(false);
  }

  const isEmpty = messages.length === 0 && !pendingQuery;
  const showComposer = model.enabled;

  return (
    <div className="fixed inset-0 z-[60] flex overflow-hidden bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      <Sidebar
        models={MODELS}
        selectedId={modelId}
        onSelect={selectModel}
        health={health}
        onNewChat={newChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-only bar to open the sidebar */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="truncate text-sm text-zinc-300">{model.name}</span>
        </div>

        {!model.enabled ? (
          <div className="flex flex-1 items-center justify-center">
            <ComingSoonPanel model={model} />
          </div>
        ) : (
          <>
            {/* Empty state centres the composer; a live thread pushes it to the bottom. */}
            <div className={`flex flex-1 flex-col overflow-y-auto ${isEmpty ? "justify-center" : ""}`}>
              <div className="mx-auto w-full max-w-3xl px-4 py-6">
                {isEmpty
                  ? <Greeting model={model} />
                  : <MessageList messages={messages} loading={loading} onRetry={retryLast} />}
              </div>
            </div>

            <div className="mx-auto w-full max-w-3xl shrink-0 space-y-3 px-4 pb-6">
              {pendingQuery && (
                <HealthContextForm
                  followups={followups}
                  form={form}
                  onChange={setForm}
                  onSubmit={submitContext}
                  loading={loading}
                />
              )}
              {healthContext && !pendingQuery && (
                <HealthContextChip
                  healthContext={healthContext}
                  onReset={() => setHealthContext(null)}
                />
              )}
              {showComposer && (
                <Composer
                  model={model}
                  models={MODELS}
                  value={input}
                  onChange={setInput}
                  onSubmit={handleSubmit}
                  onSelectModel={selectModel}
                  loading={loading}
                />
              )}
              <p className="text-center text-[11px] leading-relaxed text-zinc-600">
                Information is retrieved from recorded traditional sources and is not medical
                advice. Consult a qualified practitioner before personal use.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
