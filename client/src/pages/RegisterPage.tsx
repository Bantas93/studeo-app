import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/register`,
        { username, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      Swal.fire({
        title: "Register Succesful",
        icon: "success",
      });
      navigate("/");
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
          <legend className="fieldset-legend">Register</legend>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <label className="label">username</label>
          <input
            type="text"
            className="input"
            placeholder="your username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">email</label>
          <input
            type="text"
            className="input"
            placeholder="your email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="your password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-neutral mt-4">
            Register
          </button>
          <p className="text-center mt-4">
            Have account? Login{" "}
            <Link to={"/"} className="underline text-blue-800">
              Here
            </Link>
          </p>
        </fieldset>
      </form>
    </div>
  );
}
