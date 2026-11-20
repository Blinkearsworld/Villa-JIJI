// Villa JIJI server core: database setup, availability and pricing.
// Same rules as js/store.js (the browser demo); keep the two in step.

const R = (guests, off, summer, winter, peak) => ({ guests, price: { peak, winter, summer, off } });
// SAMPLE prices (GEL per night). The admin panel changes them in the database.
export const DEFAULT_TYPES = {
  family: { name: 'საოჯახო, 1 საძინებლით', rates: [R(2, 150, 200, 240, 320), R(3, 165, 220, 265, 350), R(4, 180, 240, 290, 380), R(5, 195, 260, 310, 410)] },
  budget: { name: 'საოჯახო ბიუჯეტური, 1 საძინებლით', rates: [R(2, 120, 160, 200, 270), R(3, 135, 180, 225, 305), R(4, 150, 200, 250, 340)] },
  duplex: { name: 'დუპლექსი', rates: [R(2, 220, 300, 380, 500), R(3, 250, 340, 430, 560), R(4, 290, 390, 480, 620)] },
  lux:    { name: 'ლუქსი', rates: [R(2, 210, 290, 370, 480), R(3, 245, 335, 415, 540), R(4, 280, 380, 460, 600)] },
};
export const DEFAULT_ROOMS = [
  ['103', 'family'], ['203', 'family'], ['201', 'budget'], ['202', 'budget'],
  ['204', 'duplex'], ['301', 'duplex'], ['302', 'lux'], ['303', 'lux'],
];
export const DEFAULT_SETTINGS = { seasonMode: 'auto', winterFrom: '11-15', winterTo: '03-31', gapDiscount: '10' };

