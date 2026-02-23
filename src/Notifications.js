import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaBell, FaUserPlus, FaUserMinus, FaBan, FaUnlock,
  FaSearch, FaCheck, FaCheckDouble, FaSync,
  FaInbox, FaTimes, FaTrash, FaCommentAlt, FaFlask,
} from "react-icons/fa";

const BASE = "http://31.97.206.144:4055/api/notifications";

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const TYPE_META = {
  follow:             { icon: FaUserPlus,   color: "#10b981", label: "Follow" },
  unfollow:           { icon: FaUserMinus,  color: "#f59e0b", label: "Unfollow" },
  block:              { icon: FaBan,        color: "#ef4444", label: "Block" },
  unblock:            { icon: FaUnlock,     color: "#06b6d4", label: "Unblock" },
  feedback_submitted: { icon: FaCommentAlt, color: "#ec4899", label: "Feedback" },
  test:               { icon: FaFlask,      color: "#a855f7", label: "Test" },
};
const DEFAULT_META = { icon: FaBell, color: "#6b7280", label: "Notification" };

// ─── Theme tokens — all inline, no Tailwind opacity utilities ─────────────
const theme = (dm) => ({
  bg:          dm ? "#0a0a0f"                       : "#f8fafc",
  surface:     dm ? "#13131a"                       : "#ffffff",
  surfaceHov:  dm ? "#1a1a24"                       : "#f9fafb",
  surfaceUnrd: dm ? "#1a0f1a"                       : "#fdf2f8",
  border:      dm ? "#2a2a3a"                       : "#e5e7eb",
  borderUnrd:  dm ? "#4a1a4a"                       : "#fbcfe8",
  text:        dm ? "#f3f4f6"                       : "#111827",
  textSub:     dm ? "#9ca3af"                       : "#6b7280",
  textMuted:   dm ? "#4b5563"                       : "#9ca3af",
  inputBg:     dm ? "#0d0d14"                       : "#ffffff",
  inputBorder: dm ? "#2a2a3a"                       : "#fbcfe8",
  skeletonBg:  dm ? "#1f1f2e"                       : "#f3f4f6",
  pink:        "#ec4899",
  pinkDim:     dm ? "rgba(236,72,153,0.15)"         : "rgba(236,72,153,0.08)",
  pinkBorder:  dm ? "rgba(236,72,153,0.35)"         : "rgba(236,72,153,0.3)",
});

// ─── Tab ──────────────────────────────────────────────────────────────────
const Tab = ({ label, count, active, onClick, dm }) => {
  const t = theme(dm);
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 12,
        fontSize: 12, fontWeight: 600,
        border: `1px solid ${active ? t.pinkBorder : "transparent"}`,
        background: active ? t.pinkDim : "transparent",
        color: active ? t.pink : t.textSub,
        cursor: "pointer", transition: "all 0.2s",
      }}
    >
      {label}
      {count > 0 && (
        <span style={{
          padding: "1px 6px", borderRadius: 999, fontSize: 10, fontWeight: 700,
          background: active ? "#ec4899" : dm ? "rgba(255,255,255,0.08)" : "#f3f4f6",
          color: active ? "#fff" : t.textSub,
        }}>
          {count}
        </span>
      )}
    </button>
  );
};

