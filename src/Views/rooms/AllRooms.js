import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaSearch, FaDownload, FaEye, FaTimes, FaVideo, FaMicrophone, FaUsers, FaClock, FaTag } from "react-icons/fa";

const API = "http://31.97.228.17:4055/api/users/all";

// STATUS ENGINE
const getStatus = (start, duration) => {
  try {
    const [datePart, timePart, meridian] = start.split(" ");
    const [day, month, year] = datePart.split("-");

    let [hour, minute] = timePart.split(":");
    hour = Number(hour);

    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const now = new Date();

    if (now < startDate) return "upcoming";
    if (now >= startDate && now <= endDate) return "live";
    return "completed";
  } catch {
    return "unknown";
  }
};

// ROOM DETAILS MODAL
const RoomModal = ({ room, onClose, darkMode }) => {
  if (!room) return null;

  const status = getStatus(room.startDateTime, room.duration);

  const statusStyle = {
    live: "bg-green-500/20 text-green-400 border border-green-500/30",
    upcoming: "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30",
    completed: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
    unknown: "bg-gray-400/20 text-gray-400 border border-gray-400/30",
  };

  const genderColor = (gender) =>
    gender === "female"
      ? "from-pink-500/20 to-red-400/20 border-pink-400/30"
      : "from-blue-500/20 to-indigo-400/20 border-blue-400/30";

  const genderText = (gender) =>
    gender === "female" ? "text-pink-400" : "text-blue-400";

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl
          ${darkMode
            ? "bg-[#0f0f0f] border-pink-500/20"
            : "bg-white border-pink-200"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full
            bg-gray-200/30 hover:bg-pink-500/20 text-gray-400 hover:text-pink-400 transition"
        >
          <FaTimes />
        </button>

        {/* ROOM HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle[status]}`}>
              ● {status.toUpperCase()}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full
              bg-pink-500/10 text-pink-400 border border-pink-500/20`}>
              {room.type === "video" ? "📹 Video" : "🎙 Audio"}
            </span>
          </div>

          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            #{room.tag}
          </h2>
        </div>

        {/* ROOM META */}
        <div className={`grid grid-cols-2 gap-3 mb-6 p-4 rounded-2xl border
          ${darkMode ? "bg-white/5 border-white/10" : "bg-pink-50/60 border-pink-100"}`}>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <FaClock className="text-pink-400" />
            <span>{room.startDateTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <FaTag className="text-pink-400" />
            <span>{room.duration} mins duration</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <FaUsers className="text-pink-400" />
            <span>{room.joinedUsers?.length || 0} participants</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70">
            {room.type === "video" ? (
              <FaVideo className="text-pink-400" />
            ) : (
              <FaMicrophone className="text-pink-400" />
            )}
            <span>{room.type} room</span>
          </div>
        </div>

        {/* HOST INFO */}
        {room.userId && typeof room.userId === "object" && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">
              Host
            </p>
            <div className={`flex items-center gap-4 p-4 rounded-2xl border
              ${darkMode ? "bg-white/5 border-white/10" : "bg-white border-pink-100"}`}>
              {room.userId.profileImage ? (
                <img
                  src={room.userId.profileImage}
                  alt={room.userId.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-pink-500/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500
                  flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(room.userId.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">
                  {room.userId.name || "Unknown"}
                  {room.userId.nickname && (
                    <span className="ml-2 text-sm font-normal opacity-50">
                      @{room.userId.nickname}
                    </span>
                  )}
                </p>
                <p className="text-sm opacity-50">{room.userId.mobile}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 font-medium">
                  {room.userId.totalCoins || 0} coins
                </span>
                <span className="text-xs opacity-40">{room.userId.language}</span>
              </div>
            </div>
          </div>
        )}

        {/* JOINED USERS */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">
            Participants ({room.joinedUsers?.length || 0})
          </p>

          {room.joinedUsers?.length ? (
            <div className="flex flex-col gap-3">
              {room.joinedUsers.map((user, idx) => (
                <div
                  key={user._id || idx}
                  className={`flex items-center gap-3 p-4 rounded-2xl border bg-gradient-to-r
                    ${genderColor(user.gender)}
                    ${darkMode ? "" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    font-bold text-sm ${genderText(user.gender)}
                    bg-white/20 ring-1 ring-current/30`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user.name || "Unknown"}
                      {user.nickname && (
                        <span className="ml-2 font-normal opacity-50 text-xs">
                          @{user.nickname}
                        </span>
                      )}
                    </p>
                    <p className="text-xs opacity-50">{user.mobile}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${user.gender === "female"
                      ? "bg-pink-500/20 text-pink-400"
                      : "bg-blue-500/20 text-blue-400"}`}>
                    {user.gender || "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-40 text-sm">
              No participants yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AllRooms = ({ darkMode }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(API);
        setRooms(res.data.rooms || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // FILTER
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const status = getStatus(room.startDateTime, room.duration);
      const matchesSearch =
        room.tag.toLowerCase().includes(search.toLowerCase()) ||
        room.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesType =
        typeFilter === "all" || room.type.toLowerCase() === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rooms, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredRooms.length / rowsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // EXPORT
  const exportCSV = () => {
    const escape = (val) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const header = ["Tag", "Type", "Start", "Duration", "Status"];
    const rows = filteredRooms.map((room) => [
      room.tag,
      room.type,
      room.startDateTime,
      room.duration,
      getStatus(room.startDateTime, room.duration),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "rooms.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* MODAL */}
      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          darkMode={darkMode}
        />
      )}

      <div
        className={`relative min-h-screen p-10 overflow-hidden ${
          darkMode
            ? "bg-[#070707]"
            : "bg-gradient-to-br from-pink-50 via-white to-red-100"
        }`}
      >
        {/* PINK GRID */}
        {/* <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(#ff4d6d22 1px, transparent 1px),
              linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        /> */}

        {/* HEADER */}
        <div className="flex justify-between flex-wrap gap-4 mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Rooms War Center
          </h1>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold
              bg-gradient-to-r from-pink-500 to-red-500
              hover:scale-105 transition shadow-[0_0_25px_rgba(255,0,90,.6)]"
          >
            <FaDownload />
            Export
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative">
            <FaSearch className="absolute top-4 left-3 opacity-40" />
            <input
              placeholder="Search rooms..."
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-xl border
                bg-white/70 backdrop-blur-lg
                focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>
          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white/70"
          >
            <option value="all">All Status</option>
            <option value="live">Live</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <select
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border bg-white/70"
          >
            <option value="all">All Types</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </div>

        {/* ROOMS */}
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedRooms.map((room) => {
              const status = getStatus(room.startDateTime, room.duration);
              const participantCount = room.joinedUsers?.length || 0;

              return (
                <div
                  key={room._id}
                  className="
                    relative p-6 rounded-3xl border
                    bg-white/70 backdrop-blur-xl
                    hover:scale-[1.03] transition shadow-xl
                    hover:shadow-[0_0_40px_rgba(255,0,90,.35)]
                    border-pink-200
                  "
                >
                  {/* STATUS */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      status === "live"
                        ? "bg-green-500/20 text-green-500 animate-pulse"
                        : status === "upcoming"
                        ? "bg-yellow-400/20 text-yellow-500"
                        : "bg-gray-400/20 text-gray-500"
                    }`}
                  >
                    ● {status.toUpperCase()}
                  </span>

                  <h2 className="text-2xl font-bold mt-3">#{room.tag}</h2>
                  <p className="opacity-70 mt-2">🎙 {room.type}</p>
                  <p className="opacity-70">🕒 {room.startDateTime}</p>
                  <p className="opacity-70">⏳ {room.duration} mins</p>

                  {/* FOOTER: participants + eye */}
                  <div className="flex items-center justify-between mt-4 pt-4
                    border-t border-pink-100">
                    <span className="text-xs opacity-50 flex items-center gap-1">
                      <FaUsers className="text-pink-400" />
                      {participantCount} in call
                    </span>

                    <button
                      onClick={() => setSelectedRoom(room)}
                      title="View room details"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                        text-pink-500 border border-pink-300/60 bg-pink-50/60
                        hover:bg-pink-500 hover:text-white hover:border-pink-500
                        transition-all duration-200"
                    >
                      <FaEye />
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-5 py-2 rounded-lg text-white
              bg-gradient-to-r from-pink-500 to-red-500
              disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-bold">{page} / {totalPages || 1}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-5 py-2 rounded-lg text-white
              bg-gradient-to-r from-pink-500 to-red-500
              disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AllRooms;