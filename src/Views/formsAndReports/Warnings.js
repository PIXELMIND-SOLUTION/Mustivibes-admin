import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaSearch,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/admin/warnings";

const Warnings = ({ darkMode }) => {
  const [warnings, setWarnings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [viewModal, setViewModal] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);

  // FETCH
  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setWarnings(res.data.warnings);
    } catch (err) {
      console.error("Fetch warnings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, []);

  // FILTER
  useEffect(() => {
    let data = [...warnings];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (w) =>
          w.reason?.toLowerCase().includes(s) ||
          w.reportedUser?.name?.toLowerCase().includes(s) ||
          w.adminComment?.toLowerCase().includes(s)
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();

      data = data.filter((w) => {
        const created = new Date(w.createdAt);
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);

        if (dateFilter === "7") return diffDays <= 7;
        if (dateFilter === "30") return diffDays <= 30;
        return true;
      });
    }

    setFiltered(data);
    setPage(1);
  }, [warnings, search, dateFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // EXPORT CSV
  const exportCSV = () => {
    const header = [
      "S.No",
      "User",
      "Mobile",
      "Reason",
      "Admin Comment",
      "Date",
    ];

    const rows = filtered.map((w, i) => [
      i + 1,
      w.reportedUser?.name || "Unknown",
      w.reportedUser?.mobile || "N/A",
      w.reason,
      w.adminComment || "-",
      new Date(w.createdAt).toLocaleDateString(),
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "warnings.csv";
    link.click();
  };

  return (
    <div
      className={`min-h-screen p-8 transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-indigo-50 via-white to-indigo-100"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            ⚠️ User Warnings
          </h1>
          <p className="opacity-70 mt-1">
            Monitor flagged users and administrative actions
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold
          bg-gradient-to-r from-indigo-600 to-purple-600
          hover:scale-105 hover:shadow-2xl
          transition-all text-white"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="relative flex-1">
          <FaSearch className="absolute top-4 left-4 opacity-40" />

          <input
            placeholder="Search user, reason, comment..."
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border backdrop-blur-xl
            shadow-lg focus:ring-2 focus:ring-indigo-500 outline-none
            ${
              darkMode
                ? "bg-white/5 border-white/10"
                : "bg-white/70 border-gray-200"
            }`}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          onChange={(e) => setDateFilter(e.target.value)}
          className={`px-6 py-4 rounded-2xl border shadow-lg
          ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white border-gray-200"
          }`}
        >
          <option value="all">All Time</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-3xl overflow-hidden border backdrop-blur-xl shadow-2xl
        ${
          darkMode
            ? "bg-white/5 border-white/10"
            : "bg-white/70 border-gray-200"
        }`}
      >
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="p-5">#</th>
              <th>User</th>
              <th>Reason</th>
              <th>Admin Comment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-white/5">
                  <td className="p-6" colSpan="6">
                    <div className="h-6 bg-gray-400/20 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-10 opacity-60">
                  No warnings found.
                </td>
              </tr>
            ) : (
              paginated.map((w, i) => (
                <tr
                  key={w._id}
                  className="border-b border-white/5 hover:bg-indigo-500/5 transition"
                >
                  <td className="p-5 font-bold">
                    {(page - 1) * rowsPerPage + i + 1}
                  </td>

                  <td>
                    <div className="font-semibold">
                      {w.reportedUser?.name || "Unknown"}
                    </div>
                    <div className="text-xs opacity-60">
                      {w.reportedUser?.mobile || "N/A"}
                    </div>
                  </td>

                  {/* REASON PILL */}
                  <td>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold
                      bg-gradient-to-r from-pink-500 to-red-500 text-white"
                    >
                      {w.reason}
                    </span>
                  </td>

                  <td className="max-w-xs truncate">
                    {w.adminComment || "-"}
                  </td>

                  <td>
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <FaEye
                      onClick={() => {
                        setSelectedWarning(w);
                        setViewModal(true);
                      }}
                      className="cursor-pointer text-indigo-500 hover:scale-125 transition"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-3 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:scale-110 transition"
        >
          <FaChevronLeft />
        </button>

        <span className="font-semibold">
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-3 rounded-full bg-indigo-600 text-white disabled:opacity-40 hover:scale-110 transition"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* MODAL */}
      {viewModal && selectedWarning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div
            className={`w-[620px] rounded-3xl p-10 shadow-[0_25px_80px_rgba(0,0,0,0.6)]
            animate-[scaleIn_.25s_ease]
            ${
              darkMode
                ? "bg-gradient-to-br from-gray-900 to-gray-800"
                : "bg-white"
            }`}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Warning Details
            </h2>

            <div className="space-y-4 text-lg">
              <p>
                <strong>User:</strong>{" "}
                {selectedWarning.reportedUser?.name}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {selectedWarning.reportedUser?.mobile}
              </p>

              <p>
                <strong>Reason:</strong> {selectedWarning.reason}
              </p>

              <p>
                <strong>Admin Comment:</strong>{" "}
                {selectedWarning.adminComment || "-"}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(
                  selectedWarning.createdAt
                ).toLocaleString()}
              </p>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setViewModal(false)}
                className="px-6 py-3 rounded-xl font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600
                hover:scale-105 transition text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warnings;
