import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers, FaPhone, FaCoins, FaCreditCard, FaChartLine,
  FaExclamationTriangle, FaComments, FaEnvelope, FaArrowUp,
  FaArrowDown, FaMinus, FaVideo, FaPhoneAlt, FaUserCheck,
  FaUserSlash, FaMapMarkerAlt, FaSync
} from "react-icons/fa";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";

const API = "http://31.97.206.144:4055/api/dashboard";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n ?? 0);
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent = "pink", dm }) => {
  const accents = {
    pink: "from-pink-500 to-rose-500 shadow-pink-500/20",
    purple: "from-purple-500 to-violet-500 shadow-purple-500/20",
    cyan: "from-cyan-500 to-blue-500 shadow-cyan-500/20",
    amber: "from-amber-500 to-orange-500 shadow-amber-500/20",
    green: "from-emerald-500 to-teal-500 shadow-emerald-500/20",
    red: "from-red-500 to-pink-600 shadow-red-500/20",
  };
  const ring = {
    pink: dm ? "border-pink-500/20" : "border-pink-200",
    purple: dm ? "border-purple-500/20" : "border-purple-200",
    cyan: dm ? "border-cyan-500/20" : "border-blue-200",
    amber: dm ? "border-amber-500/20" : "border-amber-200",
    green: dm ? "border-emerald-500/20" : "border-emerald-200",
    red: dm ? "border-red-500/20" : "border-red-200",
  };

  return (
    <div
      className={`relative rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        ring[accent]
      } ${
        dm
          ? "bg-[#0f0f0f] hover:shadow-black/40"
          : "bg-white hover:shadow-gray-200"
      }`}
    >
      {/* glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${accents[accent]} opacity-10 blur-2xl`}
      />
      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${accents[accent]} shadow-lg ${accents[accent].split(" ").slice(-1)[0]}`}
        >
          <Icon className="text-white text-base" />
        </div>
        {sub !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              sub > 0
                ? "text-emerald-400 bg-emerald-500/10"
                : sub < 0
                ? "text-red-400 bg-red-500/10"
                : dm
                ? "text-white/30 bg-white/5"
                : "text-gray-400 bg-gray-100"
            }`}
          >
            {sub > 0 ? "▲" : sub < 0 ? "▼" : "—"} {Math.abs(sub)}
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            dm ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </p>
        <p
          className={`text-xs mt-0.5 font-medium ${
            dm ? "text-white/40" : "text-gray-500"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

// ─── Section Title ──────────────────────────────────────────────────────────
const SectionTitle = ({ title, dm }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-pink-500 to-rose-600" />
    <h2
      className={`text-sm font-bold uppercase tracking-widest ${
        dm ? "text-white/60" : "text-gray-500"
      }`}
    >
      {title}
    </h2>
  </div>
);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, dm }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs shadow-xl ${
        dm
          ? "bg-[#111] border-pink-500/20 text-white"
          : "bg-white border-pink-200 text-gray-800"
      }`}
    >
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Activity Row ────────────────────────────────────────────────────────────
const UserRow = ({ user, dm, idx }) => (
  <div
    className={`flex items-center gap-3 py-3 border-b last:border-b-0 ${
      dm ? "border-white/5" : "border-gray-100"
    }`}
  >
    <span
      className={`text-xs w-5 text-center font-bold ${
        dm ? "text-white/20" : "text-gray-300"
      }`}
    >
      {idx + 1}
    </span>
    <img
      src={user.profileImage}
      alt={user.name}
      className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500/30"
      onError={(e) => {
        e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=e91e8c&color=fff&size=64`;
      }}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`text-sm font-semibold truncate ${
          dm ? "text-white" : "text-gray-900"
        }`}
      >
        {user.name}
      </p>
      <p className={`text-xs ${dm ? "text-white/30" : "text-gray-400"}`}>
        {user.mobile}
      </p>
    </div>
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
        user.gender === "male"
          ? "bg-blue-500/10 text-blue-400"
          : user.gender === "female"
          ? "bg-pink-500/10 text-pink-400"
          : "bg-gray-500/10 text-gray-400"
      }`}
    >
      {user.gender}
    </span>
  </div>
);

const CallRow = ({ call, dm }) => {
  const isEnded = call.status === "ENDED";
  return (
    <div
      className={`flex items-center gap-3 py-3 border-b last:border-b-0 ${
        dm ? "border-white/5" : "border-gray-100"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg ${
          isEnded ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}
      >
        {call.callType === "video" ? (
          <FaVideo
            className={`text-xs ${
              isEnded ? "text-emerald-400" : "text-red-400"
            }`}
          />
        ) : (
          <FaPhoneAlt
            className={`text-xs ${
              isEnded ? "text-emerald-400" : "text-red-400"
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-semibold truncate ${
            dm ? "text-white" : "text-gray-900"
          }`}
        >
          {call.senderId?.name} → {call.receiverId?.name}
        </p>
        <p className={`text-xs ${dm ? "text-white/30" : "text-gray-400"}`}>
          {fmtDate(call.createdAt)} · {call.duration}s
        </p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          isEnded
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {call.status}
      </span>
    </div>
  );
};

// ─── Mini Stat ───────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, dm }) => (
  <div
    className={`flex justify-between items-center py-2.5 border-b last:border-b-0 text-sm ${
      dm ? "border-white/5" : "border-gray-100"
    }`}
  >
    <span className={dm ? "text-white/40" : "text-gray-500"}>{label}</span>
    <span className={`font-bold ${dm ? "text-white" : "text-gray-900"}`}>
      {value}
    </span>
  </div>
);

// ─── Panel ────────────────────────────────────────────────────────────────────
const Panel = ({ title, children, dm, className = "" }) => (
  <div
    className={`rounded-2xl border p-4 sm:p-5 ${
      dm
        ? "bg-[#0f0f0f] border-pink-500/20"
        : "bg-white border-pink-100"
    } ${className}`}
  >
    {title && (
      <h3
        className={`text-sm font-bold mb-4 ${
          dm ? "text-white/60" : "text-gray-500"
        } uppercase tracking-widest`}
      >
        {title}
      </h3>
    )}
    {children}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color = "pink", dm }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colors = {
    pink: "from-pink-500 to-rose-500",
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className={dm ? "text-white/50" : "text-gray-500"}>{label}</span>
        <span className={`font-bold ${dm ? "text-white" : "text-gray-900"}`}>
          {value} <span className={dm ? "text-white/30" : "text-gray-400"}>/ {max}</span>
        </span>
      </div>
      <div
        className={`h-2 rounded-full overflow-hidden ${
          dm ? "bg-white/5" : "bg-gray-100"
        }`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ darkMode, collapsed }) => {
  const dm = darkMode;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setData(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
          dm ? "bg-[#080808]" : "bg-gray-50"
        }`}
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
        </div>
        <p
          className={`text-sm font-medium animate-pulse ${
            dm ? "text-white/30" : "text-gray-400"
          }`}
        >
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          dm ? "bg-[#080808] text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <p>Failed to load data.</p>
      </div>
    );
  }

  const { summary, recentActivity, charts } = data;
  const s = summary;

  // Enrich chart data
  const growthData = charts.userGrowth.map((d) => ({
    date: fmtDate(d.date),
    Users: d.count,
  }));
  const callVolumeData = charts.callVolume.map((d) => ({
    date: fmtDate(d.date),
    Calls: d.count,
  }));
  const revenueData = charts.revenue.map((d) => ({
    date: fmtDate(d.date),
    Revenue: d.revenue,
    Coins: d.coins,
  }));

  const gridCls = `${
    dm
      ? "bg-[#080808] text-white"
      : "bg-gray-50 text-gray-900"
  } min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300`;

  const chartColor = dm ? "#ec4899" : "#e91e8c";
  const chartSecondary = dm ? "#a855f7" : "#7c3aed";
  const chartGrid = dm ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const chartAxis = dm ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)";

  return (
    <div className={gridCls}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              dm ? "text-white" : "text-gray-900"
            }`}
          >
            Dashboard{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Overview
            </span>
          </h1>
          <p className={`text-sm mt-1 ${dm ? "text-white/30" : "text-gray-400"}`}>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString("en-IN")}`
              : "Welcome to your admin panel"}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 self-start sm:self-auto"
        >
          <FaSync className="text-xs" /> Refresh
        </button>
      </div>

      {/* ── Primary Stats ── */}
      <SectionTitle title="Key Metrics" dm={dm} />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={FaUsers}
          label="Total Users"
          value={fmt(s.users.total)}
          sub={s.users.newToday}
          accent="pink"
          dm={dm}
        />
        <StatCard
          icon={FaPhone}
          label="Total Calls"
          value={fmt(s.calls.total)}
          sub={s.calls.active}
          accent="purple"
          dm={dm}
        />
        <StatCard
          icon={FaCoins}
          label="Coins in System"
          value={fmt(s.coins.totalInSystem)}
          accent="amber"
          dm={dm}
        />
        <StatCard
          icon={FaCreditCard}
          label="Revenue (₹)"
          value={`₹${fmt(s.payments.totalRevenue)}`}
          sub={s.payments.completed}
          accent="green"
          dm={dm}
        />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={FaComments}
          label="Chat Requests"
          value={s.communication.totalChatRequests}
          accent="cyan"
          dm={dm}
        />
        <StatCard
          icon={FaEnvelope}
          label="Messages"
          value={s.messages.total}
          sub={-s.messages.unread}
          accent="pink"
          dm={dm}
        />
        <StatCard
          icon={FaExclamationTriangle}
          label="Reports"
          value={s.moderation.totalReports}
          accent="red"
          dm={dm}
        />
        <StatCard
          icon={FaUserCheck}
          label="Profile Complete"
          value={s.users.profileCompleted}
          accent="green"
          dm={dm}
        />
      </div>

      {/* ── Charts Row ── */}
      <SectionTitle title="Analytics — Last 7 Days" dm={dm} />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {/* User Growth */}
        <Panel title="User Growth" dm={dm}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip dm={dm} />} />
              <Area
                type="monotone"
                dataKey="Users"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#ugGrad)"
                dot={{ fill: chartColor, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Call Volume */}
        <Panel title="Call Volume" dm={dm}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={callVolumeData}>
              <defs>
                <linearGradient id="cvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartSecondary} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={chartSecondary} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip dm={dm} />} />
              <Bar dataKey="Calls" fill="url(#cvGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Revenue */}
        <Panel title="Revenue (₹)" dm={dm} className="lg:col-span-2 xl:col-span-1">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chartAxis }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip dm={dm} />} />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke={chartColor}
                strokeWidth={2}
                dot={{ fill: chartColor, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Coins"
                stroke={chartSecondary}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: chartSecondary, r: 3 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ── Detail Panels ── */}
      <SectionTitle title="Details & Breakdown" dm={dm} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        {/* User Breakdown */}
        <Panel title="User Breakdown" dm={dm}>
          <ProgressBar label="Male" value={s.users.male} max={s.users.total} color="cyan" dm={dm} />
          <ProgressBar label="Female" value={s.users.female} max={s.users.total} color="pink" dm={dm} />
          <ProgressBar label="With Location" value={s.users.withLocation} max={s.users.total} color="emerald" dm={dm} />
          <ProgressBar label="Profile Done" value={s.users.profileCompleted} max={s.users.total} color="amber" dm={dm} />
        </Panel>

        {/* Call Stats */}
        <Panel title="Call Stats" dm={dm}>
          <MiniStat label="Ended" value={s.calls.ended} dm={dm} />
          <MiniStat label="Missed" value={s.calls.missed} dm={dm} />
          <MiniStat label="Active" value={s.calls.active} dm={dm} />
          <MiniStat label="Avg Duration" value={`${s.calls.avgDuration}s`} dm={dm} />
          <MiniStat label="Total Duration" value={`${s.calls.totalDuration}s`} dm={dm} />
          <MiniStat label="M → M" value={s.calls.maleToMale} dm={dm} />
        </Panel>

        {/* Coins & Payments */}
        <Panel title="Coins & Payments" dm={dm}>
          <MiniStat label="Coins in System" value={fmt(s.coins.totalInSystem)} dm={dm} />
          <MiniStat label="Avg per User" value={fmt(s.coins.avgPerUser)} dm={dm} />
          <MiniStat label="Admin Balance" value={fmt(s.coins.adminBalance)} dm={dm} />
          <MiniStat label="Coins Sold" value={s.payments.totalCoinsSold} dm={dm} />
          <MiniStat label="Revenue" value={`₹${s.payments.totalRevenue}`} dm={dm} />
          <MiniStat label="Transactions" value={s.payments.completed} dm={dm} />
        </Panel>

        {/* Moderation */}
        <Panel title="Moderation" dm={dm}>
          <MiniStat label="Total Reports" value={s.moderation.totalReports} dm={dm} />
          <MiniStat label="Pending" value={s.moderation.pendingReports} dm={dm} />
          <MiniStat label="Approved" value={s.moderation.approvedReports} dm={dm} />
          <MiniStat label="Warnings Issued" value={s.moderation.warningsIssued} dm={dm} />
          <MiniStat label="Users Warned" value={s.moderation.usersWithWarnings} dm={dm} />
          <MiniStat label="Chat Approved" value={s.communication.approved} dm={dm} />
        </Panel>
      </div>

      {/* ── Recent Activity ── */}
      <SectionTitle title="Recent Activity" dm={dm} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Recent Users */}
        <Panel title="Recent Users" dm={dm}>
          {recentActivity.users.map((u, i) => (
            <UserRow key={u._id} user={u} dm={dm} idx={i} />
          ))}
        </Panel>

        {/* Recent Calls */}
        <Panel title="Recent Calls" dm={dm}>
          {recentActivity.calls.slice(0, 8).map((c) => (
            <CallRow key={c._id} call={c} dm={dm} />
          ))}
        </Panel>
      </div>

      {/* ── Recent Payments ── */}
      <SectionTitle title="Recent Payments" dm={dm} />
      <div
        className={`rounded-2xl border overflow-hidden mb-8 ${
          dm ? "bg-[#0f0f0f] border-pink-500/20" : "bg-white border-pink-100"
        }`}
      >
        {/* Table header */}
        <div
          className={`grid grid-cols-4 sm:grid-cols-5 gap-3 px-4 sm:px-6 py-3 text-xs font-bold uppercase tracking-widest border-b ${
            dm
              ? "border-pink-500/10 text-white/30"
              : "border-pink-100 text-gray-400"
          }`}
        >
          <span>#</span>
          <span className="col-span-2">User</span>
          <span className="hidden sm:block">Amount</span>
          <span>Coins</span>
        </div>
        {recentActivity.payments.map((p, i) => (
          <div
            key={p._id}
            className={`grid grid-cols-4 sm:grid-cols-5 gap-3 items-center px-4 sm:px-6 py-3.5 text-sm border-b last:border-b-0 transition-colors ${
              dm
                ? "border-white/5 hover:bg-white/[0.02]"
                : "border-gray-100 hover:bg-pink-50/50"
            }`}
          >
            <span className={`font-bold ${dm ? "text-white/20" : "text-gray-300"}`}>
              {i + 1}
            </span>
            <div className="col-span-2 flex items-center gap-2 min-w-0">
              <img
                src={p.userId?.profileImage}
                alt={p.userId?.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-pink-500/20 flex-shrink-0"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${p.userId?.name}&background=e91e8c&color=fff&size=32`;
                }}
              />
              <div className="min-w-0">
                <p
                  className={`font-semibold truncate text-xs sm:text-sm ${
                    dm ? "text-white" : "text-gray-900"
                  }`}
                >
                  {p.userId?.name}
                </p>
                <p className={`text-xs truncate ${dm ? "text-white/25" : "text-gray-400"}`}>
                  {p.userId?.mobile}
                </p>
              </div>
            </div>
            <span
              className={`hidden sm:block font-bold text-emerald-400`}
            >
              ₹{p.amount}
            </span>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 w-fit`}
            >
              +{p.coins}
            </span>
          </div>
        ))}
      </div>

      {/* ── Warning Content Settings ── */}
      {data.settings?.warningContents?.length > 0 && (
        <>
          <SectionTitle title="Warning Guidelines" dm={dm} />
          <Panel dm={dm} className="mb-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {data.settings.warningContents[0].description.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    dm ? "bg-white/[0.03]" : "bg-pink-50/60"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className={`text-sm ${dm ? "text-white/60" : "text-gray-600"}`}>
                    {d.replace(/^\d+\./, "").trim()}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      {/* Footer */}
      <p className={`text-center text-xs pb-4 ${dm ? "text-white/15" : "text-gray-300"}`}>
        Generated at {new Date(data.generatedAt).toLocaleString("en-IN")}
      </p>
    </div>
  );
};

export default Dashboard;