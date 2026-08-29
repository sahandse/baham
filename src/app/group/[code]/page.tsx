import { GroupRoomClient } from "./GroupRoomClient";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <GroupRoomClient code={code.toUpperCase()} />;
}
