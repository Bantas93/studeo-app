import {
  AudioStream,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  TrackKind,
} from "@livekit/rtc-node";
import { AccessToken } from "livekit-server-sdk";
import { io as ioClient } from "socket.io-client";
import { encodeWav } from "../helpers/encodeWav";
import { askAI } from "../config/openAi";
import Message from "../models/Message";
import User from "../models/User";
import RoomModel from "../models/Room";
import { server } from "../config/dns";
server();

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;
const BOT_NAME = process.env.BOT_NAME;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const room = new Room();
let socketClient: ReturnType<typeof ioClient> | null = null;

interface RecordedBuffer {
  timestamp: number;
  buffer: Buffer;
  participant: string;
  roomId: string | undefined;
}

type ActiveAudioRecorder = {
  participantIdentity: string;
  trackSid: string | undefined;
  flush: () => void;
  stop: () => void;
};

interface TranscriptEntry {
  timestamp: number;
  participant: string;
  text: string;
}

interface GroqTranscriptionResponse {
  text: string;
  error?: {
    message: string;
  };
}

const recorderBuffer = new Map<string, RecordedBuffer[]>();
const activeRecorders = new Map<string, ActiveAudioRecorder>();
const getRecorderKey = (participantIdentity: string, trackSid: string) =>
  `${participantIdentity}:${trackSid}`;

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

    if (!publication.sid) throw new Error("Publication SID is undefined!");
    if (!room.name) throw new Error("Room name is undefined");
    const participantIdentity = participant.identity;
    const recorderKey = getRecorderKey(participantIdentity, publication.sid);
    const roomName = room.name;

    console.log(`Mulai merekam suara dari: ${recorderKey}`);

    const audioStream = new AudioStream(track, 16000, 1);

    await (async () => {
      const CHUNK_SIZE = 256 * 1024;
      let accumulatedChunks: Buffer[] = [];
      let accumulatedSize = 0;
      let firstTimestamp = 0;
      let stopRecord = false;

      const flush = () => {
        if (accumulatedChunks.length === 0) return;
        const mergedBuffer = Buffer.concat(accumulatedChunks);
        const timestampBuffers = recorderBuffer.get(roomName);
        console.log(
          `[FLUSH] ${participantIdentity} — ${mergedBuffer.byteLength} bytes — ts: ${firstTimestamp}`,
        );

        if (timestampBuffers === undefined) {
          recorderBuffer.set(roomName, [
            {
              timestamp: firstTimestamp,
              buffer: mergedBuffer,
              participant: participantIdentity,
              roomId: roomName,
            },
          ]);
        } else {
          if (mergedBuffer.byteLength >= CHUNK_SIZE) {
            timestampBuffers.push({
              timestamp: firstTimestamp,
              buffer: mergedBuffer,
              participant: participantIdentity,
              roomId: roomName,
            });
          } else {
            const latestBuffer = timestampBuffers[timestampBuffers.length - 1];
            latestBuffer.buffer = Buffer.concat([
              latestBuffer.buffer,
              mergedBuffer,
            ]);
          }
        }
        accumulatedChunks = [];
        accumulatedSize = 0;
      };

      const stop = () => {
        if (stopRecord) return;
        stopRecord = true;
        flush();
        activeRecorders.delete(recorderKey);
      };

      activeRecorders.set(participantIdentity, {
        participantIdentity: participantIdentity,
        trackSid: publication.sid,
        flush,
        stop,
      });

      try {
        for await (const frame of audioStream) {
          if (stopRecord) break;

          const frameBuffer = Buffer.from(frame.data.buffer);
          const dateNow = Date.now();
          if (accumulatedChunks.length === 0) firstTimestamp = dateNow;

          if (!room.remoteParticipants.get(participant.identity)) {
            stop();
          }

          accumulatedChunks.push(frameBuffer);
          accumulatedSize += frameBuffer.byteLength;

          if (accumulatedSize >= CHUNK_SIZE) {
            flush();
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        stop();
      }
    })();
  },
);

