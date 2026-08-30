import { API_URL } from "./models";

/**
 * Fetch helpers for the backend.
 *
 * IMPORTANT: every FastAPI router in this project returns HTTP 200 even when it
 * fails, with a body of `{ error: true, message: "..." }`. So these helpers
 * never inspect `res.ok` — callers must branch on `data.error`. A thrown error
 * here means the network request itself failed (backend down, CORS, DNS), which
 * is a genuinely different situation and gets a different message in the UI.
 */

/** POST /api/member2/ask — the RAG herb assistant. */
export async function askMember2({ query, healthContext, lastHerb }) {
  const res = await fetch(`${API_URL}/api/member2/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      healthContext: healthContext ?? null,
      lastHerb: lastHerb ?? null,
    }),
  });
  return res.json();
}

/**
 * GET /api/member2/health — reports whether the pipeline has loaded.
 * Does not force a load, so it is cheap to call on mount.
 */
export async function getMember2Health() {
  const res = await fetch(`${API_URL}/api/member2/health`);
  return res.json();
}

/**
 * POST an image to an image-classifying module (member1, member3).
 * The field name must be `file` — that is what the FastAPI routers expect.
 * Do NOT set Content-Type here; the browser adds the multipart boundary.
 */
export async function predictImage(endpoint, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: form });
  return res.json();
}
