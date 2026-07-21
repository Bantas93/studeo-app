import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";

interface Subject {
  _id: string;
  name: string;
}

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/subjects`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      setSubjects(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      console.log(msg);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const payload = {
      name,
      roomType,
      maxParticipants: Number(maxParticipants),
      selectedSubject,
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/rooms`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      Swal.fire({
        title: "Create Room Succesful",
        icon: "success",
      });

      socket.emit("rooms_changed");
      navigate("/homepage");
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
          <legend className="fieldset-legend">Create Room</legend>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <label className="label">Topic</label>
          <input
            type="text"
            className="input"
            placeholder="topic name"
            onChange={(e) => setName(e.target.value)}
          />

          <label className="label">type</label>
          <select
            defaultValue={""}
            className="select appearance-none"
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value={""} disabled>
              Select type
            </option>
            <option value={"public"}>Public</option>
            <option value={"private"}>Private</option>
          </select>

          <label className="label">subject</label>
          <select
            defaultValue={""}
            className="select appearance-none"
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value={""} disabled>
              Select subjects
            </option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj.name}>
                {subj.name.toUpperCase()}
              </option>
            ))}
          </select>

          <label className="label">Max Participants</label>
          <input
            type="number"
            className="input"
            onChange={(e) => setMaxParticipants(e.target.value)}
          />

          <button type="submit" className="btn btn-primary mt-4">
            Create room
          </button>
          <Link to={"/homepage"} className="btn btn-outline mt-2">
            ← Back
          </Link>
        </fieldset>
      </form>
    </div>
  );
}
