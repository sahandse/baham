# baham-server

API واقعی «باهم»: Express + SQLite (`better-sqlite3`). گروه‌ها و اعضا و فیلم انتخابی هر گروه در دیتابیس ذخیره می‌شن (نه در مرورگر)، بنابراین بین گوشی‌های مختلف واقعاً sync می‌شه. فرانت‌اند با یک polling ساده (هر ۳ ثانیه) وضعیت گروه رو تازه می‌کنه.

## اجرای محلی

```bash
npm install
cp .env.example .env
npm run dev        # روی PORT=4000 بالا میاد
```

## Endpointها

| متد | مسیر | توضیح |
|---|---|---|
| GET | `/health` | health check |
| POST | `/api/groups` | ساخت گروه — body: `{ name, memberId, memberName }` |
| GET | `/api/groups/:code` | گرفتن وضعیت گروه |
| POST | `/api/groups/:code/join` | پیوستن — body: `{ memberId, memberName }` |
| POST | `/api/groups/:code/leave` | ترک گروه — body: `{ memberId }` |
| PUT | `/api/groups/:code/movie` | تنظیم فیلم/سریال — body: `{ id, title, kind, year?, genre?, gradient?, url? }` |
| DELETE | `/api/groups/:code/movie` | حذف فیلم انتخاب‌شده |
| PUT | `/api/groups/:code/playing` | تغییر وضعیت پخش — body: `{ playing: boolean }` |

هویت کاربر یک `memberId` است که خود فرانت‌اند (client) تولید و در `localStorage` نگه می‌داره — سرور به آن اعتماد می‌کند (بدون احراز هویت واقعی)، چون این پروژه برای استفاده‌ی دوستانه طراحی شده، نه یک سرویس عمومی با کاربران ناشناس.

## دیپلوی

این سرور باید جایی اجرا بشه که یک پراسس Node.js دائمی نگه می‌داره (GitHub Pages فقط فایل استاتیک سرو می‌کنه و نمی‌تونه این بک‌اند رو میزبانی کنه).

### گزینه ۱ — Render (ساده‌ترین)

**راه سریع (Blueprint):** یک `render.yaml` توی ریشه‌ی ریپو هست. توی داشبورد Render: **New + → Blueprint** → این ریپو رو وصل کن. Render خودش سرویس + دیسک رو طبق `render.yaml` می‌سازه؛ فقط باید بعدش متغیر `ALLOWED_ORIGINS` رو دستی به آدرس GitHub Pages‌ت ست کنی (چون `sync: false` گذاشته شده، عمداً از قبل ست نمی‌شه).

> `render.yaml` روی پلن `starter` تنظیم شده چون دیسک دائمی (برای اینکه دیتابیس SQLite بین ری‌استارت‌ها پاک نشه) روی پلن رایگان Render پشتیبانی نمی‌شه. اگه می‌خوای رایگان بمونی، بخش `disk:` رو از `render.yaml` حذف کن — فقط دیتابیس با هر ری‌استارت/دیپلوی پاک می‌شه.

**راه دستی:**

1. یک سرویس جدید از نوع **Web Service** بساز و این ریپو رو وصل کن، Root Directory را `server` بذار.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. یک **Persistent Disk** (مثلاً ۱GB) به مسیر `/opt/render/project/src/data` وصل کن و `DATA_DIR` رو به همون مسیر ست کن (وگرنه با هر دیپلوی، دیتابیس پاک می‌شه).
5. متغیر محیطی `ALLOWED_ORIGINS` رو به آدرس GitHub Pages ست کن، مثلاً: `https://<username>.github.io`

**راه گفتگویی:** اگه کانکتور رسمی Render رو توی تنظیمات claude.ai به این حساب وصل و توی همین چت فعال کنی، می‌تونم مستقیم از همینجا سرویس رو طبق همین `render.yaml` بسازم و دیپلوی کنم — بدون این مراحل دستی.

### گزینه ۲ — Docker (روی هر VPS)

```bash
docker build -t baham-server .
docker run -d -p 4000:4000 -v baham-data:/app/data \
  -e ALLOWED_ORIGINS=https://<username>.github.io \
  baham-server
```

### گزینه ۳ — Railway / Fly.io

مشابه Render: یک web service از پوشه‌ی `server` بساز، یک volume برای `DATA_DIR` وصل کن، و `ALLOWED_ORIGINS` رو ست کن.

بعد از دیپلوی، آدرس عمومی بک‌اند (مثلاً `https://baham-api.onrender.com`) رو باید به‌عنوان مقدار `NEXT_PUBLIC_API_URL` هنگام build فرانت‌اند بدی — جزئیاتش در README ریشه‌ی پروژه است.
