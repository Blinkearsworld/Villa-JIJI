// /api/meta — Facebook Messenger and Instagram Direct webhook.
// Same scripted flow as the site chatbot (no AI), answering from the same database.
// Env (set as secrets in Cloudflare): META_VERIFY_TOKEN, META_APP_SECRET, META_PAGE_TOKEN; optional META_GRAPH_VERSION,
// META_APP_ID (lets the bot tell its own messages from replies typed by hotel staff in the inbox).
// Talking to a person: the "ადამიანთან საუბარი" button, typing e.g. "ადამიანი" / "operator" / "человек",
// or staff simply replying in Meta Business Suite — in all three cases the bot stays quiet for 12 hours.
import { tr, fmtL, fmtRangeL, detectLang, LANGS, LANG_NAMES } from '../_lib/bot-i18n.js';
import { ensureDb, loadState, findOffer, nextOffer, partialOffer, splitOffer, gaps, gapDiscount, quote, rateFor, createRequest, addDays, today, fmt, fmtRange, json } from '../_lib/core.js';

const PHONE = '+995 596 90 40 60';
const MAP = 'https://maps.google.com/?q=41.7318533,43.5301119';
const HANDOFF_MS = 12 * 3600e3;
const BOT_TAG = 'jiji-bot';
const HUMAN = 'ადამიანთან საუბარი';
const WANTS_HUMAN = /ადამიან|ოპერატორ|ადმინისტრ|მენეჯერ|ცოცხალ|human|operator|person|agent|manager|real person|человек|оператор|менеджер|администратор|живой/i;
// reception hours in Georgia (UTC+4)
const openNow = () => { const h = (new Date().getUTCHours() + 4) % 24; return h >= 10 && h < 20; };
const FAQ = [
  ['კვება', 'ვილა ჯიჯიში კვება არ არის, სამაგიეროდ ყველა ნომერს აქვს სამზარეულოს კუთხე. მაღაზიები ფეხით მისასვლელზეა, ბაკურიანში კი ბევრი კაფე და რესტორანია.'],
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
  const message = { text, metadata: BOT_TAG };
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
const MENU_KA = [['ნომრები და ფასი', 'AVAIL'], ['მოკლე შეთავაზებები', 'DEALS'], ['სად ვართ', 'LOC'], ['ხშირი კითხვები', 'FAQ'], [HUMAN, 'CONTACT'], ['🌐 English / Русский', 'LANG']];

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
  await ensureDb(env.DB);
  const psid = ev.sender?.id;
  // A message the page sent. If hotel staff typed it in the inbox (not this bot), pause the bot for that guest.
  if (ev.message?.is_echo) {
    const guest = ev.recipient?.id;
    if (guest && staffEcho(env, channel, ev.message)) {
      const cid = channel + ':' + guest, conv = await getConvo(env.DB, cid);
      conv.handoff = Date.now() + HANDOFF_MS; conv.step = 'menu';
      await saveConvo(env.DB, cid, conv);
    }
    return;
  }
  if (!psid || ev.read || ev.delivery) return;
  const db = env.DB, id = channel + ':' + psid;
  const c = await getConvo(db, id);
  const payload = ev.message?.quick_reply?.payload || ev.postback?.payload || null;
  const text = (ev.message?.text || '').trim();
  const say = (t, r) => send(env, psid, t, r);
  // language: chosen in the menu, or guessed from the first message the guest typed
  if (!c.lang && text) c.lang = detectLang(text) || undefined;
  const lang = () => c.lang || 'ka';
  const t = (k, v) => tr(lang(), k, v);
  const fmt = s => fmtL(lang(), s), fmtRange = (a, b) => fmtRangeL(lang(), a, b);
  const MENU = () => MENU_KA.map(([k, p]) => [t(k), p]);
  const BACK = () => [t('მენიუ'), 'MENU'];
  const RN = n => t(n || '');

  // A person from the hotel is answering: stay quiet unless the guest asks for the menu.
  if (c.handoff && Date.now() < c.handoff && payload !== 'MENU' && !/^(მენიუ|menu|меню)$/i.test(text)) return;
  if (c.handoff) delete c.handoff;

  const menu = async (greet) => {
    c.step = 'menu';
    await say((greet ? t('გამარჯობა! ვილა ჯიჯიში მოგესალმებით.\n') : '') + t('რით დაგეხმაროთ?'), MENU());
  };
  const askDate = async () => {
    c.step = 'date';
    await say(t('შესვლის თარიღი? დაწერეთ ასე: 15.01, ან აირჩიეთ:'), [
      [t('ეს შაბათი {d}', { d: fmt(nextSaturday()) }), 'D_' + nextSaturday()], [t('შემდეგი შაბ. {d}', { d: fmt(nextSaturday(1)) }), 'D_' + nextSaturday(1)], BACK()]);
  };
  const askNights = async () => { c.step = 'nights'; await say(t('რამდენი ღამე? აირჩიეთ ან ჩაწერეთ რიცხვი.'), [1, 2, 3, 4, 5, 6, 7, 10, 14].map(n => [String(n), 'N_' + n]).concat([BACK()])); };
  const askGuests = async () => { c.step = 'guests'; await say(t('რამდენი სტუმარი?'), [1, 2, 3, 4, 5, 6].map(n => [String(n), 'G_' + n]).concat([[t('7 ან მეტი'), 'G_7'], BACK()])); };
  const offerText = (from, to, o) => `${t('{d} · {n} ღამე · {g} სტუმარი', { d: fmtRange(from, to), n: c.n, g: c.g })}\n${t('თავისუფალია: {room}', { room: RN(o.name) })}\n${o.total} ₾`;
  const contact = async (lead) => {
    c.step = 'menu'; c.handoff = Date.now() + HANDOFF_MS;
    const when = t(openNow() ? 'ვილა ჯიჯის თანამშრომელი აქვე გიპასუხებთ, დაწერეთ თქვენი კითხვა.' : 'ახლა სამუშაო საათები არ არის, ვილა ჯიჯის თანამშრომელი დილით 10:00-დან გიპასუხებთ. დაწერეთ თქვენი კითხვა.');
    await say((lead ? t(lead) + '\n' : '') + when + '\n' + t('ან დაგვირეკეთ: {ph}\n\nბოტზე დასაბრუნებლად დაწერეთ: მენიუ', { ph: PHONE }), [BACK()]);
  };
  // short free windows (1–3 nights) between bookings, offered with the gap discount
  const maxG = (st, ty) => Math.max(0, ...(st.types[ty]?.rates || []).map(r => r.guests));
  const gapPrice = (st, g, n) => Math.round(quote(st, g.type, g.from, g.to, n) * (100 - gapDiscount(st)) / 100);
  const deals = async () => {
    const st = await loadState(db), d = gapDiscount(st), seen = new Set();
    const list = gaps(st).filter(g => { const k = g.type + g.from + g.to; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6);
    c.step = 'menu';
    if (!list.length) return say(t('ამჟამად მოკლე შეთავაზება არ გვაქვს.'), [[t('ნომრები და ფასი'), 'AVAIL'], BACK()]);
    c.gaps = list.map(g => ({ type: g.type, from: g.from, to: g.to, n: g.n }));
    const lines = list.map((g, i) => `${i + 1}) ${t('{d} · {n} ღამე', { d: fmtRange(g.from, g.to), n: g.n })}\n${t('{room}, {g} სტუმრამდე · {p} ₾-დან', { room: RN(st.types[g.type].name), g: maxG(st, g.type), p: gapPrice(st, g, 1) })}`);
    return say(`${t('ორ ჯავშანს შორის დარჩენილი 1–3 ღამე')}${d ? t(', {d}% ფასდაკლებით', { d }) : ''}:\n\n` + lines.join('\n\n'), list.map((g, i) => [`${i + 1}) ${fmt(g.from)}`, 'GAP_' + i]).concat([BACK()]));
  };
  const gapOffer = async (st, g, n) => {
    const total = gapPrice(st, g, n), name = RN(st.types[g.type].name), d = gapDiscount(st);
    c.g = n; c.step = 'offer';
    c.pick = { parts: [{ from: g.from, to: g.to, type: g.type }], typeName: name, total, gap: true };
    return say(`${t('{d} · {n} ღამე · {g} სტუმარი', { d: fmtRange(g.from, g.to), n: g.n, g: n })}\n${name}\n${total} ₾${d ? t(' (ჩვეულებრივ {p} ₾)', { p: quote(st, g.type, g.from, g.to, n) }) : ''}`, [[t('დაჯავშნა'), 'GBOOK'], [t('სხვა შეთავაზება'), 'DEALS'], BACK()]);
  };
  const check = async () => {
    const st = await loadState(db);
    c.to = addDays(c.from, c.n);
    const hit = gapDiscount(st) && gaps(st).find(x => x.from === c.from && x.to === c.to && rateFor(st, x.type, c.g));
    if (hit) return gapOffer(st, hit, c.g);
    const o = findOffer(st, c.from, c.to, c.g);
    if (o) { c.step = 'offer'; c.type = o.type; c.total = o.total; c.typeName = RN(o.name); return say(offerText(c.from, c.to, o), [[t('დაჯავშნა'), 'BOOK'], [t('სხვა თარიღი'), 'AVAIL'], BACK()]); }
    const part = partialOffer(st, c.from, c.to, c.g), split = splitOffer(st, c.from, c.to, c.g), nx = nextOffer(st, c.from, c.n, c.g);
    if (!part && !split && !nx) {
      c.step = 'menu';
      return say(t('ამ პერიოდში ადგილი აღარ გვაქვს. დაგვიკავშირდით და იქნებ მაინც მოგიძებნოთ გამოსავალი.'), [[t(HUMAN), 'CONTACT'], [t('სხვა თარიღი'), 'AVAIL'], BACK()]);
    }
    c.step = 'offer'; c.alts = {};
    const lines = [t('{d} ({n} ღამე) მთლიანად თავისუფალი არ გვაქვს, მაგრამ შეგვიძლია შემოგთავაზოთ:', { d: fmtRange(c.from, c.to), n: c.n })], btns = [];
    if (split) {
      const [x, y] = split.parts;
      lines.push(`\n1) ${t('მთელი {n} ღამე, ნომრის ერთი გამოცვლით:', { n: c.n })}\n${fmtRange(x.from, x.to)} · ${RN(x.name)}\n${fmtRange(y.from, y.to)} · ${RN(y.name)}\n${split.total} ₾`);
      c.alts.SPLIT = { parts: split.parts.map(p => ({ from: p.from, to: p.to, type: p.type })), typeName: RN(x.name) + ' → ' + RN(y.name), total: split.total };
      btns.push([t('მთელი {n} ღამე', { n: c.n }), 'PICK_SPLIT']);
    }
    if (part) {
      lines.push(`\n${lines.length}) ${t('{n} ღამიდან თავისუფალია {k}:', { n: c.n, k: part.n })}\n${fmtRange(part.from, part.to)} · ${RN(part.name)}\n${part.total} ₾`);
      c.alts.PART = { parts: [{ from: part.from, to: part.to, type: part.type }], typeName: RN(part.name), total: part.total };
      btns.push([t('{k} ღამე', { k: part.n }), 'PICK_PART']);
    }
    if (nx) {
      lines.push(`\n${lines.length}) ${t('სრული {n} ღამე სხვა თარიღებში:', { n: c.n })}\n${fmtRange(nx.from, nx.to)} · ${RN(nx.name)}\n${nx.total} ₾`);
      c.alts.NEXT = { parts: [{ from: nx.from, to: nx.to, type: nx.type }], typeName: RN(nx.name), total: nx.total };
      btns.push([fmtRange(nx.from, nx.to), 'PICK_NEXT']);
    }
    return say(lines.join('\n'), [...btns, [t('სხვა თარიღი'), 'AVAIL'], [t(HUMAN), 'CONTACT']]);
  };

  try {
    if (payload === 'MENU' || (c.step === 'new' && !payload && !WANTS_HUMAN.test(text)) || /^(მენიუ|გამარჯობა|სალამი|hi|hello|menu|start|меню|привет|здравствуйте|gamarjoba)[!.]?$/i.test(text)) await menu(c.step === 'new');
    else if (payload === 'LANG') { c.step = 'menu'; await say(t('აირჩიეთ ენა:'), LANGS.map(l => [LANG_NAMES[l], 'LANG_' + l])); }
    else if (payload?.startsWith('LANG_') && LANGS.includes(payload.slice(5))) { c.lang = payload.slice(5); await menu(false); }
    else if (payload === 'AVAIL') await askDate();
    else if (payload === 'LOC') { c.step = 'menu'; await say(`${t('თრიალეთის ქუჩა, ბაკურიანი\nკოხტას საბაგირო 300 მეტრშია, დიდველის საბაგირო 2,9 კმ-ში.')}\n${MAP}`, [[t('ნომრები და ფასი'), 'AVAIL'], BACK()]); }
    else if (payload === 'FAQ') { c.step = 'menu'; await say(t('აირჩიეთ კითხვა:'), FAQ.map(([q], i) => [t(q), 'FAQ_' + i]).concat([BACK()])); }
    else if (payload?.startsWith('FAQ_')) await say(t(FAQ[+payload.slice(4)]?.[1] || '—'), [[t('სხვა კითხვა'), 'FAQ'], [t('ნომრები და ფასი'), 'AVAIL'], BACK()]);
    else if (payload === 'CONTACT' || (!payload && WANTS_HUMAN.test(text) && !['name', 'phone'].includes(c.step))) await contact();
    else if (payload === 'DEALS') await deals();
    else if (payload?.startsWith('GAP_') && c.gaps?.[+payload.slice(4)]) {
      const st = await loadState(db), g = c.gaps[+payload.slice(4)], cap = Math.min(6, maxG(st, g.type));
      c.gap = g; c.step = 'gapguests';
      await say(t('რამდენი სტუმარი?'), Array.from({ length: cap }, (_, i) => [String(i + 1), 'GG_' + (i + 1)]).concat([BACK()]));
    }
    else if (payload?.startsWith('GG_') && c.gap) await gapOffer(await loadState(db), c.gap, +payload.slice(3));
    else if (payload === 'GBOOK' && c.pick) { c.step = 'name'; await say(t('თქვენი სახელი?')); }
    else if (payload?.startsWith('D_') || c.step === 'date') {
      const d = payload?.startsWith('D_') ? payload.slice(2) : parseDate(text);
      if (!d || d < today()) await say(t('თარიღი ვერ გავიგე. დაწერეთ ასე: 15.01'), [BACK()]);
      else { c.from = d; await askNights(); }
    }
    else if (payload?.startsWith('N_') || (c.step === 'nights' && /^\d{1,2}$/.test(text))) {
      const n = payload?.startsWith('N_') ? +payload.slice(2) : +text;
      if (n < 1 || n > 30) await say(t('ჩაწერეთ ღამეების რაოდენობა 1-დან 30-მდე.'), [BACK()]);
      else { c.n = n; await askGuests(); }
    }
    else if (payload?.startsWith('G_')) {
      c.g = +payload.slice(2);
      if (c.g > 6) await contact('7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ, ამას ვილა ჯიჯი პირადად შეგითანხმებთ.');
      else await check();
    }
    else if (payload?.startsWith('PICK_') && c.alts?.[payload.slice(5)]) { c.pick = c.alts[payload.slice(5)]; delete c.alts; c.step = 'name'; await say(t('თქვენი სახელი?')); }
    else if (payload === 'BOOK') { c.pick = { parts: [{ from: c.from, to: c.to, type: c.type }], typeName: c.typeName, total: c.total }; c.step = 'name'; await say(t('თქვენი სახელი?')); }
    else if (c.step === 'name' && text) { c.name = text.slice(0, 80); c.step = 'phone'; await say(t('ტელეფონის ნომერი, რომ დაგიკავშირდეთ?')); }
    else if (c.step === 'phone' && text) {
      if (text.replace(/\D/g, '').length < 9) await say(t('ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.'));
      else {
        const st = await loadState(db), pick = c.pick || { parts: [{ from: c.from, to: c.to }], typeName: c.typeName, total: c.total };
        let total = 0;
        for (const p of pick.parts) total += (await createRequest(db, st, { from: p.from, to: p.to, guests: c.g, name: c.name, phone: text, source: channel === 'ig' ? 'instagram' : 'facebook', type: p.type || c.type, gap: !!pick.gap })).total;
        if (pick.gap) pick.total = total;
        const first = pick.parts[0].from, last = pick.parts[pick.parts.length - 1].to;
        c.step = 'menu'; delete c.pick; delete c.gap; delete c.gaps;
        await say(`${t('მოთხოვნა მიღებულია.')}\n${fmtRange(first, last)} · ${pick.typeName} · ${pick.total} ₾\n\n${t('ვილა ჯიჯი დაგიკავშირდებათ ნომერზე {ph} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.', { ph: text })}`, [BACK()]);
      }
    }
    else {
      c.misses = (c.misses || 0) + 1;
      if (c.misses >= 2) { c.misses = 0; await contact('ვერ გავიგე.'); }
      else await say(t('ვერ გავიგე. აირჩიეთ ერთ-ერთი:'), MENU());
    }
  } finally {
    await saveConvo(db, id, c);
  }
}

// Was this echo typed by a person in the inbox? The bot tags its own messages; with META_APP_ID set,
// anything sent by another app (Business Suite, Instagram app) counts as staff.
function staffEcho(env, channel, m) {
  if (m.metadata === BOT_TAG) return false;
  if (env.META_APP_ID) return String(m.app_id || '') !== String(env.META_APP_ID);
  return channel === 'fb';
}
