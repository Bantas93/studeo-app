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
}

export default function HompePage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<IRoom[]>([]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/rooms`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

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

    socket.on("rooms_updated", handleRoomsUpdated);

    return () => {
      socket.off("rooms_updated", handleRoomsUpdated);
      socket.disconnect();
    };
  }, []);

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
                      <Link
                        to={`/room/${room.name}-${room._id.toString()}`}
                        className="btn btn-primary"
                      >
                        Join Room
                      </Link>
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
