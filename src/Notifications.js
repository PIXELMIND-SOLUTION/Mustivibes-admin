import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBell,
  FaUserPlus,
  FaUserMinus,
  FaBan,
  FaUnlock,
  FaSearch,
  FaCheck,
  FaCheckDouble,
  FaSync,
  FaFilter,
  FaInbox,
  FaTimes,
  FaTrash,
  FaCommentAlt,
  FaFlask,
} from "react-icons/fa";

const BASE = "http://31.97.206.144:4055/api/notifications";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TYPE_META = {
  follow:             { icon: FaUserPlus,   color: "emerald", label: "Follow" },
  unfollow:           { icon: FaUserMinus,  color: "amber",   label: "Unfollow" },
  block:              { icon: FaBan,        color: "red",     label: "Block" },
  unblock:            { icon: FaUnlock,     color: "cyan",    label: "Unblock" },
  feedback_submitted: { icon: FaCommentAlt, color: "pink",    label: "Feedback" },
  test:               { icon: FaFlask,      color: "purple",  label: "Test" },
};

const DEFAULT_META = { icon: FaBell, color: "gray", label: "Notification" };

const COLOR = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", grad: "from-emerald-500 to-teal-500" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   ring: "ring-amber-500/30",   grad: "from-amber-500 to-orange-500" },
  red:     { bg: "bg-red-500/10",     text: "text-red-400",     ring: "ring-red-500/30",     grad: "from-red-500 to-rose-600" },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    ring: "ring-cyan-500/30",    grad: "from-cyan-500 to-blue-500" },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-400",    ring: "ring-pink-500/30",    grad: "from-pink-500 to-rose-500" },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-400",  ring: "ring-purple-500/30",  grad: "from-purple-500 to-indigo-500" },
  gray:    { bg: "bg-gray-500/10",    text: "text-gray-400",    ring: "ring-gray-500/30",    grad: "from-gray-500 to-slate-500" },
};

// ─── Tab ──────────────────────────────────────────────────────────────────
const Tab = ({ label, count, active, onClick, dm }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
      active
        ? dm
          ? "bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40"
          : "bg-pink-100 text-pink-600 ring-1 ring-pink-300"
        : dm
        ? "text-white/30 hover:text-white/60"
        : "text-gray-400 hover:text-gray-700"
    }`}
  >
    {label}
    {count > 0 && (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
          active
            ? "bg-pink-500 text-white"
            : dm
            ? "bg-white/10 text-white/50"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Notification Card ────────────────────────────────────────────────────
const NotifCard = ({ notif, selected, onSelect, onMarkRead, onDelete, dm }) => {
  const meta = TYPE_META[notif.type] || DEFAULT_META;
  const Icon = meta.icon;
  const col = COLOR[meta.color] || COLOR.gray;
  const unread = !notif.isRead;
  const user = notif.relatedUser;

  return (
    <div
      className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all ${
        unread
          ? dm
            ? "bg-pink-500/5 border-pink-500/20"
            : "bg-pink-50/60 border-pink-200"
          : dm
          ? "bg-white/3 border-white/8 hover:bg-white/5"
          : "bg-white border-gray-100 hover:bg-gray-50"
      }`}
    >
      {/* Unread dot */}
      {unread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50" />
      )}

      {/* Checkbox */}
      <button
        onClick={() => onSelect(notif._id)}
        className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
          selected
            ? "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-500"
            : dm
            ? "border-white/20 hover:border-pink-400"
            : "border-gray-300 hover:border-pink-400"
        }`}
      >
        {selected && <FaCheck className="text-white text-[8px]" />}
      </button>

      {/* Icon / Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${col.bg} ring-1 ${col.ring} flex items-center justify-center overflow-hidden`}>
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=e91e8c&color=fff&size=64`;
            }}
          />
        ) : (
          <Icon className={`text-sm ${col.text}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`text-sm font-semibold ${dm ? "text-white" : "text-gray-900"}`}>
            {notif.title}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.bg} ${col.text}`}>
            {meta.label}
          </span>
          {notif.priority && notif.priority !== "low" && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              notif.priority === "high"
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-400"
            }`}>
              {notif.priority}
            </span>
          )}
        </div>
        <p className={`text-xs leading-relaxed ${dm ? "text-white/50" : "text-gray-500"} mb-1`}>
          {notif.body}
        </p>
        {/* Feedback extra detail */}
        {notif.relatedData?.experience && (
          <p className={`text-xs italic ${dm ? "text-white/30" : "text-gray-400"} mb-1`}>
            "{notif.relatedData.experience}"
          </p>
        )}
        {notif.relatedData?.rating && (
          <p className={`text-xs ${dm ? "text-amber-400" : "text-amber-500"} mb-1`}>
            {"★".repeat(notif.relatedData.rating)}{"☆".repeat(5 - notif.relatedData.rating)} {notif.relatedData.rating}/5
          </p>
        )}
        <div className={`flex items-center gap-2 text-[10px] ${dm ? "text-white/30" : "text-gray-400"}`}>
          <span>{fmtDate(notif.createdAt)}</span>
          {user && (
            <>
              <span>·</span>
              <span>{user.name}</span>
              {user.mobile && (
                <>
                  <span>·</span>
                  <span>{user.mobile}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        {unread && (
          <button
            onClick={() => onMarkRead(notif._id)}
            title="Mark as read"
            className={`p-1.5 rounded-lg transition-all ${
              dm
                ? "text-white/30 hover:text-pink-400 hover:bg-pink-500/10"
                : "text-gray-300 hover:text-pink-500 hover:bg-pink-50"
            }`}
          >
            <FaCheck className="text-xs" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif._id)}
          title="Delete"
          className={`p-1.5 rounded-lg transition-all ${
            dm
              ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
              : "text-gray-300 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <FaTrash className="text-xs" />
        </button>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────
const EmptyState = ({ dm }) => (
  <div className={`flex flex-col items-center justify-center py-16 gap-3 ${dm ? "text-white/20" : "text-gray-300"}`}>
    <FaInbox className="text-4xl" />
    <p className="text-sm font-medium">No notifications found</p>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────
const Toast = ({ msg, dm }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-bounce-in ${
      dm ? "bg-[#1a1a1a] border border-pink-500/30 text-white" : "bg-white border border-pink-200 text-gray-800"
    }`}
  >
    <FaCheck className="text-pink-500" />
    {msg}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
const Notifications = ({ darkMode }) => {
  const dm = darkMode;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeRead, setActiveRead] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState("");

  // ── Fetch ──
  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE);
      // API returns { success, notifications, pagination, unreadCount }
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Mark single read: PUT /api/notifications/:id/read ──
  const markRead = async (id) => {
    try {
      setMarking(true);
      await axios.put(`${BASE}/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      showToast("Marked as read");
    } catch (e) {
      console.error("Mark read error:", e);
    } finally {
      setMarking(false);
    }
  };

  // ── Mark selected unread ones as read ──
  const markSelectedRead = async () => {
    const unreadIds = [...selected].filter((id) =>
      notifications.find((n) => n._id === id && !n.isRead)
    );
    if (!unreadIds.length) return;
    setMarking(true);
    let successCount = 0;
    await Promise.all(
      unreadIds.map(async (id) => {
        try {
          await axios.put(`${BASE}/${id}/read`);
          successCount++;
        } catch (e) {
          console.error(`Failed to mark ${id}:`, e);
        }
      })
    );
    setNotifications((prev) =>
      prev.map((n) =>
        unreadIds.includes(n._id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - successCount));
    setSelected(new Set());
    showToast(`${successCount} notification${successCount > 1 ? "s" : ""} marked as read`);
    setMarking(false);
  };

  // ── Mark ALL unread as read ──
  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (!unreadIds.length) return;
    setMarking(true);
    let successCount = 0;
    await Promise.all(
      unreadIds.map(async (id) => {
        try {
          await axios.put(`${BASE}/${id}/read`);
          successCount++;
        } catch (e) {
          console.error(`Failed to mark ${id}:`, e);
        }
      })
    );
    setNotifications((prev) =>
      prev.map((n) =>
        unreadIds.includes(n._id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    setUnreadCount(0);
    showToast(`All ${successCount} notifications marked as read`);
    setMarking(false);
  };

  // ── Delete: DELETE /api/notifications/:id ──
  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      showToast("Notification deleted");
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // ── Delete selected ──
  const deleteSelected = async () => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => axios.delete(`${BASE}/${id}`).catch(console.error)));
    const unreadDeleted = ids.filter((id) => notifications.find((n) => n._id === id && !n.isRead)).length;
    setNotifications((prev) => prev.filter((n) => !ids.includes(n._id)));
    setUnreadCount((c) => Math.max(0, c - unreadDeleted));
    setSelected(new Set());
    showToast(`${ids.length} notification${ids.length > 1 ? "s" : ""} deleted`);
  };

  // ── Unique types for tabs ──
  const typeGroups = useMemo(() => {
    const map = {};
    notifications.forEach((n) => {
      if (!map[n.type]) map[n.type] = 0;
      map[n.type]++;
    });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [notifications]);

  // ── Filtered List ──
  const filtered = useMemo(() => {
    let data = [...notifications];
    if (activeType !== "all") data = data.filter((n) => n.type === activeType);
    if (activeRead === "unread") data = data.filter((n) => !n.isRead);
    if (activeRead === "read") data = data.filter((n) => n.isRead);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (n) =>
          n.title?.toLowerCase().includes(s) ||
          n.body?.toLowerCase().includes(s) ||
          n.relatedUser?.name?.toLowerCase().includes(s)
      );
    }
    return data;
  }, [notifications, activeType, activeRead, search]);

  // ── Select helpers ──
  const toggleSelect = (id) =>
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const toggleAll = () =>
    setSelected(
      selected.size === filtered.length
        ? new Set()
        : new Set(filtered.map((n) => n._id))
    );

  const selectedUnread = [...selected].filter((id) =>
    notifications.find((n) => n._id === id && !n.isRead)
  );

  // ── Input class ──
  const inputCls = `px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition text-sm ${
    dm
      ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20"
      : "bg-white border-pink-200 text-gray-800 placeholder-gray-400"
  }`;

  return (
    <div className={`min-h-screen p-6 ${dm ? "bg-[#050505] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${dm ? "text-white" : "text-gray-900"}`}>
              Notifications{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Center
              </span>
            </h1>
            <p className={`text-xs mt-1 ${dm ? "text-white/30" : "text-gray-400"}`}>
              Monitor all platform activity and user interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold ring-1 ring-pink-500/30">
                <FaBell className="text-[10px]" />
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={fetchNotifs}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                dm
                  ? "border-white/10 text-white/50 hover:bg-white/5"
                  : "border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dm ? "text-white/20" : "text-gray-300"}`} />
            <input
              placeholder="Search notifications, users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-9 w-full`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${dm ? "text-white/20 hover:text-white/60" : "text-gray-300 hover:text-gray-600"}`}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tab
              label="All"
              count={notifications.length}
              active={activeType === "all"}
              onClick={() => setActiveType("all")}
              dm={dm}
            />
            {typeGroups.map((f) => {
              const meta = TYPE_META[f.type] || DEFAULT_META;
              return (
                <Tab
                  key={f.type}
                  label={meta.label}
                  count={f.count}
                  active={activeType === f.type}
                  onClick={() => setActiveType(f.type)}
                  dm={dm}
                />
              );
            })}
          </div>

          {/* Read filter + bulk actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "unread", "read"].map((r) => (
              <button
                key={r}
                onClick={() => setActiveRead(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeRead === r
                    ? dm
                      ? "bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40"
                      : "bg-pink-100 text-pink-600"
                    : dm
                    ? "text-white/30 hover:text-white/60"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {filtered.length > 0 && (
                <button
                  onClick={toggleAll}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    dm ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {selected.size === filtered.length ? "Deselect All" : "Select All"}
                </button>
              )}
              {selected.size > 0 && selectedUnread.length > 0 && (
                <button
                  onClick={markSelectedRead}
                  disabled={marking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  <FaCheck className="text-[10px]" />
                  Mark {selectedUnread.length} Read
                </button>
              )}
              {selected.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25 hover:opacity-90 active:scale-95 transition-all"
                >
                  <FaTrash className="text-[10px]" />
                  Delete {selected.size}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Results meta ── */}
        <p className={`text-xs ${dm ? "text-white/20" : "text-gray-400"}`}>
          Showing {filtered.length} of {notifications.length} notifications
          {selected.size > 0 && (
            <span className="text-pink-400 font-semibold"> · {selected.size} selected</span>
          )}
        </p>

        {/* ── List ── */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-20 rounded-2xl animate-pulse ${dm ? "bg-white/5" : "bg-gray-100"}`}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState dm={dm} />
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <NotifCard
                key={n._id}
                notif={n}
                selected={selected.has(n._id)}
                onSelect={toggleSelect}
                onMarkRead={markRead}
                onDelete={deleteNotif}
                dm={dm}
              />
            ))}
          </div>
        )}

        {/* ── Mark All Unread ── */}
        {unreadCount > 0 && !loading && (
          <div className="flex justify-center pt-2">
            <button
              onClick={markAllRead}
              disabled={marking}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                dm
                  ? "border-pink-500/20 text-pink-400 hover:bg-pink-500/10"
                  : "border-pink-300 text-pink-600 hover:bg-pink-50"
              }`}
            >
              <FaCheckDouble />
              Mark All {unreadCount} as Read
            </button>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} dm={dm} />}
    </div>
  );
};

export default Notifications;