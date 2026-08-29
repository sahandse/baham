"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { createGroup, getMe } from "@/lib/groupStore";

export function CreateForm() {
  const router = useRouter();
  const me = typeof window !== "undefined" ? getMe() : null;

  const [myName, setMyName] = useState(me?.name ?? "");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myName.trim()) {
      setError("لطفاً اسمت رو وارد کن");
      return;
    }
    setError("");
    setLoading(true);
    const group = createGroup(groupName, myName);
    router.push(`/group/${group.code}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="اسم شما"
        placeholder="مثلاً: سحند"
        value={myName}
        onChange={(e) => setMyName(e.target.value)}
        error={error}
        maxLength={20}
      />
      <Field
        label="اسم گروه (اختیاری)"
        placeholder="مثلاً: شب فیلم دوستان"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        maxLength={30}
      />

      <div className="mt-2 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
        بعد از ساخت گروه، یک کد اختصاصی ۵ کاراکتری برات ساخته می‌شه که می‌تونی برای دوستات (تا ۸ نفر) بفرستی.
      </div>

      <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
        ساخت گروه
      </Button>
    </form>
  );
}
