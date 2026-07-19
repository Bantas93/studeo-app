import { ChildProcess, spawn } from "child_process";
import path from "path";

const runningBots = new Map<string, ChildProcess>();
export function ensureBotRunning(roomName: string): void {
  if (runningBots.has(roomName)) {
    return;
  }

  console.log(`Spawning bot baru untuk room: ${roomName}`);

  const botProcess = spawn(
    "npx",
    ["tsx", path.join(__dirname, "../services/record-text.ts"), roomName],
    { stdio: "inherit", shell: true },
  );

  runningBots.set(roomName, botProcess);

  botProcess.on("exit", (code: number | null) => {
    console.log(`Bot untuk room "${roomName}" berhenti (exit code: ${code})`);
    runningBots.delete(roomName);
  });

  botProcess.on("error", (err: Error) => {
    console.error(
      `Gagal menjalankan bot untuk room "${roomName}":`,
      err.message,
    );
    runningBots.delete(roomName);
  });
}
