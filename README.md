# باهم

اپلیکیشن وب برای ساخت گروه و تماشای فیلم/سریال با دوستان. یک گروه بساز یا با کد یک گروه بپیوند (تا ۸ نفر)، فیلم/سریال از کاتالوگ نمونه انتخاب کن یا مستقیم لینک بذار (فایل mp4، یوتیوب، آپارات)، تمام‌صفحه کن و با هم تماشا کنید.

- **فرانت‌اند**: Next.js (App Router) + TypeScript + Tailwind — به‌صورت static export، مناسب GitHub Pages
- **بک‌اند**: `server/` — Express + SQLite (`better-sqlite3`)، یک API واقعی با دیتابیس (نه localStorage)
- کاملاً فارسی و راست‌به‌چپ (RTL)، فونت Vazirmatn، ریسپانسیو موبایل تا دسکتاپ

## اجرای محلی (هر دو سرویس)

```bash
# ترمینال ۱ — بک‌اند
cd server
npm install
cp .env.example .env
npm run dev            # روی http://localhost:4000

# ترمینال ۲ — فرانت‌اند
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev            # روی http://localhost:3000
```

## ساختار

- `src/app/page.tsx` — صفحه اصلی (ایجاد گروه / ورود با کد)
- `src/app/create`, `src/app/join` — فرم‌های ساخت/ورود به گروه
- `src/app/group` — اتاق گروه، با `?code=` (نه یک مسیر داینامیک — دلیلش را در بخش «چرا `/group?code=`» بخوانید)
- `src/lib/api.ts` — کلاینت API
- `src/lib/groupStore.ts` — مدیریت هویت محلی کاربر (`localStorage`) + صداکردن API
- `src/lib/embed.ts` — تشخیص نوع لینک (فایل مستقیم / یوتیوب / آپارات / iframe عمومی)
- `server/` — بک‌اند مستقل (API + دیتابیس)، جزئیات در `server/README.md`

## دیپلوی روی GitHub Pages

GitHub Pages فقط فایل استاتیک سرو می‌کنه، پس این ریپو به دو تیکه تقسیم شده: **فرانت‌اند استاتیک** (که روی Pages میره) و **بک‌اند** (که باید جای دیگه‌ای با یک پراسس Node دائمی اجرا بشه — گزینه‌ها و راهنما در `server/README.md`).

قدم‌ها:

1. بک‌اند رو طبق `server/README.md` جایی دیپلوی کن (مثلاً Render) و آدرس عمومیش رو بردار.
2. توی تنظیمات ریپو: **Settings → Secrets and variables → Actions → Variables** یک متغیر به اسم `NEXT_PUBLIC_API_URL` بساز و آدرس بک‌اند رو بذار.
3. **Settings → Pages → Source** رو روی **GitHub Actions** بذار.
4. ورک‌فلوی `.github/workflows/deploy-pages.yml` با هر push به شاخه‌ی `main` اجرا می‌شه و سایت رو build و روی Pages منتشر می‌کنه (یا از تب Actions دستی اجراش کن).

سایت نهایی زیر مسیر `https://<username>.github.io/baham/` بالا میاد؛ `basePath` توی `next.config.ts` برای همین تنظیم شده (فقط وقتی env متغیر `GITHUB_PAGES=true` باشه، که ورک‌فلو خودش ست می‌کنه — برای dev محلی لازم نیست).

## چرا `/group?code=` به‌جای `/group/[code]`؟

چون static export نمی‌تونه صفحه‌ای با مسیر داینامیک (`[code]`) رو برای کدهای گروهی که موقع build وجود ندارن، از قبل بسازه. با query param (`/group?code=ABCDE`) یک صفحه‌ی استاتیک ثابت داریم که کد رو در مرورگر (client-side) می‌خونه — روی GitHub Pages درست کار می‌کنه.

## همگام‌سازی زنده

فرانت‌اند هر ۳ ثانیه وضعیت گروه رو از API می‌گیره (polling، نه WebSocket) تا اعضای جدید/تغییر فیلم بین گوشی‌های مختلف دیده بشه. وقتی تب پنهانه، polling متوقف می‌شه.

## لینک مستقیم فیلم/سریال

توی «انتخاب فیلم یا سریال» یک تب «لینک مستقیم» هست: عنوان + نوع (فیلم/سریال) + لینک. لینک‌های زیر پشتیبانی می‌شن:

- فایل مستقیم ویدیو (`.mp4`, `.webm`, `.m3u8`, …) → پخش با تگ `<video>`
- یوتیوب (`youtube.com/watch?v=...`, `youtu.be/...`) → embed
- آپارات (`aparat.com/v/...`) → embed
- هر لینک دیگه → تلاش برای embed در iframe (بعضی سایت‌ها با `X-Frame-Options` جلوی embed رو می‌گیرن؛ در این صورت فقط توی همون سایت باز می‌شه، نه اینجا)

## تمام‌صفحه

دکمه‌ی گوشه‌ی بالا-چپ پلیر از Fullscreen API استفاده می‌کنه (با پشتیبانی از Safari/iOS هم).

## محدودیت‌های شناخته‌شده

- هویت کاربر (`memberId`) صرفاً یک شناسه‌ی تولیدشده در مرورگره، بدون احراز هویت واقعی — کافیه برای استفاده‌ی دوستانه، نه یک سرویس عمومی.
- همگام‌سازی با polling ۳ ثانیه‌ایه، نه لحظه‌ای؛ برای real-time واقعی باید WebSocket اضافه بشه.
- پخش هم‌زمان دقیق (sync شدن لحظه‌ی play/pause/seek بین همه) پیاده نشده — هرکس پخش رو مستقل کنترل می‌کنه؛ فقط انتخاب فیلم/سریال بین اعضا sync می‌شه.

## فونت

از فونت [Vazirmatn](https://github.com/rastikerdar/vazirmatn) (لایسنس آزاد SIL OFL) به‌عنوان جایگزین بصری نزدیک به فونت ایران‌سنس استفاده شده، چون ایران‌سنس لایسنس تجاریه و قابل embed مستقیم در پروژه نیست. اگر لایسنس ایران‌سنس رو داری، کافیه در `src/app/layout.tsx` فراخوانی `Vazirmatn` از `next/font/google` رو با import فونت خودت جایگزین کنی.
