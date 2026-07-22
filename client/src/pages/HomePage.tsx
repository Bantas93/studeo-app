import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";
import { buildRoomPath } from "../helpers/roomId";

interface ICreator {
  username: string;
  email: string;
}
interface IRoom {
  _id: string;
  name: string;
  subject: string;
  roomType: string;
  maxParticipants: number;
  creator: ICreator;
  isMember: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

function getCurrentUserId(): string {
  const token = localStorage.getItem("access_token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload._id || "";
  } catch {
    return "";
  }
}

export default function HompePage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/rooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setRooms(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!socket.connected) {
      socket.connect();
    }

    const handleRoomsUpdated = () => {
      fetchData();
    };
    const handleMembersInvite = () => fetchData();
    const handleScheduleReminder = (data: {
      title: string;
      meetingTime: string;
      roomId: string;
      room: { name: string; subject: string; roomType: string } | null;
    }) => {
      const roomName = data.room?.name ?? data.roomId;
      const subject = data.room?.subject ?? "";

      Swal.fire({
        title: `📅 ${roomName.toUpperCase()}`,
        text: `Subject: ${subject.toUpperCase()}, Meeting at ${new Date(
          data.meetingTime,
        )
          .toISOString()
          .split(".")[0]
          .replace("T", " ")}`,
        icon: "info",
        confirmButtonText: "OK",
      });
    };

    socket.on("rooms_updated", handleRoomsUpdated);
    socket.on("members_updated", handleMembersInvite);
    socket.on("schedule_reminder", handleScheduleReminder);

    return () => {
      socket.off("rooms_updated", handleRoomsUpdated);
      socket.off("members_updated", handleMembersInvite);
      socket.off("schedule_reminder", handleScheduleReminder);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket.connected || rooms.length === 0) return;

    const userId = getCurrentUserId();
    if (!userId) return;

    const memberRoomIds = rooms
      .filter((r) => r.isMember)
      .map((r) => r._id.toString());

    if (memberRoomIds.length > 0) {
      socket.emit("schedule-notification", { userId, roomIds: memberRoomIds });
    }
  }, [rooms]);

  const handleJoinRoom = async (
    roomId: string,
    roomName: string,
    isMember: boolean,
  ) => {
    const token = localStorage.getItem("access_token");
    const userId = getCurrentUserId();

    if (!token || !userId) return;

    setJoiningRoomId(roomId);

    if (isMember) {
      navigate(`/room/${buildRoomPath(roomName, roomId)}`);
    }

    try {
      // Check if user is already a member
      const { data: members } = await axios.get<{ userId: string }[]>(
        `${API_URL}/members/room/${roomId}`,
      );

      const isMember = members.some((m) => m.userId === userId);

      if (!isMember) {
        await axios.post(
          `${API_URL}/members`,
          { roomId, userId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      navigate(`/room/${buildRoomPath(roomName, roomId)}`);
    } catch {
      Swal.fire({
        title: "Gagal bergabung ke room",
        icon: "error",
      });
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleDeleteRoom = async (_id: string, name: string) => {
    try {
      const result = await Swal.fire({
        title: `Delete "${name}" rooms?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya",
      });

      if (result.isConfirmed) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/rooms/${_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: { _id },
        });
        socket.emit("rooms_changed");
        socket.emit("members_changed", { roomId: _id });

        Swal.fire({
          title: "Delete Sucesfull",
          icon: "success",
        });
        fetchData();
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);

      Swal.fire({
        title: msg,
        icon: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const result = await Swal.fire({
        title: "Do you want logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes",
      });

      if (!result.isConfirmed) return;

      localStorage.removeItem("access_token");
      navigate("/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-l from-primary/95 to-info/50 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <div className="flex gap-4">
            <Link to={"/room/create"} className="btn btn-primary">
              Create Room
            </Link>
            <Link to={"/subject/create"} className="btn">
              Create Subject
            </Link>
          </div>

          <button className="btn" onClick={handleLogout}>
            Welcome,{" "}
            {
              JSON.parse(
                atob(
                  (localStorage.getItem("access_token") || ".").split(".")[1],
                ),
              ).username
            }
          </button>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-32">
              <span className="loading loading-infinity loading-xl text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full text-center py-16 text-base-content/50">
              <p className="text-lg">Belum ada room</p>
              <p className="text-sm mt-1">Buat room baru untuk memulai!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                className="card bg-base-100/80 backdrop-blur card-md shadow-sm hover:shadow-md transition-shadow border border-base-300/50"
                key={String(room._id)}
              >
                <div className="card-body">
                  <div className="card-title justify-between">
                    <div>
                      Topic : <span>{room.name.toUpperCase()}</span>
                    </div>
                    <div className="badge-xs -me-4 -mt-12">
                      by : {room.creator.username}
                    </div>
                  </div>
                  <p className="-mt-3">Mata pelajaran : {room.subject}</p>
                  <p
                    className={`badge badge-soft ${room.roomType === "public" ? `badge-primary` : `badge-warning`}`}
                  >
                    {room.roomType}
                  </p>
                  <div className="justify-end card-actions">
                    <button
                      className="btn btn-error text-white"
                      onClick={() => handleDeleteRoom(room._id, room.name)}
                    >
                      Delete
                    </button>
                    <button
                      className={`btn ${room.isMember ? "btn-outline btn-info text-black" : "btn-primary"}`}
                      onClick={() =>
                        handleJoinRoom(
                          room._id.toString(),
                          room.name,
                          room.isMember,
                        )
                      }
                      disabled={joiningRoomId === room._id.toString()}
                    >
                      {joiningRoomId === room._id.toString()
                        ? "Joining..."
                        : room.isMember
                          ? "Enter Room"
                          : "Join Room"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
