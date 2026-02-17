import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaSearch, FaSync, FaRupeeSign, FaCoins, FaCreditCard,
  FaDownload, FaChevronLeft, FaChevronRight, FaFilter,
  FaCheckCircle, FaClock, FaTimesCircle, FaSortUp, FaSortDown, FaSort,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/get/payments";

// ─── EXPORT HELPERS ───────────────────────────────────────
const exportCSV = (data) => {
  const headers = ["User", "Mobile", "Payment ID", "Order ID", "Amount (₹)", "Coins", "Status", "Date"];
  const rows = data.map((p) => [
    p.userId?.name || "Guest",
    p.userId?.mobile || "-",
    p.razorpayPaymentId || "-",
    p.razorpayOrderId || "-",
    p.amount,
    p.coins,
    p.status,
    new Date(p.createdAt).toLocaleDateString("en-IN"),
  ]);
  const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].map((r) => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = `payments-${Date.now()}.csv`;
  link.click();
};

// ─── MAIN COMPONENT ───────────────────────────────────────
const AllPayments = ({ darkMode }) => {
  const dm = darkMode;

  const [payments, setPayments]   = useState([]);
  const [search, setSearch]       = useState("");
  const [status, setStatus]       = useState("all");
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [page, setPage]           = useState(1);
  const [sortKey, setSortKey]     = useState("createdAt");
  const [sortDir, setSortDir]     = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const rowsPerPage = 8;

  // FETCH
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setPayments(res.data.data || []);
    } catch {
      setError("Failed to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  // SORT TOGGLE
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <FaSort className="opacity-30 text-xs" />;
    return sortDir === "asc" ? <FaSortUp className="text-pink-500 text-xs" /> : <FaSortDown className="text-pink-500 text-xs" />;
  };

  // FILTER + SORT
  const filtered = useMemo(() => {
    let list = [...payments];

    if (status !== "all") list = list.filter((p) => p.status === status);

    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter((p) =>
        p.userId?.name?.toLowerCase().includes(t) ||
        p.userId?.mobile?.includes(t) ||
        p.razorpayPaymentId?.toLowerCase().includes(t) ||
        p.razorpayOrderId?.toLowerCase().includes(t)
      );
    }

    if (dateFrom) list = list.filter((p) => new Date(p.createdAt) >= new Date(dateFrom));
    if (dateTo)   list = list.filter((p) => new Date(p.createdAt) <= new Date(dateTo + "T23:59:59"));

    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "name")   { av = a.userId?.name || ""; bv = b.userId?.name || ""; }
      if (sortKey === "createdAt") { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [payments, search, status, dateFrom, dateTo, sortKey, sortDir]);

  useEffect(() => setPage(1), [search, status, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = useMemo(() => filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage), [filtered, page]);

  // STATS
  const stats = useMemo(() => ({
    revenue:   payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0),
    coins:     payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.coins, 0),
    total:     payments.length,
    completed: payments.filter((p) => p.status === "completed").length,
    pending:   payments.filter((p) => p.status === "created").length,
  }), [payments]);

  // RESET FILTERS
  const resetFilters = () => {
    setSearch(""); setStatus("all"); setDateFrom(""); setDateTo("");
  };

  const hasFilters = search || status !== "all" || dateFrom || dateTo;

  // INPUT CLASS
  const inputCls = `px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition text-sm
    ${dm ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20" : "bg-white border-pink-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className={`relative min-h-screen p-6 md:p-10 transition-all duration-300
      ${dm ? "bg-[#070707] text-white" : "bg-gradient-to-br from-pink-50 via-white to-red-100 text-gray-800"}`}
    >
      {/* GRID OVERLAY */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              Payments Dashboard
            </h1>
            <p className={`text-sm mt-1 ${dm ? "text-white/40" : "text-gray-400"}`}>
              Monitor revenue, transactions and coin sales
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => exportCSV(filtered)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition
                ${dm ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10" : "border-pink-300 text-pink-600 hover:bg-pink-50"}`}
            >
              <FaDownload /> Export CSV
            </button>

            <button
              onClick={fetchPayments}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-pink-500 to-red-500
                hover:scale-105 transition shadow-[0_0_20px_rgba(255,0,90,.45)]"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Revenue"    value={`₹${stats.revenue.toLocaleString("en-IN")}`} icon={<FaRupeeSign />}  dm={dm} span="lg:col-span-2" />
          <StatCard label="Coins Sold"       value={stats.coins.toLocaleString()}                  icon={<FaCoins />}      dm={dm} />
          <StatCard label="Total Payments"   value={stats.total}                                   icon={<FaCreditCard />} dm={dm} />
          <StatCard label="Completed"        value={stats.completed}                               icon={<FaCheckCircle />} dm={dm} accent />
        </div>

        {/* ── TABLE CARD ── */}
        <div className={`rounded-3xl border backdrop-blur-xl
          ${dm ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.12)]" : "bg-white border-pink-200 shadow-xl"}`}
        >
          {/* FILTER BAR */}
          <div className={`p-5 border-b ${dm ? "border-pink-500/10" : "border-pink-100"}`}>
            <div className="flex flex-wrap gap-3 items-center justify-between">

              {/* SEARCH */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40 text-sm" />
                <input
                  placeholder="Search name, mobile, payment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputCls} pl-10 w-full`}
                />
              </div>

              <div className="flex gap-3 flex-wrap items-center">
                {/* STATUS FILTER */}
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputCls}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="created">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                {/* ADVANCED FILTERS TOGGLE */}
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition
                    ${showFilters
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white border-transparent"
                      : dm ? "border-pink-500/20 text-pink-400 hover:bg-pink-500/10" : "border-pink-200 text-pink-600 hover:bg-pink-50"
                    }`}
                >
                  <FaFilter className="text-xs" /> Filters
                  {hasFilters && <span className="w-2 h-2 rounded-full bg-pink-400 ml-1" />}
                </button>

                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-pink-400 hover:text-pink-300 underline transition"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDED DATE FILTERS */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-pink-500/10">
                <div>
                  <label className="block text-xs font-bold text-pink-500 mb-1">From Date</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pink-500 mb-1">To Date</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
                </div>
              </div>
            )}
          </div>

          {/* RESULTS META */}
          <div className={`px-5 py-2.5 text-xs font-semibold border-b flex items-center justify-between
            ${dm ? "border-pink-500/10 text-white/30" : "border-pink-100 text-gray-400"}`}
          >
            <span>Showing {paginated.length} of {filtered.length} records</span>
            <span>{hasFilters ? "Filtered" : "All payments"}</span>
          </div>

          {/* TABLE / STATES */}
          {loading ? (
            <Skeleton dm={dm} />
          ) : error ? (
            <div className="p-12 text-center">
              <FaTimesCircle className="text-3xl text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold">{error}</p>
              <button onClick={fetchPayments} className="mt-4 px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-pink-500 to-red-500">
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${dm ? "border-pink-500/10" : "border-pink-100"}`}>
                      {[
                        { label: "User",       key: "name" },
                        { label: "Payment ID", key: "razorpayPaymentId" },
                        { label: "Amount",     key: "amount" },
                        { label: "Coins",      key: "coins" },
                        { label: "Status",     key: "status" },
                        { label: "Date",       key: "createdAt" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={`px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest cursor-pointer select-none
                            ${dm ? "text-pink-500/70 hover:text-pink-400" : "text-pink-500 hover:text-pink-700"}`}
                        >
                          <span className="flex items-center gap-1.5">
                            {col.label} <SortIcon col={col.key} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 opacity-40">
                          <FaCreditCard className="text-3xl text-pink-500 mx-auto mb-3" />
                          <p className="text-sm">No payments found</p>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((p) => (
                        <tr
                          key={p._id}
                          className={`border-b transition-all duration-150
                            ${dm ? "border-pink-500/10 hover:bg-pink-500/5" : "border-pink-100 hover:bg-pink-50"}`}
                        >
                          {/* USER */}
                          <td className="px-5 py-4">
                            {p.userId ? (
                              <div>
                                <p className="font-semibold">{p.userId.name}</p>
                                <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>{p.userId.mobile}</p>
                              </div>
                            ) : (
                              <span className={`text-xs ${dm ? "text-white/30" : "text-gray-400"}`}>Guest User</span>
                            )}
                          </td>

                          {/* PAYMENT ID */}
                          <td className="px-5 py-4">
                            <code className={`text-xs font-mono px-2 py-1 rounded-lg
                              ${dm ? "bg-pink-500/10 text-pink-300" : "bg-pink-50 text-pink-700"}`}>
                              {(p.razorpayPaymentId || p.razorpayOrderId || "-").slice(0, 18)}…
                            </code>
                          </td>

                          {/* AMOUNT */}
                          <td className="px-5 py-4 font-bold text-pink-400">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>

                          {/* COINS */}
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 font-semibold">
                              <FaCoins className="text-yellow-400 text-xs" />
                              {p.coins.toLocaleString()}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <StatusBadge status={p.status} />
                          </td>

                          {/* DATE */}
                          <td className={`px-5 py-4 text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>
                            {new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                            <p className="mt-0.5">
                              {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className={`flex flex-wrap justify-between items-center p-5 border-t
                ${dm ? "border-pink-500/10" : "border-pink-100"}`}
              >
                <p className={`text-sm ${dm ? "text-white/40" : "text-gray-400"}`}>
                  Page <span className="font-bold text-pink-400">{page}</span> of {totalPages || 1}
                </p>

                <div className="flex items-center gap-2">
                  {/* FIRST */}
                  <PaginationBtn onClick={() => setPage(1)} disabled={page === 1} dm={dm}>«</PaginationBtn>
                  {/* PREV */}
                  <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} dm={dm}>
                    <FaChevronLeft className="text-xs" />
                  </PaginationBtn>

                  {/* PAGE NUMBERS */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const num = start + i;
                    return num <= totalPages ? (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-9 h-9 rounded-xl text-sm font-semibold transition
                          ${num === page
                            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_12px_rgba(255,0,90,.4)]"
                            : dm ? "text-white/40 hover:bg-pink-500/10 hover:text-white" : "text-gray-500 hover:bg-pink-50"
                          }`}
                      >
                        {num}
                      </button>
                    ) : null;
                  })}

                  {/* NEXT */}
                  <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} dm={dm}>
                    <FaChevronRight className="text-xs" />
                  </PaginationBtn>
                  {/* LAST */}
                  <PaginationBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} dm={dm}>»</PaginationBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────
