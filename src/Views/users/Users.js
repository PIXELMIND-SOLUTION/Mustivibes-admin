import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  Users as UsersIcon,
  Shield,
  Circle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Eye,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Star,
  Crown,
  Filter,
  TrendingUp,
  User,
  Calendar,
  Globe,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

const API_BASE = "http://31.97.206.144:4050/api/users";
const ALL_USERS_API = `${API_BASE}/users/all`;
const UPDATE_USER_API = (userId) => `${API_BASE}/update/${userId}`;
const DELETE_USER_API = (userId) => `${API_BASE}/delete/${userId}`;

const Users = ({ darkMode }) => {
  const isDark = darkMode;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    nickname: "",
    gender: "male",
    dob: "",
    language: "hindi",
    userType: "regular",
    mobile: "",
    isActive: true,
    wallet: 0,
    warningsCount: 0,
    isTemporarilyBlocked: false,
    isPermanentlyBlocked: false,
    hasCompletedProfile: false
  });
  
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /* ================= TOAST NOTIFICATION ================= */
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ALL_USERS_API);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= UPDATE USER ================= */
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(selectedUser._id);
      
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        formData.append(key, editForm[key]);
      });

      const response = await axios.put(UPDATE_USER_API(selectedUser._id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update local state
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { ...user, ...editForm, isPremium: editForm.userType === 'premium' }
            : user
        ));
        
        showToast("User updated successfully!", "success");
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast(err.response?.data?.message || "Failed to update user", "error");
    } finally {
      setUpdating(null);
    }
  };

  /* ================= DELETE USER ================= */
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleting(selectedUser._id);
      
      const response = await axios.delete(DELETE_USER_API(selectedUser._id));
      
      if (response.data.success) {
        // Remove from local state
        setUsers(users.filter(user => user._id !== selectedUser._id));
        
        showToast("User deleted successfully!", "success");
        setShowDeleteModal(false);
        setSelectedUser(null);
        
        // Reset to first page if needed
        if (paginatedUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setDeleting(null);
    }
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      nickname: user.nickname || "",
      gender: user.gender || "male",
      dob: user.dob ? user.dob.split('T')[0] : "",
      language: user.language || "hindi",
      userType: user.isPremium ? "premium" : "regular",
      mobile: user.mobile || "",
      isActive: user.isActive !== false,
      wallet: user.wallet || 0,
      warningsCount: user.warningsCount || 0,
      isTemporarilyBlocked: user.isTemporarilyBlocked || false,
      isPermanentlyBlocked: user.isPermanentlyBlocked || false,
      hasCompletedProfile: user.hasCompletedProfile || false
    });
    setShowEditModal(true);
  };

  /* ================= OPEN DELETE MODAL ================= */
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  /* ================= FILTER ================= */
  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch = u.name?.toLowerCase().includes(term) || 
                           u.mobile?.includes(term) || 
                           u.nickname?.toLowerCase().includes(term);
      const matchesGender = selectedGender === "all" || u.gender === selectedGender;
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "online" && u.isOnline) ||
        (selectedStatus === "offline" && !u.isOnline);
      
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [users, search, selectedGender, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const onlineUsers = users.filter((u) => u.isOnline);
    const premiumUsers = users.filter((u) => u.isPremium);
    const activeUsers = users.filter((u) => u.isActive !== false);
    const blockedUsers = users.filter((u) => u.isTemporarilyBlocked || u.isPermanentlyBlocked);

    return {
      total: users.length,
      online: onlineUsers.length,
      premium: premiumUsers.length,
      active: activeUsers.length,
      blocked: blockedUsers.length,
      wallet: users.reduce((a, u) => a + (u.wallet || 0), 0),
      matches: users.reduce((a, u) => a + (u.totalMatches || 0), 0),
    };
  }, [users]);

  /* ================= THEME ================= */
  const theme = {
    page: isDark
      ? "bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/30"
      : "bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50",

    card: isDark
      ? "bg-gray-900/60 backdrop-blur-xl border border-pink-500/20 shadow-2xl"
      : "bg-white/80 backdrop-blur-xl border border-pink-200 shadow-xl",

    header: isDark
      ? "bg-gradient-to-r from-pink-900/30 to-purple-900/30 text-pink-200"
      : "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700",

    text: isDark ? "text-white" : "text-gray-800",
    sub: isDark ? "text-pink-300/70" : "text-pink-600/70",

    rowHover: isDark
      ? "hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10"
      : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50",

    input: isDark
      ? "bg-gray-800/50 border-pink-500/30 text-white placeholder-pink-400/50 focus:ring-pink-500/30"
      : "bg-white border-pink-300 text-gray-800 placeholder-pink-400/50 focus:ring-pink-300",

    button: isDark
      ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",

    premiumBadge: "bg-gradient-to-r from-yellow-400 to-orange-500",
  };

  /* ================= ACTIONS ================= */
  const handleViewProfile = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  const handleSendMessage = (userId) => {
    // Implement message functionality
    console.log("Send message to:", userId);
    showToast("Message feature coming soon!", "info");
  };

  const handleTogglePremium = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;
    
    try {
      const newUserType = user.isPremium ? "regular" : "premium";
      
      const formData = new FormData();
      formData.append('userType', newUserType);
      
      const response = await axios.put(UPDATE_USER_API(userId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUsers(users.map(u => 
          u._id === userId 
            ? { ...u, isPremium: !u.isPremium, userType: newUserType }
            : u
        ));
        showToast(`User ${newUserType === 'premium' ? 'upgraded to' : 'downgraded from'} premium`, "success");
      }
    } catch (err) {
      console.error("Toggle premium error:", err);
      showToast("Failed to update premium status", "error");
    }
  };

  return (
    <div className={`min-h-screen ${theme.page} p-4 md:p-8 relative`}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl transform transition-all duration-300 animate-slideIn ${
          toast.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
            : toast.type === 'error'
            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle size={20} />
            ) : toast.type === 'error' ? (
              <XCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur-xl opacity-30" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl">
                <UsersIcon size={28} />
              </div>
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme.text}`}>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  LoveConnect Users
                </span>
              </h1>
              <p className={`${theme.sub} flex items-center gap-2`}>
                <Heart size={14} className="text-pink-500" />
                Manage and monitor all dating app users
              </p>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-3.5 text-pink-500" size={18} />
              <input
                placeholder="Search by name, nickname or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 transition-all duration-300`}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`px-3 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <button
              onClick={fetchUsers}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`}
              style={{
                background: theme.button
              }}
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={<UsersIcon className="text-white" />}
            gradient="from-pink-500 to-rose-500"
            trend={stats.total > 0 ? "+12%" : "0%"}
          />

          <StatCard
            title="Online Now"
            value={stats.online}
            icon={<Circle className="text-white" size={20} fill="currentColor" />}
            gradient="from-emerald-500 to-teal-500"
            trend={stats.online > 0 ? "+5%" : "0%"}
          />

          <StatCard
            title="Active Users"
            value={stats.active}
            icon={<CheckCircle className="text-white" />}
            gradient="from-blue-500 to-cyan-500"
            trend={stats.active > 0 ? "+10%" : "0%"}
          />
        </div>

        

        {/* TABLE */}
        <div className={`rounded-2xl overflow-hidden ${theme.card}`}>
          {loading ? (
            <Skeleton dark={isDark} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={theme.header}>
                    <tr>
                      <th className="p-4 text-left">Profile</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Wallet</th>
                      <th className="p-4 text-center">Matches</th>
                      <th className="p-4 text-center">Warnings</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user._id}
                        className={`border-t border-pink-500/10 transition-all duration-200 ${theme.rowHover}`}
                      >
                        {/* USER PROFILE */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=ec4899&color=fff`}
                                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/30"
                                alt={user.name}
                              />
                              {user.isPremium && (
                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${theme.premiumBadge}`}>
                                  <Crown size={10} className="text-white" />
                                </div>
                              )}
                              {(user.isTemporarilyBlocked || user.isPermanentlyBlocked) && (
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                                  user.isPermanentlyBlocked 
                                    ? 'bg-gradient-to-r from-rose-600 to-red-700' 
                                    : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                }`}>
                                  <Shield size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={`font-semibold ${theme.text}`}>
                                {user.name}
                                {user.isPremium && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${theme.premiumBadge} text-white`}>
                                    PREMIUM
                                  </span>
                                )}
                                {(user.isTemporarilyBlocked || user.isPermanentlyBlocked) && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    user.isPermanentlyBlocked 
                                      ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white' 
                                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                  }`}>
                                    {user.isPermanentlyBlocked ? 'PERM BANNED' : 'TEMP BANNED'}
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className={`text-xs ${theme.sub}`}>
                                  @{user.nickname || "user"}
                                </p>
                                <span className={`text-xs ${user.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}`}>
                                  • {user.gender || 'Not specified'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.mobile}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            {user.isOnline ? (
                              <span className="flex items-center gap-2 text-emerald-500 font-semibold">
                                <Circle size={10} fill="currentColor" />
                                Online
                              </span>
                            ) : (
                              <span className={`flex items-center gap-2 ${theme.sub}`}>
                                <Circle size={10} />
                                Offline
                              </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </td>

                        {/* WALLET */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-emerald-500 flex items-center gap-1">
                              <Wallet size={16} />
                              ₹ {user.wallet || 0}
                            </span>
                            <span className={`text-xs ${theme.sub}`}>
                              {user.totalCoins || 0} coins
                            </span>
                          </div>
                        </td>

                        {/* MATCHES */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-pink-500 flex items-center gap-1">
                              <Heart size={16} />
                              {user.totalMatches || 0}
                            </span>
                            <span className={`text-xs ${theme.sub}`}>
                              matches
                            </span>
                          </div>
                        </td>

                        {/* WARNINGS */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            {user.warningsCount > 0 ? (
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Shield size={14} />
                                {user.warningsCount}
                              </span>
                            ) : (
                              <span className={`${theme.sub}`}>None</span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <ActionBtn 
                              onClick={() => handleViewProfile(user._id)} 
                              color="blue" 
                              dark={isDark}
                              tooltip="View Profile"
                            >
                              <FaEye size={16} />
                            </ActionBtn>

                            <ActionBtn 
                              onClick={() => openEditModal(user)} 
                              color="green" 
                              dark={isDark}
                              tooltip="Edit User"
                            >
                              <Pencil size={16} />
                            </ActionBtn>

                            <ActionBtn 
                              onClick={() => openDeleteModal(user)} 
                              color="rose" 
                              dark={isDark}
                              tooltip="Delete User"
                            >
                              <Trash2 size={16} />
                            </ActionBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className={`p-12 text-center ${theme.sub}`}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 flex items-center justify-center">
                      <UsersIcon size={24} className="text-pink-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-pink-500 mb-2">No users found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              <div className={`flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-pink-500/20 ${theme.header}`}>
                <span className={`mb-2 sm:mb-0 ${theme.sub}`}>
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </span>

                <div className="flex items-center gap-2">
                  <PageBtn
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    dark={isDark}
                  >
                    <ChevronLeft size={16} />
                  </PageBtn>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PageBtn
                        key={page}
                        active={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                        dark={isDark}
                      >
                        {page}
                      </PageBtn>
                    );
                  })}

                  {totalPages > 5 && (
                    <span className={`px-3 ${theme.sub}`}>...</span>
                  )}

                  <PageBtn
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    dark={isDark}
                  >
                    <ChevronRight size={16} />
                  </PageBtn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl ${theme.card} max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme.text}`}>
                  <Pencil className="inline mr-2" size={20} />
                  Edit User
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <XCircle size={20} className={theme.sub} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                    <User size={14} className="inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    placeholder="Enter nickname"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                      Gender
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                      <Calendar size={14} className="inline mr-1" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                    <Globe size={14} className="inline mr-1" />
                    Language
                  </label>
                  <select
                    value={editForm.language}
                    onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                  >
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                    <Phone size={14} className="inline mr-1" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                      User Type
                    </label>
                    <select
                      value={editForm.userType}
                      onChange={(e) => setEditForm({...editForm, userType: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                    >
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                      Wallet Balance
                    </label>
                    <input
                      type="number"
                      value={editForm.wallet}
                      onChange={(e) => setEditForm({...editForm, wallet: parseFloat(e.target.value) || 0})}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                      placeholder="Enter wallet amount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme.sub}`}>
                      Warnings
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.warningsCount}
                      onChange={(e) => setEditForm({...editForm, warningsCount: parseInt(e.target.value) || 0})}
                      className={`w-full px-4 py-2.5 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                      placeholder="Number of warnings"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                        className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500/30"
                      />
                      <span className={theme.sub}>Active User</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isTemporarilyBlocked}
                      onChange={(e) => setEditForm({...editForm, isTemporarilyBlocked: e.target.checked})}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500/30"
                    />
                    <span className={theme.sub}>Temporarily Blocked</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isPermanentlyBlocked}
                      onChange={(e) => setEditForm({...editForm, isPermanentlyBlocked: e.target.checked})}
                      className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500/30"
                    />
                    <span className={theme.sub}>Permanently Blocked</span>
                  </label>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.hasCompletedProfile}
                    onChange={(e) => setEditForm({...editForm, hasCompletedProfile: e.target.checked})}
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500/30"
                  />
                  <span className={theme.sub}>Profile Completed</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'border-pink-500/30 text-pink-300 hover:bg-pink-500/10' 
                        : 'border-pink-300 text-pink-600 hover:bg-pink-50'
                    } transition-all duration-300`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    disabled={updating === selectedUser._id}
                    className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-xl ${
                      updating === selectedUser._id 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:scale-105'
                    }`}
                    style={{
                      background: theme.button
                    }}
                  >
                    {updating === selectedUser._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCcw size={16} className="animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update User"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl ${theme.card} max-w-md w-full`}>
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500/20 to-red-500/20 flex items-center justify-center">
                  <Trash2 size={28} className="text-rose-500" />
                </div>
              </div>
              
              <h2 className={`text-xl font-bold text-center mb-2 ${theme.text}`}>
                Delete User
              </h2>
              <p className={`text-center mb-6 ${theme.sub}`}>
                Are you sure you want to delete <span className="font-semibold text-rose-500">{selectedUser.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${
                  isDark ? 'bg-gray-800/50' : 'bg-rose-50/50'
                }`}>
                  <p className={`text-sm ${theme.sub} mb-2`}>User details:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.profileImage || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=ec4899&color=fff`}
                      className="w-10 h-10 rounded-full object-cover border border-rose-500/30"
                      alt={selectedUser.name}
                    />
                    <div>
                      <p className={`font-semibold ${theme.text}`}>{selectedUser.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.mobile}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                    } transition-all duration-300`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleting === selectedUser._id}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      deleting === selectedUser._id
                        ? 'bg-gradient-to-r from-rose-400 to-red-400 opacity-70 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 hover:shadow-xl hover:scale-105'
                    } text-white`}
                  >
                    {deleting === selectedUser._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCcw size={16} className="animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      "Delete User"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ title, value, icon, gradient, trend }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 shadow-lg group hover:scale-105 transition-all duration-300">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    <div className="relative">
      <div className="flex justify-between items-start mb-2">
        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {icon}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${parseFloat(trend) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
          {trend}
        </span>
      </div>
      <p className="text-white/80 text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-white mt-1">{value}</h2>
    </div>
  </div>
);

const ActionBtn = ({ children, color, dark, onClick, tooltip }) => {
  const styles = {
    blue: dark
      ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30"
      : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 hover:from-blue-200 hover:to-cyan-200 border border-blue-200",

    green: dark
      ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30"
      : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600 hover:from-emerald-200 hover:to-teal-200 border border-emerald-200",

    amber: dark
      ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30"
      : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600 hover:from-amber-200 hover:to-orange-200 border border-amber-200",

    rose: dark
      ? "bg-gradient-to-r from-rose-600/20 to-pink-600/20 text-rose-400 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/30"
      : "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 hover:from-rose-200 hover:to-pink-200 border border-rose-200",
  };

  return (
    <div className="relative group/btn">
      <button
        onClick={onClick}
        className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${styles[color]}`}
      >
        {children}
      </button>
      {tooltip && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {tooltip}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

const PageBtn = ({ children, disabled, onClick, active, dark }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`
      w-10 h-10 rounded-lg border transition-all duration-300
      ${active 
        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg scale-105"
        : dark
          ? "border-pink-500/30 text-pink-300 hover:bg-pink-500/20 hover:scale-105"
          : "border-pink-300 text-pink-600 hover:bg-pink-100 hover:scale-105"
      }
      ${disabled
        ? "opacity-40 cursor-not-allowed hover:scale-100"
        : "hover:shadow-md"
      }
    `}
  >
    {children}
  </button>
);

const Skeleton = ({ dark }) => (
  <div className="p-8 space-y-4 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className={`h-16 rounded-xl ${dark ? "bg-gray-800" : "bg-gray-200"}`}
      />
    ))}
  </div>
);

export default Users;