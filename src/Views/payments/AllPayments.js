import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  CreditCard,
  IndianRupee,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "http://31.97.206.144:4050/api/get/payments";

const AllPayments = ({ darkMode }) => {
  const isDark = darkMode;

  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  /* ================= PREMIUM THEME ================= */

  const theme = {
    page: isDark
      ? "bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white"
      : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900",

    card: isDark
      ? "bg-white/[0.04] border border-white/10 backdrop-blur-xl"
      : "bg-white border border-slate-200",

    hover: isDark
      ? "hover:bg-white/[0.07]"
      : "hover:bg-slate-50",

    sub: isDark ? "text-slate-400" : "text-slate-500",

    input: isDark
      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300",

    tableHead: isDark
      ? "bg-white/[0.03]"
      : "bg-slate-50",
  };

  /* ================= FETCH ================= */

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setPayments(res.data.data);
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return payments
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => {
        const t = search.toLowerCase();

        return (
          p.userId?.name?.toLowerCase().includes(t) ||
          p.userId?.mobile?.includes(t) ||
          p.razorpayPaymentId?.toLowerCase().includes(t)
        );
      });
  }, [payments, search, status]);

  useEffect(() => setPage(1), [search, status]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  /* ================= STATS ================= */

  const stats = useMemo(() => {
    const revenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const coins = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.coins, 0);

    return {
      revenue,
      coins,
      total: payments.length,
    };
  }, [payments]);

  /* ================= BADGE ================= */

  const statusBadge = (s) => {
    if (s === "completed")
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";

    if (s === "created")
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";

    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  /* ================================================= */

  return (
    <div className={`${theme.page} min-h-screen p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Payments Dashboard
            </h1>
            <p className={theme.sub}>
              Monitor revenue, transactions and coin sales
            </p>
          </div>

          <button
            onClick={fetchPayments}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-xl
              bg-gradient-to-r from-indigo-600 to-blue-600
              hover:scale-105 active:scale-95
              transition
              text-white shadow-lg
            "
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* PREMIUM STATS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Total Revenue"
            value={`₹ ${stats.revenue.toLocaleString("en-IN")}`}
            icon={<IndianRupee />}
            isDark={isDark}
          />

          <StatCard
            label="Coins Sold"
            value={stats.coins}
            icon={<Coins />}
            isDark={isDark}
          />

          <StatCard
            label="Total Payments"
            value={stats.total}
            icon={<CreditCard />}
            isDark={isDark}
          />
        </div>

        {/* TABLE */}

        <div className={`rounded-3xl shadow-xl ${theme.card}`}>

          {/* FILTER BAR */}

          <div className="flex flex-wrap gap-3 justify-between p-5 border-b border-white/10">

            <div className="relative">
              <Search
                size={18}
                className="absolute top-3 left-3 text-slate-400"
              />

              <input
                placeholder="Search payments..."
                className={`pl-10 pr-4 py-2 rounded-xl border ${theme.input}`}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={`px-3 py-2 rounded-xl border ${theme.input}`}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="created">Created</option>
            </select>
          </div>

          {/* CONTENT */}

          {loading ? (
            <Skeleton />
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead className={`${theme.tableHead} ${theme.sub}`}>
                    <tr>
                      <th className="p-4 text-left font-semibold">User</th>
                      <th className="text-left">Payment</th>
                      <th>Amount</th>
                      <th>Coins</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((p) => (
                      <tr
                        key={p._id}
                        className={`border-t border-white/5 transition ${theme.hover}`}
                      >
                        <td className="p-4">
                          {p.userId ? (
                            <>
                              <p className="font-semibold">
                                {p.userId.name}
                              </p>
                              <p className={theme.sub}>
                                {p.userId.mobile}
                              </p>
                            </>
                          ) : (
                            <span className={theme.sub}>
                              Guest User
                            </span>
                          )}
                        </td>

                        <td className="font-mono text-xs">
                          {p.razorpayPaymentId ||
                            p.razorpayOrderId}
                        </td>

                        <td className="font-bold">
                          ₹ {p.amount}
                        </td>

                        <td>{p.coins}</td>

                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                              p.status
                            )}`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className={theme.sub}>
                          {new Date(
                            p.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="text-center p-12 text-slate-400">
                    No payments found
                  </div>
                )}
              </div>

              {/* PAGINATION */}

              <div className="flex justify-between items-center p-5 border-t border-white/10">
                <p className={theme.sub}>
                  Page {page} of {totalPages || 1}
                </p>

                <div className="flex gap-2">
                  <PageBtn
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={16} />
                  </PageBtn>

                  <PageBtn
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight size={16} />
                  </PageBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= PREMIUM STAT CARD ================= */

const StatCard = ({ label, value, icon, isDark }) => (
  <div
    className={`
      relative overflow-hidden rounded-3xl p-6
      transition hover:-translate-y-1 hover:shadow-2xl
      ${isDark
        ? "bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10"
        : "bg-white border border-slate-200"}
    `}
  >
    {/* glow */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full"/>

    <div className="flex justify-between items-center">
      <div>
        <p className={`${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {label}
        </p>

        <h2 className="text-2xl font-bold mt-1">
          {value}
        </h2>
      </div>

      <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg">
        {icon}
      </div>
    </div>
  </div>
);

/* ================= PAGE BUTTON ================= */

const PageBtn = ({ children, disabled, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="
      p-2 rounded-lg border border-white/10
      hover:bg-white/10
      disabled:opacity-40 disabled:cursor-not-allowed
      transition
    "
  >
    {children}
  </button>
);

/* ================= SKELETON ================= */

const Skeleton = () => (
  <div className="p-6 space-y-4 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-14 rounded-xl bg-white/5"/>
    ))}
  </div>
);

export default AllPayments;
