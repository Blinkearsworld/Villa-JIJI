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
    bot('გამარჯობა! Villa JIJI-ში მოგესალმებით.\nთავისუფალ ნომრებს და ფასს წამებში გეტყვით.');
    menu();
  }
  function menu() {
    mode = 'menu'; ctx = {};
    bot('რით დაგეხმაროთ?');
    options([
      { t: 'თავისუფალი ნომრები და ფასი', f: askDate },
      { t: 'სად ვართ', f: location },
      { t: 'ხშირი კითხვები', f: faq },
      { t: 'მფლობელთან დაკავშირება', f: contact }
    ]);
  }
  function nextSat(offsetWeeks = 0) {
    const t = J.today(), d = new Date(t + 'T00:00:00Z'), add = (6 - d.getUTCDay() + 7) % 7;
    return J.addDays(t, add + offsetWeeks * 7);
  }
  function askDate() {
    bot('შესვლის თარიღი? აირჩიეთ კალენდარში ან ღილაკით.');
    mode = 'date'; setInput('date');
    options([
      { t: 'ეს შაბათი, ' + J.fmt(nextSat()), f: () => gotDate(nextSat()) },
      { t: 'შემდეგი შაბათი, ' + J.fmt(nextSat(1)), f: () => gotDate(nextSat(1)) },
      ...nav()
    ]);
  }
  function gotDate(s) {
    if (!s || s < J.today()) { bot('ეს თარიღი უკვე გავიდა, აირჩიეთ სხვა.'); return askDate(); }
    ctx.from = s; setInput(null);
    bot('რამდენი ღამე?');
    options([1, 2, 3, 4, 5, 7].map(n => ({ t: String(n), f: () => { ctx.n = n; askGuests(); } })).concat(nav()));
  }
  function askGuests() {
    bot('რამდენი სტუმარი?');
    options([
      { t: '2', f: () => check(2) }, { t: '3–4', f: () => check(4) }, { t: '5–6', f: () => check(6) },
      { t: '7 ან მეტი', f: group }, ...nav()
    ]);
  }
  function offerHtml(from, to, n, g, o) {
    return `${J.fmtRange(from, to)} · ${n} ღამე · ${g} სტუმარი\nთავისუფალია: ${esc(o.name)} ნომერი<strong>${o.total} ₾</strong>საუზმით · სანიმუშო ფასი`;
  }
  function check(g) {
    ctx.g = g; ctx.to = J.addDays(ctx.from, ctx.n);
    const o = J.findOffer(ctx.from, ctx.to, g);
    if (o) {
      ctx.offer = o;
      bot(offerHtml(ctx.from, ctx.to, ctx.n, g, o), 'offer');
      options([{ t: 'დაჯავშნა', f: askName }, { t: 'სხვა თარიღი', f: askDate }, ...nav()]);
      return;
    }
    const nx = J.nextOffer(ctx.from, ctx.n, g);
    if (nx) {
      bot(`${J.fmtRange(ctx.from, ctx.to)} ${g} სტუმრისთვის ადგილი აღარ გვაქვს.\nუახლოესი თავისუფალი:`);
      bot(offerHtml(nx.from, nx.to, ctx.n, g, nx), 'offer');
      options([
        { t: 'ეს მინდა', f: () => { ctx.from = nx.from; ctx.to = nx.to; ctx.offer = nx; askName(); } },
        { t: 'სხვა თარიღი', f: askDate }, { t: 'მფლობელთან დაკავშირება', f: contact, sub: true }
      ]);
    } else {
      bot('ამ პერიოდში ადგილი აღარ გვაქვს. მფლობელი იქნებ მაინც მოგიძებნოთ გამოსავალი.');
      options([{ t: 'მფლობელთან დაკავშირება', f: contact }, { t: 'სხვა თარიღი', f: askDate }, ...nav()]);
    }
  }
  function group() {
    bot('7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ. ამას მფლობელი პირადად შეგითანხმებთ.');
    contact(true);
  }
  function askName() { bot('თქვენი სახელი?'); mode = 'name'; setInput('text', 'სახელი'); options(nav()); }
  function askPhone() { bot('ტელეფონის ნომერი, რომ მფლობელმა დაგიკავშირდეთ?'); mode = 'phone'; setInput('tel', '+995 5…'); options(nav()); }
  function finish() {
    const r = J.createRequest({ from: ctx.from, to: ctx.to, guests: ctx.g, name: ctx.name, phone: ctx.phone, source: 'chat', type: ctx.offer.type });
    mode = 'menu'; setInput(null);
    bot(`მოთხოვნა მიღებულია.\n${J.fmtRange(r.from, r.to)} · ${esc(ctx.offer.name)} · ${ctx.offer.total} ₾\n\nმფლობელი დაგიკავშირდებათ ნომერზე ${esc(ctx.phone)} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.`);
    options(nav());
  }
  function location() {
    bot(`თრიალეთის ქუჩა, ბაკურიანი\nდიდველის საბაგიროსთან ახლოს, მაღაზიები და აფთიაქი ფეხით მისასვლელზეა.\nბორჯომიდან 18 კმ.\n<a href="${MAP}" target="_blank" rel="noopener">რუკაზე ნახვა</a>`);
    options([{ t: 'თავისუფალი ნომრები', f: askDate }, ...nav()]);
  }
  const FAQ = [
    ['საუზმე შედის?', 'დიახ, საუზმე ფასში შედის.'],
    ['ცხოველით შეიძლება?', 'დიახ, შინაური ცხოველებით მოსვლა შეიძლება. წინასწარ გაგვაფრთხილეთ.'],
    ['პარკინგი გაქვთ?', 'დიახ, პარკინგი უფასოა.'],
    ['აუზი როდის მუშაობს?', 'ღია აუზი სეზონურია, თბილ თვეებში მუშაობს. ზუსტ თარიღებს მფლობელი გეტყვით.'],
    ['შესვლის და გასვლის დრო', 'ზუსტ საათებს ჯავშნის დადასტურებისას მფლობელი გეტყვით. მიღება ყოველდღე 10:00–20:00.'],
    ['სკი-პასი და ინვენტარი', 'სკი-პასს ვილაში იყიდით. საბაგირო ახლოსაა.']
  ];
  function faq() {
    bot('აირჩიეთ კითხვა:');
    options(FAQ.map(([q, a]) => ({ t: q, f: () => { bot(a); options([{ t: 'სხვა კითხვა', f: faq }, { t: 'თავისუფალი ნომრები', f: askDate }, ...nav()]); } })).concat(nav()));
  }
  function contact(silent) {
    if (silent !== true) bot('მფლობელი პირადად გიპასუხებთ.');
    bot(`ტელეფონი: ${PHONE}\nყოველდღე 10:00–20:00\n<a href="${WA}" target="_blank" rel="noopener">WhatsApp-ზე მიწერა</a>`);
    options(nav());
  }

  // ---------- typed input ----------
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim(); if (!v) return;
    if (mode === 'date') { me(J.fmt(v)); opts.innerHTML = ''; gotDate(v); return; }
    if (mode === 'name') { me(v); ctx.name = v; askPhone(); return; }
    if (mode === 'phone') {
      me(v);
      if (v.replace(/\D/g, '').length < 9) { bot('ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.'); setInput('tel', '+995 5…'); return; }
      ctx.phone = v; finish(); return;
    }
    me(v); misses++;
    if (misses >= 2) { misses = 0; bot('ვერ გავიგე. მფლობელთან დაგაკავშირებთ.'); contact(true); }
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
