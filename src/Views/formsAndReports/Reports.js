import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheck, FaTimes, FaChevronLeft, FaChevronRight,
  FaDownload, FaEye, FaArrowRight, FaSearch,
  FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaClock,
} from "react-icons/fa";

const API    = "http://31.97.206.144:4050/api/admin/reports";
const HANDLE = "http://31.97.206.144:4050/api/admin/handle";
const SINGLE = "http://31.97.206.144:4050/api/admin/report";

const Reports = ({ darkMode }) => {
  const dm = darkMode;

  const [reports, setReports]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState("pending");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const rowsPerPage = 8;

  const [modal, setModal]                   = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType]         = useState("");
  const [comment, setComment]               = useState("");
  const [actionLoading, setActionLoading]   = useState(false);
  const [actionError, setActionError]       = useState("");

  const [viewModal, setViewModal]   = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  useEffect(() => {
    let data = reports.filter((r) => r.status === activeTab);
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((r) =>
        r.reason?.toLowerCase().includes(s) ||
        r.reportedUser?.name?.toLowerCase().includes(s) ||
        r.reportedBy?.name?.toLowerCase().includes(s)
      );
    }
    setFiltered(data);
    setPage(1);
  }, [reports, activeTab, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const fetchSingleReport = async (id) => {
    try {
      setViewLoading(true);
      setViewModal(true);
      const res = await axios.get(`${SINGLE}/${id}`);
      setViewReport(res.data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleAction = async () => {
    if (!comment.trim()) return setActionError("Admin comment is required.");
    try {
      setActionLoading(true);
      setActionError("");
      await axios.put(`${HANDLE}/${selectedReport._id}`, {
        action: actionType,
        adminComment: comment,
      });
      setModal(false);
      setComment("");
      fetchReports();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to process action.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const header = ["S.No", "Reporter", "Reported User", "Reason", "Status"];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.reportedBy?.name || "Anonymous",
      r.reportedUser?.name || "Unknown",
      `"${r.reason}"`,
      r.status,
    ]);
    const csv = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `reports-${activeTab}-${Date.now()}.csv`;
    link.click();
  };

  const count = (s) => reports.filter((r) => r.status === s).length;

  const tabIcon = { pending: <FaClock />, approved: <FaCheckCircle />, rejected: <FaTimesCircle /> };
  const tabColor = { pending: "text-yellow-400", approved: "text-green-400", rejected: "text-red-400" };

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
              Moderation Reports
            </h1>
            <p className={`text-sm mt-1 ${dm ? "text-white/40" : "text-gray-400"}`}>
              Review, approve or reject user reports
            </p>
          </div>
          <button onClick={exportCSV}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition
              ${dm ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10" : "border-pink-300 text-pink-600 hover:bg-pink-50"}`}
          >
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* TABS */}
        <div className={`inline-flex gap-1 p-1 rounded-2xl mb-8 ${dm ? "bg-[#111] border border-pink-500/20" : "bg-pink-50 border border-pink-200"}`}>
          {["pending", "approved", "rejected"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300
                ${activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,90,.45)]"
                  : dm ? "text-white/50 hover:text-white/80" : "text-gray-500 hover:text-gray-800"
                }`}
            >
              <span className={`text-xs ${activeTab === tab ? "text-white" : tabColor[tab]}`}>{tabIcon[tab]}</span>
              {tab}
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                ${activeTab === tab ? "bg-white/20" : dm ? "bg-pink-500/10 text-pink-400" : "bg-pink-100 text-pink-600"}`}>
                {count(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative mb-6 max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40 text-sm" />
          <input
            placeholder="Search reporter, reported user, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-10 w-full`}
          />
        </div>

        {/* META */}
        <div className={`text-xs font-semibold mb-3 ${dm ? "text-white/30" : "text-gray-400"}`}>
          Showing {paginated.length} of {filtered.length} {activeTab} reports
        </div>

        {/* TABLE */}
        <div className={`rounded-3xl border backdrop-blur-xl overflow-hidden
          ${dm ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.12)]" : "bg-white border-pink-200 shadow-xl"}`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dm ? "border-pink-500/10" : "border-pink-100"}`}>
                {["#", "Reporter", "Reported User", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-pink-500">{h}</th>
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
                    <FaExclamationCircle className="text-3xl text-pink-500 mx-auto mb-3" />
                    <p className="text-sm">No {activeTab} reports found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => (
                  <tr key={r._id}
                    className={`border-b transition-all ${dm ? "border-pink-500/10 hover:bg-pink-500/5" : "border-pink-100 hover:bg-pink-50"}`}
                  >
                    <td className="px-5 py-4 font-bold text-pink-400">{(page - 1) * rowsPerPage + i + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{r.reportedBy?.name || "Anonymous"}</p>
                      <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>{r.reportedBy?.mobile || ""}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{r.reportedUser?.name || "Unknown"}</p>
                      <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>{r.reportedUser?.mobile || ""}</p>
                    </td>
                    <td className="px-5 py-4 max-w-[180px]">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-red-500 text-white truncate max-w-full">
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 items-center">
                        <ActionBtn title="View" onClick={() => fetchSingleReport(r._id)} color="pink" dm={dm}>
                          <FaEye className="text-xs" />
                        </ActionBtn>
                        {r.status === "pending" && (
                          <>
                            <ActionBtn title="Approve" onClick={() => { setSelectedReport(r); setActionType("approve"); setModal(true); }} color="green" dm={dm}>
                              <FaCheck className="text-xs" />
                            </ActionBtn>
                            <ActionBtn title="Reject" onClick={() => { setSelectedReport(r); setActionType("reject"); setModal(true); }} color="red" dm={dm}>
                              <FaTimes className="text-xs" />
                            </ActionBtn>
                          </>
                        )}
                      </div>
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

      {/* ── ACTION MODAL ── */}
      {modal && selectedReport && (
        <ModalWrap dm={dm} onClose={() => { setModal(false); setActionError(""); setComment(""); }}
          title={actionType === "approve" ? "Approve Report" : "Reject Report"}
        >
          {/* Reporter → Reported */}
          <div className={`flex items-center justify-between p-4 rounded-2xl mb-5 ${dm ? "bg-pink-500/5" : "bg-pink-50"}`}>
            <div className="text-center">
              <p className="font-bold text-sm">{selectedReport.reportedBy?.name || "Anonymous"}</p>
              <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>Reporter</p>
            </div>
            <FaArrowRight className="text-pink-500" />
            <div className="text-center">
              <p className="font-bold text-sm">{selectedReport.reportedUser?.name || "Unknown"}</p>
              <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>Reported</p>
            </div>
          </div>

          {/* Reason */}
          <div className={`px-4 py-2 rounded-xl mb-5 ${dm ? "bg-pink-500/5" : "bg-pink-50"}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-500">Reason: </span>
            <span className={`text-sm ${dm ? "text-white/70" : "text-gray-700"}`}>{selectedReport.reason}</span>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">Admin Comment *</label>
            <textarea
              rows={3}
              placeholder="Enter your decision comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition resize-none text-sm
                ${dm ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20" : "bg-white border-pink-200"}`}
            />
          </div>

          {actionError && (
            <p className="text-xs text-red-400 mb-4 flex items-center gap-1">
              <FaTimesCircle /> {actionError}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={handleAction} disabled={actionLoading}
              className={`flex-1 py-3 rounded-xl text-white font-bold transition hover:scale-[1.02] disabled:opacity-60
                ${actionType === "approve"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_20px_rgba(34,197,94,.4)]"
                  : "bg-gradient-to-r from-pink-500 to-red-500 shadow-[0_0_20px_rgba(255,0,90,.4)]"
                }`}
            >
              {actionLoading ? "Processing..." : actionType === "approve" ? "✓ Approve" : "✗ Reject"}
            </button>
            <button onClick={() => { setModal(false); setActionError(""); setComment(""); }}
              className={`flex-1 py-3 rounded-xl font-semibold border transition
                ${dm ? "border-pink-500/20 text-white/50 hover:bg-pink-500/10" : "border-pink-200 text-gray-500 hover:bg-pink-50"}`}
            >
              Cancel
            </button>
          </div>
        </ModalWrap>
      )}

      {/* ── VIEW MODAL ── */}
      {viewModal && (
        <ModalWrap dm={dm} onClose={() => { setViewModal(false); setViewReport(null); }} title="Report Details" wide>
          {viewLoading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
              <p className={`text-sm ${dm ? "text-white/40" : "text-gray-400"}`}>Loading report...</p>
            </div>
          ) : viewReport ? (
            <>
              {/* User Avatars */}
              <div className="flex items-center justify-center gap-6 mb-6">
                {[
                  { user: viewReport.reportedBy,   label: "Reporter" },
                  { user: viewReport.reportedUser, label: "Reported" },
                ].map(({ user, label }, i) => (
                  <React.Fragment key={i}>
                    {i === 1 && <FaArrowRight className="text-pink-500 text-lg" />}
                    <div className="text-center">
                      <img
                        src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "?")}&background=ff4d6d&color=fff&size=80`}
                        alt={user?.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-pink-500 shadow-[0_0_15px_rgba(255,0,90,.4)]"
                      />
                      <p className="font-bold text-sm">{user?.name || "Unknown"}</p>
                      <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>{user?.mobile || "N/A"}</p>
                      <span className="text-xs text-pink-400 font-semibold">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div className="space-y-3">
                <DetailRow label="Reason"        value={viewReport.reason} pill dm={dm} />
                <DetailRow label="Status"        value={viewReport.status} dm={dm} />
                <DetailRow label="Admin Comment" value={viewReport.adminComment || "—"} dm={dm} />
                <DetailRow label="Date"          value={new Date(viewReport.createdAt).toLocaleString("en-IN")} dm={dm} />
              </div>
            </>
          ) : null}
        </ModalWrap>
      )}
    </div>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: <FaClock className="text-xs" /> },
    approved: { cls: "bg-green-500/15 text-green-400 border-green-500/30",    icon: <FaCheckCircle className="text-xs" /> },
    rejected: { cls: "bg-red-500/15 text-red-400 border-red-500/30",          icon: <FaTimesCircle className="text-xs" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
};

// ─── ACTION BUTTON ────────────────────────────────────────
const ActionBtn = ({ children, onClick, color, dm, title }) => {
  const colors = {
    pink:  dm ? "border-pink-500/20 text-pink-400 hover:bg-pink-500/10"   : "border-pink-200 text-pink-500 hover:bg-pink-50",
    green: dm ? "border-green-500/20 text-green-400 hover:bg-green-500/10" : "border-green-200 text-green-600 hover:bg-green-50",
    red:   dm ? "border-red-500/20 text-red-400 hover:bg-red-500/10"       : "border-red-200 text-red-500 hover:bg-red-50",
  };
  return (
    <button title={title} onClick={onClick}
      className={`p-2 rounded-xl border hover:scale-110 transition ${colors[color]}`}
    >{children}</button>
  );
};

// ─── PAGINATION BUTTON ────────────────────────────────────
const PaginationBtn = ({ children, disabled, onClick, dm }) => (
  <button disabled={disabled} onClick={onClick}
    className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm transition
      ${dm ? "border-pink-500/20 text-white/40 hover:bg-pink-500/10 hover:text-white disabled:opacity-20" : "border-pink-200 text-gray-400 hover:bg-pink-50 disabled:opacity-30"}
      disabled:cursor-not-allowed`}
  >{children}</button>
);

// ─── MODAL WRAPPER ────────────────────────────────────────
const ModalWrap = ({ dm, onClose, title, children, wide }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
    <div className="absolute inset-0" onClick={onClose} />
    <div className={`relative rounded-3xl p-8 border z-10 shadow-2xl w-full
      ${wide ? "max-w-2xl" : "max-w-lg"}
      ${dm ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_60px_rgba(255,0,90,.25)]" : "bg-white border-pink-200"}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent capitalize">
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

// ─── DETAIL ROW ───────────────────────────────────────────
const DetailRow = ({ label, value, pill, dm }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl ${dm ? "bg-pink-500/5" : "bg-pink-50"}`}>
    <span className="text-xs font-bold uppercase tracking-widest text-pink-500 w-32 shrink-0 pt-0.5">{label}</span>
    {pill
      ? <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-red-500 text-white">{value}</span>
      : <span className={`text-sm ${dm ? "text-white/70" : "text-gray-700"}`}>{value}</span>
    }
  </div>
);

export default Reports;