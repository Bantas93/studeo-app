import {
  Room,
  RoomEvent,
  AudioStream,
  TrackKind,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "@livekit/rtc-node";
import { AccessToken } from "livekit-server-sdk";
import { askAI } from "../config/openAi";
import { encodeWav } from "../helpers/encodeWav";

const room = new Room();

const audioBuffers: Record<string, Buffer[]> = {};

interface GroqTranscriptionResponse {
  text: string;
  error?: {
    message: string;
  };
}

async function transcribeWithGroq(wavBuffer: Buffer): Promise<string> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([wavBuffer], { type: "audio/wav" }),
    "audio.wav",
  );
  form.append("model", "whisper-large-v3");
  form.append("language", "id");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: form,
    },
  );

  const data: GroqTranscriptionResponse = await response.json();

  if (!response.ok) {
    console.error("Groq API error:", data);
    throw new Error(data.error?.message || "Unknown Groq error");
  }

  return data.text;
}

room.on(
  RoomEvent.TrackSubscribed,
  async (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (track.kind !== TrackKind.KIND_AUDIO) return;

    console.log(`Mulai merekam suara dari: ${participant.identity}`);
    audioBuffers[participant.identity] = [];

    const audioStream = new AudioStream(track, 16000, 1);

    (async () => {
      for await (const frame of audioStream) {
        const chunks = audioBuffers[participant.identity];
        if (!chunks) break;
        chunks.push(Buffer.from(frame.data.buffer));
      }
    })();
  },
);

room.on(
  RoomEvent.ParticipantDisconnected,
  async (participant: RemoteParticipant) => {
    const chunks = audioBuffers[participant.identity];
    if (!chunks || chunks.length === 0) return;

    delete audioBuffers[participant.identity];

    const pcmBuffer = Buffer.concat(chunks);
    const wavBuffer = encodeWav(pcmBuffer);

    console.log(
      `\n${participant.identity} keluar. Mengirim ke Groq Whisper...`,
    );

    try {
      const text = await transcribeWithGroq(wavBuffer);
      const aiResponse = await askAI(text);

      console.log("\n═══════════════════════════════════════");
      console.log(`🎤 Transkrip dari ${participant.identity}:`);
      console.log(`   "${text}"`);
      console.log(`🤖 AI Response:`);
      console.log(`   "${aiResponse}"`);
      console.log("═══════════════════════════════════════\n");
    } catch (err) {
      console.error("Gagal transkrip:", (err as Error).message);
    }
  },
);

// 🔍 Saat room disconnect (semua participant sudah leave)
room.on(RoomEvent.Disconnected, () => {
  console.log("\n🔚 Room telah kosong — semua participant sudah leave.");
  console.log("   Hasil transkrip sudah dicetak di atas.\n");
});

async function main() {
  const roomName = process.argv[2] || "Test-Room";

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: "recorder-bot",
    },
  );
  at.addGrant({ room: roomName, roomJoin: true, canSubscribe: true });

  await room.connect(process.env.LIVEKIT_URL as string, await at.toJwt(), {
    autoSubscribe: true,
  });

  console.log(`Bot bergabung ke room "${roomName}"...`);
}

main().catch((err) => {
  console.error("Gagal menjalankan bot:", err);
  process.exit(1);
});
