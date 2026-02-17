import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChevronLeft, FaChevronRight, FaDownload, FaEye,
  FaSearch, FaExclamationTriangle, FaTimes,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/admin/warnings";

const Warnings = ({ darkMode }) => {
  const dm = darkMode;
  const [warnings, setWarnings]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [dateFilter, setDateFilter]     = useState("all");
  const [page, setPage]                 = useState(1);
  const [viewModal, setViewModal]       = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const rowsPerPage = 8;

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setWarnings(res.data.warnings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarnings(); }, []);

  useEffect(() => {
    let data = [...warnings];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter((w) =>
        w.reason?.toLowerCase().includes(s) ||
        w.reportedUser?.name?.toLowerCase().includes(s) ||
        w.adminComment?.toLowerCase().includes(s)
      );
    }
    if (dateFilter !== "all") {
      const now = new Date();
      data = data.filter((w) => {
        const diff = (now - new Date(w.createdAt)) / (1000 * 60 * 60 * 24);
        return dateFilter === "7" ? diff <= 7 : diff <= 30;
      });
    }
    setFiltered(data);
    setPage(1);
  }, [warnings, search, dateFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const exportCSV = () => {
    const header = ["S.No", "User", "Mobile", "Reason", "Admin Comment", "Date"];
    const rows = filtered.map((w, i) => [
      i + 1,
      w.reportedUser?.name || "Unknown",
      w.reportedUser?.mobile || "N/A",
      `"${w.reason}"`,
      `"${w.adminComment || "-"}"`,
      new Date(w.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `warnings-${Date.now()}.csv`;
    link.click();
  };

  const inputCls = `px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition text-sm
    ${dm ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20" : "bg-white border-pink-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className={`relative min-h-screen p-6 md:p-10 transition-all duration-300
      ${dm ? "bg-[#070707] text-white" : "bg-gradient-to-br from-pink-50 via-white to-red-100 text-gray-800"}`}
    >
      {/* GRID */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              User Warnings
            </h1>
            <p className={`text-sm mt-1 ${dm ? "text-white/40" : "text-gray-400"}`}>
              Monitor flagged users and administrative actions
            </p>
          </div>
          <button onClick={exportCSV}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition
              ${dm ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10" : "border-pink-300 text-pink-600 hover:bg-pink-50"}`}
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[220px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40 text-sm" />
            <input
              placeholder="Search user, reason, comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-10 w-full`}
            />
          </div>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={inputCls}>
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        {/* RESULTS META */}
        <div className={`text-xs font-semibold mb-3 ${dm ? "text-white/30" : "text-gray-400"}`}>
          Showing {paginated.length} of {filtered.length} warnings
        </div>

        {/* TABLE */}
        <div className={`rounded-3xl border backdrop-blur-xl overflow-hidden
          ${dm ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.12)]" : "bg-white border-pink-200 shadow-xl"}`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dm ? "border-pink-500/10" : "border-pink-100"}`}>
                {["#", "User", "Reason", "Admin Comment", "Date", "View"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-pink-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-5 py-4">
                      <div className={`h-10 rounded-xl ${dm ? "bg-pink-500/5" : "bg-pink-50"}`} />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 opacity-40">
                    <FaExclamationTriangle className="text-3xl text-pink-500 mx-auto mb-3" />
                    <p className="text-sm">No warnings found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((w, i) => (
                  <tr key={w._id}
                    className={`border-b transition-all ${dm ? "border-pink-500/10 hover:bg-pink-500/5" : "border-pink-100 hover:bg-pink-50"}`}
                  >
                    <td className="px-5 py-4 font-bold text-pink-400">{(page - 1) * rowsPerPage + i + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{w.reportedUser?.name || "Unknown"}</p>
                      <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>{w.reportedUser?.mobile || "N/A"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-red-500 text-white">
                        {w.reason}
                      </span>
                    </td>
                    <td className={`px-5 py-4 max-w-xs truncate text-xs ${dm ? "text-white/60" : "text-gray-600"}`}>
                      {w.adminComment || <span className="opacity-40">—</span>}
                    </td>
                    <td className={`px-5 py-4 text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>
                      {new Date(w.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => { setSelectedWarning(w); setViewModal(true); }}
                        className="p-2 rounded-xl border border-pink-500/20 text-pink-400 hover:bg-pink-500/10 hover:scale-110 transition"
                      >
                        <FaEye className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6">
          <p className={`text-sm ${dm ? "text-white/40" : "text-gray-400"}`}>
            Page <span className="font-bold text-pink-400">{page}</span> of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <PaginationBtn onClick={() => setPage(1)} disabled={page === 1} dm={dm}>«</PaginationBtn>
            <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={page === 1} dm={dm}><FaChevronLeft className="text-xs" /></PaginationBtn>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const num = start + i;
              return num <= totalPages ? (
                <button key={num} onClick={() => setPage(num)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition
                    ${num === page
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_12px_rgba(255,0,90,.4)]"
                      : dm ? "text-white/40 hover:bg-pink-500/10 hover:text-white" : "text-gray-500 hover:bg-pink-50"
                    }`}
                >{num}</button>
              ) : null;
            })}
            <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} dm={dm}><FaChevronRight className="text-xs" /></PaginationBtn>
            <PaginationBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} dm={dm}>»</PaginationBtn>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModal && selectedWarning && (
        <Modal dm={dm} onClose={() => setViewModal(false)} title="Warning Details">
          <div className="space-y-4">
            <DetailRow label="User"          value={selectedWarning.reportedUser?.name} dm={dm} />
            <DetailRow label="Mobile"        value={selectedWarning.reportedUser?.mobile} dm={dm} />
            <DetailRow label="Reason"        value={selectedWarning.reason} pill dm={dm} />
            <DetailRow label="Admin Comment" value={selectedWarning.adminComment || "—"} dm={dm} />
            <DetailRow label="Date"          value={new Date(selectedWarning.createdAt).toLocaleString("en-IN")} dm={dm} />
          </div>
        </Modal>
      )}
    </div>
  );
};

const PaginationBtn = ({ children, disabled, onClick, dm }) => (
  <button disabled={disabled} onClick={onClick}
    className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition
      ${dm ? "border-pink-500/20 text-white/40 hover:bg-pink-500/10 hover:text-white disabled:opacity-20" : "border-pink-200 text-gray-400 hover:bg-pink-50 disabled:opacity-30"}
      disabled:cursor-not-allowed`}
  >{children}</button>
);

const Modal = ({ dm, onClose, title, children }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
    <div className="absolute inset-0" onClick={onClose} />
    <div className={`relative w-full max-w-lg rounded-3xl p-8 border z-10 shadow-2xl
      ${dm ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_60px_rgba(255,0,90,.25)]" : "bg-white border-pink-200"}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          {title}
        </h2>
        <button onClick={onClose} className="p-2 rounded-xl border border-pink-500/20 text-pink-400 hover:bg-pink-500/10 transition">
          <FaTimes className="text-sm" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value, pill, dm }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl ${dm ? "bg-pink-500/5" : "bg-pink-50"}`}>
    <span className="text-xs font-bold uppercase tracking-widest text-pink-500 w-32 shrink-0 pt-0.5">{label}</span>
    {pill
      ? <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-red-500 text-white">{value}</span>
      : <span className={`text-sm ${dm ? "text-white/70" : "text-gray-700"}`}>{value}</span>
    }
  </div>
);

export default Warnings;