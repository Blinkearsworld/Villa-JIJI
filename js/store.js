/* Villa JIJI — shared data layer.
   On Cloudflare (when /api/state answers) data lives in the D1 database via functions/api/*.
   Anywhere else (GitHub Pages demo) it falls back to this browser's localStorage with sample data.
   The availability and price rules are duplicated in functions/_lib/core.js; keep them in step. */
window.JIJI = (() => {
  const KEY = 'jiji-demo-v3';

  // Room types. Each type has price "versions" by number of guests, set by the hotel
  // (not proportional): the smallest version that fits the group is used.
  // Prices are SAMPLE values in GEL per night, by season.
  const R = (guests, off, summer, winter, peak) => ({ guests, price: { peak, winter, summer, off } });
  const DEFAULT_TYPES = {
    family: { name: 'საოჯახო, 1 საძინებლით', rates: [R(2, 150, 200, 240, 320), R(3, 165, 220, 265, 350), R(4, 180, 240, 290, 380), R(5, 195, 260, 310, 410)] },
    budget: { name: 'საოჯახო ბიუჯეტური, 1 საძინებლით', rates: [R(2, 120, 160, 200, 270), R(3, 135, 180, 225, 305), R(4, 150, 200, 250, 340)] },
    duplex: { name: 'დუპლექსი', rates: [R(2, 220, 300, 380, 500), R(3, 250, 340, 430, 560), R(4, 290, 390, 480, 620)] },
    lux:    { name: 'ლუქსი', rates: [R(2, 210, 290, 370, 480), R(3, 245, 335, 415, 540), R(4, 280, 380, 460, 600)] },
  };
  // 10 rooms. The split between types is a SAMPLE, the owner sets the real one.
  const ROOMS = [
    { id: '103', type: 'family' },
    { id: '201', type: 'budget' }, { id: '202', type: 'budget' }, { id: '203', type: 'family' },
    { id: '204', type: 'duplex' }, { id: '301', type: 'duplex' }, { id: '302', type: 'lux' },
    { id: '303', type: 'lux' }
  ];
  const SEASONS = { peak: 'ახალი წელი', winter: 'ზამთარი', summer: 'ზაფხული', off: 'დანარჩენი' };

  // ---------- dates as 'YYYY-MM-DD', math in UTC ----------
  const toD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const toS = d => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + n); return toS(d); };
  const nights = (a, b) => Math.round((toD(b) - toD(a)) / 864e5);
  const today = () => { const n = new Date(); return toS(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()))); };
  const MONTHS = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];
  const WD = ['კვ', 'ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ'];
  const fmt = s => { const d = toD(s); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
  const fmtRange = (a, b) => fmt(a) + ' – ' + fmt(b);
  const weekday = s => WD[toD(s).getUTCDay()];

  const seasonOf = s => {
    const d = toD(s), m = d.getUTCMonth() + 1, day = d.getUTCDate();
    if ((m === 12 && day >= 25) || (m === 1 && day <= 7)) return 'peak';
    if (m === 12 || m <= 3) return 'winter';
    if (m >= 6 && m <= 8) return 'summer';
    return 'off';
  };

  // ---------- storage ----------
  let state, mode = 'demo';
  // Which season the site opens in. 'auto' follows the winter date range (MM-DD, may wrap the year).
  const DEFAULT_SETTINGS = { seasonMode: 'auto', winterFrom: '11-15', winterTo: '03-31' };
  // capacity of a type = its largest guest version
  function syncCap(k) {
    const t = state.types[k];
    t.rates = (t.rates || []).filter(r => r.guests > 0).sort((a, b) => a.guests - b.guests);
    t.cap = t.rates.length ? t.rates[t.rates.length - 1].guests : 0;
  }
  const uid = () => Math.random().toString(36).slice(2, 9);
  function seed() {
    const t = today();
    const b = (room, from, n, name, phone, guests, status, source) => ({
      id: uid(), room, type: ROOMS.find(r => r.id === room)?.type || 'family', from: addDays(t, from), to: addDays(t, from + n),
      name, phone, guests, status, source, created: new Date().toISOString()
    });
    const pending = (type, from, n, name, phone, guests, source) => ({
      id: uid(), room: null, type, from: addDays(t, from), to: addDays(t, from + n), name, phone, guests, status: 'pending', source, created: new Date().toISOString()
    });
    const types = JSON.parse(JSON.stringify(DEFAULT_TYPES));
    for (const k in types) types[k].cap = types[k].rates[types[k].rates.length - 1].guests;
    return {
      settings: { ...DEFAULT_SETTINGS },
      types,
      bookings: [
        b('202', 1, 3, 'ნინო ბ.', '+995 555 10 20 30', 2, 'confirmed', 'admin'),
        b('103', 2, 4, 'გიორგი მ.', '+995 555 22 33 44', 4, 'confirmed', 'site'),
        b('203', 0, 2, 'Anna K.', '+48 600 100 200', 3, 'confirmed', 'chat'),
        b('302', 5, 5, 'დავით ლ.', '+995 555 77 88 99', 4, 'confirmed', 'admin'),
        b('201', 6, 2, 'Irina S.', '+7 900 123 45 67', 2, 'confirmed', 'chat'),
        b('301', 8, 3, 'თამარ ჯ.', '+995 555 40 50 60', 4, 'confirmed', 'site'),
        pending('family', 3, 3, 'ლევან ქ.', '+995 555 12 12 12', 4, 'chat'),
        pending('budget', 9, 2, 'Mark T.', '+44 7700 900123', 2, 'site')
      ]
    };
  }
  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
    if (!state || !state.bookings) { state = seed(); save(); return; }
    for (const k in state.types) syncCap(k);
    if (!state.settings) { state.settings = { ...DEFAULT_SETTINGS }; save(); }
    // add room types introduced after this browser first saved its data
    let added = false;
    for (const k in state.types) if (!DEFAULT_TYPES[k]) { delete state.types[k]; added = true; }
    for (const k in DEFAULT_TYPES) if (!state.types[k]) { state.types[k] = JSON.parse(JSON.stringify(DEFAULT_TYPES[k])); syncCap(k); added = true; }
    if (added) save();
  }
  function save() { if (mode === 'api') return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: demo keeps working in memory */ } }
  function reset() { state = seed(); save(); }
  load();

  // ---------- availability ----------
  const overlaps = (a1, b1, a2, b2) => a1 < b2 && a2 < b1;
  const confirmed = () => state.bookings.filter(x => x.status === 'confirmed');
  const roomFree = (roomId, from, to, ignoreId) =>
    !confirmed().some(x => x.room === roomId && x.id !== ignoreId && overlaps(from, to, x.from, x.to));
  const freeRoomsOfType = (type, from, to) => ROOMS.filter(r => r.type === type && roomFree(r.id, from, to)).map(r => r.id);

  // the price version used for a group: the smallest one with enough places
  const rateFor = (type, guests) => (state.types[type]?.rates || []).find(r => r.guests >= (guests || 1)) || null;
  function quote(type, from, to, guests) {
    const r = rateFor(type, guests) || (state.types[type].rates || []).slice(-1)[0];
    if (!r) return 0;
    let sum = 0;
    for (let d = from; d < to; d = addDays(d, 1)) sum += r.price[seasonOf(d)];
    return sum;
  }
  // lowest nightly price of a version (any season), for "from" prices
  const fromPrice = r => Math.min(...Object.values(r.price));
  // Cheapest room type that fits the guests and has a free room for the whole stay.
  function findOffer(from, to, guests) {
    let best = null;
    for (const t of Object.keys(state.types)) {
      const r = rateFor(t, guests); if (!r) continue;
      const free = freeRoomsOfType(t, from, to); if (!free.length) continue;
      const total = quote(t, from, to, guests);
      if (!best || total < best.total) best = { type: t, name: state.types[t].name, total, free: free.length, rateGuests: r.guests };
    }
    return best;
  }
  // Nearest start date within `days` days with the same length of stay.
  function nextOffer(from, n, guests, days = 30) {
    for (let i = 1; i <= days; i++) {
      const f = addDays(from, i), o = findOffer(f, addDays(f, n), guests);
      if (o) return { from: f, to: addDays(f, n), ...o };
    }
    return null;
  }

  // ---------- actions ----------
  function createRequest({ from, to, guests, name, phone, source, type }) {
    const offer = type ? { type } : findOffer(from, to, guests);
    const t = offer ? offer.type : (Object.keys(state.types).find(k => rateFor(k, guests)) || Object.keys(state.types)[0]);
    const req = { id: uid(), room: null, type: t, from, to, guests, name, phone, status: 'pending', source, created: new Date().toISOString() };
    state.bookings.push(req); save();
    req.saved = post('api/request', { from, to, guests, name, phone, source });
    return req;
  }
  function confirm(id, roomId) {
    const r = state.bookings.find(x => x.id === id); if (!r) return { ok: false, msg: 'ჯავშანი ვერ მოიძებნა' };
    const room = roomId || freeRoomsOfType(r.type, r.from, r.to)[0];
    if (!room || !roomFree(room, r.from, r.to, r.id)) return { ok: false, msg: 'ამ თარიღებზე ' + state.types[r.type].name + ' ნომერი თავისუფალი აღარ არის' };
    r.room = room; r.status = 'confirmed'; save(); post('api/admin/action', { op: 'confirm', id, room }); return { ok: true, room };
  }
  function decline(id) { const r = state.bookings.find(x => x.id === id); if (r) { r.status = 'declined'; save(); post('api/admin/action', { op: 'decline', id }); } }
  function addManual({ room, from, to, name, phone, guests }) {
    if (!roomFree(room, from, to)) return { ok: false, msg: 'ნომერი ' + room + ' ამ თარიღებზე დაკავებულია' };
    const type = ROOMS.find(r => r.id === room).type;
    state.bookings.push({ id: uid(), room, type, from, to, name, phone, guests, status: 'confirmed', source: 'admin', created: new Date().toISOString() });
    save(); post('api/admin/action', { op: 'add', room, from, to, name, phone, guests }); return { ok: true };
  }
  const pushRates = type => post('api/admin/action', { op: 'rates', type, rates: state.types[type].rates });
  function setRate(type, i, field, value) {
    const r = state.types[type].rates[i]; if (!r) return;
    const v = Math.max(0, Math.round(+value || 0));
    if (field === 'guests') r.guests = Math.max(1, v); else r.price[field] = v;
    syncCap(type); save(); pushRates(type);
  }
  function addRate(type) {
    const rs = state.types[type].rates, last = rs[rs.length - 1];
    rs.push(last ? { guests: last.guests + 1, price: { ...last.price } } : { guests: 2, price: { peak: 0, winter: 0, summer: 0, off: 0 } });
    syncCap(type); save(); pushRates(type);
  }
  function removeRate(type, i) { state.types[type].rates.splice(i, 1); syncCap(type); save(); pushRates(type); }
  function setSetting(k, v) { state.settings[k] = v; save(); post('api/admin/action', { op: 'setting', k, v }); }
  function siteSeason(day) {
    const st = state.settings || DEFAULT_SETTINGS;
    if (st.seasonMode === 'winter' || st.seasonMode === 'summer') return st.seasonMode;
    const md = (day || today()).slice(5), a = st.winterFrom, b = st.winterTo;
    const inWinter = a <= b ? (md >= a && md <= b) : (md >= a || md <= b);
    return inWinter ? 'winter' : 'summer';
  }
  function remove(id) { state.bookings = state.bookings.filter(x => x.id !== id); save(); post('api/admin/action', { op: 'remove', id }); }

  // ---------- server (Cloudflare) ----------
  const isAdmin = /admin(\.html)?$/.test(location.pathname);
  const listeners = [], errorListeners = [];
  const emit = () => listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  function applyServer(data) {
    for (const k in data.types) data.types[k].cap = data.types[k].cap ?? (data.types[k].rates.slice(-1)[0]?.guests || 0);
    state = { types: data.types, settings: data.settings, bookings: data.bookings };
    ROOMS.length = 0; data.rooms.forEach(r => ROOMS.push(r));
  }
  async function refresh() {
    const r = await fetch(isAdmin ? 'api/admin/state' : 'api/state', { cache: 'no-store' });
    if (!r.ok) throw new Error('state ' + r.status);
    applyServer(await r.json()); emit();
  }
  async function post(url, body) {
    if (mode !== 'api') return;
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const out = await r.json().catch(() => ({}));
      if (!r.ok || out.ok === false) errorListeners.forEach(f => f(out.msg || out.error || 'შეცდომა სერვერზე'));
      await refresh();
      return out;
    } catch (e) { errorListeners.forEach(f => f('კავშირი სერვერთან ვერ მოხერხდა')); }
  }
  const ready = (async () => {
    if (!/^https?:$/.test(location.protocol) || /github\.io$/.test(location.hostname)) return;
    try {
      const ctl = new AbortController(); setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(isAdmin ? 'api/admin/state' : 'api/state', { cache: 'no-store', signal: ctl.signal });
      if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return;
      const data = await r.json(); if (!data.types) return;
      mode = 'api'; applyServer(data); emit();
      if (isAdmin) setInterval(() => refresh().catch(() => {}), 30000);
    } catch (e) { /* no server: keep the demo */ }
  })();

  // Keep every open tab (site, admin) in sync.
  window.addEventListener('storage', e => { if (mode === 'demo' && e.key === KEY) { load(); listeners.forEach(f => f()); } });
  const onChange = f => listeners.push(f);
  const onError = f => errorListeners.push(f);

  return {
    ROOMS, SEASONS, get settings() { return state.settings; }, setSetting, siteSeason, get types() { return state.types; }, get bookings() { return state.bookings; },
    today, addDays, nights, fmt, fmtRange, weekday, seasonOf, quote, rateFor, fromPrice, findOffer, nextOffer, roomFree,
    createRequest, confirm, decline, addManual, setRate, addRate, removeRate, remove, reset, onChange, onError, reload: load,
    ready, get mode() { return mode; }
  };
})();
