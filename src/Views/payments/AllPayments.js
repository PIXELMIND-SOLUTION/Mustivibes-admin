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

const API = "http://31.97.206.144:4055/api/get/payments";

const AllPayments = ({ darkMode }) => {
  const isDark = darkMode;

  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // 🎨 Theme
  const colors = {
    bg: isDark ? "bg-slate-950" : "bg-slate-100",
    card: isDark ? "bg-slate-900" : "bg-white",
    border: isDark ? "border-slate-800" : "border-slate-200",
    text: isDark ? "text-slate-100" : "text-slate-800",
    sub: isDark ? "text-slate-400" : "text-slate-500",
    input: isDark
      ? "bg-slate-950 border-slate-700 text-white"
      : "bg-white border-slate-300",
    hover: isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-50",
  };

  // fetch
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

  // filtering
  const filtered = useMemo(() => {
    return payments
      .filter((p) =>
        status === "all" ? true : p.status === status
      )
      .filter((p) => {
        const text = search.toLowerCase();

        return (
          p.userId?.name?.toLowerCase().includes(text) ||
          p.userId?.mobile?.includes(text) ||
          p.razorpayPaymentId?.toLowerCase().includes(text)
        );
      });
  }, [payments, search, status]);

  useEffect(() => setPage(1), [search, status]);

  // pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  // 📊 STATS
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

  const statusBadge = (s) => {
    if (s === "completed")
      return "bg-green-100 text-green-700";
    if (s === "created")
      return "bg-yellow-100 text-yellow-700";

    return "bg-slate-200 text-slate-600";
  };

  return (
    <div className={`${colors.bg} min-h-screen p-6`}>
      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-4 mb-7">
        <div>
          <h1 className={`text-2xl font-bold ${colors.text}`}>
            Payments Dashboard
          </h1>
          <p className={colors.sub}>
            Track transactions and revenue
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {[
          {
            label: "Total Revenue",
            value: `₹ ${stats.revenue}`,
            icon: <IndianRupee />,
          },
          {
            label: "Coins Sold",
            value: stats.coins,
            icon: <Coins />,
          },
          {
            label: "Total Payments",
            value: stats.total,
            icon: <CreditCard />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`${colors.card} ${colors.border} border rounded-2xl p-5 shadow-sm`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={colors.sub}>{card.label}</p>
                <h2
                  className={`text-2xl font-bold mt-1 ${colors.text}`}
                >
                  {card.value}
                </h2>
              </div>

              <div className="p-3 rounded-xl bg-blue-600 text-white">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div
        className={`${colors.card} ${colors.border} border rounded-2xl shadow-sm`}
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search
              size={18}
              className="absolute top-2.5 left-3 text-slate-400"
            />
            <input
              placeholder="Search payments..."
              className={`pl-10 pr-4 py-2 rounded-lg border ${colors.input}`}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className={`px-3 py-2 rounded-lg border ${colors.input}`}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="created">Created</option>
          </select>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading payments...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-4 text-left">User</th>
                    <th>Payment ID</th>
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
                      className={`${colors.hover} border-t ${colors.border}`}
                    >
                      <td className="p-4">
                        {p.userId ? (
                          <>
                            <p className={`font-semibold ${colors.text}`}>
                              {p.userId.name}
                            </p>
                            <p className={colors.sub}>
                              {p.userId.mobile}
                            </p>
                          </>
                        ) : (
                          <span className={colors.sub}>
                            Guest User
                          </span>
                        )}
                      </td>

                      <td className={colors.text}>
                        {p.razorpayPaymentId ||
                          p.razorpayOrderId}
                      </td>

                      <td className={`font-semibold ${colors.text}`}>
                        ₹ {p.amount}
                      </td>

                      <td className={colors.text}>{p.coins}</td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className={colors.sub}>
                        {new Date(
                          p.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center p-10 text-slate-400">
                  No payments found
                </div>
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-800">
              <p className={colors.sub}>
                Page {page} of {totalPages || 1}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 border rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border rounded-lg disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllPayments;
