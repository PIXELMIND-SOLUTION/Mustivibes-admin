import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCoins,
  FaTrash,
  FaSave,
  FaPlus,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/referral";

const ReferralConfig = ({ darkMode }) => {
  const [configs, setConfigs] = useState([]);
  const [coins, setCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // FETCH
  const fetchConfigs = async () => {
    try {
      const res = await axios.get(API);
      setConfigs(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // CREATE
  const createConfig = async () => {
    if (!coins) return;

    try {
      setLoading(true);

      await axios.post(API, {
        coins,
      });

      setCoins("");
      fetchConfigs();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const updateCoins = async (id, newCoins) => {
    try {
      setSavingId(id);

      await axios.put(`${API}/${id}`, {
        coins: newCoins,
      });

      fetchConfigs();
    } catch (err) {
      console.log(err);
    } finally {
      setSavingId(null);
    }
  };

  // DELETE
  const deleteConfig = async (id) => {
    if (!window.confirm("Delete this config?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      fetchConfigs();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={`relative min-h-screen p-10 ${
        darkMode
          ? "bg-[#070707]"
          : "bg-gradient-to-br from-pink-50 via-white to-red-100"
      }`}
    >
      {/* GRID */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(#ff4d6d22 1px, transparent 1px),
            linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12 relative">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
          Referral Reward Control
        </h1>
      </div>

      {/* CREATE CARD */}
      <div
        className={`p-8 rounded-3xl mb-10 border backdrop-blur-xl
        ${
          darkMode
            ? "bg-[#111]/80 border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.15)]"
            : "bg-white/70 border-pink-200 shadow-xl"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaCoins className="text-pink-500" />
          Create Referral Reward
        </h2>

        <div className="flex gap-4">
          <input
            type="number"
            placeholder="Enter coins..."
            value={coins}
            onChange={(e) => setCoins(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-500 outline-none"
          />

          <button
            onClick={createConfig}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold
            bg-gradient-to-r from-pink-500 to-red-500
            hover:scale-105 transition shadow-[0_0_25px_rgba(255,0,90,.6)]"
          >
            <FaPlus />
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* CONFIG LIST */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 relative">
        {configs.map((cfg) => (
          <ReferralCard
            key={cfg._id}
            cfg={cfg}
            darkMode={darkMode}
            updateCoins={updateCoins}
            deleteConfig={deleteConfig}
            savingId={savingId}
          />
        ))}
      </div>
    </div>
  );
};

////////////////////////////////////////////////////////////

const ReferralCard = ({
  cfg,
  darkMode,
  updateCoins,
  deleteConfig,
  savingId,
}) => {
  const [value, setValue] = useState(
    cfg.referralRewardCoins
  );

  return (
    <div
      className={`
      p-6
      rounded-3xl
      border
      backdrop-blur-xl
      transition
      hover:scale-[1.03]
      ${
        darkMode
          ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_35px_rgba(255,0,90,.18)] hover:shadow-[0_0_60px_rgba(255,0,90,.35)]"
          : "bg-white border-pink-200 shadow-xl"
      }
    `}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm opacity-60">
          Reward Coins
        </span>

        <FaCoins className="text-pink-500 text-xl" />
      </div>

      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border mb-4 focus:ring-2 focus:ring-pink-500 outline-none"
      />

      <div className="flex justify-between gap-3">
        <button
          onClick={() => updateCoins(cfg._id, value)}
          disabled={savingId === cfg._id}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white
          bg-gradient-to-r from-pink-500 to-red-500
          hover:scale-105 transition"
        >
          <FaSave />
          {savingId === cfg._id ? "Saving..." : "Update"}
        </button>

        <button
          onClick={() => deleteConfig(cfg._id)}
          className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600 transition"
        >
          <FaTrash />
        </button>
      </div>

      <p className="text-xs opacity-40 mt-4">
        Created:{" "}
        {new Date(cfg.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default ReferralConfig;
