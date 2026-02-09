import React, { useState } from "react";
import axios from "axios";
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheckCircle,
} from "react-icons/fi";

const API_URL = "http://31.97.206.144:4050/api/admin/change-password";

const Settings = ({ darkMode }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // 🔥 Password Strength
    const getStrength = () => {
        if (newPassword.length > 10) return "strong";
        if (newPassword.length > 6) return "medium";
        if (newPassword.length > 0) return "weak";
        return "";
    };

    const strength = getStrength();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!currentPassword || !newPassword) {
            setError("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const token = sessionStorage.getItem("adminToken");

            const res = await axios.post(
                API_URL,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.data.success) {
                setMessage("Password changed successfully");

                setCurrentPassword("");
                setNewPassword("");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen p-6 md:p-10 ${darkMode
                    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                    : ""
                }`}
        >
            {/* HEADER */}
            <div className="mb-10">
                <h1
                    className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#2A0A14]"
                        }`}
                >
                    Settings
                </h1>

                <p className="text-gray-400 mt-2">
                    Manage your admin security and preferences
                </p>
            </div>

            {/* CARD */}
            <div
                className={`
        max-w-xl
        rounded-3xl
        p-8
        shadow-lg
        backdrop-blur-xl
        border
        ${darkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-white border-pink-100"
                    }
      `}
            >
                {/* SUCCESS */}
                {message && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
                        <FiCheckCircle />
                        {message}
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleChangePassword}
                    className="space-y-6"
                >
                    {/* CURRENT PASSWORD */}
                    <div>
                        <label className="text-sm font-semibold text-gray-500">
                            Current Password
                        </label>

                        <div className="relative mt-2">
                            <FiLock className="absolute top-3.5 left-4 text-gray-400" />

                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className={`
                  w-full
                  pl-12 pr-12 py-3
                  rounded-xl
                  border
                  outline-none
                  transition
                  ${darkMode
                                        ? "bg-white/5 border-white/10 text-white"
                                        : "border-gray-200"
                                    }
                  focus:ring-4 focus:ring-pink-100
                `}
                                placeholder="Enter current password"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrent(!showCurrent)
                                }
                                className="absolute right-4 top-3.5 text-gray-400"
                            >
                                {showCurrent ? (
                                    <FiEyeOff />
                                ) : (
                                    <FiEye />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                        <label className="text-sm font-semibold text-gray-500">
                            New Password
                        </label>

                        <div className="relative mt-2">
                            <FiLock className="absolute top-3.5 left-4 text-gray-400" />

                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                className={`
                  w-full
                  pl-12 pr-12 py-3
                  rounded-xl
                  border
                  outline-none
                  transition
                  ${darkMode
                                        ? "bg-white/5 border-white/10 text-white"
                                        : "border-gray-200"
                                    }
                  focus:ring-4 focus:ring-pink-100
                `}
                                placeholder="Enter new password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-3.5 text-gray-400"
                            >
                                {showNew ? (
                                    <FiEyeOff />
                                ) : (
                                    <FiEye />
                                )}
                            </button>
                        </div>

                        {/* 🔥 Strength Indicator */}
                        {strength && (
                            <div className="mt-2">
                                <div
                                    className={`h-2 rounded-full ${strength === "weak"
                                            ? "bg-red-400 w-1/3"
                                            : strength === "medium"
                                                ? "bg-yellow-400 w-2/3"
                                                : "bg-green-500 w-full"
                                        }`}
                                />

                                <p className="text-xs mt-1 text-gray-400">
                                    Password strength:{" "}
                                    <span className="capitalize">
                                        {strength}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* BUTTON */}
                    <button
                        disabled={loading}
                        className="
              w-full
              py-3
              rounded-xl
              font-semibold
              text-white
              bg-[#7A1631]
              hover:bg-[#5A0F24]
              shadow-lg
              transition
              active:scale-95
              disabled:opacity-50
            "
                    >
                        {loading
                            ? "Updating Password..."
                            : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
