import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  Users as UsersIcon,
  Shield,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "http://31.97.206.144:4055/api/users/users/all";

const Users = ({ darkMode }) => {
  const isDark = darkMode;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const colors = {
    bg: isDark ? "bg-slate-950" : "bg-slate-100",
    card: isDark ? "bg-slate-900" : "bg-white",
    border: isDark ? "border-slate-800" : "border-slate-200",
    text: isDark ? "text-slate-100" : "text-slate-800",
    subText: isDark ? "text-slate-400" : "text-slate-500",
    input: isDark
      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
      : "bg-white border-slate-300 text-slate-800",
    rowHover: isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-50",
    thead: isDark
      ? "bg-slate-900 text-slate-400"
      : "bg-slate-50 text-slate-600",
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setUsers(res.data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ SEARCH FILTER
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search)
    );
  }, [users, search]);

  // reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const badge = (condition, ok, no) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        condition
          ? isDark
            ? "bg-green-900/40 text-green-400"
            : "bg-green-100 text-green-700"
          : isDark
          ? "bg-slate-700 text-slate-300"
          : "bg-slate-200 text-slate-600"
      }`}
    >
      {condition ? ok : no}
    </span>
  );

  return (
    <div className={`min-h-screen ${colors.bg} p-6`}>
      {/* HEADER */}
      <div className="flex flex-wrap justify-between gap-4 mb-7">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg">
            <UsersIcon size={22} />
          </div>

          <div>
            <h1 className={`text-2xl font-bold ${colors.text}`}>
              Users Management
            </h1>
            <p className={`text-sm ${colors.subText}`}>
              Monitor platform users and activity
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute top-2.5 left-3 text-slate-400"
            />

            <input
              placeholder="Search name or mobile..."
              className={`pl-10 pr-4 py-2 rounded-lg border outline-none transition focus:ring-2 focus:ring-blue-500 ${colors.input}`}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-2xl border shadow-sm ${colors.card} ${colors.border}`}
      >
        {loading ? (
          <div className={`p-10 text-center ${colors.subText}`}>
            Loading users...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={colors.thead}>
                  <tr>
                    <th className="p-4 text-left font-semibold">User</th>
                    <th className="text-left">Mobile</th>
                    <th>Wallet</th>
                    <th>Coins</th>
                    <th>Followers</th>
                    <th>Following</th>
                    <th>Status</th>
                    <th>Profile</th>
                    <th>Warnings</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-t ${colors.border} ${colors.rowHover} transition`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={
                            user.profileImage ||
                            `https://ui-avatars.com/api/?name=${user.name}`
                          }
                          alt=""
                          className={`w-11 h-11 rounded-full object-cover border ${
                            isDark
                              ? "border-slate-700"
                              : "border-slate-300"
                          }`}
                        />

                        <div>
                          <p className={`font-semibold ${colors.text}`}>
                            {user.name || "Unknown"}
                          </p>

                          <p className={`text-xs ${colors.subText}`}>
                            @{user.nickname || "no-nick"}
                          </p>
                        </div>
                      </td>

                      <td className={colors.text}>{user.mobile}</td>
                      <td className={colors.text}>₹ {user.wallet}</td>
                      <td className={colors.text}>{user.totalCoins}</td>
                      <td className={colors.text}>
                        {user.followers?.length || 0}
                      </td>
                      <td className={colors.text}>
                        {user.following?.length || 0}
                      </td>

                      <td>
                        {user.isOnline ? (
                          <span className="flex items-center gap-1 text-green-500 font-semibold">
                            <Circle size={10} fill="currentColor" />
                            Online
                          </span>
                        ) : (
                          <span className={colors.subText}>
                            Offline
                          </span>
                        )}
                      </td>

                      <td>
                        {badge(
                          user.hasCompletedProfile,
                          "Completed",
                          "Incomplete"
                        )}
                      </td>

                      <td>
                        {user.warningsCount > 0 ? (
                          <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                            <Shield size={14} />
                            {user.warningsCount}
                          </span>
                        ) : (
                          <span className={colors.subText}>None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className={`text-center p-10 ${colors.subText}`}>
                  No users found
                </div>
              )}
            </div>

            {/* ✅ PAGINATION FOOTER */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t ${colors.border}`}
            >
              {/* Rows selector */}
              <div className="flex items-center gap-2">
                <span className={colors.subText}>Rows:</span>

                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`border rounded-lg px-2 py-1 ${colors.input}`}
                >
                  {[5, 8, 10, 15, 20].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Page info */}
              <div className={colors.subText}>
                Page {currentPage} of {totalPages || 1}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  className={`p-2 rounded-lg border ${
                    currentPage === 1
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700"
                  } ${colors.border}`}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, totalPages)
                    )
                  }
                  className={`p-2 rounded-lg border ${
                    currentPage === totalPages
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700"
                  } ${colors.border}`}
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

export default Users;