const StatCard = ({ label, value, icon, dm, span = "", accent = false }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 border transition hover:scale-[1.02]
    ${span}
    ${dm
      ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_30px_rgba(255,0,90,.1)]"
      : "bg-white border-pink-200 shadow-xl"
    }`}
  >
    <div className="absolute -top-8 -right-8 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${dm ? "text-white/40" : "text-gray-400"}`}>{label}</p>
        <h2 className="text-2xl font-extrabold mt-1 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">{value}</h2>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,90,.4)]`}>
        {icon}
      </div>
    </div>
  </div>
);

// ─── STATUS BADGE ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    completed: { cls: "bg-pink-500/15 text-pink-400 border-pink-500/30",  icon: <FaCheckCircle className="text-xs" />, label: "Completed" },
    created:   { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: <FaClock className="text-xs" />,       label: "Pending"   },
    failed:    { cls: "bg-red-500/15 text-red-400 border-red-500/30",     icon: <FaTimesCircle className="text-xs" />,  label: "Failed"    },
  };
  const s = map[status] || map.failed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
};

// ─── PAGINATION BUTTON ────────────────────────────────────
const PaginationBtn = ({ children, disabled, onClick, dm }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition
      ${dm
        ? "border-pink-500/20 text-white/40 hover:bg-pink-500/10 hover:text-white disabled:opacity-20"
        : "border-pink-200 text-gray-400 hover:bg-pink-50 disabled:opacity-30"
      } disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

// ─── SKELETON ─────────────────────────────────────────────
const Skeleton = ({ dm }) => (
  <div className="p-6 space-y-3 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className={`h-14 rounded-2xl ${dm ? "bg-pink-500/5" : "bg-pink-50"}`} />
    ))}
  </div>
);

export default AllPayments;