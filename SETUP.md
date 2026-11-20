# ვილა ჯიჯი — Cloudflare-ზე ჩართვა

GitHub Pages-ზე (`blinkearsworld.github.io/Villa-JIJI`) საიტი ისევ დემოდ მუშაობს: მონაცემები ბრაუზერში ინახება.
Cloudflare-ზე იგივე კოდი ავტომატურად ნამდვილ ბაზაზე გადადის: ჯავშნები, ფასები და კალენდარი ყველა მოწყობილობაზე ერთნაირია, Instagram-ისა და Facebook-ის ბოტიც იმავე ბაზიდან პასუხობს.

ყველაფერი უფასო გეგმაზე ეტევა.

## 1. საიტი (5 წუთი)

1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. აირჩიეთ **Blinkearsworld/Villa-JIJI**, branch `main`.
3. Framework preset: **None**. Build command: ცარიელი. Build output directory: `/`.
4. **Save and Deploy**. საიტი გაიხსნება მისამართზე `villa-jiji.pages.dev` (ზუსტ სახელს Cloudflare გაჩვენებთ).

ამის შემდეგ ყოველ ცვლილებას, რომელიც GitHub-ზე აიტვირთება, Cloudflare 1–2 წუთში თავად აქვეყნებს.

## 2. ბაზა (3 წუთი)

1. **Workers & Pages** → **D1 SQL Database** → **Create** → სახელი: `villa-jiji`.
2. Pages-ის პროექტში: **Settings** → **Bindings** → **Add** → **D1 database**.
   Variable name: `DB` (ზუსტად ასე, დიდი ასოებით), database: `villa-jiji`. **Save**.
3. **Deployments** → ბოლო ვერსიაზე **Retry deployment**.

ცხრილები და სანიმუშო ფასები პირველივე გახსნისას თავისით შეიქმნება, SQL-ის წერა საჭირო არ არის.

## 3. ადმინ პანელის დაცვა (5 წუთი)

1. **Zero Trust** → (პირველად სახელს ითხოვს, მაგ. `villajiji` — ეს არის **ACCESS_TEAM**) → **Access** → **Applications** → **Add an application** → **Self-hosted**.
2. Domain: თქვენი `*.pages.dev` მისამართი. Paths: `admin`, `admin.html` და `api/admin/*` (სამი ჩანაწერი).
3. Policy: Allow → **Emails** → ადმინისტრაციის ელ-ფოსტები.
4. შენახვის შემდეგ აპლიკაციის გვერდზე დააკოპირეთ **Application Audience (AUD) Tag** — ეს არის **ACCESS_AUD**.
5. Pages-ის პროექტში: **Settings** → **Variables and Secrets** → დაამატეთ `ACCESS_TEAM` და `ACCESS_AUD` → ისევ **Retry deployment**.

ადმინი შედის ელ-ფოსტაზე მოსული კოდით. სადემონსტრაციო PIN Cloudflare-ზე აღარ გამოიყენება.

## 4. Facebook Messenger და Instagram (როცა მზად იქნებით)

საჭიროა: Facebook-ის გვერდზე ადმინის უფლება, Instagram-ის პროფესიული ანგარიში, გვერდზე მიბმული.

1. developers.facebook.com → **Create App** → Business → დაამატეთ **Messenger** (და Instagram-ისთვის **Instagram** პროდუქტი).
2. Messenger → Settings → დააკავშირეთ ვილა ჯიჯის გვერდი → **Generate token** → ეს არის **META_PAGE_TOKEN**.
3. App Settings → Basic → **App Secret** → ეს არის **META_APP_SECRET**.
4. მოიფიქრეთ ნებისმიერი გრძელი სიტყვა → ეს არის **META_VERIFY_TOKEN**.
5. Cloudflare-ში **Variables and Secrets**-ში დაამატეთ სამივე, როგორც **Secret** → Retry deployment.
6. Meta-ში Webhooks: Callback URL `https://<თქვენი-მისამართი>/api/meta`, Verify token იგივე სიტყვა. Subscribe: `messages`, `messaging_postbacks` (Messenger-ზეც და Instagram-ზეც).

სანამ Meta აპლიკაციას შეამოწმებს (App Review), ბოტი მხოლოდ აპლიკაციის ადმინებს და ტესტერებს პასუხობს. სტუმრებისთვის ჩასართავად საჭიროა `pages_messaging` და `instagram_manage_messages` უფლებების მოთხოვნა App Review-ში და ბიზნესის ვერიფიკაცია.

**გასაღებებს ნუ გაუგზავნით არავის ჩატში.** ისინი მხოლოდ Cloudflare-ის Secrets-ში ჩაწერეთ.

## როგორ მუშაობს ბოტი

- მენიუ: ნომრები და ფასი · სად ვართ · ხშირი კითხვები · დაკავშირება
- თარიღი: ღილაკით (ეს/შემდეგი შაბათი) ან ჩაწერით `15.01`
- ღამეები და სტუმრები ღილაკებით → თავისუფალი ნომერი და ფასი ბაზიდან → სახელი, ტელეფონი → მოთხოვნა ადმინ პანელში (წყარო: Instagram / Facebook)
- „დაკავშირება" ან ორჯერ გაუგებარი პასუხი: ბოტი 12 საათით ჩუმდება და ადმინისტრაცია იმავე ჩატში პასუხობს. სტუმარი „მენიუ"-ს დაწერით ბოტს ისევ ჩართავს.

## ფაილები

- `functions/_lib/core.js` — ბაზა, ფასები, თავისუფალი ნომრები
- `functions/api/state.js` — საჯარო მონაცემები საიტისთვის (სტუმრების სახელების გარეშე)
- `functions/api/request.js` — ჯავშნის მოთხოვნა საიტიდან
- `functions/api/admin/*` — ადმინ პანელი (Cloudflare Access-ით დაცული)
- `functions/api/meta.js` — Instagram / Facebook ბოტი
- `js/store.js` — ბრაუზერის მხარე: Cloudflare-ზე სერვერს იყენებს, სხვაგან დემოს

ლოკალური ტესტი: `npx wrangler pages dev . --d1 DB --binding ADMIN_DEV=1 META_DRY_RUN=1`
