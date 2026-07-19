import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

interface IProps {
  roomId: string;
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

export default function ChatSidebar({ roomId: _roomId }: IProps) {
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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeaveRoom = () => {
    navigate("/homepage");
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
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-80 min-h-screen bg-base-200 p-4 border-l border-base-300 flex flex-col gap-4">
      {/* Judul Panel */}
      <h3 className="font-bold text-lg border-b border-base-300 pb-2 text-base-content">
        Room Information
      </h3>

      {/* Bagian Tombol Aksi */}
      <div className="flex flex-col gap-2">
        <button className="btn btn-primary btn-sm w-full">
          Invite Friends
        </button>
        <button
          className="btn btn-error btn-outline btn-sm w-full"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
        <Link
          to={`/room/${_roomId}/create/todo`}
          className="btn btn-outline btn-sm w-full"
        >
          Create Todo
        </Link>
      </div>

      {/* Active Members - placeholder */}
      <div className="grid gap-2">
        {todos.length > 0 &&
          todos.map((todo) => {
            return (
              <div
                className="card bg-base-100 shadow-sm border border-base-300 relative"
                key={String(todo._id)}
              >
                <div className="absolute top-1 right-1 flex gap-1">
                  <Link
                    to={`/room/${_roomId}/edit/todo/${todo._id}`}
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
                  <h2 className="card-title text-sm pr-12">{todo.title}</h2>
                  <p className="text-xs text-base-content/50 italic mt-2">
                    {todo.description}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
