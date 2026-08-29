import type { Movie } from "./movies";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
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

export type Group = {
  code: string;
  name: string;
  ownerId: string;
  createdAt: number;
  playing: boolean;
  movie: Movie | null;
  members: Member[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("اتصال به سرور برقرار نشد. اینترنتت یا آدرس سرور رو بررسی کن.", 0);
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "خطایی پیش اومد.";
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export function fetchGroup(code: string): Promise<Group> {
  return request<Group>(`/api/groups/${encodeURIComponent(code)}`);
}

export function createGroupApi(name: string, memberId: string, memberName: string): Promise<Group> {
  return request<Group>(`/api/groups`, {
    method: "POST",
    body: JSON.stringify({ name, memberId, memberName }),
  });
}

export function joinGroupApi(code: string, memberId: string, memberName: string): Promise<Group> {
  return request<Group>(`/api/groups/${encodeURIComponent(code)}/join`, {
    method: "POST",
    body: JSON.stringify({ memberId, memberName }),
  });
}

export function leaveGroupApi(code: string, memberId: string): Promise<{ group: Group | null }> {
  return request(`/api/groups/${encodeURIComponent(code)}/leave`, {
    method: "POST",
    body: JSON.stringify({ memberId }),
  });
}

export function setGroupMovieApi(code: string, movie: Movie): Promise<Group> {
  return request<Group>(`/api/groups/${encodeURIComponent(code)}/movie`, {
    method: "PUT",
    body: JSON.stringify(movie),
  });
}

export function clearGroupMovieApi(code: string): Promise<Group> {
  return request<Group>(`/api/groups/${encodeURIComponent(code)}/movie`, { method: "DELETE" });
}

export function setGroupPlayingApi(code: string, playing: boolean): Promise<Group> {
  return request<Group>(`/api/groups/${encodeURIComponent(code)}/playing`, {
    method: "PUT",
    body: JSON.stringify({ playing }),
  });
}
