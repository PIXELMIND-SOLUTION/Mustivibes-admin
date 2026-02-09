import React, { useState } from "react";
import axios from "axios";

const API = "http://31.97.206.144:4055/api/users/create";

const CreateRoom = ({ darkMode }) => {
  const admin = JSON.parse(sessionStorage.getItem("AdminData"));
  const token = sessionStorage.getItem("adminToken");

  const [form, setForm] = useState({
    type: "audio",
    tag: "",
    duration: "",
    startDateTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ⭐ FORMAT DATE -> "29-01-2026 06:08 PM"
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };

  // CREATE ROOM
  const createRoom = async () => {
    if (!form.tag || !form.duration || !form.startDateTime) {
      return setMsg("⚠️ Complete all blueprint parameters");
    }

    try {
      setLoading(true);
      setMsg("");

      const formattedDate = formatDateTime(form.startDateTime);

      const res = await axios.post(
        API,
        {
          adminId: admin?.id, //userId: "694be8e5086e783e1ad69b2d",
          type: form.type,
          tag: form.tag,
          duration: Number(form.duration),
          startDateTime: formattedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const id =
        res.data?.room?._id?.$oid ||
        res.data?.room?._id ||
        "Created";

      setRoomId(id);
      setMsg("🚀 Room Successfully Deployed!");

      setForm({
        type: "audio",
        tag: "",
        duration: "",
        startDateTime: "",
      });
    } catch {
      setMsg("❌ Deployment Failed");
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(roomId);
    setMsg("✅ Room ID copied");
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-6 overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-[#070b1a]"
          : "bg-gradient-to-br from-blue-50 via-white to-indigo-100"
      }`}
    >
      {/* Blueprint Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: darkMode
            ? `
            linear-gradient(#1e3a8a55 1px, transparent 1px),
            linear-gradient(90deg,#1e3a8a55 1px,transparent 1px)`
            : `
            linear-gradient(#2563eb22 1px, transparent 1px),
            linear-gradient(90deg,#2563eb22 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow Lights */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[150px] rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-[140px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* PANEL */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-10 border backdrop-blur-2xl transition ${
          darkMode
            ? "bg-[#0f172a]/80 border-cyan-400/20 shadow-[0_0_80px_rgba(34,211,238,.15)]"
            : "bg-white/80 border-blue-200 shadow-2xl"
        }`}
      >
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1
            className={`text-4xl font-extrabold tracking-widest text-transparent bg-clip-text ${
              darkMode
                ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
          >
            ROOM BLUEPRINT
          </h1>

          <p
            className={`mt-3 ${
              darkMode
                ? "text-cyan-300/70"
                : "text-gray-600"
            }`}
          >
            Architect and deploy real-time communication rooms
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* TYPE */}
          <div>
            <label
              className={`text-xs uppercase tracking-widest ${
                darkMode ? "text-cyan-400" : "text-blue-600"
              }`}
            >
              Communication Mode
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={`mt-2 w-full px-4 py-3 rounded-xl border outline-none ${
                darkMode
                  ? "bg-[#020617] border-cyan-400/20 text-cyan-100"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="audio">🎙️ Audio</option>
              <option value="video">🎥 Video</option>
            </select>
          </div>

          {/* TAG */}
          <input
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="Room Tag"
            className={`mt-2 w-full px-4 py-3 rounded-xl border ${
              darkMode
                ? "bg-[#020617] border-cyan-400/20 text-cyan-100"
                : "bg-white border-gray-300"
            }`}
          />

          {/* DURATION */}
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duration (minutes)"
            className={`mt-2 w-full px-4 py-3 rounded-xl border ${
              darkMode
                ? "bg-[#020617] border-cyan-400/20 text-cyan-100"
                : "bg-white border-gray-300"
            }`}
          />

          {/* START DATE */}
          <input
            type="datetime-local"
            name="startDateTime"
            value={form.startDateTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={handleChange}
            className={`mt-2 w-full px-4 py-3 rounded-xl border ${
              darkMode
                ? "bg-[#020617] border-cyan-400/20 text-cyan-100"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={createRoom}
          disabled={loading}
          className={`mt-10 w-full py-4 rounded-xl font-bold text-lg ${
            darkMode
              ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          }`}
        >
          {loading ? "Deploying..." : "🚀 Deploy Room"}
        </button>

        {/* SUCCESS */}
        {roomId && (
          <div className="mt-6 text-center">
            <p className="font-semibold">Room ID:</p>
            <div className="font-mono">{roomId}</div>
            <button onClick={copyId} className="underline text-sm">
              Copy
            </button>
          </div>
        )}

        {/* MESSAGE */}
        {msg && (
          <div className="mt-4 text-center font-semibold">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
