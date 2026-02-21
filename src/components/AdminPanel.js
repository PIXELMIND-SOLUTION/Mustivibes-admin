import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../Views/Dashboard';
import Users from '../Views/users/Users';
import AllRooms from '../Views/rooms/AllRooms';
import AllCoinPackages from '../Views/coinPackages/AllCoinPackages';
import CoinPrices from '../Views/coinPackages/CoinPrices';
import Settings from '../Views/Settings';
import AllPayments from '../Views/payments/AllPayments';
import Complaints from '../Views/formsAndReports/Complaints';
import Reports from '../Views/formsAndReports/Reports';
import Warnings from '../Views/formsAndReports/Warnings';
import Feedback from '../Views/formsAndReports/Feedback';
import ContactUs from '../Views/formsAndReports/ContactUs'
import SingleUser from '../Views/users/SingleUser';
import CreateRoom from '../Views/rooms/CreateRoom';
import ReferralConfig from '../Views/coinPackages/ReferalConfig';
import Notifications from '../Notifications';
import WarningFAQS from '../WarningFAQS';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [darkMode, setDarkMode] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        // Load from localStorage or default to false
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true' || false;
    });

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleCollapsed = () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);
        localStorage.setItem('sidebarCollapsed', newCollapsed);
    };

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
    };

    const handleNavigation = (path) => {
        navigate(`/admin${path}`);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    // Load preferences
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

  return (
  <div
    className={`
      h-screen overflow-hidden
      ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}
    `}
  >
    <div className="flex h-full">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleSidebar={toggleSidebar}
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
        onNavigate={handleNavigation}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          collapsed={collapsed}
          sidebarOpen={sidebarOpen}
          onNavigate={handleNavigation}
        />

        {/* ✅ ONLY THIS SCROLLS */}
        <main
          className="
            flex-1
            overflow-y-auto
            overflow-x-hidden
            p-4 md:p-6
          "
        >
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />

            <Route path="/users" element={<Users darkMode={darkMode} />} />
            <Route path="/user/:id" element={<SingleUser darkMode={darkMode} />} />

            <Route path="/allrooms" element={<AllRooms darkMode={darkMode} />} />
            <Route path="/chatrooms" element={<CreateRoom darkMode={darkMode} />} />

            <Route path="/all-coin-packages" element={<AllCoinPackages darkMode={darkMode} />} />
            <Route path="/coins-prices" element={<CoinPrices darkMode={darkMode} />} />
            <Route path="/referal" element={<ReferralConfig darkMode={darkMode} />} />

            <Route path="/all-payments" element={<AllPayments darkMode={darkMode} />} />

            <Route path='/complaints' element={<Complaints darkMode={darkMode} />} />
            <Route path='/reports' element={<Reports darkMode={darkMode} />} />
            <Route path='/warnings' element={<Warnings darkMode={darkMode} />} />
            <Route path='/feedback' element={<Feedback darkMode={darkMode} />} />
            <Route path='/contactus' element={<ContactUs darkMode={darkMode} />} />

            <Route path='/warningfaqs' element={<WarningFAQS darkMode={darkMode} />} />

            <Route path='/notifications' element={<Notifications darkMode={darkMode} />} />

            <Route path="/settings" element={<Settings darkMode={darkMode} />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  </div>
);
};

export default AdminPanel;