// ─── Notification Card ────────────────────────────────────────────────────
const NotifCard = ({ notif, selected, onSelect, onMarkRead, onDelete, dm }) => {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[notif.type] || DEFAULT_META;
  const Icon = meta.icon;
  const unread = !notif.isRead;
  const user = notif.relatedUser;
  const t = theme(dm);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: 16, borderRadius: 16,
        border: `1px solid ${unread ? t.borderUnrd : t.border}`,
        background: hovered ? t.surfaceHov : unread ? t.surfaceUnrd : t.surface,
        transition: "all 0.2s",
      }}
    >
      {/* Unread dot */}
      {unread && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          width: 8, height: 8, borderRadius: "50%",
          background: "#ec4899",
          boxShadow: "0 0 6px rgba(236,72,153,0.7)",
        }} />
      )}

      {/* Checkbox */}
      <button
        onClick={() => onSelect(notif._id)}
        style={{
          flexShrink: 0, marginTop: 2,
          width: 16, height: 16, borderRadius: 5,
          border: `2px solid ${selected ? "#ec4899" : dm ? "#374151" : "#d1d5db"}`,
          background: selected ? "#ec4899" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s", padding: 0,
        }}
      >
        {selected && <FaCheck style={{ color: "#fff", fontSize: 7 }} />}
      </button>

      {/* Icon / Avatar */}
      <div style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: 12,
        background: `${meta.color}18`,
        border: `1px solid ${meta.color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=e91e8c&color=fff&size=64`;
            }}
          />
        ) : (
          <Icon style={{ color: meta.color, fontSize: 14 }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{notif.title}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
            background: `${meta.color}18`, color: meta.color,
          }}>{meta.label}</span>
          {notif.priority && notif.priority !== "low" && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
              background: notif.priority === "high" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
              color: notif.priority === "high" ? "#ef4444" : "#f59e0b",
            }}>{notif.priority}</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.5, margin: "0 0 4px" }}>{notif.body}</p>
        {notif.relatedData?.experience && (
          <p style={{ fontSize: 11, fontStyle: "italic", color: t.textMuted, margin: "0 0 3px" }}>
            "{notif.relatedData.experience}"
          </p>
        )}
        {notif.relatedData?.rating && (
          <p style={{ fontSize: 11, color: "#f59e0b", margin: "0 0 3px" }}>
            {"★".repeat(notif.relatedData.rating)}{"☆".repeat(5 - notif.relatedData.rating)}{" "}
            {notif.relatedData.rating}/5
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: t.textMuted }}>
          <span>{fmtDate(notif.createdAt)}</span>
          {user && (
            <>
              <span>·</span><span>{user.name}</span>
              {user.mobile && <><span>·</span><span>{user.mobile}</span></>}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
        {unread && (
          <button
            onClick={() => onMarkRead(notif._id)}
            title="Mark as read"
            style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: t.textMuted }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ec4899"; e.currentTarget.style.background = "rgba(236,72,153,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = "transparent"; }}
          >
            <FaCheck style={{ fontSize: 11 }} />
          </button>
        )}
        <button
          onClick={() => onDelete(notif._id)}
          title="Delete"
          style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: t.textMuted }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = "transparent"; }}
        >
          <FaTrash style={{ fontSize: 11 }} />
        </button>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────
const EmptyState = ({ dm }) => {
  const t = theme(dm);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12, color: t.textMuted }}>
      <FaInbox style={{ fontSize: 40 }} />
      <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>No notifications found</p>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────
