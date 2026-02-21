import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaShieldAlt, FaPlus, FaEdit, FaTrash, FaSync, FaTimes,
  FaCheck, FaSave, FaExclamationTriangle, FaChevronDown,
  FaChevronUp, FaListUl, FaEye,
} from "react-icons/fa";

const BASE = "http://31.97.206.144:4055/api";

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <>
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold text-white
        ${type === "success" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-pink-600"}`}
      style={{ animation: "slideUp .25s ease" }}
    >
      {type === "success" ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
      {msg}
    </div>
  </>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel, dm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl
      ${dm ? "bg-[#111] border-pink-500/20" : "bg-white border-pink-100"}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-red-500/10">
          <FaExclamationTriangle className="text-red-400 text-base" />
        </div>
        <div>
          <p className={`font-bold text-base ${dm ? "text-white" : "text-gray-900"}`}>Delete Warning</p>
          <p className={`text-xs mt-0.5 ${dm ? "text-white/40" : "text-gray-500"}`}>This action cannot be undone.</p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02]
            ${dm ? "border-white/10 text-white/50 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-500 hover:text-gray-800"}`}>
          Cancel
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all">
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Warning Form Modal ───────────────────────────────────────────────────────
const WarningFormModal = ({ initial, onSave, onClose, dm }) => {
  const isEdit = !!initial;
  const [type, setType] = useState(initial?.type || "");
  const [descriptions, setDescriptions] = useState(
    initial?.description?.length ? initial.description : [""]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addDesc = () => setDescriptions((d) => [...d, ""]);
  const removeDesc = (i) => setDescriptions((d) => d.filter((_, idx) => idx !== i));
  const updateDesc = (i, val) =>
    setDescriptions((d) => d.map((v, idx) => (idx === i ? val : v)));

  const moveUp = (i) => {
    if (i === 0) return;
    setDescriptions((d) => {
      const arr = [...d];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr;
    });
  };
  const moveDown = (i) => {
    setDescriptions((d) => {
      if (i === d.length - 1) return d;
      const arr = [...d];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return arr;
    });
  };

  const handleSave = async () => {
    if (!type.trim()) { setError("Type is required."); return; }
    const filled = descriptions.filter((d) => d.trim());
    if (!filled.length) { setError("Add at least one description."); return; }
    setError("");
    setSaving(true);
    await onSave({ type: type.trim(), description: filled });
    setSaving(false);
  };

  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-pink-500 transition text-sm
    ${dm ? "bg-[#0a0a0a] border-pink-500/20 text-white placeholder-white/20"
         : "bg-gray-50 border-pink-200 text-gray-800 placeholder-gray-400"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh]
        ${dm ? "bg-[#111] border-pink-500/20" : "bg-white border-pink-100"}`}>

        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b flex-shrink-0
          ${dm ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${isEdit ? "from-amber-500 to-orange-500" : "from-pink-500 to-rose-500"}`}>
              {isEdit ? <FaEdit className="text-white text-sm" /> : <FaPlus className="text-white text-sm" />}
            </div>
            <div>
              <p className={`font-bold text-base ${dm ? "text-white" : "text-gray-900"}`}>
                {isEdit ? "Edit Warning" : "Create Warning"}
              </p>
              <p className={`text-xs ${dm ? "text-white/30" : "text-gray-400"}`}>
                {isEdit ? "Update the warning content" : "Add new warning guidelines"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className={`p-2 rounded-xl border transition-all hover:scale-110
              ${dm ? "border-white/10 text-white/30 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-400 hover:text-gray-700"}`}>
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Type */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2
              ${dm ? "text-white/40" : "text-gray-500"}`}>Warning Type</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. To avoid warnings"
              className={inputCls}
            />
          </div>

          {/* Descriptions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold uppercase tracking-widest ${dm ? "text-white/40" : "text-gray-500"}`}>
                Guidelines
              </label>
              <button onClick={addDesc}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 transition">
                <FaPlus style={{ fontSize: 9 }} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {descriptions.map((desc, i) => (
                <div key={i} className="flex items-start gap-2">
                  {/* Order Controls */}
                  <div className="flex flex-col gap-0.5 pt-2 flex-shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i === 0}
                      className={`p-1 rounded transition-all ${i === 0
                        ? dm ? "text-white/10 cursor-not-allowed" : "text-gray-200 cursor-not-allowed"
                        : dm ? "text-white/30 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
                      <FaChevronUp style={{ fontSize: 9 }} />
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i === descriptions.length - 1}
                      className={`p-1 rounded transition-all ${i === descriptions.length - 1
                        ? dm ? "text-white/10 cursor-not-allowed" : "text-gray-200 cursor-not-allowed"
                        : dm ? "text-white/30 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
                      <FaChevronDown style={{ fontSize: 9 }} />
                    </button>
                  </div>

                  {/* Number badge */}
                  <span className={`flex-shrink-0 mt-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                    bg-gradient-to-br from-pink-500 to-rose-500 text-white`}>
                    {i + 1}
                  </span>

                  <textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => updateDesc(i, e.target.value)}
                    placeholder={`Guideline ${i + 1}…`}
                    className={`${inputCls} resize-none flex-1`}
                  />

                  <button onClick={() => removeDesc(i)} disabled={descriptions.length === 1}
                    className={`flex-shrink-0 mt-2 p-2 rounded-xl border transition-all hover:scale-110
                      ${descriptions.length === 1
                        ? dm ? "border-white/5 text-white/10 cursor-not-allowed" : "border-gray-100 text-gray-200 cursor-not-allowed"
                        : dm ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-400 hover:bg-red-50"}`}>
                    <FaTrash style={{ fontSize: 10 }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <FaExclamationTriangle className="text-[10px]" /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={`flex gap-3 px-6 py-4 border-t flex-shrink-0 ${dm ? "border-white/5" : "border-gray-100"}`}>
          <button onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02]
              ${dm ? "border-white/10 text-white/50 hover:text-white" : "border-gray-200 text-gray-500 hover:text-gray-800"}`}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
            {saving ? (
              <><FaSync className="animate-spin text-xs" /> Saving…</>
            ) : (
              <><FaSave className="text-xs" /> {isEdit ? "Update" : "Create"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Warning Card ─────────────────────────────────────────────────────────────
const WarningCard = ({ warning, onEdit, onDelete, dm }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border transition-all duration-200 hover:scale-[1.005] hover:shadow-lg overflow-hidden
      ${dm ? "bg-[#0f0f0f] border-pink-500/20 hover:shadow-black/40" : "bg-white border-pink-100 hover:shadow-pink-100"}`}>

      {/* Card Header */}
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Icon */}
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/20 flex-shrink-0">
          <FaShieldAlt className="text-white text-sm" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base leading-tight ${dm ? "text-white" : "text-gray-900"}`}>
            {warning.type}
          </h3>
          <p className={`text-xs mt-1 ${dm ? "text-white/30" : "text-gray-400"}`}>
            {warning.description.length} guideline{warning.description.length !== 1 ? "s" : ""}
            {" · "}
            {new Date(warning.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setExpanded((v) => !v)}
            className={`p-2 rounded-xl border transition-all hover:scale-110
              ${dm ? "border-white/10 text-white/30 hover:text-white hover:border-white/20" : "border-gray-200 text-gray-400 hover:text-gray-700"}`}>
            {expanded ? <FaChevronUp className="text-xs" /> : <FaEye className="text-xs" />}
          </button>
          <button onClick={() => onEdit(warning)}
            className={`p-2 rounded-xl border transition-all hover:scale-110
              ${dm ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" : "border-amber-200 text-amber-500 hover:bg-amber-50"}`}>
            <FaEdit className="text-xs" />
          </button>
          <button onClick={() => onDelete(warning._id)}
            className={`p-2 rounded-xl border transition-all hover:scale-110
              ${dm ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-red-200 text-red-400 hover:bg-red-50"}`}>
            <FaTrash className="text-xs" />
          </button>
        </div>
      </div>

      {/* Expandable guidelines */}
      {expanded && (
        <div className={`border-t px-4 sm:px-5 py-4 ${dm ? "border-white/5" : "border-pink-50"}`}>
          <div className="flex items-center gap-2 mb-3">
            <FaListUl className={`text-xs ${dm ? "text-pink-400/60" : "text-pink-400"}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${dm ? "text-white/30" : "text-gray-400"}`}>
              Guidelines
            </span>
          </div>
          <div className="space-y-2">
            {warning.description.map((desc, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl
                ${dm ? "bg-white/[0.03]" : "bg-pink-50/60"}`}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className={`text-sm leading-relaxed ${dm ? "text-white/60" : "text-gray-600"}`}>
                  {/* strip leading "1." numbering if present */}
                  {desc.replace(/^\d+\.\s*/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ dm }) => (
  <div className={`rounded-2xl border p-5 animate-pulse ${dm ? "bg-[#0f0f0f] border-pink-500/10" : "bg-white border-pink-100"}`}>
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex-shrink-0 ${dm ? "bg-white/5" : "bg-gray-100"}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 rounded-full w-1/3 ${dm ? "bg-white/5" : "bg-gray-100"}`} />
        <div className={`h-3 rounded-full w-1/4 ${dm ? "bg-white/5" : "bg-gray-100"}`} />
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(i => (
          <div key={i} className={`w-8 h-8 rounded-xl ${dm ? "bg-white/5" : "bg-gray-100"}`} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd, dm }) => (
  <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border
    ${dm ? "border-pink-500/10 bg-[#0f0f0f]" : "border-pink-100 bg-white"}`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
      ${dm ? "bg-white/5" : "bg-pink-50"}`}>
      <FaShieldAlt className={`text-2xl ${dm ? "text-white/20" : "text-pink-300"}`} />
    </div>
    <p className={`font-bold text-base ${dm ? "text-white/30" : "text-gray-400"}`}>
      No warning content yet
    </p>
    <p className={`text-sm mt-1 mb-5 ${dm ? "text-white/15" : "text-gray-300"}`}>
      Create your first warning guideline to get started
    </p>
    <button onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-105 active:scale-95 transition-all">
      <FaPlus className="text-xs" /> Create Warning
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WarningFAQS = ({ darkMode }) => {
  const dm = darkMode;
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formModal, setFormModal] = useState(null); // null | "create" | warningObj
  const [deleteId, setDeleteId] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE}/getall-warnings`);
      // handle both array and {warnings: [...]} shapes
      const data = res.data?.warnings || res.data?.data || res.data;
      setWarnings(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to fetch warnings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (payload) => {
    try {
      await axios.post(`${BASE}/create-warning`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      showToast("Warning created successfully");
      setFormModal(null);
      fetchAll();
    } catch {
      showToast("Failed to create warning", "error");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await axios.put(`${BASE}/update-warning/${formModal._id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      showToast("Warning updated successfully");
      setFormModal(null);
      fetchAll();
    } catch {
      showToast("Failed to update warning", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE}/delete-warning/${deleteId}`);
      showToast("Warning deleted");
      setDeleteId(null);
      setWarnings((prev) => prev.filter((w) => w._id !== deleteId));
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm ? "bg-[#080808]" : "bg-gray-50"}`}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {deleteId && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          dm={dm}
        />
      )}
      {formModal !== null && (
        <WarningFormModal
          initial={typeof formModal === "object" && formModal !== "create" ? formModal : null}
          onSave={typeof formModal === "object" && formModal !== "create" ? handleUpdate : handleCreate}
          onClose={() => setFormModal(null)}
          dm={dm}
        />
      )}

      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/25">
                <FaShieldAlt className="text-white text-sm" />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${dm ? "text-white" : "text-gray-900"}`}>
                Warning{" "}
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  Content
                </span>
              </h1>
            </div>
            <p className={`text-sm ml-[52px] ${dm ? "text-white/30" : "text-gray-400"}`}>
              {loading ? "Loading…" : `${warnings.length} warning template${warnings.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={fetchAll}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:scale-105 active:scale-95
                ${dm ? "border-pink-500/20 text-white/50 hover:text-white hover:border-pink-500/40" : "border-pink-200 text-gray-500 hover:text-gray-800"}`}
            >
              <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setFormModal("create")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
            >
              <FaPlus className="text-xs" />
              <span>Create Warning</span>
            </button>
          </div>
        </div>

        {/* ── Divider with accent ── */}
        <div className={`flex items-center gap-3 mb-6`}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border
            ${dm ? "border-pink-500/20 text-pink-400/60" : "border-pink-200 text-pink-400"}`}>
            All Templates
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        </div>

        {/* ── Content ── */}
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} dm={dm} />)
          ) : warnings.length === 0 ? (
            <EmptyState onAdd={() => setFormModal("create")} dm={dm} />
          ) : (
            warnings.map((w) => (
              <WarningCard
                key={w._id}
                warning={w}
                onEdit={(w) => setFormModal(w)}
                onDelete={(id) => setDeleteId(id)}
                dm={dm}
              />
            ))
          )}
        </div>

        {/* ── Footer hint ── */}
        {!loading && warnings.length > 0 && (
          <p className={`text-center text-xs mt-8 ${dm ? "text-white/10" : "text-gray-300"}`}>
            Click the eye icon on any card to preview its guidelines
          </p>
        )}
      </div>
    </div>
  );
};

export default WarningFAQS;