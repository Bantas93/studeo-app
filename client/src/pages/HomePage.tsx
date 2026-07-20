import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";

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

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/rooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setRooms(data);
    } catch (error) {
      console.log(error);
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

    socket.on("rooms_updated", handleRoomsUpdated);
    socket.on("members_updated", handleMembersInvite);

    return () => {
      socket.off("rooms_updated", handleRoomsUpdated);
      socket.off("members_updated", handleMembersInvite);
      socket.disconnect();
    };
  }, []);

  const handleJoinRoom = async (roomId: string, roomName: string, isMember: boolean) => {
    const token = localStorage.getItem("access_token");
    const userId = getCurrentUserId();

    if (!token || !userId) return;

    setJoiningRoomId(roomId);

    if (isMember) {
      navigate(`/room/${roomName}-${roomId}`);
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

      navigate(`/room/${roomName}-${roomId}`);
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
        socket.emit("members_changed");

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

  return (
    <div className="min-h-screen p-6">
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
          <button
            className="btn"
            onClick={() => {
              localStorage.removeItem("access_token");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm-grid-cols-1 gap-4">
          {rooms &&
            rooms.map((room) => {
              return (
                <div
                  className="card bg-base-100 card-md shadow-sm"
                  key={room._id.toString()}
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
                        className="btn btn-primary"
                        onClick={() => handleJoinRoom(room._id.toString(), room.name, room.isMember)}
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
              );
            })}
        </div>
      </div>
    </div>
  );
}
