import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/admin/reports";
const HANDLE = "http://31.97.206.144:4050/api/admin/handle";
const SINGLE = "http://31.97.206.144:4050/api/admin/report";

const Reports = ({ darkMode }) => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // ✅ Action Modal
  const [modal, setModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType] = useState("");
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ View Modal
  const [viewModal, setViewModal] = useState(false);
  const [viewReport, setViewReport] = useState(null);

  // FETCH REPORTS
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setReports(res.data.reports);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // FILTER + SEARCH
  useEffect(() => {
    let data = reports.filter((r) => r.status === activeTab);

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.reason?.toLowerCase().includes(s) ||
          r.reportedUser?.name?.toLowerCase().includes(s) ||
          r.reportedBy?.name?.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
    setPage(1);
  }, [reports, activeTab, search]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const data = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // FETCH SINGLE REPORT
  const fetchSingleReport = async (id) => {
    try {
      const res = await axios.get(`${SINGLE}/${id}`);
      setViewReport(res.data.report);
      setViewModal(true);
    } catch (err) {
      console.error("Single fetch error:", err);
    }
  };

  // APPROVE / REJECT
  const handleAction = async () => {
    if (!comment.trim()) {
      alert("Admin comment is required");
      return;
    }

    try {
      setActionLoading(true);

      await axios.put(`${HANDLE}/${selectedReport._id}`, {
        action: actionType,
        adminComment: comment,
      });

      setModal(false);
      setComment("");
      fetchReports();
    } catch (err) {
      console.error("Action error:", err);
      alert("Failed to process action");
    } finally {
      setActionLoading(false);
    }
  };

  // EXPORT CSV
  const exportCSV = () => {
    const header = ["S.No", "Reporter", "Reported User", "Reason", "Status"];

    const rows = filtered.map((r, i) => [
      (page - 1) * rowsPerPage + i + 1,
      r.reportedBy?.name || "Anonymous",
      r.reportedUser?.name || "Unknown",
      r.reason,
      r.status,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "reports.csv";
    link.click();
  };

  const count = (status) =>
    reports.filter((r) => r.status === status).length;

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">🚨 Moderation Reports</h1>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
        >
          <FaDownload /> Export
        </button>
      </div>

      {/* NAV */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-5 py-2 rounded-xl capitalize font-semibold ${
              activeTab === status
                ? "bg-indigo-600 text-white"
                : darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            {status} ({count(status)})
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search reports..."
        className={`w-full mb-6 px-4 py-3 rounded-xl border ${
          darkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-300"
        }`}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div
        className={`overflow-auto rounded-2xl shadow ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <table className="w-full">
          <thead
            className={`${
              darkMode ? "bg-gray-800" : "bg-indigo-600 text-white"
            }`}
          >
            <tr>
              <th className="p-4">S.No</th>
              <th>Reporter</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-8">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8">
                  No Reports Found
                </td>
              </tr>
            ) : (
              data.map((r, i) => (
                <tr
                  key={r._id}
                  className={`border-b ${
                    darkMode
                      ? "border-gray-800 hover:bg-gray-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <td className="p-4 font-semibold">
                    {(page - 1) * rowsPerPage + i + 1}
                  </td>

                  <td>{r.reportedBy?.name || "Anonymous"}</td>
                  <td>{r.reportedUser?.name || "Unknown"}</td>
                  <td className="max-w-xs truncate">{r.reason}</td>

                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : r.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="flex gap-4 items-center py-4">
                    <FaEye
                      onClick={() => fetchSingleReport(r._id)}
                      className="cursor-pointer text-indigo-500 hover:scale-125"
                    />

                    {r.status === "pending" && (
                      <>
                        <FaCheck
                          onClick={() => {
                            setSelectedReport(r);
                            setActionType("approve");
                            setModal(true);
                          }}
                          className="cursor-pointer text-emerald-500 hover:scale-125"
                        />

                        <FaTimes
                          onClick={() => {
                            setSelectedReport(r);
                            setActionType("reject");
                            setModal(true);
                          }}
                          className="cursor-pointer text-red-500 hover:scale-125"
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-40"
        >
          <FaChevronLeft />
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-40"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* ✅ APPROVE / REJECT MODAL */}
      {modal && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur">
          <div
            className={`w-[520px] rounded-3xl p-8 shadow-2xl ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 text-center capitalize">
              {actionType} Report
            </h2>

            <div className="flex items-center justify-between mb-6">
              <div className="text-center">
                <p className="font-semibold">
                  {selectedReport.reportedBy?.name || "Anonymous"}
                </p>
                <p className="text-xs opacity-70">Reporter</p>
              </div>

              <FaArrowRight />

              <div className="text-center">
                <p className="font-semibold">
                  {selectedReport.reportedUser?.name || "Unknown"}
                </p>
                <p className="text-xs opacity-70">Reported User</p>
              </div>
            </div>

            <textarea
              placeholder="Enter admin comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full p-3 rounded-xl border mb-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              }`}
            />

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 py-3 rounded-xl text-white font-semibold ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {actionLoading ? "Processing..." : actionType}
              </button>

              <button
                onClick={() => setModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal && viewReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur z-50">
          <div
            className={`w-[780px] rounded-3xl p-8 shadow-2xl ${
              darkMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">
              Reporter → Reported User
            </h2>

            <div className="flex items-center justify-between mb-8">
              {[viewReport.reportedBy, viewReport.reportedUser].map(
                (user, i) => (
                  <div key={i} className="text-center">
                    <img
                      src={
                        user?.profileImage ||
                        "https://via.placeholder.com/80"
                      }
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-indigo-500"
                    />
                    <p className="font-semibold">
                      {user?.name || "Unknown"}
                    </p>
                    <p className="text-sm opacity-70">
                      {user?.mobile || "N/A"}
                    </p>
                  </div>
                )
              )}
            </div>

            <div
              className={`p-4 rounded-xl mb-4 ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <strong>Reason:</strong> {viewReport.reason}
            </div>

            {viewReport.adminComment && (
              <div
                className={`p-4 rounded-xl ${
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <strong>Admin Comment:</strong>{" "}
                {viewReport.adminComment}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewModal(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl"
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

export default Reports;
