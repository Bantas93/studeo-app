export function formatTime(dateStr: string): string {
  // ini cth date string: 2026-07-22T01:30:40.000Z (menunjukkan waktu WIB) (format ISO UTC)
  //  sehingga "now" harus + 7
  const date = new Date(dateStr);

  const now = new Date();

  now.setHours(now.getHours() + 7);

  const diffDays = Math.round(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
  }

  if (diffDays === 1) {
    return `Kemarin ${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
  }

  const dateStr_ = date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${dateStr_} ${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}
