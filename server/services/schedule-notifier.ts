import { getIO } from "../lib/socket";
import Schedule from "../models/Schedule";
import RoomModel from "../models/Room";

const POLL_MS = 5_000;
const LOOKBACK_MS = 5_000;
const LOOKAHEAD_MS = 60_000;

export function startScheduleNotifier() {
  setInterval(async () => {
    try {
      const now = Date.now() + 7 * 3600_000; // Jakarta time (UTC+7)
      const start = new Date(now - LOOKBACK_MS);
      const finish = new Date(now + LOOKAHEAD_MS);
      // console.log("[schedule-notifier] checking for upcoming schedules...", "now", new Date(now), "start:", start, "finish:", finish);

      const upcoming = await Schedule.where(
        "meetingTime",
        "lte",
        finish,
      )
        .where("meetingTime", "gte", start)
        .all();

      for (const schedule of upcoming) {
        if (schedule.isEmitted) continue;

        const room = await RoomModel.find(String(schedule.roomId));

        getIO().to(`schedule:${schedule.roomId}`).emit("schedule_reminder", {
          title: schedule.title,
          meetingTime: schedule.meetingTime,
          roomId: schedule.roomId,
          room: room
            ? {
                name: room.name,
                subject: room.subject,
                roomType: room.roomType,
              }
            : null,
        });

        await Schedule.update(schedule, { isEmitted: true });

        console.log(
          `[schedule-notifier] emitted reminder "${schedule.title}" to room ${schedule.roomId} at ${schedule.meetingTime.toISOString()}`,
        );
      }
    } catch (err) {
      console.error("[schedule-notifier] error:", err);
    }
  }, POLL_MS);

  console.log(`[schedule-notifier] started (polling every ${POLL_MS / 1000}s)`);
}
