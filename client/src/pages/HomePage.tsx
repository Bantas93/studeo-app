import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router";

interface IRoom {
  _id: string;
  name: string;
  subject: string;
  roomType: string;
  maxParticipants: number;
}

export default function HompePage() {
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
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Link to={"/room/create"} className="btn btn-primary">
            Create Room
          </Link>
          <Link to={"/subject/create"} className="btn">
            Create Subject
          </Link>
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
                    <h2 className="card-title">Topic : {room.name}</h2>
                    <p>Mata pelajaran : {room.subject}</p>
                    <div className="justify-end card-actions">
                      <Link
                        to={`/room/${room._id.toString()}`}
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
