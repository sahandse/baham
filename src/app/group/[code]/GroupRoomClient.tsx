"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
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
  subscribeToGroups,
  type Group,
} from "@/lib/groupStore";
import type { CatalogItem } from "@/lib/movies";

export function GroupRoomClient({ code }: { code: string }) {
  const group = useSyncExternalStore(
    subscribeToGroups,
    () => getGroup(code),
    () => null
  );
  const me = useSyncExternalStore(subscribeToGroups, getMe, () => null);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (group === null) {
    return <NotFoundScreen code={code} />;
  }

  const isMember = !!me && group.members.some((m) => m.id === me.id);

  if (!isMember) {
    return <JoinInline code={code} group={group} />;
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
            onTogglePlay={() => setGroupPlaying(group.code, !group.playing)}
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
          onSelect={(item: CatalogItem) => {
            setGroupMovie(group.code, item);
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
  return (
    <Button
      variant="danger"
      fullWidth
      onClick={() => {
        leaveGroup(code, memberId);
        router.push("/");
      }}
    >
      ترک گروه
    </Button>
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

function JoinInline({ code, group }: { code: string; group: Group }) {
  const me = typeof window !== "undefined" ? getMe() : null;
  const [name, setName] = useState(me?.name ?? "");
  const [error, setError] = useState("");
  const isFull = group.members.length >= MAX_MEMBERS;

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("لطفاً اسمت رو وارد کن");
      return;
    }
    try {
      joinGroup(code, name);
    } catch (err) {
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
          <Button type="submit" size="lg" fullWidth>
            پیوستن به گروه
          </Button>
        </form>
      )}

      <Link href="/" className="text-center text-sm text-muted underline underline-offset-4">
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
