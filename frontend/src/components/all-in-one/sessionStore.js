"use client";

/**
 * Tab-scoped persistence for the chat shell.
 *
 * A refresh used to wipe everything: the thread, the half-typed question in the
 * composer, the health profile the user had already filled in, and the pending
 * questionnaire. sessionStorage (not localStorage) is the right home for that —
 * it survives a reload and restores per tab, but is discarded when the tab is
 * closed, so a shared machine does not leak one person's stated conditions into
 * the next person's session.
 *
 * Everything here is defensive: storage throws in private-browsing modes and
 * when the quota is hit, and a stale entry written by an older build can be any
 * shape at all. A failure to persist must never break the chat, so every path
 * degrades to "no saved session".
 */

const KEY = "bioheritage.allinone.v1";

// A long thread of results is the only thing here big enough to approach the
// ~5 MB quota. Keeping the tail is what the user is looking at anyway.
const MAX_MESSAGES = 50;

/**
 * Object URLs from URL.createObjectURL die with the page, so a saved <img src>
 * would come back as a broken image. Drop the preview and leave the bubble
 * saying what happened, rather than silently losing the turn.
 */
function stripImages(messages) {
  return messages.map((m) => {
    if (!m.imageUrl) return m;
    const { imageUrl, ...rest } = m;
    return { ...rest, text: m.text || "(image — preview not kept after refresh)" };
  });
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Anything that is not a plain object is a stale or corrupt entry.
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
    return saved;
  } catch {
    return null;
  }
}

export function saveSession(state) {
  try {
    const messages = Array.isArray(state.messages) ? state.messages : [];
    sessionStorage.setItem(KEY, JSON.stringify({
      modelId: state.modelId,
      messages: stripImages(messages.slice(-MAX_MESSAGES)),
      input: state.input,
      healthContext: state.healthContext,
      form: state.form,
      lastHerb: state.lastHerb,
      pendingQuery: state.pendingQuery,
      followups: state.followups,
      // `loading` is deliberately not saved: a refresh during a request must not
      // restore a spinner for a call that is never coming back.
    }));
  } catch {
    // Full quota or blocked storage. The chat keeps working in memory.
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do — the caller is resetting state either way.
  }
}
