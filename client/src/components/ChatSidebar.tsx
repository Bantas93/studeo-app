import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";
import Markdown from "react-markdown";

interface IProps {
  roomId: string;
  roomName: string;
}

interface ITodo {
  _id: Object;
  roomId: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ChatSidebar({ roomId: _roomId, roomName }: IProps) {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<ITodo[]>([]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/todos/${_roomId}/room`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setTodos(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    }
  };

  useEffect(() => {
    fetchData();

    if (!socket.connected) {
      socket.connect();
    }

    const handleTodosUpdated = () => {
      fetchData();
    };

    socket.on("todos_updated", handleTodosUpdated);

    return () => {
      socket.off("todos_updated", handleTodosUpdated);
      socket.disconnect();
    };
  }, []);

  const backToHomePage = () => {
    navigate("/homepage");
  };

  const handleLeaveRoom = async () => {
    const result = await Swal.fire({
      title: "Leave Room?",
      text: "You will be removed from this room.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Leave",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/members/room/${_roomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      navigate("/homepage");
    } catch {
      Swal.fire({
        title: "Gagal meninggalkan room",
        icon: "error",
      });
    }
  };

  const handleDelete = async (_id: Object) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/todos/${_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: { _id },
      });

      socket.emit("todos_changed");
      fetchData();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    }
  };
  return (
    <div className="w-80 min-h-screen bg-base-100/90 backdrop-blur p-4 border-l border-base-300 flex flex-col gap-4">
      {/* Judul Panel */}
      <h3 className="font-bold text-lg border-b border-base-300 pb-2 text-base-content">
        Room Information
      </h3>

      {/* Bagian Tombol Aksi */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/room/${roomName}-${_roomId}/invite/member`}
            className="btn btn-primary btn-sm"
          >
            Members
          </Link>
          <Link
            to={`/room/${roomName}-${_roomId}/schedule`}
            className="btn btn-outline btn-sm w-full"
          >
            + Schedule
          </Link>
        </div>

        <Link
          to={`/room/${roomName}-${_roomId}/create/todo`}
          className="btn btn-outline btn-sm w-full"
        >
          Create Todo
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn btn-outline btn-sm w-full"
            onClick={backToHomePage}
          >
            Home Page
          </button>

          <button
            className="btn btn-error btn-outline btn-sm w-full"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Active Members - placeholder */}
      <div className="grid gap-2">
        {todos.length > 0 &&
          todos.map((todo) => {
            return (
              <div
                className="card bg-base-200 shadow-sm border border-base-300 relative"
                key={String(todo._id)}
              >
                <div className="absolute top-1 right-1 flex gap-1">
                  <Link
                    to={`/room/${roomName}-${_roomId}/edit/todo/${todo._id}`}
                    className="btn btn-ghost btn-xs text-xs"
                  >
                    📝
                  </Link>
                  <button
                    className="btn btn-ghost btn-xs text-xs"
                    onClick={() => handleDelete(todo._id)}
                  >
                    ❌
                  </button>
                </div>
                <div className="card-body p-4">
                  <h2 className="card-title text-sm pr-12 wrap-break-word whitespace-normal">
                    {todo.title}
                  </h2>
                  <div
                    className="text-xs text-base-content/70 mt-2 wrap-break-word 
                          [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                          [&_li]:mt-0.5 [&_p]:mb-1 [&_strong]:font-semibold
                          [&_code]:bg-base-200 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs
                          [&_pre]:bg-base-200 [&_pre]:p-2 [&_pre]:rounded-box [&_pre]:overflow-x-auto [&_pre]:text-xs
                          [&_a]:link [&_a]:link-primary"
                  >
                    <Markdown>{todo.description}</Markdown>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