// ---------- dates ----------
const toD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const toS = d => d.toISOString().slice(0, 10);
export const addDays = (s, n) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + n); return toS(d); };
export const nights = (a, b) => Math.round((toD(b) - toD(a)) / 864e5);
// Georgia is UTC+4
export const today = () => toS(new Date(Date.now() + 4 * 3600e3));
export const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(toD(s));
const MONTHS = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];
export const fmt = s => { const d = toD(s); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
export const fmtRange = (a, b) => fmt(a) + ' – ' + fmt(b);
export const seasonOf = s => {
  const d = toD(s), m = d.getUTCMonth() + 1, day = d.getUTCDate();
  if ((m === 12 && day >= 25) || (m === 1 && day <= 7)) return 'peak';
  if (m === 12 || m <= 3) return 'winter';
  if (m >= 6 && m <= 8) return 'summer';
  return 'off';
};
export const uid = () => crypto.randomUUID().slice(0, 12);

// ---------- database ----------
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)`,
  `CREATE TABLE IF NOT EXISTS types (id TEXT PRIMARY KEY, name TEXT, rates TEXT, sort INTEGER)`,
  `CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, type TEXT)`,
  `CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, room TEXT, type TEXT, date_from TEXT, date_to TEXT,
     guests INTEGER, name TEXT, phone TEXT, status TEXT, source TEXT, created TEXT, price INTEGER, note TEXT)`,
  `CREATE INDEX IF NOT EXISTS bookings_dates ON bookings (status, date_from, date_to)`,
  `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, booking TEXT, amount INTEGER, method TEXT, date TEXT, created TEXT)`,
  `CREATE INDEX IF NOT EXISTS payments_booking ON payments (booking)`,
  `CREATE TABLE IF NOT EXISTS convos (id TEXT PRIMARY KEY, state TEXT, updated TEXT)`,
];
let ready = false;
// Creates tables and sample data on the first request, so no manual SQL is needed.
export async function ensureDb(db) {
  if (ready) return;
  await db.batch(SCHEMA.map(q => db.prepare(q)));
  const n = await db.prepare('SELECT COUNT(*) AS n FROM types').first('n');
  if (!n) {
    const st = [];
    Object.entries(DEFAULT_TYPES).forEach(([id, t], i) => st.push(db.prepare('INSERT INTO types (id,name,rates,sort) VALUES (?,?,?,?)').bind(id, t.name, JSON.stringify(t.rates), i)));
    DEFAULT_ROOMS.forEach(([id, type]) => st.push(db.prepare('INSERT OR IGNORE INTO rooms (id,type) VALUES (?,?)').bind(id, type)));
    Object.entries(DEFAULT_SETTINGS).forEach(([k, v]) => st.push(db.prepare('INSERT OR IGNORE INTO settings (k,v) VALUES (?,?)').bind(k, v)));
    await db.batch(st);
  }
  // columns added after the first release
  for (const col of ['price INTEGER', 'note TEXT']) { try { await db.prepare('ALTER TABLE bookings ADD COLUMN ' + col).run(); } catch (e) { /* exists */ } }
  ready = true;
}

const rowToBooking = r => ({ id: r.id, room: r.room, type: r.type, from: r.date_from, to: r.date_to, guests: r.guests,
  name: r.name, phone: r.phone, status: r.status, source: r.source, created: r.created, price: r.price, note: r.note });

// Everything needed to answer availability questions. `full` adds guest details (admin only).
export async function loadState(db, { full = false } = {}) {
  await ensureDb(db);
  const [types, rooms, settings, bookings, payments] = await Promise.all([
    db.prepare('SELECT * FROM types ORDER BY sort').all(),
    db.prepare('SELECT * FROM rooms ORDER BY id').all(),
    db.prepare('SELECT * FROM settings').all(),
    full
      ? db.prepare("SELECT * FROM bookings WHERE status != 'declined' OR created > ? ORDER BY created DESC").bind(addDays(today(), -60)).all()
      : db.prepare("SELECT id, room, type, date_from, date_to FROM bookings WHERE status = 'confirmed' AND date_to >= ?").bind(today()).all(),
    full ? db.prepare('SELECT * FROM payments ORDER BY date').all() : null,
  ]);
  const T = {};
  for (const t of types.results) {
    const rates = JSON.parse(t.rates).sort((a, b) => a.guests - b.guests);
    T[t.id] = { name: t.name, rates, cap: rates.length ? rates[rates.length - 1].guests : 0 };
  }
  const S = { ...DEFAULT_SETTINGS };
  for (const s of settings.results) S[s.k] = s.v;
  return {
    types: T,
    rooms: rooms.results.map(r => ({ id: r.id, type: r.type })),
    settings: S,
    bookings: bookings.results.map(r => full ? rowToBooking(r)
      : { id: r.id, room: r.room, type: r.type, from: r.date_from, to: r.date_to, status: 'confirmed' }),
    ...(full ? { payments: payments.results } : {}),
  };
}

// ---------- availability (works on a loaded state) ----------
const overlaps = (a1, b1, a2, b2) => a1 < b2 && a2 < b1;
export const roomFree = (st, roomId, from, to, ignoreId) =>
  !st.bookings.some(x => x.status === 'confirmed' && x.room === roomId && x.id !== ignoreId && overlaps(from, to, x.from, x.to));
export const freeRooms = (st, type, from, to) => st.rooms.filter(r => r.type === type && roomFree(st, r.id, from, to)).map(r => r.id);
export const rateFor = (st, type, guests) => (st.types[type]?.rates || []).find(r => r.guests >= (guests || 1)) || null;
export function quote(st, type, from, to, guests) {
  const r = rateFor(st, type, guests) || (st.types[type]?.rates || []).slice(-1)[0];
  if (!r) return 0;
  let sum = 0;
  for (let d = from; d < to; d = addDays(d, 1)) sum += r.price[seasonOf(d)] || 0;
  return sum;
}
export function findOffer(st, from, to, guests) {
  let best = null;
  for (const t of Object.keys(st.types)) {
    if (!rateFor(st, t, guests)) continue;
    const free = freeRooms(st, t, from, to); if (!free.length) continue;
    const total = quote(st, t, from, to, guests);
    if (!best || total < best.total) best = { type: t, name: st.types[t].name, total, free: free.length };
  }
  return best;
}
// Longest run of free nights inside the asked period (when the whole period is not free).
export function partialOffer(st, from, to, guests) {
  let best = null;
  for (const t of Object.keys(st.types)) {
    if (!rateFor(st, t, guests)) continue;
    for (const room of st.rooms.filter(r => r.type === t)) {
      let start = null;
      for (let d = from; ; d = addDays(d, 1)) {
        const free = d < to && roomFree(st, room.id, d, addDays(d, 1));
        if (free && start === null) start = d;
        if (!free && start !== null) {
          const n = nights(start, d), total = quote(st, t, start, d, guests);
          if (!best || n > best.n || (n === best.n && total < best.total)) best = { from: start, to: d, n, type: t, name: st.types[t].name, total };
          start = null;
        }
        if (d >= to) break;
      }
    }
  }
  return best && best.n < nights(from, to) ? best : null;
}
// The whole period with one change of room in the middle.
export function splitOffer(st, from, to, guests) {
  const n = nights(from, to); let best = null;
  for (let k = 1; k < n; k++) {
    const mid = addDays(from, k), a = findOffer(st, from, mid, guests), b = a && findOffer(st, mid, to, guests);
    if (a && b && (!best || a.total + b.total < best.total)) best = { parts: [{ from, to: mid, ...a }, { from: mid, to, ...b }], total: a.total + b.total };
  }
  return best;
}
// ---------- short gaps (1–3 free nights between bookings) ----------
export const GAP_MAX = 3;
const roomBookings = (st, roomId) => st.bookings.filter(x => x.status === 'confirmed').filter(x => x.room === roomId).sort((a, b) => a.from < b.from ? -1 : 1);
// free runs of 1..GAP_MAX nights that sit between two bookings (or between today and a booking)
export function gaps(st, horizon = 60) {
  const t = today(), end = addDays(t, horizon), out = [];
  for (const room of st.rooms) {
    let prev = t;
    for (const b of roomBookings(st, room.id)) {
      if (b.to <= t) continue;
      const from = prev > t ? prev : t, n = b.from > from ? nights(from, b.from) : 0;
      if (n >= 1 && n <= GAP_MAX && from <= end) out.push({ room: room.id, type: room.type, from, to: b.from, n });
      if (b.to > prev) prev = b.to;
    }
  }
  return out.sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : a.n - b.n);
}
export const gapDiscount = st => Math.max(0, Math.min(50, parseInt(st.settings?.gapDiscount) || 0));
// the room that leaves the fewest short gaps around a stay
export function bestRoom(st, type, from, to) {
  const pen = g => g === null ? 2 : g === 0 ? 0 : g <= GAP_MAX ? 10 : 3;
  let best = null, bestScore = Infinity;
  for (const room of st.rooms.filter(r => r.type === type && roomFree(st, r.id, from, to))) {
    const bs = roomBookings(st, room.id);
    const before = bs.filter(x => x.to <= from).pop(), after = bs.find(x => x.from >= to);
    const score = pen(before ? nights(before.to, from) : null) + pen(after ? nights(to, after.from) : null);
    if (score < bestScore) { best = room.id; bestScore = score; }
  }
  return best;
}
export function nextOffer(st, from, n, guests, days = 30) {
  for (let i = 1; i <= days; i++) {
    const f = addDays(from, i), o = findOffer(st, f, addDays(f, n), guests);
    if (o) return { from: f, to: addDays(f, n), ...o };
  }
  return null;
}

// ---------- writes ----------
export async function createRequest(db, st, { from, to, guests, name, phone, source, type: wanted, gap }) {
  if (!isDate(from) || !isDate(to) || to <= from || from < today()) throw new Error('bad dates');
  if (nights(from, to) > 30) throw new Error('too long');
  guests = Math.max(1, Math.min(12, parseInt(guests) || 1));
  name = String(name || '').trim().slice(0, 80);
  phone = String(phone || '').trim().slice(0, 30);
  if (!name || phone.replace(/\D/g, '').length < 9) throw new Error('name and phone required');
  // a gap offer (or a split part) asks for a specific type; otherwise the cheapest free one
  const fits = wanted && st.types[wanted] && rateFor(st, wanted, guests) && freeRooms(st, wanted, from, to).length;
  const offer = fits ? { type: wanted, total: quote(st, wanted, from, to, guests) } : findOffer(st, from, to, guests);
  const type = offer ? offer.type : (Object.keys(st.types).find(k => rateFor(st, k, guests)) || Object.keys(st.types)[0]);
  // only a stay that exactly fills a short gap gets the gap discount
  const isGap = !!gap && gaps(st).some(g => g.type === type && g.from === from && g.to === to);
  const full = offer ? offer.total : quote(st, type, from, to, guests);
  const price = isGap ? Math.round(full * (100 - gapDiscount(st)) / 100) : full;
  const note = isGap && gapDiscount(st) ? `ფანჯარა −${gapDiscount(st)}%` : '';
  const b = { id: uid(), room: null, type, from, to, guests, name, phone, status: 'pending', source: String(source || 'site').slice(0, 20), created: new Date().toISOString(), price, note };
  await db.prepare('INSERT INTO bookings (id,room,type,date_from,date_to,guests,name,phone,status,source,created,price,note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(b.id, null, b.type, b.from, b.to, b.guests, b.name, b.phone, b.status, b.source, b.created, b.price, b.note).run();
  return { booking: b, total: price, typeName: st.types[type]?.name };
}

export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
