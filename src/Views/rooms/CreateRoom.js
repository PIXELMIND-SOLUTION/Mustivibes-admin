import React, { useState } from "react";
import axios from "axios";
import { FaMicrophone, FaVideo, FaTag, FaClock, FaCalendarAlt, FaRocket, FaCopy, FaCheck } from "react-icons/fa";

const API = "http://31.97.206.144:4055/api/users/create";

const PRESET_TAGS = [
  "Motivation", "Friendship", "Fun", "Love",
  "Lifestyle", "Music", "Gaming", "Education",
  "Wellness", "Business",
];

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
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // FORMAT DATE -> "29-01-2026 06:08 PM"
  const formatDateTime = (dateString) => {
    const date  = new Date(dateString);
    const day   = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year  = date.getFullYear();
    let hours   = date.getHours();
    const mins  = String(date.getMinutes()).padStart(2, "0");
    const ampm  = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${mins} ${ampm}`;
  };

  // CREATE ROOM
  const createRoom = async () => {
    if (!form.tag || !form.duration || !form.startDateTime) {
      return setMsg({ text: "Complete all required fields", type: "error" });
    }
    try {
      setLoading(true);
      setMsg({ text: "", type: "" });

      const res = await axios.post(
        API,
        {
          adminId: admin?.id,
          type: form.type,
          tag: form.tag,
          duration: Number(form.duration),
          startDateTime: formatDateTime(form.startDateTime),
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
      setMsg({ text: "Room successfully deployed!", type: "success" });
      setForm({ type: "audio", tag: "", duration: "", startDateTime: "" });
    } catch {
      setMsg({ text: "Deployment failed. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setMsg({ text: "Room ID copied to clipboard", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const dm = darkMode;

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition
    ${dm
      ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20"
      : "bg-white border-pink-200 placeholder-gray-300 text-gray-800"
    }`;

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center p-6 overflow-hidden transition-all duration-500
        ${dm ? "bg-[#070707]" : "bg-gradient-to-br from-pink-50 via-white to-red-100"}`}
    >
      {/* GRID OVERLAY */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* GLOW ORBS */}
      <div className="absolute w-[500px] h-[500px] bg-pink-500/15 blur-[160px] rounded-full top-[-150px] left-[-150px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-red-500/15 blur-[140px] rounded-full bottom-[-120px] right-[-120px] pointer-events-none" />

      {/* PANEL */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl p-10 border backdrop-blur-2xl transition
          ${dm
            ? "bg-[#0b0b0b]/90 border-pink-500/20 shadow-[0_0_80px_rgba(255,0,90,.18)]"
            : "bg-white/80 border-pink-200 shadow-2xl"
          }`}
      >
        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 shadow-[0_0_30px_rgba(255,0,90,.5)] mb-4">
            <FaRocket className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-widest bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            CREATE ROOM
          </h1>
          <p className={`mt-2 text-sm ${dm ? "text-white/40" : "text-gray-400"}`}>
            Architect and deploy real-time communication rooms
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* TYPE TOGGLE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
              Communication Mode
            </label>
            <div className={`flex rounded-xl overflow-hidden border ${dm ? "border-pink-500/20" : "border-pink-200"}`}>
              {[
                { value: "audio", label: "Audio", icon: <FaMicrophone /> },
                { value: "video", label: "Video", icon: <FaVideo /> },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition
                    ${form.type === opt.value
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,90,.4)]"
                      : dm
                        ? "text-white/40 hover:text-white/70 hover:bg-pink-500/5"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  <span className="text-xs">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAG */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
              Room Tag
            </label>

            {/* PRESET PILLS */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setForm({ ...form, tag })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition hover:scale-105
                    ${form.tag === tag
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white border-transparent shadow-[0_0_12px_rgba(255,0,90,.45)]"
                      : dm
                        ? "border-pink-500/20 text-white/50 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10"
                        : "border-pink-200 text-gray-500 hover:text-pink-600 hover:border-pink-400 hover:bg-pink-50"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CUSTOM INPUT */}
            <div className="relative">
              <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40 text-sm" />
              <input
                name="tag"
                value={form.tag}
                onChange={handleChange}
                placeholder="Or type a custom tag..."
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* DURATION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
              Duration
            </label>
            <div className={`flex rounded-xl overflow-hidden border ${dm ? "border-pink-500/20" : "border-pink-200"}`}>
              {[
                { value: "30", label: "30 mins" },
                { value: "60", label: "60 mins" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, duration: opt.value })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition
                    ${form.duration === opt.value
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,90,.4)]"
                      : dm
                        ? "text-white/40 hover:text-white/70 hover:bg-pink-500/5"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                >
                  <FaClock className="text-xs" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* START DATE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
              Start Date & Time
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40 text-sm" />
              <input
                type="datetime-local"
                name="startDateTime"
                value={form.startDateTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        {/* DEPLOY BUTTON */}
        <button
          onClick={createRoom}
          disabled={loading}
          className="mt-8 w-full py-4 rounded-xl font-bold text-lg text-white
            bg-gradient-to-r from-pink-500 to-red-500
            hover:scale-[1.02] transition
            shadow-[0_0_30px_rgba(255,0,90,.5)]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
            flex items-center justify-center gap-3"
        >
          <FaRocket className={loading ? "animate-bounce" : ""} />
          {loading ? "Deploying..." : "Deploy Room"}
        </button>

        {/* ROOM ID RESULT */}
        {roomId && (
          <div className={`mt-6 p-5 rounded-2xl border ${dm ? "bg-pink-500/5 border-pink-500/20" : "bg-pink-50 border-pink-200"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">Room ID</p>
            <div className="flex items-center gap-3">
              <code className={`flex-1 font-mono text-sm truncate ${dm ? "text-white/80" : "text-gray-700"}`}>
                {roomId}
              </code>
              <button
                onClick={copyId}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold
                  bg-gradient-to-r from-pink-500 to-red-500
                  hover:scale-105 transition shadow-[0_0_15px_rgba(255,0,90,.4)]"
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* MESSAGE */}
        {msg.text && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            ${msg.type === "success"
              ? dm ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "bg-pink-50 text-pink-600 border border-pink-200"
              : dm ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            <span>{msg.type === "success" ? "✓" : "⚠"}</span>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;