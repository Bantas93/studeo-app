export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  date.setHours(date.getHours() - 7);

  return date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
