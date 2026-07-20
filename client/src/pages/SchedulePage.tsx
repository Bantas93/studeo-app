import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

interface ISchedule {
  _id: string;
  title: string;
  description: string;
  meetingTime: string;
}

export default function SchedulePage() {
  const { id } = useParams<{ id: string }>();

  const roomName = id?.split("-")[0] ?? "";
  const roomId = id?.split("-")[1] ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [schedules, setSchedules] = useState<ISchedule[]>([]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/schedules`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      console.log(data, "<<<<DATA SCHEDULES");
      setSchedules(data);
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
    const date = new Date(meetingTime);
    date.setHours(date.getHours() + 7);
    //   console.log(title, "<<<<TITLE");
    //   console.log(description, "<<<<DESCRIPTION");
    console.log(date.toISOString(), "<<<<<MEET TIME");

    const payload = {
      roomId,
      title,
      description,
      meetingTime: date.toISOString(),
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/schedules`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (_id: string) => {
    console.log(_id, "<<<<ID HANDLE DELETE");

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/schedules`, {
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
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold">
          Schedule &mdash; {roomName}
        </h1>
        <p className="text-sm text-base-content/50">
          Room ID: <span className="font-mono text-xs">#{roomId}</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset bg-base-100 border border-base-300 rounded-box p-4">
              <legend className="fieldset-legend text-base font-semibold">
                Create Schedule
              </legend>

              <label className="label pt-1">Title</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="schedule title here..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label className="label pt-2">Description</label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="what shcedule description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="label pt-2">Meeting Time</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />

              <button type="submit" className="btn btn-primary w-full mt-2">
                + Create Schedule
              </button>
              <Link to={`/room/${roomName}-${roomId}`} className="btn mt-2">
                back
              </Link>
            </fieldset>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-sm sm:table-md table-zebra">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Meeting Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length > 0 ? (
                  schedules.map((schedule, idx) => (
                    <tr key={schedule?._id}>
                      <th>{idx + 1}</th>
                      <td>{schedule?.title}</td>
                      <td>{schedule?.description}</td>
                      <td>{schedule?.meetingTime}</td>
                      <td>
                        <button
                          className="btn btn-error btn-xs text-white"
                          onClick={() => handleDelete(schedule?._id)}
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-base-content/50 py-8 text-sm"
                    >
                      Belum ada schedule
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
