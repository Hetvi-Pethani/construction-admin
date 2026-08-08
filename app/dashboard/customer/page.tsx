"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserPlus,
  Loader2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Printer,
  MapPin,
  Filter,
  Smartphone,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";

interface Customer {
  id: string;
  name: string;
  mobile: string;
  type: string;
  site_name: string | null;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  mobile: string;
  type: string;
  site_name: string;
}

const emptyForm: CustomerFormData = {
  name: "",
  mobile: "",
  type: "customer",
  site_name: "",
};

interface Site {
  id: string;
  name: string;
}

// Curated color palette for site name badges — each unique site gets a distinct color
const SITE_COLOR_PALETTE = [
  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", dot: "bg-pink-500" },
  { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", dot: "bg-lime-500" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", dot: "bg-fuchsia-500" },
];

function getSiteColor(siteName: string) {
  // Stable hash so the same site name always maps to the same color
  let hash = 0;
  for (let i = 0; i < siteName.length; i++) {
    hash = siteName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SITE_COLOR_PALETTE.length;
  return SITE_COLOR_PALETTE[index];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSite, setFilterSite] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Contact Picker Support
  const [isContactPickerSupported, setIsContactPickerSupported] = useState(false);

  // Sites list for dropdown
  const [sites, setSites] = useState<Site[]>([]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/site");
      const data = await res.json();
      if (Array.isArray(data)) setSites(data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterSite]);

  // Check if Contact Picker API is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      setIsContactPickerSupported(true);
    }
  }, []);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setForm({
      name: c.name ?? "",
      mobile: c.mobile ?? "",
      type: c.type ?? "customer",
      site_name: c.site_name ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingCustomer) {
        const body = {
          id: editingCustomer.id,
          name: form.name,
          mobile: form.mobile,
          type: form.type,
          site_name: form.site_name || null,
        };
        const res = await fetch("/api/customers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        toaster.create({ title: "Entry updated successfully", type: "success" });
      } else {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            site_name: form.site_name || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");
        toaster.create({ title: "Entry created successfully", type: "success" });
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toaster.create({ title: "Entry deleted successfully", type: "error" });
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err: any) {
      toaster.create({ title: "Error", description: err.message, type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handlePickContactForForm = async () => {
    if (!('contacts' in navigator)) return;

    try {
      const props = ['name', 'tel'];
      const opts = { multiple: false };

      // @ts-ignore: Web Contact Picker API types may not be fully available
      const contacts = await navigator.contacts.select(props, opts);

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];

        let newName = form.name;
        let newMobile = form.mobile;

        if (contact.name && contact.name.length > 0) {
          newName = contact.name[0];
        }

        if (contact.tel && contact.tel.length > 0) {
          // Clean phone number: remove non-digits and take last 10
          const rawPhone = contact.tel[0];
          newMobile = rawPhone.replace(/\D/g, "").slice(-10);
        }

        setForm(prev => ({
          ...prev,
          name: newName,
          mobile: newMobile
        }));

        if (newName || newMobile) {
          toaster.create({ title: "Contact info autofilled!", type: "success" });
        }
      }
    } catch (err: any) {
      console.error(err);
      // user closed picker or error occurred
    }
  };

  const handlePrint = () => {
    const printData = filteredCustomers;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const filterLabel = filterType === "all" ? "All Entries" : filterType === "customer" ? "Customers" : filterType === "broker" ? "Brokers" : "Investors";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filterLabel} List</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; }
          h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .subtitle { font-size: 13px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f1f5f9; text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) { background: #f8fafc; }
          .sr { color: #94a3b8; width: 40px; }
          @media print {
            body { padding: 15px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <h1>${filterLabel} List</h1>
        <p class="subtitle">Total: ${printData.length} entries &bull; Printed on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
        <table>
          <thead>
            <tr>
              <th class="sr">#</th>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Site Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${printData.map((c, i) => `
              <tr>
                <td class="sr">${i + 1}</td>
                <td>${c.name || "—"}</td>
                <td>${c.mobile || "—"}</td>
                <td>${c.site_name || "—"}</td>
                <td style="text-transform:capitalize">${c.type || "—"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesType = filterType === "all" || c.type === filterType;
    const matchesSite = filterSite === "all" || c.site_name === filterSite;
    return matchesType && matchesSite;
  });
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueTypes = Array.from(new Set(customers.map(c => c.type).filter(Boolean)));

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "broker":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "investor":
        return "bg-violet-50 text-violet-600 border-violet-100";
      default:
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full mb-6">

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">

          {/* Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:gap-3">

            {/* Type Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`
        w-full sm:w-auto
        pl-3 sm:pl-9
        pr-7 sm:pr-8
        py-2.5
        bg-white
        border
        rounded-xl
        text-xs sm:text-sm
        font-medium
        outline-none
        transition-all
        shadow-sm
        appearance-none
        cursor-pointer

        ${filterType !== "all"
                    ? "border-teal-300 text-teal-700 ring-2 ring-teal-100"
                    : "border-slate-200 text-slate-700"
                  }
      `}
              >
                <option value="all">All Types</option>

                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Site Filter */}
            <div className="relative w-full sm:w-auto">
              <MapPin
                size={14}
                className="
        hidden sm:block
        absolute left-3.5 top-1/2
        -translate-y-1/2
        text-slate-400
        pointer-events-none
      "
              />

              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className={`
        w-full sm:w-auto
        pl-3 sm:pl-9
        pr-7 sm:pr-8
        py-2.5
        bg-white
        border
        rounded-xl
        text-xs sm:text-sm
        font-medium
        outline-none
        transition-all
        shadow-sm
        appearance-none
        cursor-pointer

        ${filterSite !== "all"
                    ? "border-teal-300 text-teal-700 ring-2 ring-teal-100"
                    : "border-slate-200 text-slate-700"
                  }
      `}
              >
                <option value="all">All Sites</option>

                {sites.map((site) => (
                  <option key={site.id} value={site.name}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={filteredCustomers.length === 0}
            className="
      flex-1 md:flex-none
      flex items-center justify-center gap-1.5 sm:gap-2
      px-3 sm:px-5
      py-2.5
      bg-white
      border border-slate-200
      hover:bg-slate-50
      text-slate-700
      rounded-xl
      text-xs sm:text-sm
      font-semibold
      shadow-sm
      transition-all duration-200
      cursor-pointer
      disabled:opacity-50
      disabled:cursor-not-allowed
      whitespace-nowrap
    "
          >
            <Printer size={17} className="shrink-0" />
            <span>Print</span>
          </button>

          {/* Add Entry Button */}
          <button
            onClick={openCreate}
            className="
      flex-1 md:flex-none
      flex items-center justify-center gap-1.5 sm:gap-2
      px-3 sm:px-5
      py-2.5
      bg-indigo-600
      hover:bg-indigo-700
      text-white
      rounded-xl
      text-xs sm:text-sm
      font-semibold
      shadow-sm
      shadow-indigo-200
      transition-all duration-200
      cursor-pointer
      whitespace-nowrap
    "
          >
            <Plus size={17} className="shrink-0" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>


      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={28} className="text-teal-500 animate-spin mx-auto" />
            <p className="text-slate-400 mt-3 text-sm">Loading data...</p>
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="py-16 text-center">
            <UserPlus size={40} className="text-slate-300 mx-auto" />
            <p className="text-slate-400 mt-3 text-sm">No entries found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Name", "Mobile", "Site Name", "Type", "Created", "Actions"].map((h) => (
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
                  {paginatedCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm shrink-0">
                            {c.name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {c.name || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="px-5 py-3.5 text-sm">
                        {c.mobile ? (
                          <a
                            href={`https://wa.me/91${c.mobile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 -ml-2 rounded-lg font-semibold transition-colors"
                            title="Open in WhatsApp"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {c.mobile}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Site Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {c.site_name ? (() => {
                          const color = getSiteColor(c.site_name);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                              <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                              {c.site_name}
                            </span>
                          );
                        })() : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-sm font-semibold capitalize border ${getTypeBadge(c.type)}`}
                        >
                          {c.type}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Edit2 size={14} className="text-blue-500" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c)}
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

            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="divide-y divide-slate-100">
                {paginatedCustomers.map((c) => (
                  <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold text-base shrink-0">
                          {c.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-800">{c.name || "—"}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(c.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Site</p>
                        {c.site_name ? (() => {
                          const color = getSiteColor(c.site_name);
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                              <span className="truncate max-w-[100px]">{c.site_name}</span>
                            </span>
                          );
                        })() : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">

                      {/* Mobile */}
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Mobile
                        </p>

                        {c.mobile ? (
                          <a
                            href={`https://wa.me/91${c.mobile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {c.mobile}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </div>

                      {/* Type - Right End */}
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Type
                        </p>

                        <span
                          className={`
        px-2.5 py-1
        rounded-lg
        text-[11px]
        font-bold
        capitalize
        border
        shrink-0
        whitespace-nowrap 
        ${getTypeBadge(c.type)}
      `}
                        >
                          {c.type}
                        </span>
                      </div>

                    </div>

                    <div className="flex items-center justify-end gap-1.5 w-full">
                      <button
                        onClick={() => openEdit(c)}
                        className="
      w-8 h-8 shrink-0
      rounded-lg
      border border-slate-200
      bg-white
      hover:bg-blue-50
      text-slate-500
      hover:text-blue-600
      hover:border-blue-200
      flex items-center justify-center
      transition-all
      shadow-sm
    "
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => setDeleteConfirm(c)}
                        className="
      w-8 h-8 shrink-0
      rounded-lg
      border border-slate-200
      bg-white
      hover:bg-red-50
      text-slate-500
      hover:text-red-600
      hover:border-red-200
      flex items-center justify-center
      transition-all
      shadow-sm
    "
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/30">
                <div className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-medium text-slate-700">{filteredCustomers.length}</span> entries
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-3 py-1 text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========== CREATE / EDIT MODAL ========== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal — bottom sheet on mobile, centered on desktop */}
          <div className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-7 max-h-[92vh] md:max-h-[90vh] overflow-y-auto md:mx-4">
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 md:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {editingCustomer ? "Edit Entry" : "Add New Entry"}
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

              {/* Contact Picker Button */}
              {isContactPickerSupported && !editingCustomer && (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={handlePickContactForForm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Smartphone size={16} />
                    Pick from Phone Contacts
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-1.5">
                    Automatically fill Name and Mobile Number
                  </p>
                </div>
              )}

              {/* Name & Mobile — stacked on mobile, side-by-side on larger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setForm({
                        ...form,
                        mobile: value,
                      });
                    }}
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    placeholder="Enter 10 digit mobile number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>

              </div>

              {/* Type & Site — stacked on mobile, side-by-side on larger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">
                    Type *
                  </label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Enter type (e.g. customer, broker)"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all"
                  />
                </div>

                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">
                    Site Name
                  </label>
                  <select
                    value={form.site_name}
                    onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.name}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

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
                  className="flex-1 py-2.5 rounded-xl border-none  bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  {editingCustomer ? "Update" : "Save"}
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

            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete {deleteConfirm.type === 'broker' ? 'Broker' : deleteConfirm.type === 'investor' ? 'Investor' : 'Customer'}</h3>
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
