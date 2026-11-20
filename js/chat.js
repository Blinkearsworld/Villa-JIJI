/* Villa JIJI — scripted chatbot (no AI). Reads availability and prices from JIJI (store.js).
   The same script/flow is what Instagram and Facebook bots will follow later. */
(() => {
  const J = window.JIJI;
  const PHONE = '+995 596 90 40 60';
  const WA = 'https://wa.me/995596904060';
  const MAP = 'https://www.google.com/maps/search/?api=1&query=41.7318533,43.5301119';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = {
    chat: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>'
  };

  // ---------- DOM ----------
  const fab = document.createElement('button');
  fab.className = 'jc-fab'; fab.type = 'button'; fab.innerHTML = icon.chat + 'თავისუფალი ნომრები';
  const box = document.createElement('section');
  box.className = 'jc'; box.hidden = true; box.setAttribute('aria-label', 'Villa JIJI ჩატი');
  box.innerHTML = `
    <div class="jc-head"><div><b>Villa JIJI</b><small>ავტომატური ასისტენტი</small></div>
      <button class="jc-x" type="button" aria-label="ჩატის დახურვა">${icon.x}</button></div>
    <div class="jc-log" role="log" aria-live="polite"></div>
    <div class="jc-opts"></div>
    <form class="jc-in" hidden><input id="jc-input" aria-label="პასუხი"><button type="submit" aria-label="გაგზავნა">${icon.send}</button></form>`;
  document.body.append(fab, box);
  const log = box.querySelector('.jc-log'), opts = box.querySelector('.jc-opts');
  const form = box.querySelector('.jc-in'), input = form.querySelector('input');

  let started = false, mode = 'menu', misses = 0, ctx = {}, queue = Promise.resolve();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
  const scroll = () => { log.scrollTop = log.scrollHeight; };

  // Bot messages are queued so they appear one after another with a short "typing" pause.
  function bot(html, cls = '') {
    queue = queue.then(async () => {
      const t = document.createElement('div'); t.className = 'jc-typing'; t.textContent = 'წერს…';
      log.append(t); scroll(); await wait(420); t.remove();
      const m = document.createElement('div'); m.className = 'jc-m bot ' + cls; m.innerHTML = html;
      log.append(m); scroll();
    });
    return queue;
  }
  function me(text) { const m = document.createElement('div'); m.className = 'jc-m me'; m.textContent = text; log.append(m); scroll(); }
  function options(list) {
    opts.innerHTML = '';
    queue = queue.then(() => {
      list.forEach(o => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = o.t; if (o.sub) b.className = 'sub';
        b.addEventListener('click', () => { me(o.t); opts.innerHTML = ''; setInput(null); o.f(); });
        opts.append(b);
      });
      scroll();
    });
  }
  function setInput(type, ph = '') {
    mode = type ? mode : 'menu';
    if (!type) { form.hidden = true; return; }
    queue = queue.then(() => {
      form.hidden = false; input.type = type; input.value = ''; input.placeholder = ph;
      input.min = type === 'date' ? J.today() : '';
      input.inputMode = type === 'tel' ? 'tel' : '';
      input.focus({ preventScroll: true });
    });
  }
  const nav = () => [{ t: 'მენიუ', f: menu, sub: true }];

  // ---------- flow ----------
  function start() {
    bot('გამარჯობა! ვილა ჯიჯიში მოგესალმებით.\nთავისუფალ ნომრებს და ფასს წამებში გეტყვით.');
    menu();
  }
  function menu() {
    mode = 'menu'; ctx = {};
    bot('რით დაგეხმაროთ?');
    options([
      { t: 'თავისუფალი ნომრები და ფასი', f: askDate },
      ...(J.gaps().length ? [{ t: 'მოკლე შეთავაზებები (1–3 ღამე)', f: deals }] : []),
      { t: 'სად ვართ', f: location },
      { t: 'ხშირი კითხვები', f: faq },
      { t: 'ვილა ჯიჯისთან დაკავშირება', f: contact }
    ]);
  }
  // ---------- inline calendar: tap check-in, then check-out ----------
  const MONTHS_FULL = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
  function askDate() {
    bot('აირჩიეთ შესვლისა და გასვლის დღეები კალენდარში.');
    queue = queue.then(() => {
      const t = J.today(); let y = +t.slice(0, 4), m = +t.slice(5, 7) - 1, a = null, b = null;
      const wrap = document.createElement('div'); wrap.className = 'jc-m bot jc-cal';
      log.append(wrap);
      const pad = n => String(n).padStart(2, '0');
      function draw(initial) {
        const keep = log.scrollTop;
        const first = new Date(Date.UTC(y, m, 1)), lead = (first.getUTCDay() + 6) % 7, dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        const atStart = y === +t.slice(0, 4) && m === +t.slice(5, 7) - 1;
        let cells = '';
        for (let i = 0; i < lead; i++) cells += '<span></span>';
        for (let d = 1; d <= dim; d++) {
          const s = `${y}-${pad(m + 1)}-${pad(d)}`, past = s < t;
          const cls = [s === a ? 'a' : '', s === b ? 'b' : '', a && b && s > a && s < b ? 'in' : '', s === t ? 'td' : ''].join(' ');
          cells += `<button type="button" data-d="${s}" class="${cls}" ${past ? 'disabled' : ''} aria-label="${d} ${MONTHS_FULL[m]}">${d}</button>`;
        }
        const n = a && b ? J.nights(a, b) : 0;
        const status = !a ? 'შესვლის დღე' : !b ? 'ახლა გასვლის დღე' : `${J.fmtRange(a, b)} · ${n} ღამე`;
        wrap.innerHTML = `<div class="jc-cal-h"><button type="button" data-nav="-1" aria-label="წინა თვე" ${atStart ? 'disabled' : ''}>‹</button><b>${MONTHS_FULL[m]} ${y}</b><button type="button" data-nav="1" aria-label="შემდეგი თვე">›</button></div>
          <div class="jc-cal-w"><span>ორ</span><span>სმ</span><span>ოთ</span><span>ხთ</span><span>პრ</span><span>შბ</span><span>კვ</span></div>
          <div class="jc-cal-g">${cells}</div>
          <div class="jc-cal-s">${status}</div>
          <div class="jc-cal-nav"><button type="button" data-nav="-1" ${atStart ? 'disabled' : ''}>‹ ${MONTHS_FULL[(m + 11) % 12]}</button><button type="button" data-nav="1">${MONTHS_FULL[(m + 1) % 12]} ›</button></div>
          <button type="button" class="jc-cal-ok" ${n ? '' : 'disabled'}>გაგრძელება</button>`;
        // keep the calendar where the guest is looking; only the first render scrolls it into view
        log.scrollTop = initial ? Math.max(0, wrap.offsetTop - 8) : keep;
        if (!initial && log.scrollTop > wrap.offsetTop) log.scrollTop = wrap.offsetTop - 8;
      }
      wrap.addEventListener('click', e => {
        const nav = e.target.closest('[data-nav]'), day = e.target.closest('[data-d]'), go = e.target.closest('.jc-cal-ok');
        if (nav) { m += +nav.dataset.nav; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } draw(); log.scrollTop = Math.max(0, wrap.offsetTop - 8); return; }
        if (day) { const s = day.dataset.d; if (!a || b || s <= a) { a = s; b = null; } else { b = s; } draw(); return; }
        if (go && a && b) {
          wrap.querySelectorAll('button').forEach(x => x.disabled = true); wrap.classList.add('done');
          me(J.fmtRange(a, b) + ' · ' + J.nights(a, b) + ' ღამე'); opts.innerHTML = '';
          ctx.from = a; ctx.n = J.nights(a, b); askGuests();
        }
      });
      draw(true);
    });
    options(nav());
  }
  function askGuests() {
    bot('რამდენი სტუმარი?');
    options([
      ...[1, 2, 3, 4, 5, 6].map(n => ({ t: String(n), f: () => check(n) })),
      { t: '7 ან მეტი', f: group }, ...nav()
    ]);
  }
  function offerHtml(from, to, n, g, o) {
    return `${J.fmtRange(from, to)} · ${n} ღამე · ${g} სტუმარი\nთავისუფალია: ${esc(o.name)} ნომერი<strong>${o.total} ₾</strong>საუზმით · სანიმუშო ფასი`;
  }
  function check(g) {
    ctx.g = g; ctx.to = J.addDays(ctx.from, ctx.n);
    const hit = J.gaps().find(x => x.from === ctx.from && x.to === ctx.to && J.rateFor(x.type, g));
    if (hit && J.gapDiscount()) { ctx.gap = hit; gapGuests(g); return; }
    const o = J.findOffer(ctx.from, ctx.to, g);
    if (o) {
      ctx.offer = o;
      bot(offerHtml(ctx.from, ctx.to, ctx.n, g, o), 'offer');
      options([{ t: 'დაჯავშნა', f: askName }, { t: 'სხვა თარიღი', f: askDate }, ...nav()]);
      return;
    }
    // Not all nights are free: suggest what is possible instead of a plain "no".
    const part = J.partialOffer(ctx.from, ctx.to, g);
    const split = J.splitOffer(ctx.from, ctx.to, g);
    const nx = J.nextOffer(ctx.from, ctx.n, g);
    if (!part && !split && !nx) {
      bot('ამ პერიოდში ადგილი აღარ გვაქვს. დაგვიკავშირდით და იქნებ მაინც მოგიძებნოთ გამოსავალი.');
      options([{ t: 'ვილა ჯიჯისთან დაკავშირება', f: contact }, { t: 'სხვა თარიღი', f: askDate }, ...nav()]);
      return;
    }
    bot(`${J.fmtRange(ctx.from, ctx.to)} (${ctx.n} ღამე) ${g} სტუმრისთვის მთლიანად თავისუფალი არ გვაქვს, მაგრამ შეგვიძლია შემოგთავაზოთ:`);
    const opts = [];
    if (split) {
      const [x, y] = split.parts;
      bot(`<b>მთელი ${ctx.n} ღამე, ნომრის ერთი გამოცვლით</b>
${J.fmtRange(x.from, x.to)} · ${esc(x.name)}
${J.fmtRange(y.from, y.to)} · ${esc(y.name)}<strong>${split.total} ₾</strong>საუზმით · სანიმუშო ფასი`, 'offer');
      opts.push({ t: `მთელი ${ctx.n} ღამე`, f: () => { ctx.split = split.parts; ctx.offer = { name: x.name + ' → ' + y.name, total: split.total }; askName(); } });
    }
    if (part) {
      bot(`<b>${ctx.n} ღამიდან ${part.n} ღამე თავისუფალია</b>
${J.fmtRange(part.from, part.to)} · ${esc(part.name)}<strong>${part.total} ₾</strong>საუზმით · სანიმუშო ფასი`, 'offer');
      opts.push({ t: `${part.n} ღამე: ${J.fmtRange(part.from, part.to)}`, f: () => { ctx.from = part.from; ctx.to = part.to; ctx.offer = part; delete ctx.split; askName(); } });
    }
    if (nx) {
      bot(`<b>სრული ${ctx.n} ღამე სხვა თარიღებში</b>
${J.fmtRange(nx.from, nx.to)} · ${esc(nx.name)}<strong>${nx.total} ₾</strong>საუზმით · სანიმუშო ფასი`, 'offer');
      opts.push({ t: `${J.fmtRange(nx.from, nx.to)}`, f: () => { ctx.from = nx.from; ctx.to = nx.to; ctx.offer = nx; delete ctx.split; askName(); } });
    }
    options([...opts, { t: 'სხვა თარიღი', f: askDate, sub: true }, { t: 'დაკავშირება', f: contact, sub: true }]);
  }
  // ---------- short free windows between bookings, with the gap discount ----------
  const maxGuests = type => Math.max(0, ...(J.types[type]?.rates || []).map(r => r.guests));
  const gapPrice = (g, guests) => Math.round(J.quote(g.type, g.from, g.to, guests) * (100 - J.gapDiscount()) / 100);
  function uniqGaps() {
    const seen = new Set();
    return J.gaps().filter(g => { const k = g.type + g.from + g.to; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6);
  }
  function deals() {
    const list = uniqGaps(), d = J.gapDiscount();
    if (!list.length) { bot('ამჟამად მოკლე შეთავაზება არ გვაქვს. ნახეთ თავისუფალი თარიღები კალენდარში.'); options([{ t: 'თავისუფალი ნომრები', f: askDate }, ...nav()]); return; }
    bot(`ორ ჯავშანს შორის დარჩენილი 1–3 ღამე${d ? `, <b>${d}% ფასდაკლებით</b>` : ''}:`);
    list.forEach(g => bot(`<b>${J.fmtRange(g.from, g.to)} · ${g.n} ღამე</b>\n${esc(J.types[g.type].name)} · ${maxGuests(g.type)} სტუმრამდე<strong>${gapPrice(g, 2)} ₾-დან</strong>საუზმით · სანიმუშო ფასი`, 'offer'));
    options([...list.map(g => ({ t: `${J.fmtRange(g.from, g.to)} · ${J.types[g.type].name}`, f: () => pickGap(g) })), ...nav()]);
  }
  function pickGap(g) {
    ctx.gap = g; ctx.from = g.from; ctx.to = g.to; ctx.n = g.n;
    bot('რამდენი სტუმარი?');
    const cap = maxGuests(g.type);
    options([...Array.from({ length: Math.min(cap, 6) }, (_, i) => i + 1).map(n => ({ t: String(n), f: () => gapGuests(n) })), ...nav()]);
  }
  function gapGuests(n) {
    const g = ctx.gap; ctx.g = n;
    const total = gapPrice(g, n), name = J.types[g.type].name;
    ctx.offer = { type: g.type, name, total, note: J.gapDiscount() ? `ფანჯარა −${J.gapDiscount()}%` : 'ფანჯარა' };
    bot(`${J.fmtRange(g.from, g.to)} · ${g.n} ღამე · ${n} სტუმარი\n${esc(name)}<strong>${total} ₾</strong>${J.gapDiscount() ? `ჩვეულებრივ ${J.quote(g.type, g.from, g.to, n)} ₾ · ` : ''}საუზმით`, 'offer');
    options([{ t: 'დაჯავშნა', f: askName }, { t: 'სხვა შეთავაზება', f: deals }, ...nav()]);
  }
  function group() {
    bot('7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ. ამას ვილა ჯიჯი პირადად შეგითანხმებთ.');
    contact(true);
  }
  function askName() { bot('თქვენი სახელი?'); mode = 'name'; setInput('text', 'სახელი'); options(nav()); }
  function askPhone() { bot('ტელეფონის ნომერი, რომ დაგიკავშირდეთ?'); mode = 'phone'; setInput('tel', '+995 5…'); options(nav()); }
  function finish() {
    const parts = ctx.split || [{ from: ctx.from, to: ctx.to, type: ctx.offer.type }];
    const gapNote = !ctx.split && ctx.offer.note;
    parts.forEach(p => J.createRequest({ from: p.from, to: p.to, guests: ctx.g, name: ctx.name, phone: ctx.phone, source: 'chat', type: p.type, ...(gapNote ? { price: ctx.offer.total, note: ctx.offer.note } : {}) }));
    const r = { from: parts[0].from, to: parts[parts.length - 1].to };
    delete ctx.split; delete ctx.gap;
    mode = 'menu'; setInput(null);
    bot(`მოთხოვნა მიღებულია.\n${J.fmtRange(r.from, r.to)} · ${esc(ctx.offer.name)} · ${ctx.offer.total} ₾\n\nვილა ჯიჯი დაგიკავშირდებათ ნომერზე ${esc(ctx.phone)} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.`);
    options(nav());
  }
  function location() {
    bot(`თრიალეთის ქუჩა, ბაკურიანი\nკოხტას საბაგირო 300 მეტრშია, დიდველის საბაგირო 2,9 კმ-ში. მაღაზიები და აფთიაქი ფეხით მისასვლელზეა.\n<a href="${MAP}" target="_blank" rel="noopener">რუკაზე ნახვა</a>`);
    options([{ t: 'თავისუფალი ნომრები', f: askDate }, ...nav()]);
  }
  const FAQ = [
    ['საუზმე შედის?', 'დიახ, საუზმე ფასში შედის.'],
    ['ცხოველით შეიძლება?', 'დიახ, შინაური ცხოველებით მოსვლა შეიძლება. წინასწარ გაგვაფრთხილეთ.'],
    ['პარკინგი გაქვთ?', 'დიახ, პარკინგი უფასოა.'],
    ['აუზი როდის მუშაობს?', 'ღია აუზი სეზონურია, თბილ თვეებში მუშაობს. ზუსტ თარიღებს ვილა ჯიჯი გეტყვით.'],
    ['შესვლის და გასვლის დრო', 'ზუსტ საათებს ჯავშნის დადასტურებისას გეტყვით. მიღება ყოველდღე 10:00–20:00.'],
    ['სკი-პასი და ინვენტარი', 'სკი-პასს ვილა ჯიჯიში იყიდით. საბაგირო ახლოსაა.']
  ];
  function faq() {
    bot('აირჩიეთ კითხვა:');
    options(FAQ.map(([q, a]) => ({ t: q, f: () => { bot(a); options([{ t: 'სხვა კითხვა', f: faq }, { t: 'თავისუფალი ნომრები', f: askDate }, ...nav()]); } })).concat(nav()));
  }
  function contact(silent) {
    if (silent !== true) bot('ვილა ჯიჯის ადმინისტრაცია გიპასუხებთ.');
    bot(`ტელეფონი: ${PHONE}\nყოველდღე 10:00–20:00\n<a href="${WA}" target="_blank" rel="noopener">WhatsApp-ზე მიწერა</a>`);
    options(nav());
  }

  // ---------- typed input ----------
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    if (mode === 'name') { me(v); ctx.name = v; askPhone(); return; }
    if (mode === 'phone') {
      me(v);
      if (v.replace(/\D/g, '').length < 9) { bot('ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.'); setInput('tel', '+995 5…'); return; }
      ctx.phone = v; finish(); return;
    }
    me(v); misses++;
    if (misses >= 2) { misses = 0; bot('ვერ გავიგე. ვილა ჯიჯისთან დაგაკავშირებთ.'); contact(true); }
    else { bot('ვერ გავიგე. აირჩიეთ ერთ-ერთი ღილაკი.'); menu(); }
  });
  // In menu mode a typed message is allowed too (counts as a miss), so keep the input visible there.
  const openChat = () => {
    box.hidden = false; fab.hidden = true;
    if (!started) { started = true; start(); }
  };
  fab.addEventListener('click', openChat);
  box.querySelector('.jc-x').addEventListener('click', () => { box.hidden = true; fab.hidden = false; fab.focus(); });
  window.JIJIChat = { open: openChat };
})();
