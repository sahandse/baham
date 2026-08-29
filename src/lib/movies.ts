export type CatalogItem = {
  id: string;
  title: string;
  year: number;
  kind: "فیلم" | "سریال";
  genre: string;
  gradient: string;
};

export const CATALOG: CatalogItem[] = [
  { id: "m1", title: "جدایی نادر از سیمین", year: 1390, kind: "فیلم", genre: "درام", gradient: "from-rose-500 to-orange-400" },
  { id: "m2", title: "پرویز", year: 1391, kind: "فیلم", genre: "درام", gradient: "from-slate-600 to-slate-800" },
  { id: "m3", title: "ملکه گدایان", year: 1400, kind: "سریال", genre: "درام", gradient: "from-purple-500 to-indigo-500" },
  { id: "m4", title: "پایتخت", year: 1394, kind: "سریال", genre: "کمدی", gradient: "from-amber-400 to-rose-500" },
  { id: "m5", title: "شهرزاد", year: 1394, kind: "سریال", genre: "عاشقانه", gradient: "from-fuchsia-500 to-pink-500" },
  { id: "m6", title: "اینترستلار", year: 1393, kind: "فیلم", genre: "علمی‌تخیلی", gradient: "from-sky-600 to-slate-900" },
  { id: "m7", title: "بازی تاج و تخت", year: 1390, kind: "سریال", genre: "فانتزی", gradient: "from-zinc-600 to-zinc-900" },
  { id: "m8", title: "جوکر", year: 1398, kind: "فیلم", genre: "روانشناسی", gradient: "from-emerald-600 to-teal-800" },
  { id: "m9", title: "لوپن", year: 1399, kind: "سریال", genre: "معمایی", gradient: "from-blue-600 to-cyan-500" },
  { id: "m10", title: "آشوب", year: 1401, kind: "سریال", genre: "اکشن", gradient: "from-red-600 to-rose-900" },
  { id: "m11", title: "زندگی زیباست", year: 1376, kind: "فیلم", genre: "درام", gradient: "from-lime-500 to-green-700" },
  { id: "m12", title: "ویکینگ‌ها", year: 1392, kind: "سریال", genre: "تاریخی", gradient: "from-stone-500 to-stone-800" },
];
