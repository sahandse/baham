"use client";

import { generateId } from "./id";
import {
  ApiError,
  clearGroupMovieApi,
  createGroupApi,
  fetchGroup,
  joinGroupApi,
  leaveGroupApi,
  setGroupMovieApi,
  setGroupPlayingApi,
  type Group,
} from "./api";
import type { Movie } from "./movies";

export const MAX_MEMBERS = 8;

export type { Group, Member } from "./api";

export type Me = {
  id: string;
  name: string;
};

const ME_KEY = "baham:me";

export class GroupError extends Error {}

function isBrowser() {
  return typeof window !== "undefined";
}

export function getMe(): Me | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(ME_KEY);
    return raw ? (JSON.parse(raw) as Me) : null;
  } catch {
    return null;
  }
}

export function saveMeName(name: string): Me {
  const existing = getMe();
  const me: Me = { id: existing?.id ?? generateId(), name: name.trim() };
  window.localStorage.setItem(ME_KEY, JSON.stringify(me));
  return me;
}

async function unwrap<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof ApiError) throw new GroupError(err.message);
    throw err;
  }
}

export function getGroup(code: string): Promise<Group | null> {
  return fetchGroup(code).catch((err) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err instanceof ApiError ? new GroupError(err.message) : err;
  });
}

export async function createGroup(groupName: string, myName: string): Promise<Group> {
  const me = saveMeName(myName);
  return unwrap(createGroupApi(groupName, me.id, me.name));
}

export async function joinGroup(code: string, myName: string): Promise<Group> {
  const me = saveMeName(myName);
  return unwrap(joinGroupApi(code, me.id, me.name));
}

export async function leaveGroup(code: string, memberId: string): Promise<void> {
  await unwrap(leaveGroupApi(code, memberId));
}

export async function setGroupMovie(code: string, movie: Movie | null): Promise<Group> {
  return unwrap(movie ? setGroupMovieApi(code, movie) : clearGroupMovieApi(code));
}

export async function setGroupPlaying(code: string, playing: boolean): Promise<Group> {
  return unwrap(setGroupPlayingApi(code, playing));
}
