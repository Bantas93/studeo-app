export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  date.setHours(date.getHours() - 7); // sesuaikan ke WIB

  const now = new Date();
  now.setHours(now.getHours() - 7);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor(
    (todayStart.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timeStr = date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return timeStr;
  }

  if (diffDays === 1) {
    return `Kemarin ${timeStr}`;
  }

  const dateStr_ = date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${dateStr_} ${timeStr}`;
}
