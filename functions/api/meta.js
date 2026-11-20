// /api/meta — Facebook Messenger and Instagram Direct webhook.
// Same scripted flow as the site chatbot (no AI), answering from the same database.
// Env (set as secrets in Cloudflare): META_VERIFY_TOKEN, META_APP_SECRET, META_PAGE_TOKEN; optional META_GRAPH_VERSION.
import { loadState, findOffer, nextOffer, createRequest, addDays, today, fmt, fmtRange, json } from '../_lib/core.js';

const PHONE = '+995 596 90 40 60';
const MAP = 'https://maps.google.com/?q=41.7318533,43.5301119';
const HANDOFF_MS = 12 * 3600e3;
const FAQ = [
  ['საუზმე შედის?', 'დიახ, საუზმე ფასში შედის.'],
  ['ცხოველით შეიძლება?', 'დიახ, შინაური ცხოველებით მოსვლა შეიძლება. წინასწარ გაგვაფრთხილეთ.'],
  ['პარკინგი', 'დიახ, პარკინგი უფასოა.'],
  ['აუზი', 'ღია აუზი სეზონურია, თბილ თვეებში მუშაობს.'],
  ['შესვლა-გასვლა', 'ზუსტ საათებს ჯავშნის დადასტურებისას გეტყვით. მიღება ყოველდღე 10:00–20:00.'],
  ['სკი-პასი', 'სკი-პასს ვილა ჯიჯიში იყიდით. კოხტას საბაგირო 300 მეტრშია.'],
];

// ---------- webhook entry ----------
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  if (u.searchParams.get('hub.mode') === 'subscribe' && u.searchParams.get('hub.verify_token') === env.META_VERIFY_TOKEN)
    return new Response(u.searchParams.get('hub.challenge') || '', { status: 200 });
  return new Response('forbidden', { status: 403 });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const raw = await request.text();
  if (!(await validSignature(raw, request.headers.get('x-hub-signature-256'), env.META_APP_SECRET))) return new Response('bad signature', { status: 401 });
  let body; try { body = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const channel = body.object === 'instagram' ? 'ig' : 'fb';
  const events = (body.entry || []).flatMap(e => e.messaging || []);
  // Answer Meta right away; handle the messages in the background.
  waitUntil(Promise.all(events.map(ev => handle(env, channel, ev).catch(e => console.log('meta error', e.message)))));
  return json({ ok: true });
}

async function validSignature(raw, header, secret) {
  if (!secret || !header?.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw)));
  const hex = [...mac].map(b => b.toString(16).padStart(2, '0')).join('');
  const got = header.slice(7);
  if (got.length !== hex.length) return false;
  let diff = 0; for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

