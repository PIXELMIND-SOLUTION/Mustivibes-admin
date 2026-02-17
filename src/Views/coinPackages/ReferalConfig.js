import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCoins, FaTrash, FaSave, FaPlus, FaExchangeAlt, FaMicrophone, FaVideo, FaClock } from "react-icons/fa";

// ─────────────────────────────────────────────
// API CONSTANTS
// ─────────────────────────────────────────────
const REFERRAL_API = "http://31.97.206.144:4050/api/referral";
const COIN_API     = "http://31.97.206.144:4055/api";

// ─────────────────────────────────────────────
// NAV TABS
// ─────────────────────────────────────────────
const TABS = [
  { id: "referral",   label: "Referral",        icon: <FaCoins /> },
  { id: "conversion", label: "Coin Conversion",  icon: <FaExchangeAlt /> },
  { id: "deduction",  label: "Coin Deduction",   icon: <FaClock /> },
];

// ─────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────
const CoinManagement = ({ darkMode = true }) => {
  const [activeTab, setActiveTab] = useState("referral");

  const dm = darkMode;

  return (
    <div className={`relative min-h-screen ${dm ? "bg-[#070707]" : "bg-gradient-to-br from-pink-50 via-white to-red-100"}`}>
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 p-6 md:p-10">
        {/* ── HEADER ── */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
            Coin Management
          </h1>
          <p className={`text-sm ${dm ? "text-white/40" : "text-gray-400"}`}>
            Configure referral rewards, conversion rates & deduction rules
          </p>
        </div>

        {/* ── NAV TABS ── */}
        <div className={`inline-flex gap-1 p-1 rounded-2xl mb-10 ${dm ? "bg-[#111] border border-pink-500/20" : "bg-pink-50 border border-pink-200"}`}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                  ${active
                    ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-[0_0_20px_rgba(255,0,90,.45)]"
                    : dm
                      ? "text-white/50 hover:text-white/80"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === "referral"   && <ReferralConfig darkMode={dm} />}
        {activeTab === "conversion" && <CoinConversion darkMode={dm} />}
        {activeTab === "deduction"  && <CoinDeduction  darkMode={dm} />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED CARD WRAPPER
// ─────────────────────────────────────────────
const Card = ({ darkMode, children, className = "" }) => (
  <div className={`p-6 rounded-3xl border backdrop-blur-xl transition hover:scale-[1.02]
    ${darkMode
      ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_35px_rgba(255,0,90,.18)] hover:shadow-[0_0_60px_rgba(255,0,90,.35)]"
      : "bg-white border-pink-200 shadow-xl"
    } ${className}`}
  >
    {children}
  </div>
);

const CreateCard = ({ darkMode, children, title, icon }) => (
  <div className={`p-8 rounded-3xl mb-10 border backdrop-blur-xl
    ${darkMode
      ? "bg-[#111]/80 border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.15)]"
      : "bg-white/70 border-pink-200 shadow-xl"
    }`}
  >
    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
      <span className="text-pink-500">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

const StyledInput = ({ label, ...props }) => (
  <div className="flex-1">
    {label && <label className="block text-xs font-semibold text-pink-400 mb-1 ml-1">{label}</label>}
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-pink-200/30 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none text-inherit"
    />
  </div>
);

const PrimaryBtn = ({ children, loading, ...props }) => (
  <button
    {...props}
    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold
      bg-gradient-to-r from-pink-500 to-red-500
      hover:scale-105 transition shadow-[0_0_25px_rgba(255,0,90,.6)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
  >
    {children}
  </button>
);

const DeleteBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-red-600 transition border border-pink-500/20"
  >
    <FaTrash />
  </button>
);

const Badge = ({ children, color = "pink" }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
    color === "pink"   ? "bg-pink-500/20 text-pink-400" :
    color === "purple" ? "bg-purple-500/20 text-purple-400" :
    color === "blue"   ? "bg-blue-500/20 text-blue-400" :
                         "bg-green-500/20 text-green-400"
  }`}>
    {children}
  </span>
);

// ─────────────────────────────────────────────
// 1. REFERRAL CONFIG (original, preserved)
// ─────────────────────────────────────────────
const ReferralConfig = ({ darkMode }) => {
  const [configs, setConfigs] = useState([]);
  const [coins, setCoins] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchConfigs = async () => {
    try {
      const res = await axios.get(REFERRAL_API);
      setConfigs(res.data.data || []);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const createConfig = async () => {
    if (!coins) return;
    try {
      setLoading(true);
      await axios.post(REFERRAL_API, { coins });
      setCoins("");
      fetchConfigs();
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const updateCoins = async (id, newCoins) => {
    try {
      setSavingId(id);
      await axios.put(`${REFERRAL_API}/${id}`, { coins: newCoins });
      fetchConfigs();
    } catch (err) { console.log(err); }
    finally { setSavingId(null); }
  };

  const deleteConfig = async (id) => {
    if (!window.confirm("Delete this config?")) return;
    try {
      await axios.delete(`${REFERRAL_API}/${id}`);
      fetchConfigs();
    } catch (err) { console.log(err); }
  };

  return (
    <div>
      <CreateCard darkMode={darkMode} title="Create Referral Reward" icon={<FaCoins />}>
        <div className="flex gap-4">
          <StyledInput type="number" placeholder="Enter coins..." value={coins} onChange={(e) => setCoins(e.target.value)} label="Coins Reward" />
          <div className="flex items-end">
            <PrimaryBtn onClick={createConfig} disabled={loading}>
              <FaPlus />
              {loading ? "Creating..." : "Create"}
            </PrimaryBtn>
          </div>
        </div>
      </CreateCard>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {configs.map((cfg) => (
          <ReferralCard key={cfg._id} cfg={cfg} darkMode={darkMode} updateCoins={updateCoins} deleteConfig={deleteConfig} savingId={savingId} />
        ))}
      </div>

      {configs.length === 0 && <EmptyState label="No referral rewards configured yet." />}
    </div>
  );
};

const ReferralCard = ({ cfg, darkMode, updateCoins, deleteConfig, savingId }) => {
  const [value, setValue] = useState(cfg.referralRewardCoins);
  return (
    <Card darkMode={darkMode}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm opacity-60">Reward Coins</span>
        <FaCoins className="text-pink-500 text-xl" />
      </div>
      <StyledInput type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      <div className="flex justify-between gap-3 mt-4">
        <button
          onClick={() => updateCoins(cfg._id, value)}
          disabled={savingId === cfg._id}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-pink-500 to-red-500 hover:scale-105 transition disabled:opacity-50"
        >
          <FaSave />
          {savingId === cfg._id ? "Saving..." : "Update"}
        </button>
        <DeleteBtn onClick={() => deleteConfig(cfg._id)} />
      </div>
      <p className="text-xs opacity-40 mt-4">Created: {new Date(cfg.createdAt).toLocaleString()}</p>
    </Card>
  );
};

// ─────────────────────────────────────────────
// 2. COIN CONVERSION
// ─────────────────────────────────────────────
const CoinConversion = ({ darkMode }) => {
  const [ratio, setRatio] = useState(null);
  const [form, setForm] = useState({ coins: "", rupees: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({ coins: "", rupees: "" });

  const fetchRatio = async () => {
    try {
      const res = await axios.get(`${COIN_API}/getcointorupee`);
      setRatio(res.data.ratio || null);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchRatio(); }, []);

  const createRatio = async () => {
    if (!form.coins || !form.rupees) return;
    try {
      setLoading(true);
      await axios.post(`${COIN_API}/createcointorupee`, { coins: Number(form.coins), rupees: Number(form.rupees) });
      setForm({ coins: "", rupees: "" });
      fetchRatio();
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const startEdit = () => {
    setEditValues({ coins: ratio.coins, rupees: ratio.rupees });
    setEditMode(true);
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      await axios.put(`${COIN_API}/update-cointorupee/${ratio._id}`, {
        coins: Number(editValues.coins),
        rupees: Number(editValues.rupees),
      });
      setEditMode(false);
      fetchRatio();
    } catch (err) { console.log(err); }
    finally { setSaving(false); }
  };

  const deleteRatio = async () => {
    if (!window.confirm("Delete this conversion ratio?")) return;
    try {
      await axios.delete(`${COIN_API}/delete-cointorupee/${ratio._id}`);
      setRatio(null);
    } catch (err) { console.log(err); }
  };

  return (
    <div>
      {/* CREATE (only if no ratio exists) */}
      {!ratio && (
        <CreateCard darkMode={darkMode} title="Set Coin → Rupee Ratio" icon={<FaExchangeAlt />}>
          <div className="flex flex-wrap gap-4">
            <StyledInput type="number" placeholder="Coins" value={form.coins} onChange={(e) => setForm({ ...form, coins: e.target.value })} label="Coins" />
            <div className="flex items-end pb-0.5">
              <span className="text-pink-500 text-2xl font-bold">=</span>
            </div>
            <StyledInput type="number" placeholder="Rupees (₹)" value={form.rupees} onChange={(e) => setForm({ ...form, rupees: e.target.value })} label="Rupees (₹)" />
            <div className="flex items-end">
              <PrimaryBtn onClick={createRatio} disabled={loading}>
                <FaPlus />
                {loading ? "Creating..." : "Create"}
              </PrimaryBtn>
            </div>
          </div>
        </CreateCard>
      )}

      {/* CURRENT RATIO CARD */}
      {ratio && (
        <div className="max-w-xl">
          <Card darkMode={darkMode}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs opacity-50 mb-1">Current Conversion Ratio</p>
                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                  Coin → Rupee
                </h3>
              </div>
              <FaExchangeAlt className="text-pink-500 text-2xl" />
            </div>

            {editMode ? (
              <div className="flex flex-wrap gap-4 mb-6">
                <StyledInput type="number" value={editValues.coins} onChange={(e) => setEditValues({ ...editValues, coins: e.target.value })} label="Coins" />
                <div className="flex items-end pb-2"><span className="text-pink-500 font-bold text-xl">=</span></div>
                <StyledInput type="number" value={editValues.rupees} onChange={(e) => setEditValues({ ...editValues, rupees: e.target.value })} label="Rupees (₹)" />
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-pink-500">{ratio.coins}</p>
                  <p className="text-xs opacity-50">Coins</p>
                </div>
                <div className="text-2xl text-pink-400 font-bold">=</div>
                <div className="text-center">
                  <p className="text-3xl font-black text-red-400">₹{ratio.rupees}</p>
                  <p className="text-xs opacity-50">Rupees</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {editMode ? (
                <>
                  <PrimaryBtn onClick={saveEdit} disabled={saving}>
                    <FaSave />
                    {saving ? "Saving..." : "Save"}
                  </PrimaryBtn>
                  <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl border border-pink-500/30 text-sm hover:bg-pink-500/10 transition">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <PrimaryBtn onClick={startEdit}>
                    <FaSave /> Edit
                  </PrimaryBtn>
                  <DeleteBtn onClick={deleteRatio} />
                </>
              )}
            </div>

            <p className="text-xs opacity-40 mt-4">Created: {new Date(ratio.createdAt).toLocaleString()}</p>
          </Card>
        </div>
      )}

      {!ratio && <EmptyState label="No conversion ratio set yet." />}
    </div>
  );
};

// ─────────────────────────────────────────────
// 3. COIN DEDUCTION RULES
// ─────────────────────────────────────────────
const CoinDeduction = ({ darkMode }) => {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ type: "audio", duration: "30", coins: "" });
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${COIN_API}/coindeductionrules`);
      setRules(res.data.rules || []);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchRules(); }, []);

  const createRule = async () => {
    if (!form.coins) return;
    try {
      setLoading(true);
      await axios.post(`${COIN_API}/coindeductionrule`, {
        type: form.type,
        duration: Number(form.duration),
        coins: Number(form.coins),
      });
      setForm({ type: "audio", duration: "30", coins: "" });
      fetchRules();
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const updateRule = async (id, updated) => {
    try {
      setSavingId(id);
      await axios.put(`${COIN_API}/update-coindeductionrule/${id}`, updated);
      fetchRules();
    } catch (err) { console.log(err); }
    finally { setSavingId(null); }
  };

  const deleteRule = async (id) => {
    if (!window.confirm("Delete this deduction rule?")) return;
    try {
      await axios.delete(`${COIN_API}/delete-coindeductionrule/${id}`);
      fetchRules();
    } catch (err) { console.log(err); }
  };

  // Group by type for display
  const audioRules = rules.filter((r) => r.type === "audio");
  const videoRules = rules.filter((r) => r.type === "video");

  return (
    <div>
      {/* CREATE */}
      <CreateCard darkMode={darkMode} title="Create Deduction Rule" icon={<FaClock />}>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-pink-400 mb-1 ml-1">Type</label>
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-pink-500/20" : "border-pink-200"}`}>
              {["audio", "video"].map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold capitalize transition
                    ${form.type === t
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                      : darkMode ? "text-white/50 hover:text-white/80" : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {t === "audio" ? <FaMicrophone /> : <FaVideo />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duration toggle */}
          <div>
            <label className="block text-xs font-semibold text-pink-400 mb-1 ml-1">Duration (min)</label>
            <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-pink-500/20" : "border-pink-200"}`}>
              {["30", "60"].map((d) => (
                <button
                  key={d}
                  onClick={() => setForm({ ...form, duration: d })}
                  className={`px-5 py-3 text-sm font-semibold transition
                    ${form.duration === d
                      ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                      : darkMode ? "text-white/50 hover:text-white/80" : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <StyledInput type="number" placeholder="Coins to deduct" value={form.coins} onChange={(e) => setForm({ ...form, coins: e.target.value })} label="Coins" />

          <PrimaryBtn onClick={createRule} disabled={loading}>
            <FaPlus />
            {loading ? "Creating..." : "Create"}
          </PrimaryBtn>
        </div>
      </CreateCard>

      {/* RULES GRID */}
      {rules.length > 0 && (
        <div className="space-y-8">
          {[{ label: "Audio Rules", icon: <FaMicrophone />, data: audioRules, color: "pink" },
            { label: "Video Rules", icon: <FaVideo />,       data: videoRules, color: "purple" }]
            .filter(g => g.data.length > 0)
            .map((group) => (
              <div key={group.label}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? "text-white/80" : "text-gray-700"}`}>
                  <span className="text-pink-500">{group.icon}</span>
                  {group.label}
                </h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {group.data.map((rule) => (
                    <DeductionCard key={rule._id} rule={rule} darkMode={darkMode} updateRule={updateRule} deleteRule={deleteRule} savingId={savingId} />
                  ))}
                </div>
              </div>
          ))}
        </div>
      )}

      {rules.length === 0 && <EmptyState label="No deduction rules configured yet." />}
    </div>
  );
};

const DeductionCard = ({ rule, darkMode, updateRule, deleteRule, savingId }) => {
  const [values, setValues] = useState({ type: rule.type, duration: String(rule.duration), coins: rule.coins });

  return (
    <Card darkMode={darkMode}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Badge color={rule.type === "audio" ? "pink" : "purple"}>
            {rule.type === "audio" ? <><FaMicrophone className="inline mr-1" />{rule.type}</> : <><FaVideo className="inline mr-1" />{rule.type}</>}
          </Badge>
          <Badge color="blue">{rule.duration} min</Badge>
        </div>
        <FaCoins className="text-pink-500" />
      </div>

      {/* Type */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-pink-400 mb-1">Type</label>
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-pink-500/20" : "border-pink-200"}`}>
          {["audio", "video"].map((t) => (
            <button
              key={t}
              onClick={() => setValues({ ...values, type: t })}
              className={`flex-1 py-2 text-xs font-semibold capitalize transition
                ${values.type === t
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : darkMode ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-pink-400 mb-1">Duration</label>
        <div className={`flex rounded-xl overflow-hidden border ${darkMode ? "border-pink-500/20" : "border-pink-200"}`}>
          {["30", "60"].map((d) => (
            <button
              key={d}
              onClick={() => setValues({ ...values, duration: d })}
              className={`flex-1 py-2 text-xs font-semibold transition
                ${values.duration === d
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white"
                  : darkMode ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-700"
                }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Coins */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-pink-400 mb-1">Coins to Deduct</label>
        <input
          type="number"
          value={values.coins}
          onChange={(e) => setValues({ ...values, coins: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-pink-200/30 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => updateRule(rule._id, { type: values.type, duration: Number(values.duration), coins: Number(values.coins) })}
          disabled={savingId === rule._id}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-pink-500 to-red-500 hover:scale-105 transition disabled:opacity-50"
        >
          <FaSave />
          {savingId === rule._id ? "Saving..." : "Update"}
        </button>
        <DeleteBtn onClick={() => deleteRule(rule._id)} />
      </div>

      <p className="text-xs opacity-40 mt-4">Created: {new Date(rule.createdAt).toLocaleString()}</p>
    </Card>
  );
};

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
const EmptyState = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-40">
    <FaCoins className="text-4xl text-pink-500 mb-3" />
    <p className="text-sm">{label}</p>
  </div>
);

export default CoinManagement;