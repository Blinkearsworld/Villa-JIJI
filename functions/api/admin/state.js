// GET /api/admin/state — everything, including guest names and phones.
import { loadState, json } from '../../_lib/core.js';
export async function onRequestGet({ env, data }) {
  return json({ ...(await loadState(env.DB, { full: true })), user: data.user });
}
