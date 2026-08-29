import { BackHeader } from "@/components/BackHeader";
import { CreateForm } from "./CreateForm";

export const metadata = { title: "ایجاد گروه | باهم" };

export default function CreatePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <BackHeader href="/" title="ایجاد گروه" />
      <div className="flex-1 px-6 py-6">
        <CreateForm />
      </div>
    </main>
  );
}
