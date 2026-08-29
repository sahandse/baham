import { cn } from "@/lib/cn";
import { MAX_MEMBERS, type Member } from "@/lib/groupStore";

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-lime-500 to-green-600",
];

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export function MemberGrid({ members }: { members: Member[] }) {
  const slots = Array.from({ length: MAX_MEMBERS }, (_, i) => members[i] ?? null);

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
      {slots.map((member, i) =>
        member ? (
          <div key={member.id} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr text-sm font-bold text-white",
                AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
              )}
            >
              {initials(member.name)}
              {member.isOwner && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px]">
                  ★
                </span>
              )}
            </div>
            <span className="max-w-[3.5rem] truncate text-[11px] text-muted">{member.name}</span>
          </div>
        ) : (
          <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border text-muted">
              +
            </div>
            <span className="text-[11px] text-muted/60">خالی</span>
          </div>
        )
      )}
    </div>
  );
}
