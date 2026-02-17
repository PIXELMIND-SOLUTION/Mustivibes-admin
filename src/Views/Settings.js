import React, { useState } from "react";
import axios from "axios";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaCheckCircle, FaTimesCircle, FaShieldAlt } from "react-icons/fa";

const API_URL = "http://31.97.206.144:4050/api/admin/change-password";

const Settings = ({ darkMode }) => {
  const dm = darkMode;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState("");
  const [error, setError]       = useState("");

  // PASSWORD STRENGTH
  const getStrength = () => {
    if (!newPassword) return null;
    const hasUpper   = /[A-Z]/.test(newPassword);
    const hasNumber  = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*]/.test(newPassword);
    const score = [newPassword.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 1) return { label: "Weak",   width: "w-1/4",  bar: "bg-red-500",    text: "text-red-400"    };
    if (score === 2) return { label: "Fair",   width: "w-2/4",  bar: "bg-orange-400", text: "text-orange-400" };
    if (score === 3) return { label: "Good",   width: "w-3/4",  bar: "bg-yellow-400", text: "text-yellow-400" };
    return              { label: "Strong", width: "w-full",  bar: "bg-green-500",  text: "text-green-400"  };
  };

  const strength = getStrength();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("Please fill in all fields.");
    }
    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem("adminToken");

      const res = await axios.post(
        API_URL,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setMessage(res.data.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-11 pr-12 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition
    ${dm
      ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20"
      : "bg-white border-pink-200 text-gray-800 placeholder-gray-300"
    }`;

  return (
    <div className={`relative min-h-screen p-6 md:p-10 transition-all duration-300
      ${dm ? "bg-[#070707] text-white" : "bg-gradient-to-br from-pink-50 via-white to-red-100 text-gray-800"}`}
    >
      {/* GRID OVERLAY */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* GLOW ORBS */}
      <div className="absolute w-[500px] h-[500px] bg-pink-500/10 blur-[180px] rounded-full top-[-100px] right-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-red-500/10 blur-[160px] rounded-full bottom-[-100px] left-[-100px] pointer-events-none" />

      <div className="relative z-10 max-w-xl">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className={`text-sm mt-1 ${dm ? "text-white/40" : "text-gray-400"}`}>
            Manage your admin security and preferences
          </p>
        </div>

        {/* CARD */}
        <div className={`rounded-3xl p-8 border backdrop-blur-xl
          ${dm
            ? "bg-[#0b0b0b]/90 border-pink-500/20 shadow-[0_0_60px_rgba(255,0,90,.15)]"
            : "bg-white/80 border-pink-200 shadow-2xl"
          }`}
        >
          {/* CARD HEADER */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-[0_0_25px_rgba(255,0,90,.45)]">
              <FaShieldAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                Change Password
              </h2>
              <p className={`text-xs ${dm ? "text-white/40" : "text-gray-400"}`}>
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          {/* SUCCESS */}
          {message && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-semibold
              ${dm ? "bg-pink-500/10 border-pink-500/20 text-pink-400" : "bg-pink-50 border-pink-200 text-pink-700"}`}
            >
              <FaCheckCircle className="shrink-0 text-base" />
              {message}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-semibold
              ${dm ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}
            >
              <FaTimesCircle className="shrink-0 text-base" />
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">

            {/* CURRENT PASSWORD */}
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showCurrent}
              toggle={() => setShowCurrent((v) => !v)}
              placeholder="Enter current password"
              inputCls={inputCls}
            />

            {/* NEW PASSWORD */}
            <div>
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                show={showNew}
                toggle={() => setShowNew((v) => !v)}
                placeholder="Enter new password"
                inputCls={inputCls}
              />

              {/* STRENGTH METER */}
              {strength && (
                <div className="mt-2.5 space-y-1">
                  <div className={`h-1.5 rounded-full overflow-hidden ${dm ? "bg-white/10" : "bg-pink-100"}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.width} ${strength.bar}`} />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-semibold ${strength.text}`}>
                      {strength.label} password
                    </p>
                    <p className={`text-xs ${dm ? "text-white/30" : "text-gray-400"}`}>
                      Use 8+ chars, uppercase, numbers & symbols
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirm}
                toggle={() => setShowConfirm((v) => !v)}
                placeholder="Re-enter new password"
                inputCls={inputCls}
              />

              {/* MATCH INDICATOR */}
              {confirmPassword && (
                <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1
                  ${newPassword === confirmPassword ? "text-green-400" : "text-red-400"}`}
                >
                  {newPassword === confirmPassword
                    ? <><FaCheckCircle className="text-xs" /> Passwords match</>
                    : <><FaTimesCircle className="text-xs" /> Passwords do not match</>
                  }
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base
                bg-gradient-to-r from-pink-500 to-red-500
                hover:scale-[1.02] transition
                shadow-[0_0_25px_rgba(255,0,90,.5)]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
                flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating Password...
                </>
              ) : (
                <><FaShieldAlt /> Change Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── PASSWORD FIELD ───────────────────────────────────────
const PasswordField = ({ label, value, onChange, show, toggle, placeholder, inputCls }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-pink-500 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500/40" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500/40 hover:text-pink-500 transition"
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  </div>
);

export default Settings;