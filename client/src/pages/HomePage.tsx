import { Link } from "react-router";

export default function HompePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="flex flex-col gap-4">
        <div>
          <Link to={"/room/create"} className="btn">
            Create Room
          </Link>
        </div>

        <div className="card w-96 bg-base-100 card-md shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Topic : Cari rumus segitiga</h2>
            <p>Mata pelajaran : Matematika</p>
            <div className="justify-end card-actions">
              <button className="btn btn-primary">Join Room</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
