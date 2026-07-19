import { useNavigate, useParams } from "react-router";

export default function CallingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = id;

  const handleEndCall = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex justify-between w-full p-4">
      <div>Calling Page {roomId}</div>
      <button className="btn" onClick={() => handleEndCall()}>
        End Call
      </button>
    </div>
  );
}
