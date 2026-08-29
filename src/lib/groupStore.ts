"use client";

import { generateGroupCode, generateId } from "./id";
import type { CatalogItem } from "./movies";

export const MAX_MEMBERS = 8;

export type Member = {
  id: string;
  name: string;
  isOwner: boolean;
  joinedAt: number;
};

export type Group = {
  code: string;
  name: string;
  ownerId: string;
  members: Member[];
  createdAt: number;
  movie: CatalogItem | null;
  playing: boolean;
};

export type Me = {
  id: string;
  name: string;
};

const ME_KEY = "baham:me";
const GROUPS_KEY = "baham:groups";
const CHANGE_EVENT = "baham:groups-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

// Caches keep the same object reference across reads when the underlying
// localStorage value hasn't changed, which useSyncExternalStore requires.
let groupsCache: { raw: string | null; parsed: Record<string, Group> } = {
  raw: null,
  parsed: {},
};
let meCache: { raw: string | null; parsed: Me | null } = { raw: null, parsed: null };

function readGroups(): Record<string, Group> {
  if (!isBrowser()) return groupsCache.parsed;
  const raw = window.localStorage.getItem(GROUPS_KEY);
  if (raw !== groupsCache.raw) {
    try {
      groupsCache = { raw, parsed: raw ? (JSON.parse(raw) as Record<string, Group>) : {} };
    } catch {
      groupsCache = { raw, parsed: {} };
    }
  }
  return groupsCache.parsed;
}

function writeGroups(groups: Record<string, Group>) {
  if (!isBrowser()) return;
  const raw = JSON.stringify(groups);
  window.localStorage.setItem(GROUPS_KEY, raw);
  groupsCache = { raw, parsed: groups };
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getMe(): Me | null {
  if (!isBrowser()) return meCache.parsed;
  const raw = window.localStorage.getItem(ME_KEY);
  if (raw !== meCache.raw) {
    try {
      meCache = { raw, parsed: raw ? (JSON.parse(raw) as Me) : null };
    } catch {
      meCache = { raw, parsed: null };
    }
  }
  return meCache.parsed;
}

export function saveMeName(name: string): Me {
  const existing = getMe();
  const me: Me = { id: existing?.id ?? generateId(), name: name.trim() };
  const raw = JSON.stringify(me);
  window.localStorage.setItem(ME_KEY, raw);
  meCache = { raw, parsed: me };
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return me;
}

export function getGroup(code: string): Group | null {
  const groups = readGroups();
  return groups[code.toUpperCase()] ?? null;
}

export class GroupError extends Error {}

export function createGroup(groupName: string, myName: string): Group {
  const me = saveMeName(myName);
  const groups = readGroups();

  let code = generateGroupCode();
  let attempts = 0;
  while (groups[code] && attempts < 10) {
    code = generateGroupCode();
    attempts++;
  }

  const group: Group = {
    code,
    name: groupName.trim() || "گروه فیلم‌بازی",
    ownerId: me.id,
    members: [{ id: me.id, name: me.name, isOwner: true, joinedAt: Date.now() }],
    createdAt: Date.now(),
    movie: null,
    playing: false,
  };

  groups[code] = group;
  writeGroups(groups);
  return group;
}

export function joinGroup(code: string, myName: string): Group {
  const normalized = code.trim().toUpperCase();
  const groups = readGroups();
  const group = groups[normalized];

  if (!group) {
    throw new GroupError("کد گروه پیدا نشد. لطفاً دوباره بررسی کن.");
  }

  const me = saveMeName(myName);
  const alreadyIn = group.members.find((m) => m.id === me.id);
  if (alreadyIn) {
    return group;
  }

  if (group.members.length >= MAX_MEMBERS) {
    throw new GroupError("این گروه پر است (حداکثر ۸ نفر).");
  }

  group.members.push({ id: me.id, name: me.name, isOwner: false, joinedAt: Date.now() });
  groups[normalized] = group;
  writeGroups(groups);
  return group;
}

export function leaveGroup(code: string, memberId: string) {
  const normalized = code.trim().toUpperCase();
  const groups = readGroups();
  const group = groups[normalized];
  if (!group) return;

  group.members = group.members.filter((m) => m.id !== memberId);

  if (group.members.length === 0) {
    delete groups[normalized];
  } else {
    if (!group.members.some((m) => m.isOwner)) {
      group.members[0].isOwner = true;
      group.ownerId = group.members[0].id;
    }
    groups[normalized] = group;
  }
  writeGroups(groups);
}

export function setGroupMovie(code: string, movie: CatalogItem | null) {
  const normalized = code.trim().toUpperCase();
  const groups = readGroups();
  const group = groups[normalized];
  if (!group) return;
  group.movie = movie;
  group.playing = false;
  groups[normalized] = group;
  writeGroups(groups);
}

export function setGroupPlaying(code: string, playing: boolean) {
  const normalized = code.trim().toUpperCase();
  const groups = readGroups();
  const group = groups[normalized];
  if (!group) return;
  group.playing = playing;
  groups[normalized] = group;
  writeGroups(groups);
}

export function subscribeToGroups(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}
