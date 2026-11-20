// GET /api/state — public data for the site and chatbot (no guest names or phones).
import { loadState, json } from '../_lib/core.js';
export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'database not connected' }, 503);
  return json(await loadState(env.DB));
}
