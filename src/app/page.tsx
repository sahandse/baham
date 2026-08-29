import { LinkButton } from "@/components/Button";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden px-6">
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-24 h-64 w-64 rounded-full bg-accent-2/20 blur-3xl" />

      <div className="safe-top flex flex-1 flex-col justify-center gap-10 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo size="lg" />
          <div>
            <h1 className="text-2xl font-extrabold">باهم</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              گروه بساز، دوستاتو با یک کد اضافه کن
              <br />
              و فیلم و سریال رو با هم تماشا کنید
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <LinkButton href="/create" size="lg" fullWidth icon={<PlusIcon />}>
            ایجاد گروه
          </LinkButton>
          <LinkButton href="/join" size="lg" fullWidth variant="secondary" icon={<KeyIcon />}>
            ورود به گروه با کد
          </LinkButton>
        </div>

        <ul className="flex flex-col gap-3 text-sm text-muted">
          <Feature text="تا ۸ نفر در هر گروه" />
          <Feature text="کد اختصاصی و اتوماتیک برای هر گروه" />
          <Feature text="طراحی ساده، سریع و مناسب موبایل" />
        </ul>
      </div>

      <p className="safe-bottom pb-6 text-center text-xs text-muted/70">
        نسخه نمایشی — بدون نیاز به ثبت‌نام
      </p>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-accent">
        ✓
      </span>
      {text}
    </li>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.5 12.5 20 3M17 6l3 3M14 9l2.5 2.5" />
    </svg>
  );
}
