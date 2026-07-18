import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      localStorage.setItem("access_token", data.access_token);
      Swal.fire({
        title: "Login Succesful",
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
      <form onSubmit={handleLogin}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Login</legend>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <label className="label">username</label>
          <input
            type="text"
            className="input"
            placeholder="your username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="your password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn btn-neutral mt-4">
            Login
          </button>
          <p className="text-center mt-4">
            Dont have account? register{" "}
            <Link to={"/register"} className="underline text-blue-800">
              Here
            </Link>
          </p>
        </fieldset>
      </form>
    </div>
  );
}
