"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, LinkButton } from "@/components/Button";
import { Field } from "@/components/Field";
import { Logo } from "@/components/Logo";
import { CodeBadge } from "@/components/CodeBadge";
import { MemberGrid } from "@/components/MemberGrid";
import { MoviePicker } from "@/components/MoviePicker";
import { PlayerCard } from "@/components/PlayerCard";
import {
  GroupError,
  MAX_MEMBERS,
  getGroup,
  getMe,
  joinGroup,
  leaveGroup,
  setGroupMovie,
  setGroupPlaying,
  type Group,
} from "@/lib/groupStore";
import type { Movie } from "@/lib/movies";

const POLL_MS = 3000;

function useGroup(code: string | null) {
  const [group, setGroup] = useState<Group | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    if (!code) return;
    try {
      const g = await getGroup(code);
      setGroup(g);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      if (cancelled) return;
      if (!document.hidden) await refresh();
      if (!cancelled) timer = setTimeout(tick, POLL_MS);
    }
    tick();

    function onVisible() {
      if (!document.hidden) refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [code, refresh]);

  return { group, setGroup, loadError, refresh };
}

export function GroupRoomClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.trim().toUpperCase() || null;
  const { group, setGroup, loadError } = useGroup(code);
  const me = typeof window !== "undefined" ? getMe() : null;
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!code) {
    return <MissingCodeScreen />;
  }

  if (group === undefined) {
    return loadError ? <ErrorScreen /> : null;
  }

  if (group === null) {
    return <NotFoundScreen code={code} />;
  }

  const isMember = !!me && group.members.some((m) => m.id === me.id);

  if (!isMember) {
    return <JoinInline code={code} group={group} onJoined={setGroup} />;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6">
      <header className="safe-top flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <h1 className="text-base font-bold leading-tight">{group.name}</h1>
            <p className="text-xs text-muted">
              {group.members.length} از {MAX_MEMBERS} نفر
            </p>
          </div>
        </div>
        <CodeBadge code={group.code} />
      </header>

      <section className="mb-6">
        <MemberGrid members={group.members} />
      </section>

      <section className="mb-6">
        {group.movie ? (
          <PlayerCard
            movie={group.movie}
            playing={group.playing}
            onTogglePlay={async () => setGroup(await setGroupPlaying(group.code, !group.playing))}
            onChangeMovie={() => setPickerOpen(true)}
          />
        ) : (
          <button
            onClick={() => setPickerOpen(true)}
            className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border text-muted transition-colors hover:border-accent/50 hover:text-foreground"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-2xl">
              🎬
            </span>
            <span className="text-sm font-medium">انتخاب فیلم یا سریال برای تماشا</span>
          </button>
        )}
      </section>

      <ShareSection code={group.code} />

      <div className="mt-auto safe-bottom pt-6">
        <LeaveButton code={group.code} memberId={me!.id} />
      </div>

      {pickerOpen && (
        <MoviePicker
          onClose={() => setPickerOpen(false)}
          onSelect={async (item: Movie) => {
            setGroup(await setGroupMovie(group.code, item));
            setPickerOpen(false);
          }}
        />
      )}
    </main>
  );
}

function ShareSection({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `بیا با کد ${code} به گروه فیلم من تو باهم بپیوند`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "باهم", text, url });
        return;
      } catch {
        // user cancelled share sheet, ignore
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex w-full items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-sm transition-colors hover:bg-surface"
    >
      <span className="text-muted">{copied ? "لینک کپی شد ✓" : "دعوت از دوستان با لینک یا کد"}</span>
      <span className="text-accent">اشتراک‌گذاری</span>
    </button>
  );
}

function LeaveButton({ code, memberId }: { code: string; memberId: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  return (
    <Button
      variant="danger"
      fullWidth
      disabled={leaving}
      onClick={async () => {
        setLeaving(true);
        await leaveGroup(code, memberId);
        router.push("/");
      }}
    >
      {leaving ? "در حال خروج..." : "ترک گروه"}
    </Button>
  );
}

function MissingCodeScreen() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl">🔗</span>
      <h1 className="text-lg font-bold">کد گروهی مشخص نشده</h1>
      <p className="text-sm text-muted">از لینک صحیح دعوت استفاده کن یا کد گروه رو دستی وارد کن.</p>
      <LinkButton href="/join" variant="secondary">
        ورود با کد
      </LinkButton>
      <Link href="/" className="text-sm text-muted underline underline-offset-4">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}

function ErrorScreen() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl">📡</span>
      <h1 className="text-lg font-bold">اتصال به سرور برقرار نشد</h1>
      <p className="text-sm text-muted">اینترنتت رو بررسی کن و دوباره تلاش کن.</p>
      <Button onClick={() => window.location.reload()}>تلاش دوباره</Button>
    </main>
  );
}

function NotFoundScreen({ code }: { code: string }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-4xl">😕</span>
      <h1 className="text-lg font-bold">گروهی با کد {code} پیدا نشد</h1>
      <p className="text-sm text-muted">ممکنه کد اشتباه باشه یا گروه دیگه وجود نداشته باشه.</p>
      <LinkButton href="/join" variant="secondary">
        امتحان با کد دیگه
      </LinkButton>
      <Link href="/" className="text-sm text-muted underline underline-offset-4">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}

function JoinInline({
  code,
  group,
  onJoined,
}: {
  code: string;
  group: Group;
  onJoined: (g: Group) => void;
}) {
  const me = typeof window !== "undefined" ? getMe() : null;
  const [name, setName] = useState(me?.name ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isFull = group.members.length >= MAX_MEMBERS;

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("لطفاً اسمت رو وارد کن");
      return;
    }
    setLoading(true);
    try {
      onJoined(await joinGroup(code, name));
    } catch (err) {
      setLoading(false);
      setError(err instanceof GroupError ? err.message : "مشکلی پیش اومد");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo size="lg" />
        <div>
          <h1 className="text-lg font-bold">{group.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {group.members.length} از {MAX_MEMBERS} نفر عضو این گروه هستن
          </p>
        </div>
      </div>

      {isFull ? (
        <div className="rounded-2xl bg-danger/10 px-4 py-3 text-center text-sm text-danger">
          این گروه پر شده (حداکثر ۸ نفر)
        </div>
      ) : (
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <Field
            label="اسم شما"
            placeholder="مثلاً: سحند"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            maxLength={20}
          />
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? "در حال پیوستن..." : "پیوستن به گروه"}
          </Button>
        </form>
      )}

      <Link href="/" className="text-center text-sm text-muted underline underline-offset-4">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
