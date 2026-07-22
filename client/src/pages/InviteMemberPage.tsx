import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Swal from "sweetalert2";
import { socket } from "../lib/socket";
import { parseRoomParam, buildRoomPath } from "../helpers/roomId";

interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface Member {
  _id: string;
  roomId: string;
  userId: string;
}

export default function InviteMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { roomName, roomId } = parseRoomParam(id);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    axios
      .get<User[]>(`${import.meta.env.VITE_API_URL}/users`)
      .then(({ data }) => setUsers(data))
      .catch(() => {});
  }, []);

  const fetchMembers = useCallback(() => {
    axios
      .get<Member[]>(`${import.meta.env.VITE_API_URL}/members/room/${roomId}`)
      .then(({ data }) => setMembers(data))
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const memberUsers = members
    .map((m) => users.find((u) => u._id === m.userId))
    .filter(Boolean) as User[];

  const memberUserIds = new Set(members.map((m) => m.userId));

  const filteredUsers =
    search.trim().length > 0
      ? users.filter(
          (u) =>
            !memberUserIds.has(u._id) &&
            (u.username.toLowerCase().includes(search.toLowerCase()) ||
              u.email.toLowerCase().includes(search.toLowerCase())),
        )
      : [];

  const handleInvite = async (userId: string) => {
    setError("");
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/members`,
        { roomId, userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      socket.emit("members_changed", { roomId });

      Swal.fire({
        title: "Member invited successfully",
        icon: "success",
      });

      setSearch("");
      setShowDropdown(false);
      fetchMembers();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const msg =
        axiosError.response?.data?.message ?? "Failed to invite member";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-l from-primary/95 to-info/50 flex justify-center items-center p-4">
      <fieldset className="fieldset bg-base-100/80 backdrop-blur border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Invite Member</legend>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <p className="text-base-content/70 mb-4">
          Room: <span className="font-medium">{roomName}</span>
        </p>

        <label className="label">Search by username or email</label>
        <input
          type="text"
          className="input w-full"
          placeholder="Type a username or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
            setError("");
          }}
          onFocus={() => {
            if (search.trim().length > 0) setShowDropdown(true);
          }}
        />

        <div className={"relative"}>
          {showDropdown && filteredUsers.length > 0 && (
            <ul
              ref={dropdownRef}
              className="menu bg-base-100 rounded-box absolute z-10 mt-1 w-full shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredUsers.map((user) => (
                <li key={user._id}>
                  <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() => void handleInvite(user._id)}
                    disabled={loading}
                  >
                    <div className="avatar avatar-placeholder">
                      <div className="bg-neutral text-neutral-content w-8 rounded-full">
                        <span className="text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user.username}</div>
                      <div className="text-xs text-base-content/50">
                        {user.email}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showDropdown &&
            search.trim().length > 0 &&
            filteredUsers.length === 0 && (
              <div className="bg-base-100 rounded-box absolute z-10 mt-1 w-full p-3 shadow-lg text-sm text-base-content/50">
                No users found
              </div>
            )}
        </div>

        {/* Current members list */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">
            Members ({memberUsers.length})
          </h3>
          {memberUsers.length === 0 ? (
            <p className="text-sm text-base-content/50">No members yet</p>
          ) : (
            <ul className="bg-base-100 rounded-box divide-y divide-base-200 max-h-48 overflow-y-auto">
              {memberUsers.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <div className="avatar avatar-placeholder">
                    <div className="bg-neutral text-neutral-content w-8 rounded-full">
                      <span className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user.username}</div>
                    <div className="text-xs text-base-content/50">
                      {user.email}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to={`/room/${buildRoomPath(roomName, roomId)}`}
          className="btn btn-outline mt-4 w-full"
        >
          Back to Room
        </Link>
      </fieldset>
    </div>
  );
}
