const ROOM_ID_REGEX = /-([a-f0-9]{24})$/;

export function parseRoomParam(id: string | undefined): {
  roomName: string;
  roomId: string;
} {
  if (!id) return { roomName: "", roomId: "" };
  const match = id.match(ROOM_ID_REGEX);
  if (!match) return { roomName: decodeURIComponent(id), roomId: "" };
  const roomId = match[1];
  const roomNameEncoded = id.slice(0, id.length - roomId.length - 1); // hilangkan "-<roomId>"
  return { roomName: decodeURIComponent(roomNameEncoded), roomId };
}

export function buildRoomPath(roomName: string, roomId: string): string {
  return `${encodeURIComponent(roomName)}-${roomId}`;
}
