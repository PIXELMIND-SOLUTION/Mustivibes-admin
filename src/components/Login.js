import React, { useState } from "react";
import axios from "axios";
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_URL = "http://31.97.206.144:4050/api/admin/login";

const Login = () => {
  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const handleLogin = async(e)=>{
    e.preventDefault();
    setError("");

    if(!email || !password){
      setError("Enter email and password");
      return;
    }

    try{
      setLoading(true);

      const res = await axios.post(API_URL,{
        email,
        password
      });

      if(res.data.success){
        sessionStorage.setItem("adminToken",res.data.token);
        sessionStorage.setItem("AdminData",JSON.stringify(res.data.admin));
        sessionStorage.setItem("isAdmin","true");

        navigate("/admin");
      }

    }catch(err){
      setError(err.response?.data?.message || "Login failed");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT BRAND PANEL */}
      <div className="
        hidden lg:flex
        flex-1
        relative
        items-center
        justify-center
        px-20
        bg-gradient-to-br
        from-[#2A0A14]
        via-[#4A0F22]
        to-[#7A1631]
        text-white
        overflow-hidden
      ">

        {/* glow effects */}
        <div className="absolute w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[140px] -top-40 -left-40"/>
        <div className="absolute w-[500px] h-[500px] bg-rose-400/10 rounded-full blur-[120px] bottom-[-120px] right-[-120px]"/>

        <div className="relative z-10 max-w-xl">

          <h1 className="text-7xl font-bold leading-tight">
            Musti<span className="text-pink-300">Vibes</span>
          </h1>

          <p className="mt-6 text-xl text-pink-100">
            Build connections. Empower communities.
            Manage your social universe with confidence.
          </p>

          <div className="mt-10 w-24 h-[3px] bg-pink-300 rounded-full"/>

          <p className="mt-10 text-pink-200">
            Premium Admin Console
          </p>

        </div>
      </div>


      {/* RIGHT LOGIN AREA */}
      <div className="
        flex-1
        flex
        items-center
        justify-center
        px-6
        bg-gradient-to-br
        from-[#FFF1F5]
        via-[#FFE4EC]
        to-[#FFD6E2]
        relative
      ">

        {/* soft glow */}
        <div className="absolute w-[400px] h-[400px] bg-white/40 rounded-full blur-[120px]" />

        {/* CARD */}
        <div className="
          w-full
          max-w-md
          bg-white
          p-10
          rounded-3xl
          shadow-[0_40px_120px_rgba(122,22,49,0.25)]
          relative
        ">

          {/* STATUS BADGE */}
          <div className="absolute -top-4 right-6">
            <div className="
              flex items-center gap-2
              px-4 py-1.5
              rounded-full
              bg-green-100
              border border-green-200
              text-green-700
              text-xs
              font-semibold
            ">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
              System Online
            </div>
          </div>

          {/* SECURITY TAG */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6
          rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-xs font-semibold">
            🔒 Secure Admin Access
          </div>


          <h2 className="text-3xl font-bold text-[#2A0A14]">
            Welcome Back
          </h2>

          <p className="text-gray-500 mt-2">
            Login to your admin dashboard
          </p>

          {error && (
            <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>

              <div className="relative mt-2">
                <FiMail className="absolute top-3.5 left-4 text-gray-400"/>

                <input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="admin@mustivibes.com"
                  className="
                    w-full
                    pl-12 pr-4 py-3
                    rounded-xl
                    border border-gray-200
                    hover:border-pink-300
                    focus:ring-4 focus:ring-pink-100
                    focus:border-[#7A1631]
                    outline-none
                    transition
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm font-semibold text-gray-600">
                Password
              </label>

              <div className="relative mt-2">
                <FiLock className="absolute top-3.5 left-4 text-gray-400"/>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="
                    w-full
                    pl-12 pr-12 py-3
                    rounded-xl
                    border border-gray-200
                    hover:border-pink-300
                    focus:ring-4 focus:ring-pink-100
                    focus:border-[#7A1631]
                    outline-none
                  "
                />

                {/* toggle */}
                <button
                  type="button"
                  onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-pink-600"
                >
                  {showPassword ? <FiEyeOff/> : <FiEye/>}
                </button>
              </div>
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
              "
            >
              <span className="flex items-center justify-center gap-2">
                <FiLogIn/>
                {loading ? "Signing in..." : "Login"}
              </span>
            </button>

            {/* TRUST FOOTER */}
            <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"/>
                Protected
              </div>

              <div>256-bit Encryption</div>

              <div>v3.2.0</div>
            </div>

          </form>

          <p className="text-xs text-gray-400 mt-8 text-center">
            © {new Date().getFullYear()} MustiVibes. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
