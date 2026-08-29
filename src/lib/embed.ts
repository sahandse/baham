export type EmbedInfo =
  | { kind: "file"; src: string }
  | { kind: "iframe"; src: string };

const FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m3u8"];

export function getEmbedInfo(rawUrl: string): EmbedInfo {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { kind: "iframe", src: rawUrl };
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.toLowerCase();

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (id) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
    const shortMatch = path.match(/^\/(shorts|embed)\/([\w-]+)/);
    if (shortMatch) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${shortMatch[2]}` };
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (id) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === "aparat.com") {
    const match = path.match(/\/v\/([\w-]+)/);
    if (match) return { kind: "iframe", src: `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame` };
  }

  if (FILE_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    return { kind: "file", src: url.toString() };
  }

  return { kind: "iframe", src: url.toString() };
}
