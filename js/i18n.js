/* Villa JIJI — site languages: Georgian (source), English, Russian.
   Georgian text in the page is the key; EN/RU are looked up by it.
   Plurals: {n:night|nights} (EN), {n:ночь|ночи|ночей} (RU) print the right word for n. */
window.I18N = (() => {
  const LANGS = ['ka', 'en', 'ru'];
  const D = { en: {}, ru: {} };
  const add = rows => rows.forEach(([ka, en, ru]) => { D.en[ka] = en; D.ru[ka] = ru; });

  // ---------- page ----------
  add([
    ['Villa JIJI, მთავარი', 'Villa JIJI, home', 'Villa JIJI, главная'],
    ['მენიუ', 'Menu', 'Меню'],
    ['ნომრები', 'Rooms', 'Номера'],
    ['სივრცეები', 'Spaces', 'Пространства'],
    ['ეზო', 'Grounds', 'Двор'],
    ['ახლოს', 'Nearby', 'Рядом'],
    ['კონტაქტი', 'Contact', 'Контакты'],
    ['სეზონი', 'Season', 'Сезон'],
    ['ზამთარი', 'Winter', 'Зима'],
    ['ზაფხული', 'Summer', 'Лето'],
    ['ენა', 'Language', 'Язык'],
    ['დაჯავშნა', 'Book', 'Забронировать'],
    ['Villa JIJI თოვლიან ღამეს, ანთებული გირლიანდით', 'Villa JIJI on a snowy night, lit with garlands', 'Villa JIJI снежной ночью, в огнях гирлянд'],
    ['ვილა ჯიჯი თოვლიან ღამეს, ანთებული გირლიანდით და საქანელით', 'Villa JIJI on a snowy night, with garlands and a swing', 'Villa JIJI снежной ночью, гирлянды и качели'],
    ['ვილა ჯიჯი და აუზი ზაფხულში', 'Villa JIJI and the pool in summer', 'Villa JIJI и бассейн летом'],
    ['თქვენი საუკეთესო დასვენებისთვის', 'For your best holiday', 'Для вашего лучшего отдыха'],
    ['თავისუფალი ნომრები', 'Free rooms', 'Свободные номера'],
    ['ნომრების ნახვა', 'See the rooms', 'Смотреть номера'],
    ['ვილა ჯიჯის შესახებ', 'About Villa JIJI', 'О Villa JIJI'],
    ['ვილა ჯიჯის ფასადი არყის ფოთლებს მიღმა', 'The Villa JIJI facade behind birch leaves', 'Фасад Villa JIJI за листвой берёз'],
    ['ვილა ჯიჯი თოვლიან დღეს, ქართული დროშით', 'Villa JIJI on a snowy day, with the Georgian flag', 'Villa JIJI в снежный день, с грузинским флагом'],
    ['სასტუმრო ვილა ჯიჯი ბაკურიანში, სადაც დასვენება მარტივია: რვა კომფორტული ნომერი, ბუხრის ოთახი საღამოებისთვის, დიდი ეზო ბავშვებისთვის და კოხტას საბაგირო 300 მეტრში.',
      'Hotel Villa JIJI in Bakuriani, where a holiday is easy: eight comfortable rooms, a fireplace room for the evenings, a big yard for the children and the Kokhta lift 300 metres away.',
      'Отель Villa JIJI в Бакуриани, где отдыхать просто: восемь уютных номеров, каминный зал для вечеров, большой двор для детей и канатная дорога Кохта в 300 метрах.'],
    ['ნომერი', 'rooms', 'номеров'],
    ['სართული', 'floors', 'этажа'],
    ['300 მ', '300 m', '300 м'],
    ['საბაგირომდე', 'to the lift', 'до подъёмника'],
    ['ახალი წელი ვილა ჯიჯიში', 'New Year at Villa JIJI', 'Новый год в Villa JIJI'],
    ['შობა-ახალ წელს ვილა ჯიჯი ერთ დიდ ოჯახად იქცევა: ხაჭაპურსა და ხინკალს ერთად ვაცხობთ და ვახვევთ, სუფრას ბუხართან ვშლით, შუაღამით კი თოვლში ფეიერვერკს ვუყურებთ და კოცონთან ვთბებით.',
      'Over Christmas and New Year, Villa JIJI becomes one big family: we bake khachapuri and fold khinkali together, set the table by the fireplace, and at midnight watch fireworks in the snow and warm up by the bonfire.',
      'На Новый год и Рождество Villa JIJI становится одной большой семьёй: вместе печём хачапури и лепим хинкали, накрываем стол у камина, а в полночь смотрим фейерверк в снегу и греемся у костра.'],
    ['სუფრა ბუხართან', 'Dinner by the fire', 'Застолье у камина'],
    ['ერთად ცხობა', 'Baking together', 'Печём вместе'],
    ['ფეიერვერკი', 'Fireworks', 'Фейерверк'],
    ['კოცონი თოვლში', 'Bonfire in the snow', 'Костёр в снегу'],
    ['ახალი წლის თარიღები', 'New Year dates', 'Даты на Новый год'],
    ['კადრები ვილა ჯიჯის 2021 წლის ახალი წლიდან.', 'Footage from New Year 2021 at Villa JIJI.', 'Кадры с Нового 2021 года в Villa JIJI.'],
    ['ვილა ჯიჯი ახალი წლის ღამეს, სტუმრები აივნებზე სანთლებით', 'Villa JIJI on New Year’s Eve, guests on the balconies with candles', 'Villa JIJI в новогоднюю ночь, гости со свечами на балконах'],
    ['ვიდეოს ჩართვა', 'Play the video', 'Включить видео'],
    ['ვიდეოს ნახვა', 'Watch the video', 'Смотреть видео'],
    ['ზაფხული ვილა ჯიჯიში', 'Summer at Villa JIJI', 'Лето в Villa JIJI'],
    ['ზაფხული ბავშვებისთვის', 'A summer for children', 'Лето для детей'],
    ['ზაფხულში ეზო ბავშვების სამეფოა: აუზი, ბატუტი, საქანელები და საპნის ბუშტების წვეულებები. დიდები ფანჩატურში ისვენებენ, საღამოს კი მაყალი ინთება.',
      'In summer the yard belongs to the children: a pool, a trampoline, swings and bubble parties. Grown-ups relax in the gazebo, and in the evening the barbecue is lit.',
      'Летом двор — царство детей: бассейн, батут, качели и праздники с мыльными пузырями. Взрослые отдыхают в беседке, а вечером разжигается мангал.'],
    ['აუზი', 'Pool', 'Бассейн'],
    ['ბატუტი', 'Trampoline', 'Батут'],
    ['ბავშვთა წვეულებები', 'Kids’ parties', 'Детские праздники'],
    ['მაყალი', 'Barbecue', 'Мангал'],
    ['ზაფხულის თარიღები', 'Summer dates', 'Даты на лето'],
    ['ვილა ჯიჯი ზაფხულის მზეზე, აბრა და აივნები', 'Villa JIJI in the summer sun, sign and balconies', 'Villa JIJI под летним солнцем, вывеска и балконы'],
    ['ზაფხულის ვიდეოს ჩართვა', 'Play the summer video', 'Включить летнее видео'],
    ['ბუხრის ოთახი', 'Fireplace room', 'Каминный зал'],
    ['როცა ტრასიდან ბრუნდებით', 'Back from the slopes', 'Когда возвращаетесь с трассы'],
    ['საღამო ბუხართან', 'Evenings by the fire', 'Вечер у камина'],
    ['ტყავის სავარძლები, ღვინის თაროები და ცოცხალი ცეცხლი. აქ სტუმრები ერთმანეთს ეცნობიან, ჭადრაკს თამაშობენ და ჩაის სვამენ, მეზობელ ოთახში კი ბილიარდი და კინო გელით.',
      'Leather armchairs, wine shelves and a real fire. Here guests get to know each other, play chess and drink tea, and next door billiards and a cinema are waiting.',
      'Кожаные кресла, полки с вином и живой огонь. Здесь гости знакомятся, играют в шахматы и пьют чай, а в соседней комнате ждут бильярд и кино.'],
    ['ცოცხალი ცეცხლი', 'A real fire', 'Живой огонь'],
    ['ღვინის თაროები', 'Wine shelves', 'Полки с вином'],
    ['ტყავის სავარძლები', 'Leather armchairs', 'Кожаные кресла'],
    ['ჭადრაკი', 'Chess', 'Шахматы'],
    ['ლაუნჯი ანთებული ბუხრით და ტყავის დივნებით', 'Lounge with a lit fireplace and leather sofas', 'Лаундж с горящим камином и кожаными диванами'],
    ['ფოტოები', 'Photos', 'Фото'],
    ['ფოტოები, გადაახვიეთ გვერდზე', 'Photos, scroll sideways', 'Фото, листайте в сторону'],
    ['ვილა ჯიჯის აბრა და ჭიშკარი თოვლში', 'The Villa JIJI sign and gate in the snow', 'Вывеска и ворота Villa JIJI в снегу'],
    ['ჭიშკარი', 'The gate', 'Ворота'],
    ['ჩაი აივანზე, თოვს', 'Tea on the balcony while it snows', 'Чай на балконе, идёт снег'],
    ['აივანი', 'Balcony', 'Балкон'],
    ['ღვინო ტერასაზე, განათებული ფასადი', 'Wine on the terrace, the facade lit up', 'Вино на террасе, подсвеченный фасад'],
    ['ღვინო ტერასაზე', 'Wine on the terrace', 'Вино на террасе'],
    ['ფეიერვერკი ვილა ჯიჯის თავზე', 'Fireworks above Villa JIJI', 'Фейерверк над Villa JIJI'],
    ['ახალი წლის სუფრა ბუხართან', 'New Year table by the fireplace', 'Новогодний стол у камина'],
    ['ახალი წლის სუფრა', 'New Year table', 'Новогодний стол'],
    ['ბავშვები აუზში', 'Children in the pool', 'Дети в бассейне'],
    ['საპნის ბუშტების წვეულება ეზოში', 'A bubble party in the yard', 'Праздник мыльных пузырей во дворе'],
    ['ბავშვთა წვეულება', 'Kids’ party', 'Детский праздник'],
    ['ყავა ტერასაზე, ფასადი და ყვავილები', 'Coffee on the terrace, the facade and flowers', 'Кофе на террасе, фасад и цветы'],
    ['დილის ყავა', 'Morning coffee', 'Утренний кофе'],
    ['ოჯახი გაზონზე ვილა ჯიჯის წინ', 'A family on the lawn in front of Villa JIJI', 'Семья на газоне перед Villa JIJI'],
    ['გაზონი', 'Lawn', 'Газон'],
    ['ფანჩატური საქანელით', 'Gazebo with a swing', 'Беседка с качелями'],
    ['ფანჩატური', 'Gazebo', 'Беседка'],
    ['შიდა სივრცეები', 'Inside', 'Внутри'],
    ['ნომრების გარდა სტუმრებს სამი საერთო სივრცე აქვთ: ბუხრის ოთახი, თამაშების და კინოს ოთახი, და ლაუნჯი ბარით.',
      'Besides the rooms, guests share three spaces: the fireplace room, the games and cinema room, and the lounge with a bar.',
      'Кроме номеров, у гостей есть три общих пространства: каминный зал, комната игр и кино и лаундж с баром.'],
    ['თამაშების ოთახი ბილიარდით და დიდი ეკრანით', 'Games room with billiards and a big screen', 'Игровая комната с бильярдом и большим экраном'],
    ['თამაშების ოთახი', 'Games room', 'Игровая комната'],
    ['ბილიარდი, დიდი ეკრანი და ხმის სისტემა', 'Billiards, a big screen and a sound system', 'Бильярд, большой экран и аудиосистема'],
    ['კინოს კუთხე დივნით, ბუხრით და პროექტორით', 'Cinema corner with a sofa, fireplace and projector', 'Кинозона с диваном, камином и проектором'],
    ['კინოღამეები', 'Movie nights', 'Киновечера'],
    ['პროექტორი, რბილი დივანი და ბუხარი', 'A projector, a soft sofa and a fireplace', 'Проектор, мягкий диван и камин'],
    ['ლაუნჯი დივნებით, ბარის დახლით და სასადილო მაგიდებით', 'Lounge with sofas, a bar counter and dining tables', 'Лаундж с диванами, барной стойкой и обеденными столами'],
    ['ლაუნჯი და ბარი', 'Lounge and bar', 'Лаундж и бар'],
    ['ბარის დახლი, ტელევიზორი, ჭადრაკი', 'Bar counter, TV, chess', 'Барная стойка, телевизор, шахматы'],
    ['სასადილო სივრცე და დივნები გიტარით', 'Dining area and sofas with a guitar', 'Обеденная зона и диваны с гитарой'],
    ['სასადილო სივრცე', 'Dining area', 'Обеденная зона'],
    ['აქ ისაუზმებთ და ერთად ივახშმებთ', 'Breakfast here, and dinners together', 'Здесь завтраки и общие ужины'],
    ['ვილა ჯიჯის ეზო: გაზონი, სკამები, საქანელა და აუზი', 'The Villa JIJI yard: lawn, benches, a swing and the pool', 'Двор Villa JIJI: газон, скамейки, качели и бассейн'],
    ['ეზო თოვლში, საქანელა და განათებული ფასადი', 'The yard in snow, a swing and the lit facade', 'Двор в снегу, качели и подсвеченный фасад'],
    ['ზამთარში ეზოს თოვლი ფარავს: ბავშვები თოვლის კაცს აკეთებენ, საღამოს კი კოცონს ვანთებთ და ახალ წელს ფეიერვერკით ვხვდებით.',
      'In winter snow covers the yard: children build snowmen, in the evening we light a bonfire, and we see in the New Year with fireworks.',
      'Зимой двор укрыт снегом: дети лепят снеговиков, вечером мы разжигаем костёр, а Новый год встречаем фейерверком.'],
    ['ხის ღობით შემოსაზღვრული საკუთარი ეზო ტყიანი მთის ხედით. ბავშვები უსაფრთხოდ თამაშობენ, დიდები ქოლგის ქვეშ ან შეზლონგზე ისვენებენ.',
      'A private yard behind a wooden fence, with a view of the forested mountains. Children play safely, grown-ups rest under an umbrella or on a sun lounger.',
      'Собственный двор за деревянным забором с видом на лесистые горы. Дети играют в безопасности, взрослые отдыхают под зонтом или на шезлонге.'],
    ['მწვანე გაზონი, თუჯის სკამები და ხის შეზლონგები', 'A green lawn, cast-iron benches and wooden loungers', 'Зелёный газон, чугунные скамейки и деревянные шезлонги'],
    ['საბავშვო მოედანი: სასრიალო, საქანელები და ბატუტი', 'Playground: slide, swings and trampoline', 'Детская площадка: горка, качели и батут'],
    ['ქვით მოპირკეთებული ტერასა აუზით და შეზლონგებით', 'A stone terrace with the pool and loungers', 'Каменная терраса с бассейном и шезлонгами'],
    ['ფანჩატური საქანელით და მაგიდები ქოლგის ქვეშ', 'A gazebo with a swing and tables under umbrellas', 'Беседка с качелями и столики под зонтами'],
    ['მაყალი და უფასო პარკინგი', 'Barbecue and free parking', 'Мангал и бесплатная парковка'],
    ['თოვლიანი ეზო: თოვლის კაცი, ციგა და გუნდაობა', 'A snowy yard: snowmen, sledges and snowball fights', 'Снежный двор: снеговики, санки и игра в снежки'],
    ['კოცონი ეზოში და ცხელი ღვინო ტერასაზე', 'A bonfire in the yard and mulled wine on the terrace', 'Костёр во дворе и глинтвейн на террасе'],
    ['ფარნები და გირლიანდა სახლზე ყოველ საღამოს', 'Lanterns and garlands on the house every evening', 'Фонари и гирлянды на доме каждый вечер'],
    ['გაწმენდილი ბილიკები და უფასო პარკინგი', 'Cleared paths and free parking', 'Расчищенные дорожки и бесплатная парковка'],
    ['ქვის ტერასა აუზით და შეზლონგებით', 'Stone terrace with the pool and loungers', 'Каменная терраса с бассейном и шезлонгами'],
    ['ვილა ჯიჯი თოვლიან ღამეს', 'Villa JIJI on a snowy night', 'Villa JIJI снежной ночью'],
    ['ფასადი ღამით', 'The facade at night', 'Фасад ночью'],
    ['ტერასა და აუზი', 'Terrace and pool', 'Терраса и бассейн'],
    ['ბატუტი და საბავშვო მოედანი', 'Trampoline and playground', 'Батут и детская площадка'],
    ['ჭიშკარი და ფარნები თოვლიან ღამეს', 'The gate and lanterns on a snowy night', 'Ворота и фонари снежной ночью'],
    ['ჭიშკარი ღამით', 'The gate at night', 'Ворота ночью'],
    ['სასრიალო და საქანელები', 'Slide and swings', 'Горка и качели'],
    ['საბავშვო მოედანი თოვლში', 'The playground in snow', 'Детская площадка в снегу'],
    ['საბავშვო მოედანი', 'Playground', 'Детская площадка'],
    ['მაგიდა ქოლგის ქვეშ და ფანჩატური', 'A table under an umbrella and the gazebo', 'Столик под зонтом и беседка'],
    ['კოცონი თოვლიან ეზოში', 'A bonfire in the snowy yard', 'Костёр в снежном дворе'],
    ['კოცონი', 'Bonfire', 'Костёр'],
    ['ქოლგა და ფანჩატური', 'Umbrella and gazebo', 'Зонт и беседка'],
    ['ეზო აივნიდან: სკამები, საქანელა და ქვის ტერასა', 'The yard from the balcony: benches, a swing and the stone terrace', 'Двор с балкона: скамейки, качели и каменная терраса'],
    ['ეზო თოვლიან ღამეს', 'The yard on a snowy night', 'Двор снежной ночью'],
    ['ეზო ღამით', 'The yard at night', 'Двор ночью'],
    ['ეზო აივნიდან', 'The yard from the balcony', 'Двор с балкона'],
    ['რა არის ახლოს', 'What’s nearby', 'Что рядом'],
    ['ვილა ჯიჯი თრიალეთის ქუჩაზე დგას. მაღაზიები და აფთიაქი ფეხით მისასვლელ მანძილზეა.',
      'Villa JIJI stands on Trialeti Street. Shops and a pharmacy are within walking distance.',
      'Villa JIJI стоит на улице Триалети. Магазины и аптека — в пешей доступности.'],
    ['საბაგირო კოხტაზე', 'Kokhta lift', 'Подъёмник на Кохту'],
    ['გონდოლა და სათხილამურო ფერდობი', 'Gondola and ski slope', 'Гондола и горнолыжный склон'],
    ['გონდოლა ხედით მთელ ბაკურიანზე', 'A gondola with views over all of Bakuriani', 'Гондола с видом на весь Бакуриани'],
    ['გონდოლა მთის ფერდობზე, ზამთარში სათხილამუროდ', 'A gondola up the mountainside, for skiing in winter', 'Гондола на склон горы, зимой для катания'],
    ['ბაკურიანის გასართობი პარკი', 'Bakuriani amusement park', 'Парк развлечений Бакуриани'],
    ['სასრიალო, ციგები და კაფეები', 'Skating rink, sledges and cafés', 'Каток, санки и кафе'],
    ['საბავშვო მოედნები, ატრაქციონები, კაფეები', 'Playgrounds, rides, cafés', 'Детские площадки, аттракционы, кафе'],
    ['საბავშვო მოედნები, კაფეები, ზამთარში სასრიალო', 'Playgrounds, cafés, a skating rink in winter', 'Детские площадки, кафе, зимой каток'],
    ['1,8 კმ', '1.8 km', '1,8 км'],
    ['რკინიგზის სადგური', 'Railway station', 'Железнодорожная станция'],
    ['ვიწროლიანდაგიანი "კუკუშკა" ბორჯომისკენ', 'The narrow-gauge “Kukushka” train', 'Узкоколейная «Кукушка»'],
    ['2,6 კმ', '2.6 km', '2,6 км'],
    ['დიდველის საბაგირო', 'Didveli lift', 'Подъёмник Дидвели'],
    ['ბაკურიანის მთავარი სათხილამურო ზონა', 'Bakuriani’s main ski area', 'Главная горнолыжная зона Бакуриани'],
    ['საბაგირო, ტობოგანი და პანორამა', 'Lift, toboggan and panorama', 'Подъёмник, тобогган и панорама'],
    ['ბაკურიანის მთავარი სათხილამურო ზონა, ზაფხულში ტობოგანი', 'Bakuriani’s main ski area, a toboggan in summer', 'Главная горнолыжная зона Бакуриани, летом тобогган'],
    ['2,9 კმ', '2.9 km', '2,9 км'],
    ['ალპური ბოტანიკური ბაღი', 'Alpine Botanical Garden', 'Альпийский ботанический сад'],
    ['თოვლიანი ფიჭვის ტყე', 'A snowy pine forest', 'Заснеженный сосновый лес'],
    ['ფიჭვისა და ნაძვის ტყე, ჩანჩქერი', 'Pine and spruce forest, a waterfall', 'Сосновый и еловый лес, водопад'],
    ['კოხტა-მითარბი', 'Kokhta-Mitarbi', 'Кохта-Митарби'],
    ['გრძელი ტრასები გამოცდილი მოთხილამურეებისთვის', 'Long runs for experienced skiers', 'Длинные трассы для опытных лыжников'],
    ['ღია საბაგიროები და ხედები მთიდან', 'Open lifts and mountain views', 'Открытые подъёмники и виды с гор'],
    ['3,7 კმ', '3.7 km', '3,7 км'],
    ['მანძილი ვილა ჯიჯიდან პირდაპირ ხაზზეა დათვლილი, გზით ცოტა მეტი იქნება.', 'Distances from Villa JIJI are in a straight line; by road it is a little more.', 'Расстояния от Villa JIJI по прямой; по дороге чуть больше.'],
    ['ყველა ნომერი თბილია, აივნითა და ტელევიზორით. საუზმე ფასში შედის, ზუსტ ფასს თარიღის მიხედვით გეტყვით.',
      'Every room is warm, with a balcony and a TV. Breakfast is included; we will give you the exact price for your dates.',
      'Все номера тёплые, с балконом и телевизором. Завтрак включён, точную цену назовём по вашим датам.'],
    ['ფასები და ნომრების რაოდენობა სანიმუშოა, ზუსტს ვილა ჯიჯი დააზუსტებს.', 'Prices are indicative; Villa JIJI will confirm the exact price.', 'Цены ориентировочные, точную стоимость подтвердит Villa JIJI.'],
    ['მოგვწერეთ თარიღი, დანარჩენს ჩვენ მოვაგვარებთ', 'Send us your dates, we’ll take care of the rest', 'Напишите даты, остальное мы возьмём на себя'],
    ['მისამართი', 'Address', 'Адрес'],
    ['თრიალეთის ქუჩა, ბაკურიანი', 'Trialeti Street, Bakuriani', 'улица Триалети, Бакуриани'],
    ['მიღება', 'Reception', 'Ресепшн'],
    ['ყოველდღე, 10:00–20:00', 'Daily, 10:00–20:00', 'Ежедневно, 10:00–20:00'],
    ['ტელეფონი', 'Phone', 'Телефон'],
    ['შესვლა', 'Check-in', 'Заезд'],
    ['გასვლა', 'Check-out', 'Выезд'],
    ['სტუმრები', 'Guests', 'Гости'],
    ['სახელი', 'Name', 'Имя'],
    ['მოთხოვნის გაგზავნა', 'Send request', 'Отправить запрос'],
    ['გადახდა არ არის საჭირო. ჯავშანს ვილა ჯიჯი დაგიდასტურებთ ზარით.', 'No payment needed. Villa JIJI will confirm your booking by phone.', 'Оплата не нужна. Villa JIJI подтвердит бронь по телефону.'],
    ['ბაკურიანი, თრიალეთის ქუჩა ·', 'Bakuriani, Trialeti Street ·', 'Бакуриани, улица Триалети ·'],
    ['ადმინისტრაცია', 'Administration', 'Администрация'],
    ['Villa JIJI — სასტუმრო ბაკურიანში', 'Villa JIJI — hotel in Bakuriani', 'Villa JIJI — отель в Бакуриани'],
  ]);

  // ---------- room types (names are set in the admin panel; the defaults are translated) ----------
  add([
    ['ლუქსი', 'Suite', 'Люкс'],
    ['დუპლექსი', 'Duplex', 'Дуплекс'],
    ['საოჯახო, 1 საძინებლით', 'Family, 1 bedroom', 'Семейный, 1 спальня'],
    ['საოჯახო ბიუჯეტური, 1 საძინებლით', 'Family budget, 1 bedroom', 'Семейный эконом, 1 спальня'],
    ['1 საძინებელი', '1 bedroom', '1 спальня'],
    ['მისაღები დივნით, მანსარდაში', 'Living room with a sofa, in the attic', 'Гостиная с диваном, в мансарде'],
    ['სამზარეულოს კუთხე', 'Kitchenette', 'Кухонный уголок'],
    ['აივანი მთის ხედით', 'Balcony with mountain view', 'Балкон с видом на горы'],
    ['აივანი ეზოს ხედით', 'Balcony overlooking the yard', 'Балкон с видом во двор'],
    ['საშხაპე', 'Shower', 'Душ'],
    ['საშხაპე, თმის საშრობი', 'Shower, hairdryer', 'Душ, фен'],
    ['ტელევიზორი', 'TV', 'Телевизор'],
    ['საუზმე ფასში', 'Breakfast included', 'Завтрак включён'],
    ['ორსართულიანი', 'Two levels', 'Двухуровневый'],
    ['2 საძინებელი', '2 bedrooms', '2 спальни'],
    ['მანსარდა სახურავის ფანჯრით', 'Attic with a roof window', 'Мансарда с мансардным окном'],
    ['მაღალი ჭერი მისაღებში', 'High ceiling in the living room', 'Высокий потолок в гостиной'],
    ['მისაღები ორსართულიანი საწოლით', 'Living room with a bunk bed', 'Гостиная с двухъярусной кроватью'],
    ['2 იზოლირებული საძინებელი', '2 separate bedrooms', '2 изолированные спальни'],
    ['მისაღები დივნით', 'Living room with a sofa', 'Гостиная с диваном'],
    ['ხელმისაწვდომი ვარიანტი ოჯახისთვის: საძინებელი აივნით, მყუდრო მისაღები ხის ჭერით და სამზარეულოს კუთხე.',
      'An affordable choice for a family: a bedroom with a balcony, a cosy living room with a wooden ceiling and a kitchenette.',
      'Доступный вариант для семьи: спальня с балконом, уютная гостиная с деревянным потолком и кухонный уголок.'],
    ['ორი დუპლექსი, თითო ორ დონეზე გაშლილი ბინა: ქვემოთ მისაღები მაღალი ხის ჭერით, სამზარეულო და საძინებელი აივნით, კიბით კი მანსარდაში ახვალთ, სადაც საწოლი და დივანია სახურავის ფანჯრის ქვეშ.',
      'Two duplexes, each an apartment on two levels: downstairs a living room with a high wooden ceiling, a kitchen and a bedroom with a balcony; stairs lead up to the attic, with a bed and a sofa under the roof window.',
      'Два дуплекса, каждый — квартира на двух уровнях: внизу гостиная с высоким деревянным потолком, кухня и спальня с балконом, а по лестнице — мансарда с кроватью и диваном под мансардным окном.'],
    ['ორი ერთნაირი ლუქსი, თითო ცალკე ბინასავით: ორი იზოლირებული საძინებელი, მისაღები სამზარეულოს კუთხით (ინდუქციური ქურა, მიკროტალღური, მაცივარი, ჩაიდანი) და აივანი.',
      'Two identical suites, each like its own apartment: two separate bedrooms, a living room with a kitchenette (induction hob, microwave, fridge, kettle) and a balcony.',
      'Два одинаковых люкса, каждый как отдельная квартира: две изолированные спальни, гостиная с кухонным уголком (индукционная плита, микроволновка, холодильник, чайник) и балкон.'],
    ['ოჯახისთვის ბავშვებით: ცალკე საძინებელი მშობლებისთვის, მისაღებში კი ორსართულიანი საწოლი, სასადილო მაგიდა და სამზარეულოს კუთხე.',
      'For a family with children: a separate bedroom for the parents, and in the living room a bunk bed, a dining table and a kitchenette.',
      'Для семьи с детьми: отдельная спальня для родителей, а в гостиной двухъярусная кровать, обеденный стол и кухонный уголок.'],
    ['დიდი ოჯახის ან ჯგუფისთვის, ერთად დასასვენებლად.', 'For a big family or a group holidaying together.', 'Для большой семьи или компании.'],
    ['{name} ნომერი, ფოტო {i}', '{name} room, photo {i}', 'Номер «{name}», фото {i}'],
    ['ნომრის ფოტოები მალე დაემატება', 'Room photos coming soon', 'Фото номера скоро появятся'],
    ['{n} სტუმარი', '{n} {n:guest|guests}', '{n} {n:гость|гостя|гостей}'],
    ['{n} ნომერი', '{n} {n:room|rooms}', '{n} {n:номер|номера|номеров}'],
    ['სტუმ.', '{n:guest|guests}', '{n:гость|гостя|гостей}'],
    ['{p} ₾-დან', 'from {p} ₾', 'от {p} ₾'],
    ['ღამე <b>{p} ₾</b>-დან', 'from <b>{p} ₾</b> a night', 'от <b>{p} ₾</b> за ночь'],
    ['თავისუფალია?', 'Is it free?', 'Свободно?'],
  ]);

  // ---------- booking form ----------
  add([
    ['აირჩიეთ შესვლისა და გასვლის თარიღი.', 'Choose check-in and check-out dates.', 'Выберите даты заезда и выезда.'],
    ['ჩაწერეთ სახელი და ტელეფონის სრული ნომერი.', 'Enter your name and full phone number.', 'Укажите имя и полный номер телефона.'],
    ['7 და მეტი სტუმრისთვის დაგვირეკეთ: 596 90 40 60.', 'For 7 or more guests, please call us: +995 596 90 40 60.', 'Для 7 и более гостей позвоните нам: +995 596 90 40 60.'],
    ['მთელი {n} ღამე შესაძლებელია ნომრის ერთი გამოცვლით ({p} ₾)', 'all {n} {n:night|nights} with one room change ({p} ₾)', 'все {n} {n:ночь|ночи|ночей} со сменой номера один раз ({p} ₾)'],
    ['{n} ღამიდან თავისუფალია {k}: {d} ({p} ₾)', '{k} of {n} {n:night|nights} are free: {d} ({p} ₾)', 'из {n} {n:ночи|ночей|ночей} свободно {k}: {d} ({p} ₾)'],
    ['სრული {n} ღამე: {d}', 'the full {n} {n:night|nights}: {d}', 'все {n} {n:ночь|ночи|ночей}: {d}'],
    ['ეს თარიღები მთლიანად თავისუფალი არ არის. შეგვიძლია შემოგთავაზოთ: {tips}. დეტალურად ჩატბოტი გაჩვენებთ.',
      'These dates are not fully free. We can offer: {tips}. The chat assistant will show you the details.',
      'Эти даты свободны не полностью. Можем предложить: {tips}. Подробности покажет чат-помощник.'],
    ['ამ თარიღებზე ადგილი აღარ გვაქვს. დაგვირეკეთ: 596 90 40 60.', 'We are full on these dates. Call us: +995 596 90 40 60.', 'На эти даты мест нет. Позвоните нам: +995 596 90 40 60.'],
    ['მოთხოვნა მიღებულია: {d}, {n} ღამე, {room} ნომერი {g} სტუმარზე, {p} ₾ (სანიმუშო ფასი). ვილა ჯიჯი დაგიკავშირდებათ.',
      'Request received: {d}, {n} {n:night|nights}, {room} for {g} {g:guest|guests}, {p} ₾ (indicative price). Villa JIJI will contact you.',
      'Запрос принят: {d}, {n} {n:ночь|ночи|ночей}, номер «{room}» на {g} {g:гостя|гостей|гостей}, {p} ₾ (ориентировочная цена). Villa JIJI свяжется с вами.'],
  ]);

  // ---------- chat assistant ----------
  add([
    ['ავტომატური ასისტენტი', 'Automatic assistant', 'Автоматический помощник'],
    ['Villa JIJI ჩატი', 'Villa JIJI chat', 'Чат Villa JIJI'],
    ['ჩატის დახურვა', 'Close chat', 'Закрыть чат'],
    ['პასუხი', 'Answer', 'Ответ'],
    ['გაგზავნა', 'Send', 'Отправить'],
    ['წერს…', 'typing…', 'печатает…'],
    ['მენიუ', 'Menu', 'Меню'],
    ['გამარჯობა! ვილა ჯიჯიში მოგესალმებით.\nთავისუფალ ნომრებს და ფასს წამებში გეტყვით.', 'Hello! Welcome to Villa JIJI.\nWe’ll show you free rooms and prices in seconds.', 'Здравствуйте! Добро пожаловать в Villa JIJI.\nПокажем свободные номера и цены за секунды.'],
    ['რით დაგეხმაროთ?', 'How can we help?', 'Чем можем помочь?'],
    ['თავისუფალი ნომრები და ფასი', 'Free rooms and prices', 'Свободные номера и цены'],
    ['მოკლე შეთავაზებები (1–3 ღამე)', 'Short-stay deals (1–3 nights)', 'Короткие предложения (1–3 ночи)'],
    ['სად ვართ', 'Where we are', 'Где мы находимся'],
    ['ხშირი კითხვები', 'FAQ', 'Частые вопросы'],
    ['ვილა ჯიჯისთან დაკავშირება', 'Contact Villa JIJI', 'Связаться с Villa JIJI'],
    ['აირჩიეთ შესვლისა და გასვლის დღეები კალენდარში.', 'Pick your check-in and check-out days in the calendar.', 'Выберите в календаре дни заезда и выезда.'],
    ['შესვლის დღე', 'Check-in day', 'День заезда'],
    ['ახლა გასვლის დღე', 'Now the check-out day', 'Теперь день выезда'],
    ['{d} · {n} ღამე', '{d} · {n} {n:night|nights}', '{d} · {n} {n:ночь|ночи|ночей}'],
    ['წინა თვე', 'Previous month', 'Предыдущий месяц'],
    ['შემდეგი თვე', 'Next month', 'Следующий месяц'],
    ['გაგრძელება', 'Continue', 'Продолжить'],
    ['რამდენი სტუმარი?', 'How many guests?', 'Сколько гостей?'],
    ['7 ან მეტი', '7 or more', '7 и больше'],
    ['{d} · {n} ღამე · {g} სტუმარი', '{d} · {n} {n:night|nights} · {g} {g:guest|guests}', '{d} · {n} {n:ночь|ночи|ночей} · {g} {g:гость|гостя|гостей}'],
    ['თავისუფალია: {room} ნომერი', 'Available: {room}', 'Свободен номер: {room}'],
    ['საუზმით · სანიმუშო ფასი', 'with breakfast · indicative price', 'с завтраком · ориентировочная цена'],
    ['საუზმით', 'with breakfast', 'с завтраком'],
    ['სხვა თარიღი', 'Other dates', 'Другие даты'],
    ['ამ პერიოდში ადგილი აღარ გვაქვს. დაგვიკავშირდით და იქნებ მაინც მოგიძებნოთ გამოსავალი.', 'We are full for this period. Contact us and we may still find a solution.', 'На этот период мест нет. Свяжитесь с нами — возможно, найдём решение.'],
    ['{d} ({n} ღამე) {g} სტუმრისთვის მთლიანად თავისუფალი არ გვაქვს, მაგრამ შეგვიძლია შემოგთავაზოთ:', '{d} ({n} {n:night|nights}) for {g} {g:guest|guests} is not fully free, but we can offer:', '{d} ({n} {n:ночь|ночи|ночей}) на {g} {g:гостя|гостей|гостей} полностью не свободно, но можем предложить:'],
    ['მთელი {n} ღამე, ნომრის ერთი გამოცვლით', 'All {n} {n:night|nights}, with one room change', 'Все {n} {n:ночь|ночи|ночей}, со сменой номера один раз'],
    ['მთელი {n} ღამე', 'All {n} {n:night|nights}', 'Все {n} {n:ночь|ночи|ночей}'],
    ['{n} ღამიდან {k} ღამე თავისუფალია', '{k} of {n} {n:night|nights} are free', 'Из {n} {n:ночи|ночей|ночей} свободно {k}'],
    ['{k} ღამე: {d}', '{k} {k:night|nights}: {d}', '{k} {k:ночь|ночи|ночей}: {d}'],
    ['სრული {n} ღამე სხვა თარიღებში', 'The full {n} {n:night|nights} on other dates', 'Все {n} {n:ночь|ночи|ночей} в другие даты'],
    ['დაკავშირება', 'Contact', 'Связаться'],
    ['ამჟამად მოკლე შეთავაზება არ გვაქვს. ნახეთ თავისუფალი თარიღები კალენდარში.', 'No short-stay deals right now. See free dates in the calendar.', 'Сейчас коротких предложений нет. Посмотрите свободные даты в календаре.'],
    ['ორ ჯავშანს შორის დარჩენილი 1–3 ღამე', '1–3 free nights between two bookings', '1–3 свободные ночи между бронями'],
    [', <b>{d}% ფასდაკლებით</b>', ', <b>{d}% off</b>', ', <b>со скидкой {d}%</b>'],
    ['{room} · {g} სტუმრამდე', '{room} · up to {g} {g:guest|guests}', '{room} · до {g} {g:гостя|гостей|гостей}'],
    ['ჩვეულებრივ {p} ₾ · ', 'usually {p} ₾ · ', 'обычно {p} ₾ · '],
    ['სხვა შეთავაზება', 'Other deals', 'Другие предложения'],
    ['7 და მეტი სტუმრისთვის რამდენიმე ნომერს გავაერთიანებთ. ამას ვილა ჯიჯი პირადად შეგითანხმებთ.', 'For 7 or more guests we combine several rooms. Villa JIJI will arrange this with you personally.', 'Для 7 и более гостей объединим несколько номеров. Villa JIJI договорится с вами лично.'],
    ['თქვენი სახელი?', 'Your name?', 'Ваше имя?'],
    ['ტელეფონის ნომერი, რომ დაგიკავშირდეთ?', 'Your phone number, so we can contact you?', 'Ваш номер телефона, чтобы мы связались с вами?'],
    ['მოთხოვნა მიღებულია.', 'Request received.', 'Запрос принят.'],
    ['ვილა ჯიჯი დაგიკავშირდებათ ნომერზე {ph} ჯავშნის დასადასტურებლად. გადახდა საჭირო არ არის.', 'Villa JIJI will call you on {ph} to confirm the booking. No payment needed.', 'Villa JIJI свяжется с вами по номеру {ph}, чтобы подтвердить бронь. Оплата не нужна.'],
    ['კოხტას საბაგირო 300 მეტრშია, დიდველის საბაგირო 2,9 კმ-ში. მაღაზიები და აფთიაქი ფეხით მისასვლელზეა.', 'The Kokhta lift is 300 m away, the Didveli lift 2.9 km. Shops and a pharmacy are within walking distance.', 'Подъёмник Кохта в 300 м, Дидвели в 2,9 км. Магазины и аптека в пешей доступности.'],
    ['რუკაზე ნახვა', 'View on the map', 'Открыть на карте'],
    ['საუზმე შედის?', 'Is breakfast included?', 'Завтрак включён?'],
    ['დიახ, საუზმე ფასში შედის.', 'Yes, breakfast is included in the price.', 'Да, завтрак включён в стоимость.'],
    ['ცხოველით შეიძლება?', 'Can I bring a pet?', 'Можно с животными?'],
    ['დიახ, შინაური ცხოველებით მოსვლა შეიძლება. წინასწარ გაგვაფრთხილეთ.', 'Yes, pets are welcome. Please let us know in advance.', 'Да, можно с домашними животными. Предупредите нас заранее.'],
    ['პარკინგი გაქვთ?', 'Do you have parking?', 'Есть парковка?'],
    ['დიახ, პარკინგი უფასოა.', 'Yes, parking is free.', 'Да, парковка бесплатная.'],
    ['აუზი როდის მუშაობს?', 'When is the pool open?', 'Когда работает бассейн?'],
    ['ღია აუზი სეზონურია, თბილ თვეებში მუშაობს. ზუსტ თარიღებს ვილა ჯიჯი გეტყვით.', 'The outdoor pool is seasonal and open in the warm months. Villa JIJI will tell you the exact dates.', 'Открытый бассейн сезонный, работает в тёплые месяцы. Точные даты подскажет Villa JIJI.'],
    ['შესვლის და გასვლის დრო', 'Check-in and check-out times', 'Время заезда и выезда'],
    ['ზუსტ საათებს ჯავშნის დადასტურებისას გეტყვით. მიღება ყოველდღე 10:00–20:00.', 'We’ll tell you the exact times when we confirm the booking. Reception is open daily, 10:00–20:00.', 'Точное время сообщим при подтверждении брони. Ресепшн ежедневно 10:00–20:00.'],
    ['სკი-პასი და ინვენტარი', 'Ski pass and equipment', 'Ски-пасс и снаряжение'],
    ['სკი-პასს ვილა ჯიჯიში იყიდით. საბაგირო ახლოსაა.', 'You can buy a ski pass at Villa JIJI. The lift is close by.', 'Ски-пасс можно купить в Villa JIJI. Подъёмник рядом.'],
    ['აირჩიეთ კითხვა:', 'Choose a question:', 'Выберите вопрос:'],
    ['სხვა კითხვა', 'Another question', 'Другой вопрос'],
    ['ვილა ჯიჯის ადმინისტრაცია გიპასუხებთ.', 'The Villa JIJI team will answer you.', 'Вам ответит администрация Villa JIJI.'],
    ['ტელეფონი: {ph}\nყოველდღე 10:00–20:00', 'Phone: {ph}\nDaily 10:00–20:00', 'Телефон: {ph}\nЕжедневно 10:00–20:00'],
    ['WhatsApp-ზე მიწერა', 'Message on WhatsApp', 'Написать в WhatsApp'],
    ['ნომერი მოკლეა, გთხოვთ სრულად ჩაწეროთ.', 'The number is too short, please enter it in full.', 'Номер слишком короткий, введите его полностью.'],
    ['ვერ გავიგე. ვილა ჯიჯისთან დაგაკავშირებთ.', 'Sorry, I didn’t understand. Let me connect you with Villa JIJI.', 'Не понял. Соединю вас с Villa JIJI.'],
    ['ვერ გავიგე. აირჩიეთ ერთ-ერთი ღილაკი.', 'Sorry, I didn’t understand. Please choose one of the buttons.', 'Не понял. Выберите, пожалуйста, одну из кнопок.'],
  ]);

  const MONTHS_FULL = {
    ka: ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
  };
  const WEEK = { ka: ['ორ', 'სმ', 'ოთ', 'ხთ', 'პრ', 'შბ', 'კვ'], en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] };

  // ---------- language choice: link (?lang=) > saved choice > Russian-speaking browser > Georgian ----------
  const pick = () => {
    try { const q = new URLSearchParams(location.search).get('lang'); if (LANGS.includes(q)) return q; } catch (e) {}
    try { const s = localStorage.getItem('jiji-lang'); if (LANGS.includes(s)) return s; } catch (e) {}
    const nav = (navigator.languages || [navigator.language || '']).map(x => String(x).slice(0, 2).toLowerCase());
    if (nav.includes('ka')) return 'ka';
    if (['ru', 'uk', 'be', 'kk', 'hy', 'az'].includes(nav[0])) return 'ru';
    return 'ka';
  };
  let lang = pick();

  const plural = (n, forms) => {
    n = Math.abs(+n) || 0;
    if (lang === 'ru') { const a = n % 10, b = n % 100; return forms[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 1 : 2] || forms[forms.length - 1]; }
    return n === 1 ? forms[0] : forms[1] || forms[0];
  };
  function t(ka, vars = {}) {
    let s = lang === 'ka' ? ka : (D[lang][ka] ?? ka);
    s = s.replace(/\{(\w+):([^}]+)\}/g, (_, k, f) => plural(vars[k], f.split('|')));
    return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }

  // ---------- translating the static page ----------
  const ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'data-w', 'data-s', 'content'];
  const GEO = /[Ⴀ-ჿ]/;
  const tr = v => { const k = v.trim(); if (!k) return v; const out = lang === 'ka' ? k : (D[lang][k] ?? k); return v.replace(k, out); };
  const trPair = v => v.split('|').map(tr).join('|');
  function apply(root = document) {
    document.documentElement.lang = lang;
    const walker = document.createTreeWalker(root.body || root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('script,style,.jc') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    for (let n; (n = walker.nextNode());) {
      if (n.__ka === undefined) { if (!GEO.test(n.data)) continue; n.__ka = n.data; }
      n.data = tr(n.__ka);
    }
    (root.querySelectorAll ? root : document).querySelectorAll('*').forEach(el => {
      if (el.closest('.jc')) return;
      for (const a of ATTRS) {
        if (!el.hasAttribute(a)) continue;
        el.__kaA = el.__kaA || {};
        if (el.__kaA[a] === undefined) { const v = el.getAttribute(a); if (!GEO.test(v)) continue; el.__kaA[a] = v; }
        el.setAttribute(a, a === 'data-w' || a === 'data-s' ? trPair(el.__kaA[a]) : tr(el.__kaA[a]));
      }
    });
  }

  const listeners = [];
  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem('jiji-lang', l); } catch (e) {}
    listeners.forEach(f => f(l));
  }

  return {
    get lang() { return lang; }, LANGS, t, apply, set,
    onChange: f => listeners.push(f),
    months: () => MONTHS_FULL[lang], week: () => WEEK[lang]
  };
})();
window.T = window.I18N.t;
