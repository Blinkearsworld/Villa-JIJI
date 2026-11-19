/* Villa JIJI — shared data layer (demo: stored in this browser's localStorage).
   Later this file is the only one to swap for a real database (e.g. Supabase). */
window.JIJI = (() => {
  const KEY = 'jiji-demo-v1';

  // Room types. Prices are SAMPLE values in GEL per night, by season.
  const DEFAULT_TYPES = {
    double: { name: 'ორადგილიანი', cap: 2, price: { peak: 260, winter: 190, summer: 160, off: 120 } },
    family: { name: 'საოჯახო, 1 საძინებლით', cap: 5, price: { peak: 380, winter: 290, summer: 240, off: 180 } },
    budget: { name: 'საოჯახო ბიუჯეტური, 1 საძინებლით', cap: 4, price: { peak: 340, winter: 250, summer: 200, off: 150 } },
    duplex: { name: 'დუპლექსი', cap: 4, price: { peak: 620, winter: 480, summer: 390, off: 290 } },
    lux:    { name: 'ლუქსი', cap: 4, price: { peak: 600, winter: 460, summer: 380, off: 280 } },
    large:  { name: 'დიდი საოჯახო', cap: 6, price: { peak: 520, winter: 400, summer: 330, off: 250 } }
  };
  // 10 rooms. The split between types is a SAMPLE, the owner sets the real one.
  const ROOMS = [
    { id: '101', type: 'double' }, { id: '102', type: 'double' }, { id: '103', type: 'family' },
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
  let state;
  const uid = () => Math.random().toString(36).slice(2, 9);
  function seed() {
    const t = today();
    const b = (room, from, n, name, phone, guests, status, source) => ({
      id: uid(), room, type: ROOMS.find(r => r.id === room)?.type || 'double', from: addDays(t, from), to: addDays(t, from + n),
      name, phone, guests, status, source, created: new Date().toISOString()
    });
    const pending = (type, from, n, name, phone, guests, source) => ({
      id: uid(), room: null, type, from: addDays(t, from), to: addDays(t, from + n), name, phone, guests, status: 'pending', source, created: new Date().toISOString()
    });
    return {
      types: JSON.parse(JSON.stringify(DEFAULT_TYPES)),
      bookings: [
        b('101', 1, 3, 'ნინო ბ.', '+995 555 10 20 30', 2, 'confirmed', 'admin'),
        b('103', 2, 4, 'გიორგი მ.', '+995 555 22 33 44', 4, 'confirmed', 'site'),
        b('203', 0, 2, 'Anna K.', '+48 600 100 200', 3, 'confirmed', 'chat'),
        b('302', 5, 5, 'დავით ლ.', '+995 555 77 88 99', 6, 'confirmed', 'admin'),
        b('201', 6, 2, 'Irina S.', '+7 900 123 45 67', 2, 'confirmed', 'chat'),
        b('301', 8, 3, 'თამარ ჯ.', '+995 555 40 50 60', 4, 'confirmed', 'site'),
        pending('family', 3, 3, 'ლევან ქ.', '+995 555 12 12 12', 4, 'chat'),
        pending('double', 9, 2, 'Mark T.', '+44 7700 900123', 2, 'site')
      ]
    };
  }
  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
    if (!state || !state.bookings) { state = seed(); save(); return; }
    // add room types introduced after this browser first saved its data
    let added = false;
    for (const k in DEFAULT_TYPES) if (!state.types[k]) { state.types[k] = JSON.parse(JSON.stringify(DEFAULT_TYPES[k])); added = true; }
    if (added) save();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: demo keeps working in memory */ } }
  function reset() { state = seed(); save(); }
  load();

  // ---------- availability ----------
  const overlaps = (a1, b1, a2, b2) => a1 < b2 && a2 < b1;
  const confirmed = () => state.bookings.filter(x => x.status === 'confirmed');
  const roomFree = (roomId, from, to, ignoreId) =>
    !confirmed().some(x => x.room === roomId && x.id !== ignoreId && overlaps(from, to, x.from, x.to));
  const freeRoomsOfType = (type, from, to) => ROOMS.filter(r => r.type === type && roomFree(r.id, from, to)).map(r => r.id);

  function quote(type, from, to) {
    let sum = 0;
    for (let d = from; d < to; d = addDays(d, 1)) sum += state.types[type].price[seasonOf(d)];
    return sum;
  }
  // Cheapest type that fits the guests and has a free room for the whole stay.
  function findOffer(from, to, guests) {
    const fits = Object.keys(state.types).filter(t => state.types[t].cap >= guests)
      .sort((a, b) => state.types[a].cap - state.types[b].cap);
    for (const t of fits) {
      const free = freeRoomsOfType(t, from, to);
      if (free.length) return { type: t, name: state.types[t].name, total: quote(t, from, to), free: free.length };
    }
    return null;
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
    const t = offer ? offer.type : (Object.keys(state.types).find(k => state.types[k].cap >= guests) || 'large');
    const req = { id: uid(), room: null, type: t, from, to, guests, name, phone, status: 'pending', source, created: new Date().toISOString() };
    state.bookings.push(req); save(); return req;
  }
  function confirm(id, roomId) {
    const r = state.bookings.find(x => x.id === id); if (!r) return { ok: false, msg: 'ჯავშანი ვერ მოიძებნა' };
    const room = roomId || freeRoomsOfType(r.type, r.from, r.to)[0];
    if (!room || !roomFree(room, r.from, r.to, r.id)) return { ok: false, msg: 'ამ თარიღებზე ' + state.types[r.type].name + ' ნომერი თავისუფალი აღარ არის' };
    r.room = room; r.status = 'confirmed'; save(); return { ok: true, room };
  }
  function decline(id) { const r = state.bookings.find(x => x.id === id); if (r) { r.status = 'declined'; save(); } }
  function addManual({ room, from, to, name, phone, guests }) {
    if (!roomFree(room, from, to)) return { ok: false, msg: 'ნომერი ' + room + ' ამ თარიღებზე დაკავებულია' };
    const type = ROOMS.find(r => r.id === room).type;
    state.bookings.push({ id: uid(), room, type, from, to, name, phone, guests, status: 'confirmed', source: 'admin', created: new Date().toISOString() });
    save(); return { ok: true };
  }
  function setPrice(type, season, value) { state.types[type].price[season] = Math.max(0, Math.round(+value || 0)); save(); }
  function remove(id) { state.bookings = state.bookings.filter(x => x.id !== id); save(); }

  // Keep every open tab (site, admin) in sync.
  const listeners = [];
  window.addEventListener('storage', e => { if (e.key === KEY) { load(); listeners.forEach(f => f()); } });
  const onChange = f => listeners.push(f);

  return {
    ROOMS, SEASONS, get types() { return state.types; }, get bookings() { return state.bookings; },
    today, addDays, nights, fmt, fmtRange, weekday, seasonOf, quote, findOffer, nextOffer, roomFree,
    createRequest, confirm, decline, addManual, setPrice, remove, reset, onChange, reload: load
  };
})();