room.on(
  RoomEvent.ParticipantDisconnected,
  async (participant: RemoteParticipant) => {
    console.log(`Participant: ${participant.identity} has disconnected.`);

    for (const [key, recorder] of activeRecorders) {
      if (recorder.participantIdentity === participant.identity) {
        recorder.stop();
        activeRecorders.delete(key);
      }
    }

    if (room.remoteParticipants.size === 0) {
      if (!room.name) throw new Error("Room name is undefined");

      const roomName = room.name;
      const chunks = recorderBuffer.get(roomName);
      if (!chunks || chunks.length === 0) {
        console.log("No audio chunks to transcribe.");
        return;
      }

      console.log(
        `All participants gone — processing ${chunks.length} audio chunk(s)`,
      );

      recorderBuffer.set(roomName, []);

      const botUser = await User.where("username", "eq", BOT_NAME).first();
      if (!botUser) {
        throw new Error(`Bot user not found: ${BOT_NAME}`);
      }

      let isBotTyping = true;
      const botTyping = async () => {
        while (socketClient?.connected && isBotTyping) {
          socketClient.emit("user_typing", {
            roomId: room.name,
            userId: String(botUser._id),
            username: BOT_NAME,
          });
          await sleep(500);
        }
      };

      const typingPromise = botTyping();

      // Sort by timestamp for all participants
      const sorted = [...chunks].sort((a, b) => a.timestamp - b.timestamp);
      const transcript: TranscriptEntry[] = [];
      for (const chunk of sorted) {
        try {
          const wavBuffer = encodeWav(chunk.buffer);
          const text = await transcribeWithGroq(wavBuffer);
          if (text.trim()) {
            transcript.push({
              timestamp: chunk.timestamp,
              participant: chunk.participant,
              text: text.trim(),
            });
          }
        } catch (err) {
          console.error(
            `Transcription failed for ${chunk.participant} @ ${chunk.timestamp}:`,
            (err as Error).message,
          );
        }
      }

      const conversation = transcript
        .map((entry) => {
          const time = new Date(entry.timestamp).toLocaleTimeString();
          return `[${time}] ${entry.participant}: ${entry.text}`;
        })
        .join("\n")
        .trim();

      console.log("Conversation: ");
      console.log(conversation);

      const roomModel = await RoomModel.where("_id", "eq", roomName).first();
      if (!roomModel) {
        throw new Error(`Room not found: ${roomName}`);
      }

      const aiResponse = await askAI({
        topic: roomModel.name,
        conversation: conversation,
      });

      console.log("AI response: ");
      console.log(aiResponse);

      const savedMessage = await Message.sendMessage({
        roomId: roomName,
        content: aiResponse ? aiResponse : "-",
        userId: String(botUser._id),
        isBot: true,
      });

      isBotTyping = false;
      if (socketClient?.connected) {
        socketClient.emit("stop_typing", {
          roomId: roomName,
          userId: String(botUser._id),
        });
      }
      await typingPromise;

      if (socketClient?.connected) {
        socketClient.emit("send_message", {
          ...savedMessage,
          username: BOT_NAME,
        });
      }
    }
  },
);

// 🔍 Saat room disconnect (semua participant sudah leave)
room.on(RoomEvent.Disconnected, async (reason) => {
  for (const recorder of activeRecorders.values()) {
    recorder.stop();
  }

  activeRecorders.clear();

  console.log(`Room disconnected.`, reason);
  console.log("Room telah kosong — semua participant sudah leave.");
});

async function main() {
  const roomName = process.argv[2] || "Test-Room";

  socketClient = ioClient(SOCKET_SERVER_URL);
  await new Promise<void>((resolve) => {
    socketClient!.on("connect", resolve);
  });
  console.log(`Socket.IO bot connected to ${SOCKET_SERVER_URL}`);

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: BOT_NAME,
    },
  );
  at.addGrant({ room: roomName, roomJoin: true, canSubscribe: true });

  await room.connect(process.env.LIVEKIT_URL as string, await at.toJwt(), {
    autoSubscribe: true,
    dynacast: false,
  });

  console.log(`Bot bergabung ke room "${roomName}"...`);
}

main().catch((err) => {
  console.error("Gagal menjalankan bot:", err);
  process.exit(1);
});
