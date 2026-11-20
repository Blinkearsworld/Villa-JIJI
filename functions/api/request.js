// POST /api/request — a guest asks for a booking (site form or site chatbot). No payment.
import { loadState, createRequest, json } from '../_lib/core.js';
export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'database not connected' }, 503);
  let body; try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
  const source = body.source === 'chat' ? 'chat' : 'site';
  try {
    const st = await loadState(env.DB);
    const r = await createRequest(env.DB, st, { ...body, source });
    return json({ ok: true, id: r.booking.id, total: r.total, typeName: r.typeName });
  } catch (e) { return json({ ok: false, error: e.message }, 400); }
}
