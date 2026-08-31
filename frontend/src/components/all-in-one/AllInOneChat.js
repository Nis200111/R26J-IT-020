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
import { askMember2, getMember2Health, predictImage } from "./api";
import { loadSession, saveSession, clearSession } from "./sessionStore";
import {
  MODELS, DEFAULT_MODEL_ID, DEFAULT_HEALTH_FORM, getModel, toHealthContext, API_URL,
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
  // Which form fields were filled in from the query rather than by the user.
  const [knownFields, setKnownFields] = useState([]);

  const [health, setHealth] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // False until the saved tab session has been read back. Saving before that
  // would overwrite the stored session with the empty initial state.
  const [restored, setRestored] = useState(false);

  // Image attached but not yet sent: { file, previewUrl, name }
  const [pending, setPending] = useState(null);
  const [dragging, setDragging] = useState(false);

  const model = getModel(modelId);

  // This page paints over the whole viewport, so the document behind it must not
  // scroll. Save and restore the previous value, otherwise every other page
  // loses scrolling after a visit here.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  // Restore the tab's previous state after mount, never during render: the
  // server has no sessionStorage, so reading it in a state initialiser would
  // make the first client render disagree with the HTML and trip hydration.
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      if (saved.modelId) setModelId(saved.modelId);
      if (Array.isArray(saved.messages)) setMessages(saved.messages);
      if (typeof saved.input === "string") setInput(saved.input);
      if (saved.healthContext) setHealthContext(saved.healthContext);
      // Merged over the defaults so a session saved by an older build, before
      // the "other" free-text fields existed, still yields a complete form.
      if (saved.form) setForm({ ...DEFAULT_HEALTH_FORM, ...saved.form });
      if (saved.lastHerb) setLastHerb(saved.lastHerb);
      if (saved.pendingQuery) setPendingQuery(saved.pendingQuery);
      if (Array.isArray(saved.followups)) setFollowups(saved.followups);
      if (Array.isArray(saved.knownFields)) setKnownFields(saved.knownFields);
    }
    setRestored(true);
  }, []);

  // Mirror the conversation into sessionStorage on every change, including each
  // keystroke in the composer and each edit in the questionnaire — those are
  // exactly what a mistimed refresh used to throw away.
  useEffect(() => {
    if (!restored) return;
    saveSession({
      modelId, messages, input, healthContext, form, lastHerb,
      pendingQuery, followups, knownFields,
    });
  }, [restored, modelId, messages, input, healthContext, form, lastHerb,
      pendingQuery, followups, knownFields]);

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
        // The backend skipped the questions the query already answered. Fill
        // those answers in, or they are lost and the classifier scores the
        // defaults instead of what the user actually said.
        const known = data.knownContext || {};
        setKnownFields(Object.keys(known));
        setForm((f) => ({ ...f, ...known }));
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

  /** Send an attached image to an image-classifying module (member1/member3). */
  const runImageModel = useCallback(async (file) => {
    setLoading(true);
    try {
      const data = await predictImage(model.endpoint, file);
      if (data.error) {
        push({ role: "error", member: model.id, message: data.message });
        setHealth((h) => ({ ...h, [model.id]: { ok: false, message: data.message } }));
        return;
      }
      setHealth((h) => ({ ...h, [model.id]: { ok: true } }));
      push({ role: "result", member: model.id, data });
    } catch {
      push({
        role: "error",
        member: model.id,
        message: `Could not reach the backend at ${API_URL}. Is it running?`,
      });
    } finally {
      setLoading(false);
    }
  }, [model.endpoint, model.id, push]);

  /** Accept a dropped or picked image. Only image models take one. */
  const acceptFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPending((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file), name: file.name };
    });
  }, []);

  function clearPending() {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  }

  function handleSubmit() {
    if (loading || !model.enabled) return;

    if (model.input === "image") {
      if (!pending) return;
      push({ role: "user", member: model.id, imageUrl: pending.previewUrl });
      const file = pending.file;
      setPending(null);   // keep the object URL alive: the thread renders it
      runImageModel(file);
      return;
    }

    const q = input.trim();
    if (!q) return;
    push({ role: "user", member: model.id, text: q });
    setInput("");
    runMember2(q, healthContext);
  }

  function submitContext(e) {
    e.preventDefault();
    const q = pendingQuery;
    // The form carries the raw questionnaire state, including the free-text box
    // shown for "other". toHealthContext folds that down to the 4 API fields.
    const ctx = toHealthContext(form);
    setHealthContext(ctx);
    setPendingQuery(null);
    setFollowups([]);
    setKnownFields([]);
    runMember2(q, ctx);
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
    clearPending();
    // Drop the stored copy too, so "New chat" is not undone by a refresh. The
    // save effect writes the fresh empty state back on the next render.
    clearSession();
  }

  function selectModel(id) {
    // An attached image is meaningless to a text model, so drop it rather than
    // leaving a chip the user cannot send.
    if (getModel(id).input !== "image") clearPending();
    setModelId(id);
    setSidebarOpen(false);
  }

  const isEmpty = messages.length === 0 && !pendingQuery;
  const showComposer = model.enabled;

  return (
    <div
      className="fixed inset-0 z-[60] flex overflow-hidden bg-zinc-950 text-zinc-100 [color-scheme:dark]"
      onDragOver={(e) => {
        if (model.input !== "image" || !model.enabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        // Only clear when the pointer actually leaves the shell, not when it
        // crosses a child element boundary.
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragging(false);
      }}
      onDrop={(e) => {
        if (model.input !== "image" || !model.enabled) return;
        e.preventDefault();
        setDragging(false);
        acceptFile(e.dataTransfer.files?.[0]);
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center border-2 border-dashed border-[#c5a880] bg-zinc-950/80">
          <p className="rounded-2xl bg-zinc-900 px-6 py-4 text-sm font-bold text-[#c5a880]">
            Drop the image to analyse it
          </p>
        </div>
      )}
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
                  knownFields={knownFields}
                  form={form}
                  onChange={setForm}
                  onSubmit={submitContext}
                  loading={loading}
                />
              )}
              {/* The health profile only means anything to the herb assistant. */}
              {healthContext && !pendingQuery && model.id === "member2" && (
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
                  pending={pending}
                  onFile={acceptFile}
                  onClearPending={clearPending}
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
