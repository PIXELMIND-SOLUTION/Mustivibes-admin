import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
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

  const [form, setForm] = useState({
    coins: "",
    price: "",
  });

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

  useEffect(() => {
    fetchPackages();
  }, []);

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
    try {
      if (!form.coins || !form.price) return alert("Fill required fields");

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
    const header = ["Coins", "Price", "Original Price", "Active"];

    const rows = packages.map((p) => [
      p.coins,
      p.price,
      p.isActive ? "Yes" : "No",
    ]);

    let csv =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "coin-packages.csv";
    link.click();
  };

  // TOGGLE ACTIVE
  const toggleActive = async (pkg) => {
    await axios.put(`${API}/${pkg._id}`, {
      isActive: !pkg.isActive,
    });
    fetchPackages();
  };

  return (
    <div
      className={`min-h-screen p-6 transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          💰 Coin Packages
        </h1>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
              darkMode
                ? "bg-indigo-500 hover:bg-indigo-400"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <FaDownload />
            Export
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setForm({ coins: "", price: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            <FaPlus />
            Add Package
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search by coins or price..."
        className={`w-full mb-6 px-4 py-3 rounded-xl border outline-none focus:ring-2 transition ${
          darkMode
            ? "bg-gray-900 border-gray-700 placeholder-gray-400 focus:ring-indigo-500"
            : "bg-white border-gray-300 focus:ring-indigo-500"
        }`}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div
        className={`overflow-auto rounded-2xl shadow-2xl border ${
          darkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <table className="w-full">
          <thead
            className={`${
              darkMode ? "bg-gray-800" : "bg-indigo-600 text-white"
            }`}
          >
            <tr>
              <th className="p-4">Coins</th>
              <th className="text-center">Price</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-8">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8">
                  No Packages Found
                </td>
              </tr>
            ) : (
              data.map((pkg) => (
                <tr
                  key={pkg._id}
                  className={`border-b transition ${
                    darkMode
                      ? "border-gray-800 hover:bg-gray-800"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  <td className="text-center p-8 p-4 font-semibold">{pkg.coins}</td>
                  <td className="text-center p-8">₹{pkg.price}</td>

                  <td className="text-center p-8">
                    <button
                    //   onClick={() => toggleActive(pkg)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        pkg.isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="flex gap-4 justify-center items-center p-3">
                    <FaEdit
                      className="cursor-pointer text-indigo-500 hover:scale-125 transition"
                      onClick={() => {
                        setEditing(pkg);
                        setForm(pkg);
                        setShowModal(true);
                      }}
                    />

                    <FaTrash
                      className="cursor-pointer text-red-500 hover:scale-125 transition"
                      onClick={() => handleDelete(pkg._id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40"
        >
          <FaChevronLeft />
        </button>

        <span className="font-semibold">
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-40"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl w-[400px] shadow-2xl space-y-4 ${
              darkMode ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-bold">
              {editing ? "Edit Package" : "Create Package"}
            </h2>

            <input
              placeholder="Coins"
              value={form.coins}
              onChange={(e) =>
                setForm({ ...form, coins: e.target.value })
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              }`}
            />

            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className={`w-full p-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "border-gray-300"
              }`}
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
              >
                Save
              </button>

              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-3 rounded-xl ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-300"
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
