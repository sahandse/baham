import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db.js";
import {
  GroupError,
  MAX_MEMBERS,
  clearGroupMovie,
  createGroup,
  getGroup,
  joinGroup,
  leaveGroup,
  setGroupMovie,
  setGroupPlaying,
} from "./store.js";

const PORT = Number(process.env.PORT ?? 4000);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ALLOWED_ORIGINS.includes("*") ? true : ALLOWED_ORIGINS,
  })
);

function asString(value: unknown, field: string, { max = 40 } = {}): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new GroupError(`${field} الزامی است.`, 422);
  }
  return value.trim().slice(0, max);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/groups", (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.slice(0, 60) : "";
    const memberId = asString(req.body?.memberId, "شناسه کاربر", { max: 64 });
    const memberName = asString(req.body?.memberName, "اسم", { max: 40 });
    const group = createGroup(name, memberId, memberName);
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
});

app.get("/api/groups/:code", (req, res, next) => {
  try {
    const group = getGroup(req.params.code);
    if (!group) throw new GroupError("گروه پیدا نشد.", 404);
    res.json(group);
  } catch (err) {
    next(err);
  }
});

app.post("/api/groups/:code/join", (req, res, next) => {
  try {
    const memberId = asString(req.body?.memberId, "شناسه کاربر", { max: 64 });
    const memberName = asString(req.body?.memberName, "اسم", { max: 40 });
    const group = joinGroup(req.params.code, memberId, memberName);
    res.json(group);
  } catch (err) {
    next(err);
  }
});

app.post("/api/groups/:code/leave", (req, res, next) => {
  try {
    const memberId = asString(req.body?.memberId, "شناسه کاربر", { max: 64 });
    const group = leaveGroup(req.params.code, memberId);
    res.json({ group });
  } catch (err) {
    next(err);
  }
});

app.put("/api/groups/:code/movie", (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (body === null || typeof body !== "object" || Object.keys(body).length === 0) {
      const group = clearGroupMovie(req.params.code);
      res.json(group);
      return;
    }
    const id = asString(body.id, "شناسه فیلم", { max: 64 });
    const title = asString(body.title, "عنوان", { max: 120 });
    const kind = body.kind === "سریال" ? "سریال" : "فیلم";
    const url = typeof body.url === "string" && body.url.trim() ? body.url.trim().slice(0, 500) : null;
    if (url) {
      try {
        new URL(url);
      } catch {
        throw new GroupError("لینک وارد شده معتبر نیست.", 422);
      }
    }
    const group = setGroupMovie(req.params.code, {
      id,
      title,
      kind,
      year: typeof body.year === "number" ? body.year : null,
      genre: typeof body.genre === "string" ? body.genre.slice(0, 40) : null,
      gradient: typeof body.gradient === "string" ? body.gradient.slice(0, 80) : null,
      url,
    });
    res.json(group);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/groups/:code/movie", (req, res, next) => {
  try {
    const group = clearGroupMovie(req.params.code);
    res.json(group);
  } catch (err) {
    next(err);
  }
});

app.put("/api/groups/:code/playing", (req, res, next) => {
  try {
    const group = setGroupPlaying(req.params.code, !!req.body?.playing);
    res.json(group);
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "یافت نشد." });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof GroupError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "خطای داخلی سرور." });
});

// Best-effort cleanup of groups abandoned for a long time (30 days), run daily,
// so the demo database doesn't grow unbounded. Members cascade-delete with them.
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
function cleanupStaleGroups() {
  db.prepare(`DELETE FROM groups WHERE created_at < ?`).run(Date.now() - THIRTY_DAYS_MS);
}
cleanupStaleGroups();
setInterval(cleanupStaleGroups, 24 * 60 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`baham API listening on :${PORT} (max ${MAX_MEMBERS} members/group)`);
});
