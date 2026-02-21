import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaCompress,
  FaExpand,
  FaHeart,
  FaFire,
  FaUsers,
  FaChartLine,
  FaBox,
  FaDollarSign
} from 'react-icons/fa';
import { FiChevronDown, FiMenu, FiHeart, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { MdFavorite, MdEmojiPeople, MdDashboard } from 'react-icons/md';

const Navbar = ({ toggleSidebar, toggleDarkMode, darkMode, collapsed, sidebarOpen }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');

  const adminData = JSON.parse(sessionStorage.getItem("AdminData"));

  const NOTIFICATION_API = "http://31.97.206.144:4055/api/notifications";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);


  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour < 12) setTimeOfDay('Morning');
      else if (hour < 18) setTimeOfDay('Afternoon');
      else setTimeOfDay('Evening');
    };

    checkMobile();
    updateTimeOfDay();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const res = await fetch(NOTIFICATION_API);
      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markNotificationRead = async (id) => {
    try {
      await fetch(`http://31.97.206.144:4055/api/notifications/${id}/read`, {
        method: "PUT",
      });

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));

    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };


  // Profile menu items
  const profileMenu = [
    { icon: <FaBox className="text-pink-500" />, text: 'Dashboard', path: '/admin/' },
    { icon: <FiSettings className="text-blue-500" />, text: 'Account Settings', path: '/admin/settings' },
    { icon: <FaDollarSign className="text-red-500" />, text: 'Payments', path: '/admin/all-payments' },
    // { icon: <FaUsers className="text-green-500" />, text: 'Manage Team', path: '/team' },
  ];

  return (
    <header className={`
      ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'}
      backdrop-blur-xl
      border-b border-pink-500/20
      px-4 py-3
      flex items-center justify-between
      transition-all duration-300
      sticky top-0 z-50
      shadow-lg
      ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}
    `}>

      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Menu Toggle Button with gradient */}
        <button
          onClick={toggleSidebar}
          className={`
            p-2.5 rounded-xl 
            bg-gradient-to-r from-pink-500/10 to-red-500/10
            hover:from-pink-500/20 hover:to-red-500/20
            border border-pink-500/20
            transition-all duration-300
            hover:scale-105
            shadow-sm
            ${isMobile ? "" : "d-none"}
          `}
          aria-label="Toggle menu"
        >
          <FiMenu className="text-xl text-pink-500" />
        </button>

        {/* Logo/Brand for mobile */}
        <div className="md:hidden flex items-center">

          <span className="font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Mustivibes
          </span>
        </div>

        {/* Breadcrumb/Page Title with gradient */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-3">

            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                Mustivibes
              </h1>
              <p className={`text-sm ${darkMode ? 'text-pink-400/70' : 'text-pink-600/70'} font-medium`}>
                Good {timeOfDay}, Admin! <span className="ml-2 animate-pulse">❤️</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-3">

        {/* Search Bar - Desktop */}
        {/* <div className="hidden md:block relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <input
              type="text"
              placeholder="Search matches, users, reports..."
              className={`
                pl-10 pr-4 py-2.5
                w-64
                rounded-xl
                ${darkMode ? 'bg-gray-800/50 text-white' : 'bg-gray-50 text-gray-800'}
                border border-pink-500/30
                focus:border-pink-500/60
                focus:outline-none
                focus:ring-2 focus:ring-pink-500/20
                transition-all duration-300
                placeholder:${darkMode ? 'text-gray-400' : 'text-gray-500'}
              `}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" />
          </div>
        </div> */}

        {/* Dark Mode Toggle with gradient */}
        <button
          onClick={toggleDarkMode}
          className={`
            p-2.5 rounded-xl 
            bg-gradient-to-r from-pink-500/10 to-red-500/10
            hover:from-pink-500/20 hover:to-red-500/20
            border border-pink-500/20
            transition-all duration-300
            hover:scale-105
            relative overflow-hidden
          `}
          title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <FaSun className="text-xl text-yellow-400" />
          ) : (
            <FaMoon className="text-xl text-purple-500" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className={`
            p-2.5 rounded-xl 
            bg-gradient-to-r from-pink-500/10 to-red-500/10
            hover:from-pink-500/20 hover:to-red-500/20
            border border-pink-500/20
            transition-all duration-300
            hover:scale-105
            relative group
          `}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <FaCompress className="text-lg text-pink-500" />
          ) : (
            <FaExpand className="text-lg text-pink-500" />
          )}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {isFullscreen ? 'E' : 'F'}
          </div>
        </button>



        {/* Notifications with premium dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`
              p-2.5 rounded-xl 
              bg-gradient-to-r from-pink-500/10 to-red-500/10
              hover:from-pink-500/20 hover:to-red-500/20
              border border-pink-500/20
              transition-all duration-300
              hover:scale-105
              relative group
            `}
          >
            <FaBell className="text-lg text-pink-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-xl border-2 border-pink-500/0 group-hover:border-pink-500/30 transition-all duration-300" />
          </button>

          {/* Premium Notification Dropdown */}
          {notificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationOpen(false)}
              />
              <div className={`
                absolute right-0 mt-2 w-96
                ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}
                backdrop-blur-xl
                rounded-2xl shadow-2xl
                border border-pink-500/20
                z-50
                overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-pink-500/10 before:to-red-500/10 before:-z-10
              `}>
                {/* Header */}
                <div className={`
                  p-4 border-b border-pink-500/20
                  bg-gradient-to-r from-pink-500/5 to-red-500/5
                `}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500/20 to-red-500/20 flex items-center justify-center">
                        <FaBell className="text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Notifications</h3>
                        <p className="text-sm text-pink-500/70">LoveConnect Updates</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-6 text-center text-sm opacity-70">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm opacity-70">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification._id}
                        onClick={() => !notification.isRead && markNotificationRead(notification._id)}
                        className={`
          p-4 border-b border-pink-500/10 cursor-pointer transition-all
          hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-red-500/5
          ${notification.isRead ? "opacity-70" : (darkMode ? "bg-gray-800/40" : "bg-pink-50")}
        `}
                      >
                        <div className="flex items-start space-x-3">

                          {/* User Avatar */}
                          <img
                            src={
                              notification.relatedUser?.profileImage ||
                              "https://ui-avatars.com/api/?name=User&background=ec4899&color=fff"
                            }
                            className="w-10 h-10 rounded-full object-cover"
                            alt=""
                          />

                          <div className="flex-1">
                            <p className="font-semibold text-sm">{notification.title}</p>
                            <p className="text-xs opacity-70 mt-1">{notification.body}</p>

                            <p className="text-xs opacity-50 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 text-center border-t border-pink-500/20">
                  <a
                    href="/admin/notifications"
                    className={`
                      inline-flex items-center justify-center
                      px-4 py-2 rounded-lg
                      bg-gradient-to-r from-pink-500/10 to-red-500/10
                      hover:from-pink-500/20 hover:to-red-500/20
                      text-sm font-medium
                      ${darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}
                      transition-all duration-300
                    `}
                  >
                    <span className="flex items-center">
                      View all notifications
                      <FiChevronDown className="ml-2" />
                    </span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile with premium dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`
              flex items-center space-x-2 p-1.5 pr-3 rounded-xl
              bg-gradient-to-r from-pink-500/10 to-red-500/10
              hover:from-pink-500/20 hover:to-red-500/20
              border border-pink-500/20
              transition-all duration-300
              hover:scale-105
              group
            `}
          >
            {/* Animated profile image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-spin-slow opacity-20 group-hover:opacity-30"></div>
              <img
                src="https://ui-avatars.com/api/?name=Love+Admin&background=ec4899&color=fff&bold=true&size=128"
                alt="Admin"
                className="w-9 h-9 rounded-full border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-all duration-300"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>

            {!collapsed && (
              <>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                    Love Admin
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-pink-400/70' : 'text-pink-600/70'}`}>
                    Premium Admin
                  </p>
                </div>
                <FiChevronDown className={`
                  hidden md:block transition-transform duration-300
                  ${profileOpen ? 'rotate-180' : ''}
                  ${darkMode ? 'text-pink-400' : 'text-pink-600'}
                `} />
              </>
            )}
          </button>

          {/* Premium Profile Dropdown */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className={`
                absolute right-0 mt-2 w-64
                ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}
                backdrop-blur-xl
                rounded-2xl shadow-2xl
                border border-pink-500/20
                z-50
                overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-pink-500/10 before:to-red-500/10 before:-z-10
              `}>
                {/* Profile Header */}
                <div className={`
                  p-4 border-b border-pink-500/20
                  bg-gradient-to-r from-pink-500/5 to-red-500/5
                `}>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse opacity-20"></div>
                      <img
                        src="https://ui-avatars.com/api/?name=Love+Admin&background=ec4899&color=fff&bold=true&size=128"
                        alt="Admin User"
                        className="w-12 h-12 rounded-full border-2 border-pink-500/50"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Mustivibes</p>
                      <p className="text-sm text-pink-500/70">{adminData.email}</p>
                      {/* <div className="flex items-center mt-1">
                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full">
                          ⭐ Premium Admin
                        </span>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {profileMenu.map((item, index) => (
                    <a
                      key={index}
                      href={item.path}
                      className={`
                        flex items-center space-x-3 px-4 py-3
                        hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-red-500/10
                        transition-all duration-300
                        ${darkMode ? 'text-gray-200' : 'text-gray-700'}
                      `}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </a>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-pink-500/20" />

                {/* Logout */}
                <a
                  href="/"
                  className={`
                    flex items-center space-x-3 px-4 py-3
                    hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10
                    transition-all duration-300
                    text-red-500
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    sessionStorage.removeItem('authToken');
                    sessionStorage.removeItem('AdminData');
                    sessionStorage.removeItem('isAdmin');
                    window.location.href = '/';
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <FaSignOutAlt className="text-red-500" />
                  </div>
                  <span className="font-bold">Logout</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Navbar;