// ---------- sending ----------
async function send(env, psid, text, replies) {
  const message = { text };
  if (replies?.length) message.quick_replies = replies.slice(0, 13).map(([title, payload]) => ({ content_type: 'text', title: title.slice(0, 20), payload }));
  if (env.META_DRY_RUN) { console.log('BOT>', psid, JSON.stringify(message)); return; }
  const v = env.META_GRAPH_VERSION || 'v21.0';
  let res;
  try { res = await fetch(`https://graph.facebook.com/${v}/me/messages?access_token=${encodeURIComponent(env.META_PAGE_TOKEN)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ recipient: { id: psid }, messaging_type: 'RESPONSE', message }),
  }); } catch (e) { console.log('send failed', e.message); return; }
  if (!res.ok) console.log('send failed', res.status, await res.text());
}
const MENU = [['ნომრები და ფასი', 'AVAIL'], ['სად ვართ', 'LOC'], ['ხშირი კითხვები', 'FAQ'], ['დაკავშირება', 'CONTACT']];
const BACK = ['მენიუ', 'MENU'];

// ---------- conversation state ----------
async function getConvo(db, id) {
  const row = await db.prepare('SELECT state FROM convos WHERE id=?').bind(id).first();
  return row ? JSON.parse(row.state) : { step: 'new' };
}
const saveConvo = (db, id, c) => db.prepare('INSERT INTO convos (id,state,updated) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state, updated=excluded.updated')
  .bind(id, JSON.stringify(c), new Date().toISOString()).run();

// "15.01", "15/1", "15-01-2027" -> next such date from today
function parseDate(text) {
  const m = String(text).trim().match(/^(\d{1,2})[./\- ](\d{1,2})(?:[./\- ](\d{2,4}))?$/);
  if (!m) return null;
  const d = +m[1], mo = +m[2]; if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
  const t = today(); let y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : +t.slice(0, 4);
  let s = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (!m[3] && s < t) s = `${y + 1}${s.slice(4)}`;
  const check = new Date(s + 'T00:00:00Z');
  return isNaN(check) || check.getUTCDate() !== d ? null : s;
}
function nextSaturday(weeks = 0) {
  const t = today(), wd = new Date(t + 'T00:00:00Z').getUTCDay();
  return addDays(t, ((6 - wd + 7) % 7 || 7) + weeks * 7);
}

// ---------- the flow ----------
async function handle(env, channel, ev) {
  const psid = ev.sender?.id;
  if (!psid || ev.message?.is_echo || ev.read || ev.delivery) return;
  const db = env.DB, id = channel + ':' + psid;
  const c = await getConvo(db, id);
  const payload = ev.message?.quick_reply?.payload || ev.postback?.payload || null;
  const text = (ev.message?.text || '').trim();
  const say = (t, r) => send(env, psid, t, r);

  // A person from the hotel is answering: stay quiet unless the guest asks for the menu.
  if (c.handoff && Date.now() < c.handoff && payload !== 'MENU' && !/^მენიუ$/i.test(text)) return;
  if (c.handoff) delete c.handoff;

  const menu = async (greet) => {
    c.step = 'menu';
    await say((greet ? 'გამარჯობა! ვილა ჯიჯიში მოგესალმებით.\n' : '') + 'რით დაგეხმაროთ?', MENU);
  };
  const askDate = async () => {
    c.step = 'date';
    await say('შესვლის თარიღი? დაწერეთ ასე: 15.01, ან აირჩიეთ:', [
      ['ეს შაბათი ' + fmt(nextSaturday()), 'D_' + nextSaturday()], ['შემდეგი შაბ. ' + fmt(nextSaturday(1)), 'D_' + nextSaturday(1)], BACK]);
  };
  const askNights = async () => { c.step = 'nights'; await say('რამდენი ღამე?', [1, 2, 3, 4, 5, 7].map(n => [String(n), 'N_' + n]).concat([BACK])); };
  const askGuests = async () => { c.step = 'guests'; await say('რამდენი სტუმარი?', [1, 2, 3, 4, 5, 6].map(n => [String(n), 'G_' + n]).concat([['7 ან მეტი', 'G_7'], BACK])); };
  const offerText = (from, to, o) => `${fmtRange(from, to)} · ${c.n} ღამე · ${c.g} სტუმარი\nთავისუფალია: ${o.name}\n${o.total} ₾, საუზმით`;
  const contact = async (lead) => {
    c.step = 'menu'; c.handoff = Date.now() + HANDOFF_MS;
    await say((lead || 'ვილა ჯიჯის ადმინისტრაცია აქვე გიპასუხებთ.') + `\nან დაგვირეკეთ: ${PHONE} (ყოველდღე 10:00–20:00)`, [BACK]);
  };
  const check = async () => {
    const st = await loadState(db);
    c.to = addDays(c.from, c.n);
    const o = findOffer(st, c.from, c.to, c.g);
    if (o) { c.step = 'offer'; c.type = o.type; c.total = o.total; c.typeName = o.name; return say(offerText(c.from, c.to, o), [['დაჯავშნა', 'BOOK'], ['სხვა თარიღი', 'AVAIL'], BACK]); }
    const nx = nextOffer(st, c.from, c.n, c.g);
    if (nx) {
      c.step = 'offer'; c.alt = nx;
      return say(`ამ თარიღებზე ადგილი აღარ გვაქვს.\nუახლოესი თავისუფალი:\n${offerText(nx.from, nx.to, nx)}`, [['ეს მინდა', 'ALT'], ['სხვა თარიღი', 'AVAIL'], ['დაკავშირება', 'CONTACT']]);
    }
    c.step = 'menu';
    return say('ამ პერიოდში ადგილი აღარ გვაქვს. დაგვიკავშირდით და იქნებ მაინც მოგიძებნოთ გამოსავალი.', [['დაკავშირება', 'CONTACT'], ['სხვა თარიღი', 'AVAIL'], BACK]);
  };

  try {
    if (payload === 'MENU' || c.step === 'new' || /^(მენიუ|გამარჯობა|სალამი|hi|hello|menu|start)$/i.test(text)) await menu(c.step === 'new');
    else if (payload === 'AVAIL') await askDate();
    else if (payload === 'LOC') { c.step = 'menu'; await say(`თრიალეთის ქუჩა, ბაკურიანი\nკოხტას საბაგირო 300 მეტრშია, დიდველის საბაგირო 2,9 კმ-ში.\n${MAP}`, [['ნომრები და ფასი', 'AVAIL'], BACK]); }
    else if (payload === 'FAQ') { c.step = 'menu'; await say('აირჩიეთ კითხვა:', FAQ.map(([q], i) => [q, 'FAQ_' + i]).concat([BACK])); }
    else if (payload?.startsWith('FAQ_')) await say(FAQ[+payload.slice(4)]?.[1] || '—', [['სხვა კითხვა', 'FAQ'], ['ნომრები და ფასი', 'AVAIL'], BACK]);
    else if (payload === 'CONTACT') await contact();
    else if (payload?.startsWith('D_') || c.step === 'date') {
      const d = payload?.startsWith('D_') ? payload.slice(2) : parseDate(text);
      if (!d || d < today()) await say('თარიღი ვერ გავიგე. დაწერეთ ასე: 15.01', [BACK]);
      else { c.from = d; await askNights(); }
    }
    else if (payload?.startsWith('N_')) { c.n = +payload.slice(2); await askGuests(); }
    else if (payload?.startsWith('G_')) {
      c.g = +payload.slice(2);
      if (c.g > 6) await contact('7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ, ამას ვილა ჯიჯი პირადად შეგითანხმებთ.');
      else await check();
    }
    else if (payload === 'ALT' && c.alt) { Object.assign(c, { from: c.alt.from, to: c.alt.to, type: c.alt.type, total: c.alt.total, typeName: c.alt.name }); delete c.alt; c.step = 'name'; await say('თქვენი სახელი?'); }
    else if (payload === 'BOOK') { c.step = 'name'; await say('თქვენი სახელი?'); }
    else if (c.step === 'name' && text) { c.name = text.slice(0, 80); c.step = 'phone'; await say('ტელეფონის ნომერი, რომ დაგიკავშირდეთ?'); }
    else if (c.step === 'phone' && text) {
      if (text.replace(/\D/g, '').length < 9) await say('ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.');
      else {
        const st = await loadState(db);
        const r = await createRequest(db, st, { from: c.from, to: c.to, guests: c.g, name: c.name, phone: text, source: channel === 'ig' ? 'instagram' : 'facebook' });
        c.step = 'menu';
        await say(`მოთხოვნა მიღებულია.\n${fmtRange(c.from, c.to)} · ${r.typeName} · ${r.total} ₾\n\nვილა ჯიჯი დაგიკავშირდებათ ნომერზე ${text} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.`, [BACK]);
      }
    }
    else {
      c.misses = (c.misses || 0) + 1;
      if (c.misses >= 2) { c.misses = 0; await contact('ვერ გავიგე. ვილა ჯიჯის ადმინისტრაცია აქვე გიპასუხებთ.'); }
      else await say('ვერ გავიგე. აირჩიეთ ერთ-ერთი:', MENU);
    }
  } finally {
    await saveConvo(db, id, c);
  }
}
