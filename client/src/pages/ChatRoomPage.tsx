import { useParams } from "react-router";

export default function ChatRoomPage() {
  const { id } = useParams();

  return <div>ChatRoom id {id}</div>;
}
