import React, { useState, useEffect } from 'react';
import {
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaLifeRing,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaHome,
  FaIdBadge,
  FaChevronDown,
  FaChevronRight,
  FaRegQuestionCircle,
  FaDownload,
  FaPlus,
  FaSquare,
  FaCoins,
  FaHeart,
  FaFire,
  FaStar,
  FaComments,
  FaUserFriends,
  FaLock,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiHeart, FiMessageSquare, FiUsers as FiUsersIcon } from 'react-icons/fi';
import { MdFavorite, MdEmojiPeople, MdSecurity } from 'react-icons/md';
import { TbHeartHandshake, TbMessageReport } from 'react-icons/tb';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, darkMode, toggleSidebar, collapsed, toggleCollapsed, onNavigate }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({
    AllRooms: false,
    CoinsPackages: false,
    FormsReports: false,
    settings: false
  });

  const adminData = JSON.parse(sessionStorage.getItem("AdminData"));

  // Animated floating hearts
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Update active item based on route
    const path = location.pathname;
    if (path.includes('/users')) setActiveItem('users');
    else if (path.includes('/allrooms')) {
      setActiveItem('AllRooms');
      setOpenSubmenus(prev => ({ ...prev, AllRooms: true }));
    }
    else if (path.includes('/coins')) {
      setActiveItem('CoinsPackages');
      setOpenSubmenus(prev => ({ ...prev, CoinsPackages: true }));
    }
    else if (path.includes('/payments')) setActiveItem('Payments');
    else if (path.includes('/complaints') || path.includes('/reports') || path.includes('/warnings') || path.includes('/feedback') || path.includes('/contactus')) {
      setActiveItem('FormsReports');
      setOpenSubmenus(prev => ({ ...prev, FormsReports: true }));
    }
    else if (path.includes('/settings')) {
      setActiveItem('Settings');
      setOpenSubmenus(prev => ({ ...prev, settings: true }));
    }
    else setActiveItem('dashboard');

    // Create floating hearts
    const heartsArray = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 6,
      speed: Math.random() * 3 + 1,
      opacity: Math.random() * 0.2 + 0.1,
      delay: Math.random() * 2
    }));
    setHearts(heartsArray);
  }, [location]);

  const toggleSubmenu = (menu) => {
    if (collapsed) return;
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <FaTachometerAlt />, 
      text: 'Dashboard', 
      path: '/' 
    },
    { 
      id: 'users', 
      icon: <FiUsersIcon className="text-xl" />, 
      text: 'Users Management', 
      path: '/users' 
    },
    {
      id: 'AllRooms',
      icon: <FaComments />,
      text: 'Chat Rooms',
      path: '/allrooms',
      subItems: [
        { id: 'Create Rooms', text: 'Create Chat Rooms', path: '/chatrooms' },
        { id: 'All Rooms', text: 'All Chat Rooms', path: '/allrooms' }
      ]
    },
    {
      id: 'CoinsPackages',
      icon: <FaCoins />,
      text: 'Premium Features',
      path: '/coins-packages',
      subItems: [
        { id: 'Coins Packages', text: 'Coin Packages', path: '/all-coin-packages' },
        { id: 'Coins Prices', text: 'Pricing Plans', path: '/coins-prices' },
        { id: 'Referal COnfig', text: 'Referal COnfiguration', path: '/referal' },
      ]
    },
    { 
      id: 'Payments', 
      icon: <FaFileInvoiceDollar />, 
      text: 'Payments', 
      path: '/all-payments' 
    },
    {
      id: 'FormsReports',
      icon: <TbMessageReport className="text-xl" />,
      text: 'Community Safety',
      path: '/forms-reports',
      subItems: [
        { id: 'Complaints', text: 'User Complaints', path: '/complaints' },
        { id: 'Reports', text: 'Profile Reports', path: '/reports' },
        { id: 'Warnings', text: 'User Warnings', path: '/warnings' },
        { id: 'Feedback', text: 'App Feedback', path: '/feedback' },
        { id: 'Contact', text: 'Contact Us', path: '/contactus' }
      ]
    },
    { 
      id: 'Notifications', 
      icon: <FaBell />, 
      text: 'Notifications', 
      path: '/notifications' 
    },
    { 
      id: 'Settings', 
      icon: <MdSecurity className="text-xl" />, 
      text: 'Security & Settings', 
      path: '/settings' 
    },
  ];

  const handleItemClick = (item) => {
    if (item.subItems && !collapsed) {
      toggleSubmenu(item.id);
      if (!openSubmenus[item.id]) {
        onNavigate(item.path);
        setActiveItem(item.id);
      }
    } else {
      onNavigate(item.path);
      setActiveItem(item.id);
    }
  };

  const handleSubItemClick = (subItem, parentId) => {
    onNavigate(subItem.path);
    setActiveItem(subItem.id);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('AdminData');
    sessionStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  const isSubItemActive = (parentId, subItems) => {
    return subItems?.some(subItem => {
      const path = location.pathname;
      return path.includes(subItem.path.split('/')[1]) || path === subItem.path;
    });
  };

  return (
    <>
      {/* Mobile Overlay with gradient */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-r from-pink-900/70 to-red-900/70 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Animated floating hearts */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="absolute text-pink-400/20"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              fontSize: `${heart.size}px`,
              animation: `floatHeart ${heart.speed + 3}s ease-in-out ${heart.delay}s infinite alternate`,
              opacity: heart.opacity
            }}
          >
            <FiHeart />
          </div>
        ))}
      </div>

      {/* Sidebar Container */}
      <aside className={`
        ${darkMode ? 'bg-gray-900/95' : 'bg-white/95'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-20' : 'md:w-72'}
        fixed md:relative z-40
        h-screen
        transition-all duration-300 ease-in-out
        flex flex-col
        backdrop-blur-xl
        border-r border-pink-500/20
        shadow-2xl
      `}>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-red-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className={`
          p-4 border-b border-pink-500/20
          flex items-center ${collapsed ? 'justify-center' : 'justify-between'}
          relative z-10
        `}>
          {/* Logo */}
          {!collapsed ? (
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => onNavigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mr-3 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img src="/logo.png" className='img-fluid' />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  Mustivibes
                </h1>
                <p className="text-xs text-pink-400/70 font-medium">Admin Suite</p>
              </div>
            </div>
          ) : (
            <div
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform duration-300"
              onClick={() => onNavigate('/')}
            >
              <FaHeart className="text-white text-lg" />
            </div>
          )}

          {/* Close Button (Mobile only) */}
          <button
            onClick={toggleSidebar}
            className={`md:hidden p-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-red-500/10 hover:from-pink-500/20 hover:to-red-500/20 ${collapsed ? 'hidden' : ''}`}
            aria-label="Close sidebar"
          >
            <FaTimes className="text-lg text-pink-500" />
          </button>

          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={toggleCollapsed}
            className={`hidden md:flex p-2 rounded-lg bg-gradient-to-r from-pink-500/10 to-red-500/10 hover:from-pink-500/20 hover:to-red-500/20 transition-all duration-300 ${collapsed ? 'absolute -right-3 top-6 bg-white border-2 border-pink-500/30 shadow-lg' : ''}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight className="text-lg text-pink-500" />
            ) : (
              <FiChevronLeft className="text-lg text-pink-500" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 md:p-4 overflow-y-auto relative z-10">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeItem === item.id || isSubItemActive(item.id, item.subItems);
              const isSubmenuOpen = openSubmenus[item.id];
              
              return (
                <li key={item.id}>
                  {/* Main Menu Item */}
                  <div>
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`
                        w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
                        p-3 rounded-xl transition-all duration-300
                        ${isActive
                          ? 'bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 shadow-lg'
                          : `${darkMode ? 'hover:bg-pink-500/10' : 'hover:bg-pink-500/5'} hover:border hover:border-pink-500/20`
                        }
                        ${collapsed ? 'relative group' : ''}
                        backdrop-blur-sm
                        border ${isActive ? 'border-pink-500/40' : 'border-transparent'}
                        hover:shadow-md
                      `}
                      onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                      onMouseLeave={() => collapsed && setHoveredItem(null)}
                    >
                      <div className="flex items-center">
                        <span className={`
                          ${isActive ? 'text-pink-500' : darkMode ? 'text-gray-300' : 'text-gray-600'}
                          ${collapsed ? 'text-xl' : 'text-lg'}
                          transition-colors duration-300
                        `}>
                          {item.icon}
                        </span>

                        {/* Text - hidden when collapsed */}
                        {!collapsed && (
                          <span className={`
                            ml-3 font-medium
                            ${isActive ? 'text-pink-500' : darkMode ? 'text-gray-200' : 'text-gray-700'}
                          `}>
                            {item.text}
                          </span>
                        )}
                      </div>

                      {/* Submenu arrow and active indicator */}
                      {!collapsed && (
                        <div className="flex items-center gap-2">
                          {item.subItems && (
                            <span className={`text-xs transition-transform duration-300 ${isSubmenuOpen ? 'rotate-180' : ''}`}>
                              <FaChevronDown />
                            </span>
                          )}
                          {isActive && (
                            <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && hoveredItem === item.id && (
                        <div className={`
                          absolute left-full ml-2 px-3 py-2 rounded-lg shadow-xl z-50
                          bg-gradient-to-r from-pink-500 to-red-500
                          text-white text-sm font-medium
                          whitespace-nowrap
                          before:absolute before:left-[-6px] before:top-1/2 before:-translate-y-1/2
                          before:border-t-4 before:border-b-4 before:border-r-4
                          before:border-t-transparent before:border-b-transparent before:border-r-pink-500
                        `}>
                          {item.text}
                          {isActive && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub-items with animated reveal */}
                    {!collapsed && item.subItems && isSubmenuOpen && (
                      <div className="mt-1 ml-8 pl-4 border-l-2 border-gradient-to-b from-pink-500/30 to-transparent space-y-1 animate-fadeIn">
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path ||
                            location.pathname.includes(subItem.path.split('/')[1]);

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubItemClick(subItem, item.id)}
                              className={`
                                w-full flex items-center justify-start p-2.5 rounded-lg 
                                transition-all duration-300 text-sm group
                                ${isSubActive
                                  ? 'bg-gradient-to-r from-pink-500/15 to-red-500/15 text-pink-500 font-semibold'
                                  : `${darkMode ? 'hover:bg-pink-500/10 text-gray-300' : 'hover:bg-pink-500/5 text-gray-600'}`
                                }
                                hover:translate-x-1
                              `}
                            >
                              <span className={`
                                mr-2 transition-all duration-300
                                ${isSubActive ? 'text-pink-500 text-base' : 'text-pink-500/50'}
                                group-hover:text-pink-500
                              `}>
                                •
                              </span>
                              {subItem.text}
                              {isSubActive && (
                                <span className="ml-auto w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Divider with gradient */}
          <div className="my-4 relative">
            <div className="h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2">
              <FiHeart className="text-pink-500/50" />
            </div>
          </div>

          {/* Support & Logout */}
          <div className="space-y-1">
            <button
              className={`
                w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                p-3 rounded-xl transition-all duration-300
                ${darkMode ? 'hover:bg-pink-500/10 text-pink-400' : 'hover:bg-pink-500/5 text-pink-600'}
                ${collapsed ? 'relative group' : ''}
                backdrop-blur-sm
                hover:border hover:border-pink-500/20
              `}
              onMouseEnter={() => collapsed && setHoveredItem('support')}
              onMouseLeave={() => collapsed && setHoveredItem(null)}
            >
              <FaLifeRing className={`${collapsed ? 'text-xl' : 'text-lg'}`} />
              {!collapsed && <span className="ml-3 font-medium">Support</span>}
              
              {collapsed && hoveredItem === 'support' && (
                <div className={`
                  absolute left-full ml-2 px-3 py-2 rounded-lg shadow-xl z-50
                  bg-gradient-to-r from-pink-500 to-red-500
                  text-white text-sm font-medium
                  whitespace-nowrap
                `}>
                  Support
                </div>
              )}
            </button>

            {/* Logout */}
            <div className="relative">
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                  p-3 rounded-xl transition-all duration-300
                  ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-500/5 text-red-600'}
                  ${collapsed ? 'relative group' : ''}
                  backdrop-blur-sm
                  hover:border hover:border-red-500/20
                `}
                onMouseEnter={() => collapsed && setHoveredItem('logout')}
                onMouseLeave={() => collapsed && setHoveredItem(null)}
              >
                <FaSignOutAlt className={`${collapsed ? 'text-xl' : 'text-lg'}`} />
                {!collapsed && <span className="ml-3 font-medium">Logout</span>}

                {collapsed && hoveredItem === 'logout' && (
                  <div className={`
                    absolute left-full ml-2 px-3 py-2 rounded-lg shadow-xl z-50
                    bg-gradient-to-r from-red-500 to-pink-500
                    text-white text-sm font-medium
                    whitespace-nowrap
                  `}>
                    Logout
                  </div>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className={`
          p-4 border-t border-pink-500/20
          ${collapsed ? 'text-center' : ''}
          relative z-10
        `}>
          {collapsed ? (
            <div className="relative group">
              <div className="w-12 h-12 mx-auto relative cursor-pointer" onClick={() => onNavigate('/profile')}>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-spin-slow"></div>
                <img
                  src="https://ui-avatars.com/api/?name=AU&background=ec4899&color=fff&bold=true"
                  alt="Admin"
                  className="w-11 h-11 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-900"
                  onMouseEnter={() => setHoveredItem('profile')}
                  onMouseLeave={() => setHoveredItem(null)}
                />
                <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>

              {/* Profile tooltip */}
              {hoveredItem === 'profile' && (
                <div className={`
                  absolute left-full bottom-0 ml-2 px-3 py-2 rounded-lg shadow-xl z-50
                  bg-gradient-to-r from-pink-500 to-red-500
                  text-white
                  whitespace-nowrap
                `}>
                  <div className="text-sm font-semibold">Love Admin</div>
                  <div className="text-xs opacity-90">admin@loveconnect.com</div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => onNavigate('/profile')}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse opacity-20 group-hover:opacity-30"></div>
                <img
                  src="https://ui-avatars.com/api/?name=M&background=ec4899&color=fff&bold=true&size=128"
                  alt="Admin User"
                  className="w-12 h-12 rounded-full relative border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-all duration-300"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-sm bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  Mustivibes
                </h4>
                <p className={`text-xs ${darkMode ? 'text-pink-400/70' : 'text-pink-600/70'}`}>
                  {adminData.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Toggle Button for Mobile */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-6 left-6 md:hidden z-50 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/30 hover:scale-110 transition-all duration-300 group"
          aria-label="Open menu"
        >
          <FaBars className="text-xl" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
            ♥
          </div>
        </button>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes floatHeart {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) translateX(10px) rotate(10deg);
          }
          66% {
            transform: translateY(-10px) translateX(-10px) rotate(-10deg);
          }
        }
        
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;