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

interface TimestampBuffer {
  timestamp: number,
  buffer: Buffer,
  participant: string,
}

const audioBuffers: Record<string, Buffer[]> = {};
const audioBuffers2: Array<TimestampBuffer> = [];

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
    new Blob([new Uint8Array(wavBuffer)], { type: "audio/wav" }),
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
  console.log(">>> GROG RESULT", data)

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

    // todo "await" make UI loading when back to the room
    await (async () => {
      for await (const frame of audioStream) {
        // const chunks = audioBuffers[participant.identity];
        // if (!chunks) break;
        // chunks.push(Buffer.from(frame.data.buffer));


        const timestampBuffer = {
          timestamp: Date.now(),
          buffer: Buffer.from(frame.data.buffer),
          participant: participant.identity,
        }
        console.log(`${timestampBuffer.timestamp} - ${timestampBuffer.participant} - BUFFER LENGTH: ${timestampBuffer.buffer.byteLength}`);
        audioBuffers2.push(timestampBuffer);
      }
    })();
  },
);

room.on(
  RoomEvent.ParticipantDisconnected,
  async (participant: RemoteParticipant) => {
    console.log(`${new Date().toLocaleString().split(" ")[1]} - Participant: ${participant.identity} has disconnected.`)
    console.log(room.remoteParticipants);

    if (room.remoteParticipants.size === 0) {
      console.log("TOTAL DATA TIMESTAMP BUFFER: ", audioBuffers2.length)

      const buffer = audioBuffers2.sort((a, b) => a.timestamp - b.timestamp)
        .map(buffer => buffer.buffer);

      const pcmBuffer = Buffer.concat(buffer);
      const wavBuffer = encodeWav(pcmBuffer);

      try {
        const text = await transcribeWithGroq(wavBuffer);
        // const aiResponse = await askAI(text);

        // console.log("\n═══════════════════════════════════════");
        // console.log(`🎤 Transkrip dari ${participant.identity}:`);
        // console.log(`   "${text}"`);
        // console.log(`🤖 AI Response:`);
        // console.log(`   "${aiResponse}"`);
        // console.log("═══════════════════════════════════════\n");
      } catch (err) {
        console.error("Gagal transkrip:", (err as Error).message);
      }
    }
  },
);

// 🔍 Saat room disconnect (semua participant sudah leave)
room.on(RoomEvent.Disconnected, async (reason) => {
  console.log(`Room disconnected.`, reason);
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
    dynacast: false
  });

  console.log(`Bot bergabung ke room "${roomName}"...`);
}

main().catch((err) => {
  console.error("Gagal menjalankan bot:", err);
  process.exit(1);
});
