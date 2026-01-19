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
  FaCoins
} from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, darkMode, toggleSidebar, collapsed, toggleCollapsed, onNavigate }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({
    Packages: false,
    analytics: false,
    settings: false
  });

  // Update active item based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) setActiveItem('users');
    else if (path.includes('/packages') || path.includes('/categories') || path.includes('/products')) {
      setActiveItem('Packages');
      setOpenSubmenus(prev => ({ ...prev, Packages: true }));
    }
    else if (path.includes('/orders')) setActiveItem('orders');
    else if (path.includes('/analytics')) {
      setActiveItem('analytics');
      setOpenSubmenus(prev => ({ ...prev, analytics: true }));
    }
    else if (path.includes('/settings')) {
      setActiveItem('settings');
      setOpenSubmenus(prev => ({ ...prev, settings: true }));
    }
    else setActiveItem('dashboard');
  }, [location]);

  const toggleSubmenu = (menu) => {
    if (collapsed) return;
    setOpenSubmenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    { id: 'dashboard', icon: <FaTachometerAlt />, text: 'Dashboard', path: '/' },
    { id: 'users', icon: <FaUsers />, text: 'Users', path: '/users' },
    {
      id: 'AllRooms',
      icon: <FaSquare />,
      text: 'AllRooms',
      path: '/allrooms',
      subItems: [
        { id: 'All Rooms', text: 'All Rooms', path: '/allrooms' }
      ]
    },
    {
      id: 'Coins Packages',
      icon: <FaCoins />,
      text: 'Coins Packages',
      path: '/coins-packages',
      subItems: [
        { id: 'Coins Packages', text: 'Create Coins Packages', path: '/create-coin-package' },
        { id: 'Coins Packages', text: 'Coins Packages', path: '/all-coin-packages' },
        { id: 'Coins Prices', text: 'Coins Prices', path: '/coins-prices' }
      ]
    },
    { id: 'Payments', icon: <FaFileInvoiceDollar />, text: 'Payments', path: '/all-payments' },
    {
      id: 'Forms&Reports',
      icon: <FaRegQuestionCircle />,
      text: 'Forms & Reports',
      path: '/forms-reports',
      subItems: [
        { id: 'Complaints', text: 'All Complaints', path: '/complaints' },
        { id: 'Reports', text: 'All Reports', path: '/reports' },
        { id: 'Warnings', text: 'All Warnings', path: '/warnings' },
        { id: 'Feedback', text: 'All Feedback', path: '/feedback' },
        { id: 'Contact', text: 'All Contact', path: '/contactus' }
      ]
    },
    { id: 'Settings', icon: <FaCog />, text: 'Settings', path: '/settings' },
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

    // When in collapsed mode, close sidebar after navigation on mobile
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('AdminData');
    sessionStorage.removeItem('isAdmin');

    window.location.href = '/';
  };

  // Check if a subitem is active
  const isSubItemActive = (parentId, subItems) => {
    return subItems?.some(subItem => {
      const path = location.pathname;
      return path.includes(subItem.path.split('/')[1]) || path === subItem.path;
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-20' : 'md:w-64'}
        fixed md:relative z-40
        h-screen
        transition-all duration-300 ease-in-out
        flex flex-col
        border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        shadow-lg md:shadow-sm
      `}>
        {/* Header */}
        <div className={`
          p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} 
          flex items-center ${collapsed ? 'justify-center' : 'justify-between'}
          border-b
        `}>
          {/* Logo */}
          {!collapsed ? (
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8  rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                <img
                  src="/logo.png"   // or your logo path
                  alt="Logo"
                  className="w-8 h-8 object-contain rounded-lg"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold">Mustivibes</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => onNavigate('/')}
            >
              <span className="text-white font-bold">A</span>
            </div>
          )}

          {/* Close Button (Mobile only) */}
          <button
            onClick={toggleSidebar}
            className={`md:hidden p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${collapsed ? 'hidden' : ''}`}
            aria-label="Close sidebar"
          >
            <FaTimes className="text-lg" />
          </button>

          {/* Collapse Toggle Button (Desktop only) */}
          <button
            onClick={toggleCollapsed}
            className={`hidden md:flex p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${collapsed ? 'absolute -right-3 top-6 bg-white dark:bg-gray-800 border shadow-lg' : ''}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <FiChevronRight className="text-lg" />
            ) : (
              <FiChevronLeft className="text-lg" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 md:p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                {/* Main Menu Item */}
                <div>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} 
                      p-3 rounded-lg transition-all duration-200
                      ${activeItem === item.id || isSubItemActive(item.id, item.subItems)
                        ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`
                        : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                      }
                      ${collapsed ? 'relative' : ''}
                    `}
                    onMouseEnter={() => collapsed && setHoveredItem(item.id)}
                    onMouseLeave={() => collapsed && setHoveredItem(null)}
                  >
                    <div className="flex items-center">
                      <span className={`${collapsed ? 'text-xl' : 'text-lg'}`}>{item.icon}</span>

                      {/* Text - hidden when collapsed */}
                      {!collapsed && (
                        <span className="ml-3 font-medium">{item.text}</span>
                      )}
                    </div>

                    {/* Submenu arrow (only when not collapsed) */}
                    {!collapsed && item.subItems && (
                      <span className="text-xs ml-2">
                        {openSubmenus[item.id] ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    )}

                    {/* Active indicator */}
                    {(activeItem === item.id || isSubItemActive(item.id, item.subItems)) && !collapsed && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && hoveredItem === item.id && (
                      <div className={`
                        absolute left-full ml-2 px-3 py-2 rounded-md shadow-lg z-50
                        ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                        whitespace-nowrap
                      `}>
                        {item.text}
                      </div>
                    )}
                  </button>

                  {/* Sub-items (only when not collapsed and menu is open) */}
                  {!collapsed && item.subItems && openSubmenus[item.id] && (
                    <div className="mt-1 ml-6 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isActive = location.pathname === subItem.path ||
                          location.pathname.includes(subItem.path.split('/')[1]);

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem, item.id)}
                            className={`
                              w-full flex items-center justify-start p-2 rounded-lg 
                              transition-all duration-200 text-sm
                              ${isActive
                                ? `${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-gray-100 text-blue-600'} font-medium`
                                : `${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`
                              }
                            `}
                          >
                            <span className="mr-2">•</span>
                            {subItem.text}
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className={`my-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

          {/* Logout */}
          <div className="relative">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} 
                p-3 rounded-lg transition-all duration-200
                ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}
                ${collapsed ? 'relative' : ''}
              `}
              onMouseEnter={() => collapsed && setHoveredItem('logout')}
              onMouseLeave={() => collapsed && setHoveredItem(null)}
            >
              <FaSignOutAlt className={`${collapsed ? 'text-xl' : 'text-lg'}`} />
              {!collapsed && <span className="ml-3 font-medium">Logout</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && hoveredItem === 'logout' && (
                <div className={`
                  absolute left-full ml-2 px-3 py-2 rounded-md shadow-lg z-50
                  ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                  whitespace-nowrap
                `}>
                  Logout
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className={`
          p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}
          ${collapsed ? 'text-center' : ''}
        `}>
          {collapsed ? (
            <div className="relative">
              <img
                src="https://ui-avatars.com/api/?name=AU&background=3b82f6&color=fff"
                alt="Admin"
                className="w-10 h-10 rounded-full mx-auto cursor-pointer"
                onMouseEnter={() => setHoveredItem('profile')}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => onNavigate('/profile')}
              />
              <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>

              {/* Profile tooltip */}
              {hoveredItem === 'profile' && (
                <div className={`
                  absolute left-full bottom-0 ml-2 px-3 py-2 rounded-md shadow-lg z-50
                  ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}
                  whitespace-nowrap
                `}>
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs opacity-75">admin@example.com</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/profile')}>
              <div className="relative">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff"
                  alt="Admin User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-sm">Admin User</h4>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>admin@example.com</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Toggle Button for Mobile */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 md:hidden z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          aria-label="Open menu"
        >
          <FaBars className="text-xl" />
        </button>
      )}
    </>
  );
};

export default Sidebar;