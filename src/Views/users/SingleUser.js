import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wallet,
  Users,
  ArrowLeft,
  Search,
  X,
  Shield,
  Circle,
  Gift,
  Clock,
  Phone,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Star,
  Crown,
  MapPin,
  Mail,
  Shield as ShieldIcon,
  TrendingUp,
  Award,
  Edit,
  Camera,
  Eye
} from "lucide-react";

const API = "http://31.97.206.144:4050/api/users/users";

const SingleUser = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isDark = darkMode;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("followers");
  const [listUsers, setListUsers] = useState([]);
  const [search, setSearch] = useState("");

  /* ================= THEME ================= */
  const theme = {
    page: isDark
      ? "bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/30"
      : "bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50",

    card: isDark
      ? "bg-gray-900/60 backdrop-blur-xl border border-pink-500/20 shadow-2xl"
      : "bg-white/80 backdrop-blur-xl border border-pink-200 shadow-xl",

    hover: isDark 
      ? "hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10" 
      : "hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50",

    sub: isDark ? "text-pink-300/70" : "text-pink-600/70",
    text: isDark ? "text-white" : "text-gray-800",

    input: isDark
      ? "bg-gray-800/50 border-pink-500/30 text-white placeholder-pink-400/50 focus:ring-pink-500/30"
      : "bg-white border-pink-300 text-gray-800 placeholder-pink-400/50 focus:ring-pink-300",

    modalBg: isDark ? "bg-black/70 backdrop-blur-sm" : "bg-black/40 backdrop-blur-sm",

    tabActive: isDark
      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
      : "bg-gradient-to-r from-pink-500 to-rose-500 text-white",

    tabInactive: isDark
      ? "text-pink-300 hover:bg-pink-500/10"
      : "text-pink-600 hover:bg-pink-100",
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}/${id}`);
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        } else {
          setError("User data not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  /* ================= FETCH FOLLOWERS/FOLLOWING ================= */
  const openUserList = async (type) => {
    if (!user || !user[type] || !Array.isArray(user[type])) {
      setListUsers([]);
      return;
    }
    
    setModalType(type);
    setModalOpen(true);
    setListUsers([]); // Clear previous list
    
    try {
      const userList = user[type];
      if (userList.length === 0) {
        return;
      }
      
      const responses = await Promise.all(
        userList.map((uid) => 
          axios.get(`${API}/${uid}`).catch(err => {
            console.error(`Failed to fetch user ${uid}:`, err);
            return { data: { user: null } };
          })
        )
      );

      const validUsers = responses
        .map((r) => r.data?.user)
        .filter(user => user !== null);
      
      setListUsers(validUsers);
    } catch (err) {
      console.error("Failed fetching users:", err);
      setListUsers([]);
    }
  };

  /* ================= FILTER ================= */
  const filteredList = useMemo(() => {
    if (!Array.isArray(listUsers)) return [];
    
    return listUsers.filter((u) =>
      u?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u?.mobile?.toLowerCase().includes(search.toLowerCase()) ||
      u?.nickname?.toLowerCase().includes(search.toLowerCase())
    );
  }, [listUsers, search]);

  /* ================= HELPERS ================= */
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      
      return dateObj.toLocaleDateString("en-IN", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "N/A";
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return "N/A";
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return "N/A";
    }
  };

  /* ================= STATS ================= */
  const userStats = useMemo(() => {
    if (!user) return {};
    
    return {
      matches: user.totalMatches || 0,
      likes: user.totalLikes || 0,
      messages: user.totalMessages || 0,
      visits: user.profileVisits || 0,
      giftsSent: user.giftsSent || 0,
      giftsReceived: user.giftsReceived || 0,
      followersCount: Array.isArray(user.followers) ? user.followers.length : 0,
      followingCount: Array.isArray(user.following) ? user.following.length : 0,
      successRate: user.totalMatches && user.totalLikes 
        ? ((user.totalMatches / Math.max(user.totalLikes, 1)) * 100).toFixed(1)
        : 0
    };
  }, [user]);

  /* ================= LOADER ================= */
  if (loading) return (
    <div className={`${theme.page} min-h-screen flex items-center justify-center`}>
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin" />
      </div>
    </div>
  );

  if (error) return (
    <div className={`${theme.page} min-h-screen flex flex-col items-center justify-center p-8`}>
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 flex items-center justify-center mb-6">
        <Shield size={40} className="text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-rose-500 mb-2">Error Loading User</h2>
      <p className={`${theme.sub} mb-4 text-center max-w-md`}>{error}</p>
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl ${theme.tabActive}`}
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );

  if (!user) return (
    <div className={`${theme.page} min-h-screen flex flex-col items-center justify-center p-8`}>
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-6">
        <User size={40} className="text-pink-500" />
      </div>
      <h2 className="text-2xl font-bold text-pink-500 mb-2">User Not Found</h2>
      <p className={`${theme.sub} mb-6`}>The user you're looking for doesn't exist</p>
      <button
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl ${theme.tabActive}`}
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );

  return (
    <div className={`${theme.page} min-h-screen p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* BACK BUTTON & ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 hover:scale-105 group`}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Users
          </button>

          <div className="flex flex-wrap gap-2">
            <button className={`px-4 py-3 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 hover:scale-105 flex items-center gap-2`}>
              <Edit size={18} />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <button className={`px-4 py-3 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 hover:scale-105 flex items-center gap-2`}>
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Send Message</span>
            </button>
            {user.isPermanentlyBlocked ? (
              <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-300 hover:scale-105">
                Unblock User
              </button>
            ) : (
              <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white transition-all duration-300 hover:scale-105">
                Block User
              </button>
            )}
          </div>
        </div>

        {/* HERO SECTION */}
        <div className={`relative overflow-hidden rounded-2xl ${theme.card}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, ${isDark ? '#ec4899' : '#f472b6'} 2%, transparent 0%), radial-gradient(circle at 75px 75px, ${isDark ? '#ec4899' : '#f472b6'} 2%, transparent 0%)`,
              backgroundSize: '100px 100px'
            }} />
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-32 h-32">
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=ec4899&color=fff&bold=true&size=256`}
                    className="w-full h-full rounded-2xl object-cover border-4 border-white/20 shadow-2xl"
                    alt={user.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=ec4899&color=fff&bold=true&size=256`;
                    }}
                  />
                  {user.isOnline && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Circle size={8} fill="white" />
                    </div>
                  )}
                  {user.isPremium && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown size={16} className="text-white" />
                    </div>
                  )}
                  {user.isPermanentlyBlocked && (
                    <div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <Shield size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                      {user.name || "Unnamed User"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-lg ${theme.sub}`}>
                        @{user.nickname || "user"}
                      </span>
                      {user.gender && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.gender === 'male' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : user.gender === 'female'
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                        </span>
                      )}
                      {user.isPremium && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-amber-400 text-sm font-medium">
                          PREMIUM
                        </span>
                      )}
                      {user.isPermanentlyBlocked && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 text-sm font-medium">
                          BLOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className={`px-4 py-2 rounded-lg ${user.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {user.isOnline ? 'Online Now' : `Last seen: ${formatDate(user.lastSeen)}`}
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-pink-500/20 text-pink-400">
                      ID: {user._id?.substring(0, 8)}...
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Followers"
                    value={userStats.followersCount}
                    onClick={() => openUserList("followers")}
                    icon={<Users size={20} />}
                    color="blue"
                    clickable={userStats.followersCount > 0}
                  />

                  <StatCard
                    title="Following"
                    value={userStats.followingCount}
                    onClick={() => openUserList("following")}
                    icon={<User size={20} />}
                    color="purple"
                    clickable={userStats.followingCount > 0}
                  />

                  <StatCard
                    title="Wallet"
                    value={`₹ ${user.wallet || 0}`}
                    icon={<Wallet size={20} />}
                    color="emerald"
                  />

                  <StatCard
                    title="Coins"
                    value={user.totalCoins || 0}
                    icon={<Award size={20} />}
                    color="amber"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto border-b border-pink-500/20">
          {["overview", "activity", "matches", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-6 py-3 font-medium transition-all duration-300 capitalize whitespace-nowrap ${
                activeTab === tab
                  ? theme.tabActive
                  : theme.tabInactive
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className={`rounded-2xl ${theme.card} p-6`}>
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <InfoCard title="Personal Information" icon={<User className="text-pink-500" />}>
                <InfoRow icon={<Phone size={16} />} label="Mobile" value={user.mobile || "N/A"} />
                <InfoRow icon={<Mail size={16} />} label="Email" value={user.email || "Not provided"} />
                <InfoRow icon={<Calendar size={16} />} label="Date of Birth" value={formatDate(user.dob)} />
                <InfoRow icon={<User size={16} />} label="Age" value={calculateAge(user.dob)} />
                <InfoRow icon={<MapPin size={16} />} label="Location" value={user.location?.address || "Not specified"} />
              </InfoCard>

              {/* Account Status */}
              <InfoCard title="Account Status" icon={<ShieldIcon className="text-blue-500" />}>
                <InfoRow icon={<Circle size={16} />} label="Online Status" value={user.isOnline ? "Currently Online" : "Offline"} />
                <InfoRow icon={<Clock size={16} />} label="Last Seen" value={formatDate(user.lastSeen)} />
                <InfoRow icon={<Shield size={16} />} label="Warnings" value={user.warningsCount || 0} />
                <InfoRow icon={<Calendar size={16} />} label="Joined Date" value={formatDate(user.createdAt)} />
                <InfoRow icon={<Gift size={16} />} label="Referral Code" value={user.myReferralCode || "N/A"} />
              </InfoCard>

              {/* Engagement Stats */}
              <InfoCard title="Engagement Stats" icon={<TrendingUp className="text-emerald-500" />}>
                <InfoRow icon={<Heart size={16} />} label="Total Matches" value={userStats.matches} />
                <InfoRow icon={<Star size={16} />} label="Total Likes" value={userStats.likes} />
                <InfoRow icon={<MessageCircle size={16} />} label="Messages Sent" value={userStats.messages} />
                <InfoRow icon={<Eye size={16} />} label="Profile Visits" value={userStats.visits} />
                <InfoRow icon={<Award size={16} />} label="Success Rate" value={`${userStats.successRate}%`} />
              </InfoCard>

              {/* Premium Features */}
              <InfoCard title="Premium Features" icon={<Crown className="text-amber-500" />}>
                <InfoRow icon={<Crown size={16} />} label="Premium Status" value={user.isPremium ? "Active" : "Inactive"} />
                <InfoRow icon={<Wallet size={16} />} label="Wallet Balance" value={`₹ ${user.wallet || 0}`} />
                <InfoRow icon={<Award size={16} />} label="Total Coins" value={user.totalCoins || 0} />
                <InfoRow icon={<Gift size={16} />} label="Gifts Sent" value={userStats.giftsSent} />
                <InfoRow icon={<Gift size={16} />} label="Gifts Received" value={userStats.giftsReceived} />
              </InfoCard>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-pink-500">Recent Activity</h3>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300">
                  View Full Log
                </button>
              </div>
              
              <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                      <Calendar className="text-pink-500" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Last Login</p>
                      <p className={`text-sm ${theme.sub}`}>
                        {user.hasLoggedIn ? formatDate(user.lastActive) : "Never logged in"}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${user.hasLoggedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user.hasLoggedIn ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-3">
                  <ActivityItem
                    icon={<Heart className="text-pink-500" />}
                    title="Profile Completion"
                    description={user.hasCompletedProfile ? "Profile is complete" : "Profile is incomplete"}
                    status={user.hasCompletedProfile ? "complete" : "incomplete"}
                    date={formatDate(user.updatedAt)}
                  />
                  
                  <ActivityItem
                    icon={<Shield className="text-blue-500" />}
                    title="Account Security"
                    description={user.isTemporarilyBlocked ? "Temporarily blocked" : user.isPermanentlyBlocked ? "Permanently blocked" : "Account is secure"}
                    status={user.isTemporarilyBlocked || user.isPermanentlyBlocked ? "warning" : "secure"}
                    date={user.isTemporarilyBlocked ? formatDate(user.temporaryBlockExpiresAt) : "N/A"}
                  />
                  
                  <ActivityItem
                    icon={<Gift className="text-purple-500" />}
                    title="Referral Status"
                    description={user.hasUsedReferral ? "Used referral code" : "No referral used"}
                    status={user.hasUsedReferral ? "used" : "not-used"}
                    date="N/A"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-pink-500">Matches & Connections</h3>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300">
                  View All Matches
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MatchStatCard
                  title="Total Matches"
                  value={userStats.matches}
                  icon={<Heart className="text-pink-500" />}
                  trend="+12%"
                  color="pink"
                />
                <MatchStatCard
                  title="Active Chats"
                  value={userStats.messages || 0}
                  icon={<MessageCircle className="text-blue-500" />}
                  trend="+5%"
                  color="blue"
                />
                <MatchStatCard
                  title="Success Rate"
                  value={`${userStats.successRate}%`}
                  icon={<TrendingUp className="text-emerald-500" />}
                  trend="+2%"
                  color="emerald"
                />
              </div>

              <div className={`rounded-xl p-6 text-center ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500/30" />
                <h4 className="text-lg font-semibold text-pink-500 mb-2">Match History</h4>
                <p className={theme.sub}>
                  {userStats.matches > 0 
                    ? `User has ${userStats.matches} matches in total`
                    : "No matches found for this user"}
                </p>
                <button className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg transition-all duration-300 hover:scale-105">
                  View Match Analytics
                </button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-pink-500 mb-4">Account Management</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button className={`p-4 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 text-left flex items-start gap-3`}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                    <Shield className="text-blue-500" />
                  </div>
                  <div>
                    <span className="font-medium">Manage Warnings</span>
                    <p className="text-sm mt-1 opacity-70">View or add user warnings</p>
                  </div>
                </button>

                <button className={`p-4 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 text-left flex items-start gap-3`}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                    <Crown className="text-amber-500" />
                  </div>
                  <div>
                    <span className="font-medium">Premium Settings</span>
                    <p className="text-sm mt-1 opacity-70">Manage premium status</p>
                  </div>
                </button>

                <button className={`p-4 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 text-left flex items-start gap-3`}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                    <Wallet className="text-emerald-500" />
                  </div>
                  <div>
                    <span className="font-medium">Wallet Management</span>
                    <p className="text-sm mt-1 opacity-70">Add or deduct funds</p>
                  </div>
                </button>

                <button className={`p-4 rounded-xl ${theme.card} ${theme.hover} transition-all duration-300 text-left flex items-start gap-3`}>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-violet-500/20">
                    <Award className="text-purple-500" />
                  </div>
                  <div>
                    <span className="font-medium">Coin Management</span>
                    <p className="text-sm mt-1 opacity-70">Manage user coins</p>
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-pink-500/20 space-y-4">
                <h4 className="font-semibold text-lg">Account Actions</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {user.isPermanentlyBlocked ? (
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                      <Shield className="rotate-180" />
                      Unblock Account
                    </button>
                  ) : (
                    <>
                      <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                        <Clock />
                        Temporary Block
                      </button>
                      <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                        <Shield />
                        Permanent Block
                      </button>
                    </>
                  )}
                </div>
                
                <p className={`text-sm ${theme.sub}`}>
                  {user.isPermanentlyBlocked 
                    ? "This account is permanently blocked. Unblock to restore access."
                    : user.isTemporarilyBlocked
                    ? `Account is temporarily blocked until ${formatDate(user.temporaryBlockExpiresAt)}`
                    : "Account is currently active"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FOR FOLLOWERS/FOLLOWING */}
      {modalOpen && (
        <div className={`fixed inset-0 ${theme.modalBg} flex items-center justify-center z-50 p-4`}>
          <div className={`w-full max-w-lg max-h-[80vh] rounded-2xl flex flex-col ${theme.card} shadow-2xl`}>
            <div className="flex justify-between items-center p-6 border-b border-pink-500/20">
              <div>
                <h2 className="text-xl font-bold capitalize">{modalType}</h2>
                <p className={`text-sm ${theme.sub}`}>
                  {filteredList.length} of {listUsers.length} {modalType} shown
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-pink-500/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3.5 text-pink-500" />
                <input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.input} focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
                />
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filteredList.length > 0 ? (
                filteredList.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => {
                      navigate(`/admin/user/${u._id}`);
                      setModalOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${theme.hover} hover:scale-[1.02]`}
                  >
                    <img
                      src={u.profileImage || `https://ui-avatars.com/api/?name=${u.name}&background=ec4899&color=fff`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/30"
                      alt={u.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${u.name}&background=ec4899&color=fff`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{u.name || "Unknown User"}</p>
                        {u.isPremium && (
                          <Crown size={12} className="text-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm ${theme.sub} truncate`}>
                        @{u.nickname || "user"} • {u.gender || "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {u.isOnline && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mb-1" />
                      )}
                      <span className={`text-xs ${theme.sub}`}>
                        {u.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 ${theme.sub}`}>
                  <Users size={32} className="mx-auto mb-4 opacity-30" />
                  <p>No {modalType} found</p>
                  {search && (
                    <p className="text-sm mt-2">Try a different search term</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= SUBCOMPONENTS ================= */

const StatCard = ({ title, value, onClick, icon, color, clickable = true }) => {
  const colors = {
    blue: "from-blue-500/20 to-cyan-500/20 text-blue-400",
    purple: "from-purple-500/20 to-violet-500/20 text-purple-400",
    emerald: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
    amber: "from-amber-500/20 to-orange-500/20 text-amber-400",
  };

  return (
    <div
      onClick={onClick && clickable ? onClick : undefined}
      className={`p-4 rounded-xl bg-gradient-to-r ${colors[color]} ${
        onClick && clickable ? "cursor-pointer hover:scale-105 transition-all duration-300" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/10">
          {icon}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ title, children, icon }) => (
  <div className="rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent border border-pink-500/10">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-pink-500/10 last:border-none">
    <span className="flex items-center gap-2 opacity-80">
      {icon}
      {label}
    </span>
    <span className="font-semibold max-w-[50%] truncate">
      {value}
    </span>
  </div>
);

const ActivityItem = ({ icon, title, description, status, date }) => {
  const statusColors = {
    complete: "text-emerald-500 bg-emerald-500/10",
    incomplete: "text-amber-500 bg-amber-500/10",
    warning: "text-rose-500 bg-rose-500/10",
    secure: "text-blue-500 bg-blue-500/10",
    used: "text-purple-500 bg-purple-500/10",
    "not-used": "text-gray-500 bg-gray-500/10"
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-70">{description}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status.replace('-', ' ')}
        </span>
        <span className="text-xs opacity-60">{date}</span>
      </div>
    </div>
  );
};

const MatchStatCard = ({ title, value, icon, trend, color }) => {
  const colors = {
    pink: "from-pink-500/20 to-rose-500/20",
    blue: "from-blue-500/20 to-cyan-500/20",
    emerald: "from-emerald-500/20 to-teal-500/20",
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-r ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="p-2 rounded-lg bg-white/10">
            {icon}
          </div>
          <span className="text-xs mt-2 px-2 py-1 rounded-full bg-white/10">
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SingleUser;