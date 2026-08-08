"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Eye,
    EyeOff,
    UserPlus,
    Loader2,
} from "lucide-react";

interface Profile {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    status: string;
    created_at: string;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    mobile: string;
    role: string;
    status: string;
}

const emptyForm: UserFormData = {
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "user",
    status: "active",
};

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [form, setForm] = useState<UserFormData>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Profile | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(fetchUsers, 300);
        return () => clearTimeout(t);
    }, [fetchUsers]);

    const openCreate = () => {
        setEditingUser(null);
        setForm(emptyForm);
        setError("");
        setShowPassword(false);
        setModalOpen(true);
    };

    const openEdit = (u: Profile) => {
        setEditingUser(u);
        setForm({
            name: u.name ?? "",
            email: u.email ?? "",
            password: "",
            mobile: u.mobile ?? "",
            role: u.role ?? "user",
            status: u.status ?? "active",
        });
        setError("");
        setShowPassword(false);
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            if (editingUser) {
                const body: any = {
                    id: editingUser.id,
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    role: form.role,
                    status: form.status,
                };
                if (form.password.trim()) body.password = form.password;
                const res = await fetch("/api/users", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Update failed");
            } else {
                if (!form.password.trim()) {
                    setError("Password is required");
                    setSubmitting(false);
                    return;
                }
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Create failed");
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/users?id=${deleteConfirm.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed");
            setDeleteConfirm(null);
            fetchUsers();
        } catch {
            /* ignore */
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 w-full mb-5">

                {/* ===== SEARCH - START ===== */}
                <div className="flex items-center gap-2 w-full max-w-md">
                    <div className="relative w-full">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200" />
                    </div>
                </div>

                {/* ===== ADD USER - END ===== */}
                <button
                    onClick={openCreate}
                    className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all duration-200 cursor-pointer">
                    <Plus size={18} />
                    <span>Add User</span>
                </button>

            </div>



            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center">
                        <Loader2 size={28} className="text-indigo-500 animate-spin mx-auto" />
                        <p className="text-slate-400 mt-3 text-sm">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center">
                        <UserPlus size={40} className="text-slate-300 mx-auto" />
                        <p className="text-slate-400 mt-3 text-sm">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    {["Name", "Email", "Mobile", "Role", "Status", "Created", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                                    >
                                        {/* Name */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                                                    {u.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {u.name || "—"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-3.5 text-sm text-slate-500">
                                            {u.email}
                                        </td>

                                        {/* Mobile */}
                                        <td className="px-5 py-3.5 text-sm text-slate-500">
                                            {u.mobile || "—"}
                                        </td>

                                        {/* Role */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${u.role === "admin"
                                                    ? "bg-violet-50 text-violet-600 border-violet-100"
                                                    : "bg-blue-50 text-blue-600 border-blue-100"
                                                    }`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${u.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : "bg-red-50 text-red-500 border-red-100"
                                                    }`}
                                            >
                                                {u.status}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                                            {new Date(u.created_at).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    title="Edit"
                                                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Edit2 size={14} className="text-blue-500" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(u)}
                                                    title="Delete"
                                                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer"
                                                >
                                                    <Trash2 size={14} className="text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========== CREATE / EDIT MODAL ========== */}
            {modalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-7 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingUser ? "Edit User" : "Add New User"}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name & Mobile */}
                            <div className="grid grid-cols-2 gap-3">

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        required
                                        placeholder="Enter name"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Email *
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        required
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>

                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Password {editingUser ? "(leave empty to keep)" : "*"}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({ ...form, password: e.target.value })
                                            }
                                            placeholder={editingUser ? "••••••••" : "Min 6 characters"}
                                            className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={15} className="text-slate-400" />
                                            ) : (
                                                <Eye size={15} className="text-slate-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Mobile *
                                    </label>
                                    <input
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                        required
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>
                            {/* Role & Status */}

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                    Role
                                </label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {editingUser && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({ ...form, status: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}


                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl border-none bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={15} className="animate-spin" />}
                                    {editingUser ? "Update User" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========== DELETE CONFIRMATION MODAL ========== */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                        onClick={() => setDeleteConfirm(null)}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-7 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={26} className="text-red-500" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete User</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete{" "}
                            <strong className="text-slate-700">{deleteConfirm.name}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl border-none bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm shadow-red-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                            >
                                {deleting && <Loader2 size={15} className="animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
