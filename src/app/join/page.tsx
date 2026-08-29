import { Suspense } from "react";
import { BackHeader } from "@/components/BackHeader";
import { JoinForm } from "./JoinForm";

export const metadata = { title: "ورود به گروه | باهم" };

export default function JoinPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <BackHeader href="/" title="ورود به گروه" />
      <div className="flex-1 px-6 py-6">
        <Suspense fallback={null}>
          <JoinForm />
        </Suspense>
      </div>
    </main>
  );
}
