import { customAlphabet } from "nanoid";
import { db } from "./db.js";

export const MAX_MEMBERS = 8;

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const generateCode = customAlphabet(CODE_ALPHABET, 5);

export class GroupError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type Member = {
  id: string;
  name: string;
  isOwner: boolean;
  joinedAt: number;
};

export type Movie = {
  id: string;
  title: string;
  kind: "فیلم" | "سریال";
  year: number | null;
  genre: string | null;
  gradient: string | null;
  url: string | null;
};

export type Group = {
  code: string;
  name: string;
  ownerId: string;
  createdAt: number;
  playing: boolean;
  movie: Movie | null;
  members: Member[];
};

type GroupRow = {
  code: string;
  name: string;
  owner_id: string;
  created_at: number;
  playing: number;
  movie_id: string | null;
  movie_title: string | null;
  movie_kind: string | null;
  movie_year: number | null;
  movie_genre: string | null;
  movie_gradient: string | null;
  movie_url: string | null;
};

type MemberRow = {
  id: string;
  name: string;
  is_owner: number;
  joined_at: number;
};

const stmts = {
  insertGroup: db.prepare(
    `INSERT INTO groups (code, name, owner_id, created_at, playing) VALUES (@code, @name, @owner_id, @created_at, 0)`
  ),
  getGroup: db.prepare(`SELECT * FROM groups WHERE code = ?`),
  getMembers: db.prepare(`SELECT * FROM members WHERE group_code = ? ORDER BY joined_at ASC`),
  countMembers: db.prepare(`SELECT COUNT(*) as n FROM members WHERE group_code = ?`),
  getMember: db.prepare(`SELECT * FROM members WHERE group_code = ? AND id = ?`),
  insertMember: db.prepare(
    `INSERT INTO members (id, group_code, name, is_owner, joined_at) VALUES (@id, @group_code, @name, @is_owner, @joined_at)`
  ),
  deleteMember: db.prepare(`DELETE FROM members WHERE group_code = ? AND id = ?`),
  promoteMember: db.prepare(`UPDATE members SET is_owner = 1 WHERE group_code = ? AND id = ?`),
  updateGroupOwner: db.prepare(`UPDATE groups SET owner_id = ? WHERE code = ?`),
  deleteGroup: db.prepare(`DELETE FROM groups WHERE code = ?`),
  setMovie: db.prepare(
    `UPDATE groups SET movie_id = @movie_id, movie_title = @movie_title, movie_kind = @movie_kind,
      movie_year = @movie_year, movie_genre = @movie_genre, movie_gradient = @movie_gradient,
      movie_url = @movie_url, playing = 0 WHERE code = @code`
  ),
  clearMovie: db.prepare(
    `UPDATE groups SET movie_id = NULL, movie_title = NULL, movie_kind = NULL, movie_year = NULL,
      movie_genre = NULL, movie_gradient = NULL, movie_url = NULL, playing = 0 WHERE code = ?`
  ),
  setPlaying: db.prepare(`UPDATE groups SET playing = ? WHERE code = ?`),
};

function toGroup(row: GroupRow): Group {
  const memberRows = stmts.getMembers.all(row.code) as MemberRow[];
  return {
    code: row.code,
    name: row.name,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    playing: !!row.playing,
    movie: row.movie_id
      ? {
          id: row.movie_id,
          title: row.movie_title!,
          kind: (row.movie_kind as "فیلم" | "سریال") ?? "فیلم",
          year: row.movie_year,
          genre: row.movie_genre,
          gradient: row.movie_gradient,
          url: row.movie_url,
        }
      : null,
    members: memberRows.map((m) => ({
      id: m.id,
      name: m.name,
      isOwner: !!m.is_owner,
      joinedAt: m.joined_at,
    })),
  };
}

export function getGroup(code: string): Group | null {
  const row = stmts.getGroup.get(code.toUpperCase()) as GroupRow | undefined;
  return row ? toGroup(row) : null;
}

export function createGroup(name: string, ownerId: string, ownerName: string): Group {
  let code = generateCode();
  for (let i = 0; i < 10 && stmts.getGroup.get(code); i++) {
    code = generateCode();
  }

  const now = Date.now();
  const tx = db.transaction(() => {
    stmts.insertGroup.run({
      code,
      name: name.trim() || "گروه فیلم‌بازی",
      owner_id: ownerId,
      created_at: now,
    });
    stmts.insertMember.run({
      id: ownerId,
      group_code: code,
      name: ownerName.trim(),
      is_owner: 1,
      joined_at: now,
    });
  });
  tx();

  return getGroup(code)!;
}

export function joinGroup(code: string, memberId: string, memberName: string): Group {
  const normalized = code.trim().toUpperCase();
  const row = stmts.getGroup.get(normalized) as GroupRow | undefined;
  if (!row) throw new GroupError("گروه پیدا نشد. لطفاً کد را بررسی کنید.", 404);

  const existing = stmts.getMember.get(normalized, memberId);
  if (existing) return toGroup(row);

  const { n } = stmts.countMembers.get(normalized) as { n: number };
  if (n >= MAX_MEMBERS) throw new GroupError("این گروه پر است (حداکثر ۸ نفر).", 409);

  stmts.insertMember.run({
    id: memberId,
    group_code: normalized,
    name: memberName.trim(),
    is_owner: 0,
    joined_at: Date.now(),
  });

  return getGroup(normalized)!;
}

export function leaveGroup(code: string, memberId: string): Group | null {
  const normalized = code.trim().toUpperCase();
  const row = stmts.getGroup.get(normalized) as GroupRow | undefined;
  if (!row) return null;

  const tx = db.transaction(() => {
    stmts.deleteMember.run(normalized, memberId);
    const remaining = stmts.getMembers.all(normalized) as MemberRow[];
    if (remaining.length === 0) {
      stmts.deleteGroup.run(normalized);
      return;
    }
    if (!remaining.some((m) => m.is_owner)) {
      stmts.promoteMember.run(normalized, remaining[0].id);
      stmts.updateGroupOwner.run(remaining[0].id, normalized);
    }
  });
  tx();

  return getGroup(normalized);
}

export function setGroupMovie(
  code: string,
  movie: { id: string; title: string; kind: string; year?: number | null; genre?: string | null; gradient?: string | null; url?: string | null }
): Group {
  const normalized = code.trim().toUpperCase();
  const row = stmts.getGroup.get(normalized) as GroupRow | undefined;
  if (!row) throw new GroupError("گروه پیدا نشد.", 404);

  stmts.setMovie.run({
    code: normalized,
    movie_id: movie.id,
    movie_title: movie.title.trim(),
    movie_kind: movie.kind,
    movie_year: movie.year ?? null,
    movie_genre: movie.genre ?? null,
    movie_gradient: movie.gradient ?? null,
    movie_url: movie.url ?? null,
  });

  return getGroup(normalized)!;
}

export function clearGroupMovie(code: string): Group {
  const normalized = code.trim().toUpperCase();
  const row = stmts.getGroup.get(normalized) as GroupRow | undefined;
  if (!row) throw new GroupError("گروه پیدا نشد.", 404);
  stmts.clearMovie.run(normalized);
  return getGroup(normalized)!;
}

export function setGroupPlaying(code: string, playing: boolean): Group {
  const normalized = code.trim().toUpperCase();
  const row = stmts.getGroup.get(normalized) as GroupRow | undefined;
  if (!row) throw new GroupError("گروه پیدا نشد.", 404);
  stmts.setPlaying.run(playing ? 1 : 0, normalized);
  return getGroup(normalized)!;
}
