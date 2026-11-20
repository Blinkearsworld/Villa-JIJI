// Messenger / Instagram bot texts in Georgian (key), English and Russian.
// Plurals: {n:night|nights} (EN), {n:ночь|ночи|ночей} (RU).

export const LANGS = ['ka', 'en', 'ru'];
export const LANG_NAMES = { ka: 'ქართული', en: 'English', ru: 'Русский' };

const D = { en: {}, ru: {} };
const add = rows => rows.forEach(([ka, en, ru]) => { D.en[ka] = en; D.ru[ka] = ru; });

add([
  // menu
  ['ნომრები და ფასი', 'Rooms and prices', 'Номера и цены'],
  ['მოკლე შეთავაზებები', 'Short-stay deals', 'Короткие предложения'],
  ['სად ვართ', 'Where we are', 'Где мы'],
  ['ხშირი კითხვები', 'FAQ', 'Частые вопросы'],
  ['ადამიანთან საუბარი', 'Talk to a person', 'Связь с человеком'],
  ['მენიუ', 'Menu', 'Меню'],
  ['🌐 English / Русский', '🌐 ქართული / Русский', '🌐 ქართული / English'],
  ['აირჩიეთ ენა:', 'Choose a language:', 'Выберите язык:'],
  ['გამარჯობა! ვილა ჯიჯიში მოგესალმებით.\n', 'Hello! Welcome to Villa JIJI.\n', 'Здравствуйте! Добро пожаловать в Villa JIJI.\n'],
  ['რით დაგეხმაროთ?', 'How can we help?', 'Чем можем помочь?'],
  // dates, nights, guests
  ['შესვლის თარიღი? დაწერეთ ასე: 15.01, ან აირჩიეთ:', 'Check-in date? Write it like 15.01, or choose:', 'Дата заезда? Напишите так: 15.01, или выберите:'],
  ['ეს შაბათი {d}', 'This Sat {d}', 'Эта сб {d}'],
  ['შემდეგი შაბ. {d}', 'Next Sat {d}', 'След. сб {d}'],
  ['რამდენი ღამე? აირჩიეთ ან ჩაწერეთ რიცხვი.', 'How many nights? Choose or type a number.', 'Сколько ночей? Выберите или напишите число.'],
  ['რამდენი სტუმარი?', 'How many guests?', 'Сколько гостей?'],
  ['7 ან მეტი', '7 or more', '7 и больше'],
  ['თარიღი ვერ გავიგე. დაწერეთ ასე: 15.01', 'I didn’t get the date. Write it like 15.01', 'Не понял дату. Напишите так: 15.01'],
  ['ჩაწერეთ ღამეების რაოდენობა 1-დან 30-მდე.', 'Please enter 1 to 30 nights.', 'Укажите от 1 до 30 ночей.'],
  // offers
  ['{d} · {n} ღამე · {g} სტუმარი', '{d} · {n} {n:night|nights} · {g} {g:guest|guests}', '{d} · {n} {n:ночь|ночи|ночей} · {g} {g:гость|гостя|гостей}'],
  ['თავისუფალია: {room}', 'Available: {room}', 'Свободно: {room}'],
  ['დაჯავშნა', 'Book', 'Забронировать'],
  ['სხვა თარიღი', 'Other dates', 'Другие даты'],
  ['ამ პერიოდში ადგილი აღარ გვაქვს. დაგვიკავშირდით და იქნებ მაინც მოგიძებნოთ გამოსავალი.', 'We are full for this period. Contact us and we may still find a solution.', 'На этот период мест нет. Свяжитесь с нами — возможно, найдём решение.'],
  ['{d} ({n} ღამე) მთლიანად თავისუფალი არ გვაქვს, მაგრამ შეგვიძლია შემოგთავაზოთ:', '{d} ({n} {n:night|nights}) is not fully free, but we can offer:', '{d} ({n} {n:ночь|ночи|ночей}) полностью не свободно, но можем предложить:'],
  ['მთელი {n} ღამე, ნომრის ერთი გამოცვლით:', 'all {n} {n:night|nights}, with one room change:', 'все {n} {n:ночь|ночи|ночей}, со сменой номера один раз:'],
  ['მთელი {n} ღამე', 'All {n} {n:night|nights}', 'Все {n} {n:ночь|ночи|ночей}'],
  ['{n} ღამიდან თავისუფალია {k}:', '{k} of {n} {n:night|nights} are free:', 'из {n} {n:ночи|ночей|ночей} свободно {k}:'],
  ['{k} ღამე', '{k} {k:night|nights}', '{k} {k:ночь|ночи|ночей}'],
  ['სრული {n} ღამე სხვა თარიღებში:', 'the full {n} {n:night|nights} on other dates:', 'все {n} {n:ночь|ночи|ночей} в другие даты:'],
  // gaps
  ['ამჟამად მოკლე შეთავაზება არ გვაქვს.', 'No short-stay deals right now.', 'Сейчас коротких предложений нет.'],
  ['{d} · {n} ღამე', '{d} · {n} {n:night|nights}', '{d} · {n} {n:ночь|ночи|ночей}'],
  ['{room}, {g} სტუმრამდე · {p} ₾-დან', '{room}, up to {g} {g:guest|guests} · from {p} ₾', '{room}, до {g} {g:гостя|гостей|гостей} · от {p} ₾'],
  ['ორ ჯავშანს შორის დარჩენილი 1–3 ღამე', '1–3 free nights between two bookings', '1–3 свободные ночи между бронями'],
  [', {d}% ფასდაკლებით', ', {d}% off', ', со скидкой {d}%'],
  [' (ჩვეულებრივ {p} ₾)', ' (usually {p} ₾)', ' (обычно {p} ₾)'],
  ['სხვა შეთავაზება', 'Other deals', 'Другие предложения'],
  // booking
  ['თქვენი სახელი?', 'Your name?', 'Ваше имя?'],
  ['ტელეფონის ნომერი, რომ დაგიკავშირდეთ?', 'Your phone number, so we can contact you?', 'Ваш номер телефона, чтобы мы связались с вами?'],
  ['ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.', 'The number is too short, please enter it in full.', 'Номер слишком короткий, введите его полностью.'],
  ['მოთხოვნა მიღებულია.', 'Request received.', 'Запрос принят.'],
  ['ვილა ჯიჯი დაგიკავშირდებათ ნომერზე {ph} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.', 'Villa JIJI will call you on {ph} to confirm the booking. No payment needed.', 'Villa JIJI свяжется с вами по номеру {ph}, чтобы подтвердить бронь. Оплата не нужна.'],
  // location, faq
  ['თრიალეთის ქუჩა, ბაკურიანი\nკოხტას საბაგირო 300 მეტრშია, დიდველის საბაგირო 2,9 კმ-ში.', 'Trialeti Street, Bakuriani\nThe Kokhta lift is 300 m away, the Didveli lift 2.9 km.', 'улица Триалети, Бакуриани\nПодъёмник Кохта в 300 м, Дидвели в 2,9 км.'],
  ['აირჩიეთ კითხვა:', 'Choose a question:', 'Выберите вопрос:'],
  ['სხვა კითხვა', 'Another question', 'Другой вопрос'],
  ['კვება', 'Meals', 'Питание'],
  ['ვილა ჯიჯიში კვება არ არის, სამაგიეროდ ყველა ნომერს აქვს სამზარეულოს კუთხე. მაღაზიები ფეხით მისასვლელზეა, ბაკურიანში კი ბევრი კაფე და რესტორანია.', 'Villa JIJI does not serve meals, but every room has a kitchenette. Shops are within walking distance, and Bakuriani has plenty of cafés and restaurants.', 'Питания в Villa JIJI нет, зато в каждом номере есть кухонный уголок. Магазины в пешей доступности, а в Бакуриани много кафе и ресторанов.'],
  ['ცხოველით შეიძლება?', 'Pets?', 'С животными?'],
  ['დიახ, შინაური ცხოველებით მოსვლა შეიძლება. წინასწარ გაგვაფრთხილეთ.', 'Yes, pets are welcome. Please let us know in advance.', 'Да, можно с домашними животными. Предупредите нас заранее.'],
  ['პარკინგი', 'Parking', 'Парковка'],
  ['დიახ, პარკინგი უფასოა.', 'Yes, parking is free.', 'Да, парковка бесплатная.'],
  ['აუზი', 'Pool', 'Бассейн'],
  ['ღია აუზი სეზონურია, თბილ თვეებში მუშაობს.', 'The outdoor pool is seasonal and open in the warm months.', 'Открытый бассейн сезонный, работает в тёплые месяцы.'],
  ['შესვლა-გასვლა', 'Check-in/out', 'Заезд/выезд'],
  ['ზუსტ საათებს ჯავშნის დადასტურებისას გეტყვით. მიღება ყოველდღე 10:00–20:00.', 'We’ll tell you the exact times when we confirm the booking. Reception is open daily, 10:00–20:00.', 'Точное время сообщим при подтверждении брони. Ресепшн ежедневно 10:00–20:00.'],
  ['სკი-პასი', 'Ski pass', 'Ски-пасс'],
  ['სკი-პასს ვილა ჯიჯიში იყიდით. კოხტას საბაგირო 300 მეტრშია.', 'You can buy a ski pass at Villa JIJI. The Kokhta lift is 300 m away.', 'Ски-пасс можно купить в Villa JIJI. Подъёмник Кохта в 300 м.'],
  // handoff
  ['ვილა ჯიჯის თანამშრომელი აქვე გიპასუხებთ, დაწერეთ თქვენი კითხვა.', 'A Villa JIJI team member will answer you here. Please write your question.', 'Сотрудник Villa JIJI ответит вам здесь. Напишите ваш вопрос.'],
  ['ახლა სამუშაო საათები არ არის, ვილა ჯიჯის თანამშრომელი დილით 10:00-დან გიპასუხებთ. დაწერეთ თქვენი კითხვა.', 'We are outside working hours now; a Villa JIJI team member will answer from 10:00 in the morning. Please write your question.', 'Сейчас нерабочее время, сотрудник Villa JIJI ответит утром с 10:00. Напишите ваш вопрос.'],
  ['ან დაგვირეკეთ: {ph}\n\nბოტზე დასაბრუნებლად დაწერეთ: მენიუ', 'Or call us: {ph}\n\nTo go back to the bot, type: menu', 'Или позвоните: {ph}\n\nЧтобы вернуться к боту, напишите: меню'],
  ['7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ, ამას ვილა ჯიჯი პირადად შეგითანხმებთ.', 'For 7 or more guests we combine several rooms; Villa JIJI will arrange this with you personally.', 'Для 7 и более гостей объединим несколько номеров, Villa JIJI договорится с вами лично.'],
  ['ვერ გავიგე.', 'Sorry, I didn’t understand.', 'Не понял.'],
  ['ვერ გავიგე. აირჩიეთ ერთ-ერთი:', 'Sorry, I didn’t understand. Please choose one:', 'Не понял. Выберите, пожалуйста:'],
  // room types (default names from the admin panel)
  ['ლუქსი', 'Suite', 'Люкс'],
  ['დუპლექსი', 'Duplex', 'Дуплекс'],
  ['საოჯახო, 1 საძინებლით', 'Family, 1 bedroom', 'Семейный, 1 спальня'],
  ['საოჯახო ბიუჯეტური, 1 საძინებლით', 'Family budget, 1 bedroom', 'Семейный эконом, 1 спальня'],
]);

