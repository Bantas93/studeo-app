import { useParams } from "react-router";
import ChatRoomsList from "../components/ChatRoomList";
import ChatSidebar from "../components/ChatSidebar";

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="drawer lg:drawer-open drawer-end h-screen overflow-hidden">
      <input id="chat-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col h-full overflow-hidden">
        <ChatRoomsList id={id ?? ""} />
      </div>

      <div className="drawer-side z-10">
        <label htmlFor="chat-drawer" className="drawer-overlay"></label>
        <ChatSidebar />
      </div>
    </div>
  );
}
