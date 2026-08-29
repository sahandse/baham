import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, "baham.sqlite3");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    playing INTEGER NOT NULL DEFAULT 0,
    movie_id TEXT,
    movie_title TEXT,
    movie_kind TEXT,
    movie_year INTEGER,
    movie_genre TEXT,
    movie_gradient TEXT,
    movie_url TEXT
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT NOT NULL,
    group_code TEXT NOT NULL REFERENCES groups(code) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_owner INTEGER NOT NULL DEFAULT 0,
    joined_at INTEGER NOT NULL,
    PRIMARY KEY (id, group_code)
  );

  CREATE INDEX IF NOT EXISTS idx_members_group_code ON members(group_code);
`);