const Toast = ({ msg, dm }) => {
  const t = theme(dm);
  return (
    <div style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, display: "flex", alignItems: "center", gap: 8,
      padding: "12px 20px", borderRadius: 16,
      boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
      background: t.surface, border: `1px solid ${t.pinkBorder}`,
      color: t.text, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <FaCheck style={{ color: "#ec4899" }} />
      {msg}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────
const Notifications = ({ darkMode }) => {
  const dm = !!darkMode;
  const t = theme(dm);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [marking, setMarking]             = useState(false);
  const [search, setSearch]               = useState("");
  const [activeType, setActiveType]       = useState("all");
  const [activeRead, setActiveRead]       = useState("all");
  const [selected, setSelected]           = useState(new Set());
  const [toast, setToast]                 = useState("");

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch (e) { console.error("Fetch error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const markRead = async (id) => {
    try {
      setMarking(true);
      await axios.put(`${BASE}/${id}/read`);
      setNotifications((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
      showToast("Marked as read");
    } catch (e) { console.error(e); } finally { setMarking(false); }
  };

  const markSelectedRead = async () => {
    const ids = [...selected].filter((id) => notifications.find((n) => n._id === id && !n.isRead));
    if (!ids.length) return;
    setMarking(true);
    let count = 0;
    await Promise.all(ids.map(async (id) => { try { await axios.put(`${BASE}/${id}/read`); count++; } catch (e) { console.error(e); } }));
    setNotifications((p) => p.map((n) => ids.includes(n._id) ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - count));
    setSelected(new Set());
    showToast(`${count} notification${count > 1 ? "s" : ""} marked as read`);
    setMarking(false);
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (!ids.length) return;
    setMarking(true);
    let count = 0;
    await Promise.all(ids.map(async (id) => { try { await axios.put(`${BASE}/${id}/read`); count++; } catch (e) { console.error(e); } }));
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    showToast(`All ${count} notifications marked as read`);
    setMarking(false);
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      setNotifications((p) => p.filter((n) => n._id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      setSelected((p) => { const s = new Set(p); s.delete(id); return s; });
      showToast("Notification deleted");
    } catch (e) { console.error(e); }
  };

  const deleteSelected = async () => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => axios.delete(`${BASE}/${id}`).catch(console.error)));
    const unreadDel = ids.filter((id) => notifications.find((n) => n._id === id && !n.isRead)).length;
    setNotifications((p) => p.filter((n) => !ids.includes(n._id)));
    setUnreadCount((c) => Math.max(0, c - unreadDel));
    setSelected(new Set());
    showToast(`${ids.length} notification${ids.length > 1 ? "s" : ""} deleted`);
  };

  const typeGroups = useMemo(() => {
    const map = {};
    notifications.forEach((n) => { map[n.type] = (map[n.type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [notifications]);

  const filtered = useMemo(() => {
    let data = [...notifications];
    if (activeType !== "all") data = data.filter((n) => n.type === activeType);
    if (activeRead === "unread") data = data.filter((n) => !n.isRead);
    if (activeRead === "read") data = data.filter((n) => n.isRead);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((n) =>
        n.title?.toLowerCase().includes(s) ||
        n.body?.toLowerCase().includes(s) ||
        n.relatedUser?.name?.toLowerCase().includes(s)
      );
    }
    return data;
  }, [notifications, activeType, activeRead, search]);

  const toggleSelect = (id) => setSelected((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll   = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((n) => n._id)));
  const selectedUnread = [...selected].filter((id) => notifications.find((n) => n._id === id && !n.isRead));

  const pillBtn = (active) => ({
    padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    border: "none", cursor: "pointer", transition: "all 0.2s",
    background: active ? t.pinkDim : "transparent",
    color: active ? t.pink : t.textMuted,
  });

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: t.bg, color: t.text, fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px", color: t.text, margin: 0 }}>
              Notifications{" "}
              <span style={{ background: "linear-gradient(135deg,#ec4899,#f43f5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Center
              </span>
            </h1>
            <p style={{ fontSize: 12, color: t.textMuted, marginTop: 4, marginBottom: 0 }}>
              Monitor all platform activity and user interactions
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {unreadCount > 0 && (
              <span style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 999,
                background: t.pinkDim, border: `1px solid ${t.pinkBorder}`,
                color: t.pink, fontSize: 12, fontWeight: 700,
              }}>
                <FaBell style={{ fontSize: 10 }} /> {unreadCount} unread
              </span>
            )}
            <button
              onClick={fetchNotifs}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 12,
                border: `1px solid ${t.border}`,
                background: "transparent", color: t.textSub,
                fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1, transition: "all 0.2s",
              }}
            >
              <FaSync style={{ fontSize: 11, animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.textMuted, fontSize: 12, pointerEvents: "none" }} />
            <input
              placeholder="Search notifications, users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "10px 36px", borderRadius: 12,
                border: `1px solid ${t.inputBorder}`,
                background: t.inputBg, color: t.text,
                fontSize: 13, outline: "none",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 12, padding: 0 }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Type tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Tab label="All" count={notifications.length} active={activeType === "all"} onClick={() => setActiveType("all")} dm={dm} />
            {typeGroups.map((f) => {
              const meta = TYPE_META[f.type] || DEFAULT_META;
              return <Tab key={f.type} label={meta.label} count={f.count} active={activeType === f.type} onClick={() => setActiveType(f.type)} dm={dm} />;
            })}
          </div>

          {/* Read filter + actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {["all", "unread", "read"].map((r) => (
              <button key={r} onClick={() => setActiveRead(r)} style={pillBtn(activeRead === r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              {filtered.length > 0 && (
                <button onClick={toggleAll} style={pillBtn(false)}>
                  {selected.size === filtered.length ? "Deselect All" : "Select All"}
                </button>
              )}
              {selected.size > 0 && selectedUnread.length > 0 && (
                <button
                  onClick={markSelectedRead}
                  disabled={marking}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#ec4899,#f43f5e)",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    opacity: marking ? 0.5 : 1,
                    boxShadow: "0 4px 14px rgba(236,72,153,0.35)",
                  }}
                >
                  <FaCheck style={{ fontSize: 10 }} /> Mark {selectedUnread.length} Read
                </button>
              )}
              {selected.size > 0 && (
                <button
                  onClick={deleteSelected}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#ef4444,#f43f5e)",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                  }}
                >
                  <FaTrash style={{ fontSize: 10 }} /> Delete {selected.size}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>
          Showing {filtered.length} of {notifications.length} notifications
          {selected.size > 0 && <span style={{ color: "#ec4899", fontWeight: 600 }}> · {selected.size} selected</span>}
        </p>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 80, borderRadius: 16, background: t.skeletonBg, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState dm={dm} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((n) => (
              <NotifCard key={n._id} notif={n} selected={selected.has(n._id)} onSelect={toggleSelect} onMarkRead={markRead} onDelete={deleteNotif} dm={dm} />
            ))}
          </div>
        )}

        {/* Mark All */}
        {unreadCount > 0 && !loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
            <button
              onClick={markAllRead}
              disabled={marking}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 24px", borderRadius: 12,
                border: `1px solid ${t.pinkBorder}`,
                background: "transparent", color: t.pink,
                fontSize: 13, fontWeight: 600,
                cursor: marking ? "not-allowed" : "pointer",
                opacity: marking ? 0.5 : 1, transition: "all 0.2s",
              }}
            >
              <FaCheckDouble /> Mark All {unreadCount} as Read
            </button>
          </div>
        )}
      </div>

      {toast && <Toast msg={toast} dm={dm} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

export default Notifications;