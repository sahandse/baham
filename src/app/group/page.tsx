import { Suspense } from "react";
import { GroupRoomClient } from "./GroupRoomClient";

export default function GroupPage() {
  return (
    <Suspense fallback={null}>
      <GroupRoomClient />
    </Suspense>
  );
}
