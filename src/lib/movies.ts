export type MovieKind = "فیلم" | "سریال";

export type Movie = {
  id: string;
  title: string;
  kind: MovieKind;
  year: number | null;
  genre: string | null;
  gradient: string | null;
  url: string | null;
};

export const CATALOG: Movie[] = [
  { id: "m1", title: "جدایی نادر از سیمین", year: 1390, kind: "فیلم", genre: "درام", gradient: "from-rose-500 to-orange-400", url: null },
  { id: "m2", title: "پرویز", year: 1391, kind: "فیلم", genre: "درام", gradient: "from-slate-600 to-slate-800", url: null },
  { id: "m3", title: "ملکه گدایان", year: 1400, kind: "سریال", genre: "درام", gradient: "from-purple-500 to-indigo-500", url: null },
  { id: "m4", title: "پایتخت", year: 1394, kind: "سریال", genre: "کمدی", gradient: "from-amber-400 to-rose-500", url: null },
  { id: "m5", title: "شهرزاد", year: 1394, kind: "سریال", genre: "عاشقانه", gradient: "from-fuchsia-500 to-pink-500", url: null },
  { id: "m6", title: "اینترستلار", year: 1393, kind: "فیلم", genre: "علمی‌تخیلی", gradient: "from-sky-600 to-slate-900", url: null },
  { id: "m7", title: "بازی تاج و تخت", year: 1390, kind: "سریال", genre: "فانتزی", gradient: "from-zinc-600 to-zinc-900", url: null },
  { id: "m8", title: "جوکر", year: 1398, kind: "فیلم", genre: "روانشناسی", gradient: "from-emerald-600 to-teal-800", url: null },
  { id: "m9", title: "لوپن", year: 1399, kind: "سریال", genre: "معمایی", gradient: "from-blue-600 to-cyan-500", url: null },
  { id: "m10", title: "آشوب", year: 1401, kind: "سریال", genre: "اکشن", gradient: "from-red-600 to-rose-900", url: null },
  { id: "m11", title: "زندگی زیباست", year: 1376, kind: "فیلم", genre: "درام", gradient: "from-lime-500 to-green-700", url: null },
  { id: "m12", title: "ویکینگ‌ها", year: 1392, kind: "سریال", genre: "تاریخی", gradient: "from-stone-500 to-stone-800", url: null },
];

const LINK_GRADIENTS = [
  "from-violet-600 to-indigo-700",
  "from-rose-600 to-orange-600",
  "from-cyan-600 to-blue-700",
];

export function movieFromLink(input: { title: string; kind: MovieKind; url: string }): Movie {
  return {
    id: `link-${Date.now()}`,
    title: input.title.trim(),
    kind: input.kind,
    year: null,
    genre: null,
    gradient: LINK_GRADIENTS[Math.floor(Math.random() * LINK_GRADIENTS.length)],
    url: input.url.trim(),
  };
}
