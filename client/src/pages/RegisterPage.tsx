import axios, { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import studeoLogo from "../assets/studeo_logo_v4.svg";

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
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-linear-to-r from-primary/95 to-info/50">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-100/80 backdrop-blur border-base-300 rounded-box w-xs border p-4">
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

            <button type="submit" className="btn btn-primary mt-4">
              Register
            </button>
            <p className="text-center mt-4">
              Have account? Login{" "}
              <Link to={"/"} className="link link-primary">
                Here
              </Link>
            </p>
          </fieldset>
        </form>
      </div>

      {/* Right: Brand */}
      <div className="hidden lg:flex lg:w-3/5 bg-linear-to-bl from-primary to-primary-focus items-center justify-center p-12">
        <div className="flex items-center gap-1">
          <img src={studeoLogo} alt="STUDEO" className="w-42 -me-8" />
          <div>
            <h1 className="text-7xl font-black tracking-tighter text-primary-content leading-none">
              STUDEO
            </h1>
            <p className="text-lg text-white/90 mt-1 animate-bounce">
              Learn. Collaborate. Succeed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
