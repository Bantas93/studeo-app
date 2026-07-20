import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import axios from "axios";
import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  useMaybeTrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";

const API_URL = import.meta.env.VITE_API_URL;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

type CallMode = "video" | "voice";

function LiveKitCssOverride() {
  return (
    <style>{`
      .lk-participant-tile video,
      .lk-participant-media-video {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        object-fit: cover !important;
      }
      .lk-grid-layout {
        width: 100%;
        height: 100%;
      }
      .lk-participant-tile {
        position: relative;
        overflow: hidden;
        border-radius: 0.5rem;
      }
    `}</style>
  );
}

function ParticipantTileWrapper({ mode }: { mode: CallMode }) {
  const trackRef = useMaybeTrackRefContext();
  if (!trackRef) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <ParticipantTile />
      {mode === "voice" && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300 rounded-lg pointer-events-none">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-16 sm:w-20">
              <span className="text-xl sm:text-2xl">
                {trackRef.participant.name?.slice(0, 2).toUpperCase() ||
                  trackRef.participant.identity.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoomGrid({ mode }: { mode: CallMode }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone], {
    onlySubscribed: false,
  });

  return (
    <GridLayout tracks={tracks} style={{ height: "100%", width: "100%" }}>
      <ParticipantTileWrapper mode={mode} />
    </GridLayout>
  );
}

export default function CallingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomName = id?.split("-")[0] ?? "";
  const roomId = id?.split("-")[1] ?? "";
  const [searchParams] = useSearchParams();
  const mode: CallMode =
    searchParams.get("mode") === "voice" ? "voice" : "video";

  const token = localStorage.getItem("access_token");
  const currentUsername = (() => {
    try {
      if (!token) return "Guest";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.username || "Guest";
    } catch {
      return "Guest";
    }
  })();

  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !token) {
      setError("Room ID atau token tidak tersedia");
      setConnecting(false);
      return;
    }

    (async () => {
      try {
        const { data } = await axios.post(
          `${API_URL}/livekit/token`,
          { roomName: roomId, participantName: currentUsername },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setLivekitToken(data.token);
        setConnecting(false);
      } catch {
        setError("Gagal mendapatkan token LiveKit");
        setConnecting(false);
      }
    })();
  }, [roomId, token, currentUsername]);

  const handleDisconnected = () => {
    navigate(`/room/${roomName}-${roomId}`);
  };

  if (connecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="ml-3 text-lg">Menghubungkan ke panggilan...</span>
      </div>
    );
  }

  if (error || !livekitToken) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200 gap-4">
        <p className="text-error text-lg">{error || "Token tidak tersedia"}</p>
        <button
          className="btn btn-outline"
          onClick={() => navigate(`/room/${roomName}-${roomId}`)}
        >
          Kembali ke Room
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral text-neutral-content flex flex-col">
      <LiveKitCssOverride />
      <LiveKitRoom
        token={livekitToken}
        serverUrl={LIVEKIT_URL}
        video={mode === "video"}
        audio={true}
        screen={false}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
        className="h-full grid grid-col-3 min-h-0"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-neutral-focus shrink-0">
          <h2 className="font-bold text-base sm:text-lg truncate">
            {mode === "video" ? "🎥 Video Call" : "📞 Voice Call"} — Room:{" "}
            {roomName}
          </h2>
        </div>

        {/* Grid peserta */}
        <div className="flex-1 min-h-0 px-2 sm:px-4 pb-2 sm:pb-4">
          <RoomGrid mode={mode} />
        </div>

        {/* Control bar */}
        <div className="relative flex justify-center items-end w-full">
          <ControlBar
            variation="verbose"
            controls={{
              microphone: true,
              camera: mode === "video",
              screenShare: false,
              leave: true,
            }}
          />
        </div>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
