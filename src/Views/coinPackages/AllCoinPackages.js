import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaCoins,
} from "react-icons/fa";

const API = "http://31.97.206.144:4050/api/packages";

const AdminCoinPackages = ({ darkMode }) => {
  const [packages, setPackages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ coins: "", price: "" });

  // FETCH
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API);
      setPackages(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  // SEARCH
  useEffect(() => {
    const f = packages.filter(
      (p) =>
        p.coins.toString().includes(search) ||
        p.price.toString().includes(search)
    );
    setFiltered(f);
    setPage(1);
  }, [search, packages]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const data = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // CREATE / UPDATE
  const handleSubmit = async () => {
    if (!form.coins || !form.price) return alert("Fill required fields");
    try {
      if (editing) {
        await axios.put(`${API}/${editing._id}`, form);
      } else {
        await axios.post(API, form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ coins: "", price: "" });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    await axios.delete(`${API}/${id}`);
    fetchPackages();
  };

  // EXPORT CSV
  const exportCSV = () => {
    const header = ["Coins", "Price", "Active"];
    const rows = packages.map((p) => [p.coins, p.price, p.isActive ? "Yes" : "No"]);
    let csv = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "coin-packages.csv";
    link.click();
  };

  const dm = darkMode;

  return (
    <div
      className={`relative min-h-screen p-6 md:p-10 transition-all duration-300 ${
        dm ? "bg-[#070707] text-white" : "bg-gradient-to-br from-pink-50 via-white to-red-100 text-gray-800"
      }`}
    >
      {/* GRID OVERLAY */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ff4d6d22 1px,transparent 1px),linear-gradient(90deg,#ff4d6d22 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              Coin Packages
            </h1>
            <p className={`text-sm mt-1 ${dm ? "text-white/40" : "text-gray-400"}`}>
              Manage all purchasable coin bundles
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={exportCSV}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition border
                ${dm
                  ? "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                  : "border-pink-300 text-pink-600 hover:bg-pink-50"
                }`}
            >
              <FaDownload />
              Export CSV
            </button>

            <button
              onClick={() => {
                setEditing(null);
                setForm({ coins: "", price: "" });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-pink-500 to-red-500
                hover:scale-105 transition shadow-[0_0_25px_rgba(255,0,90,.5)]"
            >
              <FaPlus />
              Add Package
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-8">
          <input
            placeholder="Search by coins or price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-pink-500 transition pr-12
              ${dm
                ? "bg-[#111]/80 border-pink-500/20 placeholder-white/30 text-white"
                : "bg-white border-pink-200 placeholder-gray-400"
              }`}
          />
          <FaCoins className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500/50" />
        </div>

        {/* TABLE */}
        <div
          className={`overflow-auto rounded-3xl border backdrop-blur-xl
            ${dm
              ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_40px_rgba(255,0,90,.12)]"
              : "bg-white border-pink-200 shadow-xl"
            }`}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-pink-500/20">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-pink-500">#</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-pink-500">Coins</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-pink-500">Price</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-pink-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-pink-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 opacity-40">
                    <FaCoins className="inline text-2xl text-pink-500 animate-pulse mb-2" />
                    <p className="text-sm">Loading packages...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 opacity-40">
                    <FaCoins className="inline text-3xl text-pink-500 mb-3" />
                    <p className="text-sm">No packages found</p>
                  </td>
                </tr>
              ) : (
                data.map((pkg, idx) => (
                  <tr
                    key={pkg._id}
                    className={`border-b last:border-0 transition-all duration-200
                      ${dm
                        ? "border-pink-500/10 hover:bg-pink-500/5"
                        : "border-pink-100 hover:bg-pink-50"
                      }`}
                  >
                    {/* Index */}
                    <td className="px-6 py-4 text-sm opacity-40">
                      {(page - 1) * rowsPerPage + idx + 1}
                    </td>

                    {/* Coins */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-[0_0_12px_rgba(255,0,90,.4)]">
                          <FaCoins className="text-white text-xs" />
                        </div>
                        <span className="font-bold text-base">{pkg.coins}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-pink-400">₹{pkg.price}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pkg.isActive
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex gap-3 justify-center items-center">
                        <button
                          onClick={() => {
                            setEditing(pkg);
                            setForm(pkg);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-xl border border-pink-500/20 text-pink-400 hover:bg-pink-500/10 hover:scale-110 transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
                          className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:scale-110 transition"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition shadow-[0_0_15px_rgba(255,0,90,.4)]"
          >
            <FaChevronLeft />
          </button>

          <span className={`text-sm font-semibold px-4 py-2 rounded-xl border ${dm ? "border-pink-500/20 text-white/60" : "border-pink-200 text-gray-500"}`}>
            Page {page} / {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition shadow-[0_0_15px_rgba(255,0,90,.4)]"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={() => setShowModal(false)} />

          <div
            className={`relative p-8 rounded-3xl w-[420px] shadow-2xl space-y-5 border z-10
              ${dm
                ? "bg-[#0b0b0b] border-pink-500/20 shadow-[0_0_60px_rgba(255,0,90,.25)]"
                : "bg-white border-pink-200"
              }`}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,90,.5)]">
                <FaCoins className="text-white" />
              </div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                {editing ? "Edit Package" : "New Package"}
              </h2>
            </div>

            {/* Coins Input */}
            <div>
              <label className="block text-xs font-semibold text-pink-400 mb-1.5 ml-1">Coins</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={form.coins}
                onChange={(e) => setForm({ ...form, coins: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-500 outline-none transition
                  ${dm ? "bg-[#111] border-pink-500/20 text-white placeholder-white/20" : "border-pink-200 bg-white"}`}
              />
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-xs font-semibold text-pink-400 mb-1.5 ml-1">Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 49"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-500 outline-none transition
                  ${dm ? "bg-[#111] border-pink-500/20 text-white placeholder-white/20" : "border-pink-200 bg-white"}`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl text-white font-semibold
                  bg-gradient-to-r from-pink-500 to-red-500
                  hover:scale-105 transition shadow-[0_0_20px_rgba(255,0,90,.5)]"
              >
                {editing ? "Save Changes" : "Create"}
              </button>

              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-3 rounded-xl font-semibold transition border
                  ${dm
                    ? "border-pink-500/20 text-white/50 hover:bg-pink-500/10"
                    : "border-pink-200 text-gray-500 hover:bg-pink-50"
                  }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoinPackages;