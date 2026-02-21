import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBell, FaUserPlus, FaUserMinus, FaBan, FaUnlock,
  FaSearch, FaCheck, FaCheckDouble, FaSync, FaFilter,
  FaInbox, FaTimes,
} from "react-icons/fa";

const API_GET  = "http://31.97.206.144:4055/api/notifications";
const API_READ = "http://31.97.206.144:4055/api/notifications/read";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const TYPE_META = {
  follow:   { icon: FaUserPlus,  color: "emerald", label: "Follow"   },
  unfollow: { icon: FaUserMinus, color: "amber",   label: "Unfollow" },
  block:    { icon: FaBan,       color: "red",      label: "Block"    },
  unblock:  { icon: FaUnlock,    color: "cyan",     label: "Unblock"  },
};

const COLOR = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30", grad: "from-emerald-500 to-teal-500" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   ring: "ring-amber-500/30",   grad: "from-amber-500 to-orange-500" },
  red:     { bg: "bg-red-500/10",     text: "text-red-400",     ring: "ring-red-500/30",     grad: "from-red-500 to-rose-600"    },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    ring: "ring-cyan-500/30",    grad: "from-cyan-500 to-blue-500"   },
  pink:    { bg: "bg-pink-500/10",    text: "text-pink-400",    ring: "ring-pink-500/30",    grad: "from-pink-500 to-rose-500"   },
};

// ─── Pill / Tab ──────────────────────────────────────────────────────────────
const Tab = ({ label, count, active, onClick, dm }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
      active
        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
        : dm
        ? "text-white/40 hover:text-white hover:bg-white/5"
        : "text-gray-500 hover:text-gray-800 hover:bg-pink-50"
    }`}
  >
    {label}
    {count > 0 && (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
          active
            ? "bg-white/20 text-white"
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

// ─── Notification Card ───────────────────────────────────────────────────────
const NotifCard = ({ notif, selected, onSelect, onMarkRead, dm }) => {
  const meta  = TYPE_META[notif.type] || TYPE_META.follow;
  const Icon  = meta.icon;
  const col   = COLOR[meta.color];
  const unread = !notif.isRead;

  return (
    <div
      className={`relative flex items-start gap-3 sm:gap-4 p-4 rounded-2xl border transition-all duration-200 group ${
        selected
          ? dm
            ? "border-pink-500/50 bg-pink-500/5"
            : "border-pink-400 bg-pink-50"
          : unread
          ? dm
            ? "border-pink-500/15 bg-[#131313] hover:border-pink-500/30"
            : "border-pink-100 bg-white hover:border-pink-300"
          : dm
          ? "border-white/5 bg-[#0f0f0f] hover:border-white/10 opacity-60 hover:opacity-80"
          : "border-gray-100 bg-gray-50/50 hover:border-gray-200 opacity-70 hover:opacity-90"
      }`}
    >
      {/* Unread dot */}
      {unread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-sm shadow-pink-500/50 flex-shrink-0" />
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

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={notif.user?.profileImage}
          alt={notif.user?.name}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ${col.ring}`}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${notif.user?.name}&background=e91e8c&color=fff&size=64`;
          }}
        />
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${col.grad} shadow-sm`}
        >
          <Icon className="text-white text-[9px]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p
            className={`text-sm font-bold leading-tight ${
              dm ? "text-white" : "text-gray-900"
            }`}
          >
            {notif.title}
          </p>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${col.bg} ${col.text}`}
          >
            {meta.label}
          </span>
        </div>
        <p
          className={`text-xs mt-0.5 ${dm ? "text-white/40" : "text-gray-500"}`}
        >
          {notif.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-[11px] ${dm ? "text-white/25" : "text-gray-400"}`}>
            {fmtDate(notif.createdAt)}
          </span>
          <span className={`text-[11px] font-medium ${dm ? "text-white/30" : "text-gray-400"}`}>
            {notif.user?.name} · {notif.user?.mobile}
          </span>
        </div>
      </div>

      {/* Mark single read */}
      {unread && (
        <button
          onClick={() => onMarkRead([notif._id])}
          title="Mark as read"
          className={`flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
            dm
              ? "text-white/30 hover:text-pink-400 hover:bg-pink-500/10"
              : "text-gray-300 hover:text-pink-500 hover:bg-pink-50"
          }`}
        >
          <FaCheckDouble className="text-xs" />
        </button>
      )}
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ dm }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        dm ? "bg-white/5" : "bg-gray-100"
      }`}
    >
      <FaInbox className={`text-2xl ${dm ? "text-white/20" : "text-gray-300"}`} />
    </div>
    <p className={`text-sm font-medium ${dm ? "text-white/30" : "text-gray-400"}`}>
      No notifications found
    </p>
  </div>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ msg, dm }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-bounce-once ${
      dm ? "bg-[#1a1a1a] border border-pink-500/30 text-white" : "bg-white border border-pink-200 text-gray-900"
    }`}
  >
    <FaCheckDouble className="text-pink-500" /> {msg}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Notifications = ({ darkMode }) => {
  const dm = darkMode;

  const [notifications, setNotifications]   = useState([]);
  const [filters, setFilters]               = useState({ type: [], totalUnread: 0 });
  const [loading, setLoading]               = useState(false);
  const [marking, setMarking]               = useState(false);

  const [search, setSearch]                 = useState("");
  const [activeType, setActiveType]         = useState("all");
  const [activeRead, setActiveRead]         = useState("all"); // all | unread | read
  const [selected, setSelected]             = useState(new Set());
  const [toast, setToast]                   = useState("");

  // ── Fetch ──
  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_GET);
      setNotifications(res.data.data.notifications || []);
      setFilters(res.data.data.filters || { type: [], totalUnread: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  // ── Mark Read ──
  const markRead = async (ids) => {
    if (!ids.length) return;
    try {
      setMarking(true);
      await axios.put(API_READ, { notificationIds: ids }, {
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) =>
        prev.map((n) => ids.includes(n._id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setFilters((prev) => ({
        ...prev,
        totalUnread: Math.max(0, prev.totalUnread - ids.filter((id) =>
          notifications.find((n) => n._id === id && !n.isRead)
        ).length),
      }));
      setSelected(new Set());
      showToast(`${ids.length} notification${ids.length > 1 ? "s" : ""} marked as read`);
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Filtered List ──
  const filtered = useMemo(() => {
    let data = [...notifications];
    if (activeType !== "all")  data = data.filter((n) => n.type === activeType);
    if (activeRead === "unread") data = data.filter((n) => !n.isRead);
    if (activeRead === "read")   data = data.filter((n) => n.isRead);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((n) =>
        n.title?.toLowerCase().includes(s) ||
        n.body?.toLowerCase().includes(s) ||
        n.user?.name?.toLowerCase().includes(s)
      );
    }
    return data;
  }, [notifications, activeType, activeRead, search]);

  // ── Select helpers ──
  const toggleSelect = (id) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((n) => n._id)));

  const selectedUnread = [...selected].filter((id) =>
    notifications.find((n) => n._id === id && !n.isRead)
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Input class ──
  const inputCls = `px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition text-sm ${
    dm
      ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20"
      : "bg-white border-pink-200 text-gray-800 placeholder-gray-400"
  }`;

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${dm ? "bg-[#080808] text-white" : "bg-gray-50 text-gray-900"}`}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${dm ? "text-white" : "text-gray-900"}`}>
              Notifications{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Center
              </span>
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${dm ? "text-white/30" : "text-gray-400"}`}>
            Monitor all platform activity and user interactions
          </p>
        </div>
        <button
          onClick={fetchNotifs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 self-start sm:self-auto disabled:opacity-50"
        >
          <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className={`rounded-2xl border p-3 sm:p-4 mb-4 flex flex-col gap-3 ${dm ? "bg-[#0f0f0f] border-pink-500/20" : "bg-white border-pink-100"}`}>

        {/* Search */}
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dm ? "text-white/20" : "text-gray-300"}`} />
          <input
            type="text"
            placeholder="Search notifications..."
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
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          <Tab label="All" count={notifications.length} active={activeType === "all"} onClick={() => setActiveType("all")} dm={dm} />
          {filters.type?.map((f) => (
            <Tab
              key={f.type}
              label={f.type.charAt(0).toUpperCase() + f.type.slice(1)}
              count={f.count}
              active={activeType === f.type}
              onClick={() => setActiveType(f.type)}
              dm={dm}
            />
          ))}
        </div>

        {/* Read filter + actions */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-1.5">
            {["all", "unread", "read"].map((r) => (
              <button
                key={r}
                onClick={() => setActiveRead(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeRead === r
                    ? dm ? "bg-pink-500/20 text-pink-400 ring-1 ring-pink-500/40" : "bg-pink-100 text-pink-600"
                    : dm ? "text-white/30 hover:text-white/60" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {filtered.length > 0 && (
              <button
                onClick={toggleAll}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  dm
                    ? "border-pink-500/20 text-white/40 hover:text-white hover:border-pink-500/40"
                    : "border-pink-200 text-gray-500 hover:text-gray-800 hover:border-pink-400"
                }`}
              >
                {selected.size === filtered.length ? "Deselect All" : "Select All"}
              </button>
            )}
            {selected.size > 0 && selectedUnread.length > 0 && (
              <button
                onClick={() => markRead(selectedUnread)}
                disabled={marking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                <FaCheckDouble className="text-[10px]" />
                Mark {selectedUnread.length} Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results meta ── */}
      <p className={`text-xs mb-3 px-1 ${dm ? "text-white/25" : "text-gray-400"}`}>
        Showing <span className="font-bold">{filtered.length}</span> of{" "}
        <span className="font-bold">{notifications.length}</span> notifications
        {selected.size > 0 && (
          <span className={`ml-2 ${dm ? "text-pink-400" : "text-pink-500"}`}>
            · {selected.size} selected
          </span>
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
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <NotifCard
              key={n._id}
              notif={n}
              selected={selected.has(n._id)}
              onSelect={toggleSelect}
              onMarkRead={markRead}
              dm={dm}
            />
          ))}
        </div>
      )}

      {/* ── Mark All Unread ── */}
      {unreadCount > 0 && !loading && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => markRead(notifications.filter((n) => !n.isRead).map((n) => n._id))}
            disabled={marking}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
              dm
                ? "border-pink-500/20 text-pink-400 hover:bg-pink-500/10"
                : "border-pink-300 text-pink-600 hover:bg-pink-50"
            }`}
          >
            <FaCheckDouble className="text-xs" />
            Mark All {unreadCount} as Read
          </button>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} dm={dm} />}
    </div>
  );
};

export default Notifications;