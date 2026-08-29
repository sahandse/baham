"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { GroupError, getMe, joinGroup } from "@/lib/groupStore";

export function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const me = typeof window !== "undefined" ? getMe() : null;

  const [code, setCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [myName, setMyName] = useState(me?.name ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myName.trim()) {
      setError("لطفاً اسمت رو وارد کن");
      return;
    }
    if (!code.trim()) {
      setError("کد گروه رو وارد کن");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const group = await joinGroup(code, myName);
      router.push(`/group?code=${group.code}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof GroupError ? err.message : "مشکلی پیش اومد، دوباره تلاش کن");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="کد گروه"
        placeholder="7XQ2M"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        maxLength={8}
        dir="ltr"
        className="text-center font-mono text-lg tracking-[0.3em]"
      />
      <Field
        label="اسم شما"
        placeholder="مثلاً: سحند"
        value={myName}
        onChange={(e) => setMyName(e.target.value)}
        maxLength={20}
      />

      {error && (
        <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
        {loading ? "در حال ورود..." : "ورود به گروه"}
      </Button>
    </form>
  );
}
