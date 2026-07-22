import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";
import { parseRoomParam, buildRoomPath } from "../helpers/roomId";

interface Todo {
  roomId: string;
  title: string;
  description: string;
}

export default function CreateTodoPage() {
  const { id, todoId } = useParams<{ id: string; todoId: string }>();
  const { roomName, roomId } = parseRoomParam(id);

  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/todos/${todoId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      setTitle(data.title);
      setDescription(data.description);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    }
  };

  if (todoId) {
    useEffect(() => {
      fetchData();
    }, []);
  }
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload: Todo = {
      roomId,
      title,
      description,
    };

    try {
      if (todoId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/todos/${todoId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/todos`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
      }

      Swal.fire({
        title: `${todoId ? "Edit" : "Create"} Todo Succesful`,
        icon: "success",
      });

      socket.emit("todos_changed");
      navigate(`/room/${buildRoomPath(roomName, roomId)}`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-l from-primary/95 to-info/50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-100/80 backdrop-blur border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">
            {todoId ? "Edit" : "Create"} Todo
          </legend>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <label className="label">Title</label>
          <input
            type="text"
            className="input"
            placeholder="title name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="label">Description</label>
          <textarea
            className="textarea"
            placeholder="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <button type="submit" className="btn btn-primary mt-4">
            {todoId ? "Edit" : "Create"} Todo
          </button>
          <Link
            to={`/room/${buildRoomPath(roomName, roomId)}`}
            className="btn btn-outline mt-2"
          >
            ← Back
          </Link>
        </fieldset>
      </form>
    </div>
  );
}