const plural = (lang, n, forms) => {
  n = Math.abs(+n) || 0;
  if (lang === 'ru') { const a = n % 10, b = n % 100; return forms[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 1 : 2] || forms[forms.length - 1]; }
  return n === 1 ? forms[0] : forms[1] || forms[0];
};
export function tr(lang, ka, vars = {}) {
  let s = lang === 'en' || lang === 'ru' ? (D[lang][ka] ?? ka) : ka;
  s = s.replace(/\{(\w+):([^}]+)\}/g, (_, k, f) => plural(lang, vars[k], f.split('|')));
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

const MONTHS = {
  ka: ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};
export const fmtL = (lang, s) => { const d = new Date(s + 'T00:00:00Z'); return d.getUTCDate() + ' ' + (MONTHS[lang] || MONTHS.ka)[d.getUTCMonth()]; };
export const fmtRangeL = (lang, a, b) => fmtL(lang, a) + ' – ' + fmtL(lang, b);

// Guess the language from the script of a message: Georgian letters, Cyrillic or Latin.
// Georgian written in Latin letters ("gamarjoba") still counts as Georgian.
const KA_LATIN = /\b(gamarjoba|gamarjobat|salami|madloba|nomeri|tavisufali|ra ghirs|rogor|mainteresebs|sastumro|dajavshna)\b/i;
export function detectLang(text) {
  const s = String(text || '');
  if (/[Ⴀ-ჿ]/.test(s)) return 'ka';
  if (/[Ѐ-ӿ]/.test(s)) return 'ru';
  if (KA_LATIN.test(s)) return 'ka';
  if (/[a-z]{2,}/i.test(s)) return 'en';
  return null;
}
