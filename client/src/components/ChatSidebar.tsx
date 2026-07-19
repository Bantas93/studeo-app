import { useNavigate } from "react-router";

interface IProps {
  roomId: string;
}

export default function ChatSidebar({ roomId: _roomId }: IProps) {
  const navigate = useNavigate();

  const handleLeaveRoom = () => {
    navigate("/homepage");
  };

  return (
    <div className="w-80 h-full bg-base-200 p-4 border-l border-base-300 flex flex-col gap-4">
      {/* Judul Panel */}
      <h3 className="font-bold text-lg border-b border-base-300 pb-2 text-base-content">
        Room Information
      </h3>

      {/* Bagian Tombol-Tombol Aksi */}
      <div className="flex flex-col gap-2">
        <button className="btn btn-primary btn-sm w-full">
          Invite Friends
        </button>
        <button
          className="btn btn-error btn-outline btn-sm w-full"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
      </div>

      {/* Active Members - placeholder */}
      <div className="card bg-base-100 shadow-sm border border-base-300 mt-2">
        <div className="card-body p-4">
          <h2 className="card-title text-sm">Active Members</h2>
          <p className="text-xs text-base-content/50 italic mt-2">
            Fitur online users akan tersedia setelah WebSocket diaktifkan.
          </p>
        </div>
      </div>
    </div>
  );
}
