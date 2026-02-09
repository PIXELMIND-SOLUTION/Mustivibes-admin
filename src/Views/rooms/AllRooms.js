import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaSearch, FaDownload } from "react-icons/fa";

const API = "http://31.97.206.144:4055/api/users/all";

const AllRooms = ({ darkMode }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // FILTER
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const status = getStatus(room.startDateTime, room.duration);

      const matchesSearch =
        room.tag.toLowerCase().includes(search.toLowerCase()) ||
        room.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        room.type.toLowerCase() === typeFilter;

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
    const header = ["Tag", "Type", "Start", "Duration", "Status"];

    const rows = filteredRooms.map((room) => [
      room.tag,
      room.type,
      room.startDateTime,
      room.duration,
      getStatus(room.startDateTime, room.duration),
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "rooms.csv";
    link.click();
  };

  return (
    <div
      className={`relative min-h-screen p-10 overflow-hidden ${
        darkMode
          ? "bg-[#070707]"
          : "bg-gradient-to-br from-pink-50 via-white to-red-100"
      }`}
    >
      {/* PINK GRID */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(#ff4d6d22 1px, transparent 1px),
            linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

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
            <div
              key={i}
              className="h-48 rounded-3xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {paginatedRooms.map((room) => {
            const status = getStatus(
              room.startDateTime,
              room.duration
            );

            return (
              <div
                key={room._id}
                className="
                relative
                p-6
                rounded-3xl
                border
                bg-white/70
                backdrop-blur-xl
                hover:scale-[1.03]
                transition
                shadow-xl
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

                <h2 className="text-2xl font-bold mt-3">
                  #{room.tag}
                </h2>

                <p className="opacity-70 mt-2">
                  🎙 {room.type}
                </p>

                <p className="opacity-70">
                  🕒 {room.startDateTime}
                </p>

                <p className="opacity-70">
                  ⏳ {room.duration} mins
                </p>
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

        <span className="font-bold">
          {page} / {totalPages || 1}
        </span>

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
  );
};

export default AllRooms;
