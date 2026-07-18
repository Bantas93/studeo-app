import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function CreateSubjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/subjects/create`,
        { name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      Swal.fire({
        title: "Create Subject Succesful",
        icon: "success",
      });

      navigate("/homepage");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Terjadi kesalahan";
      setError(msg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Create Subject</legend>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <label className="label">Subject</label>
          <input
            type="text"
            className="input"
            placeholder="subject name"
            onChange={(e) => setName(e.target.value)}
          />

          <button type="submit" className="btn btn-neutral mt-4">
            Create subject
          </button>
          <Link to={"/homepage"} className="btn mt-4">
            back
          </Link>
        </fieldset>
      </form>
    </div>
  );
}
