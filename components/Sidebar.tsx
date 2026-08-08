"use client";

import {
  Menu,
  BarChart3,
  Users,

  LogOut,
  Shield,
  UserCog,
  Building2,
  Package,
  Receipt,
  ShoppingCart,
  Inbox,
  DollarSign,
  ChevronLeft,
  List,
  Banknote,
  Home,
  User,
  UserRoundCheck,
} from "lucide-react";


import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";



export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("Sidebar: Fetching session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Sidebar: Session result:", { session, sessionError });

      if (session?.user) {
        console.log("Sidebar: Fetching profile for user:", session.user.id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("name, role")
          .eq("id", session.user.id)
          .maybeSingle();

        console.log("Sidebar: Profile result:", { profile, profileError });

        if (profile) {
          setUserProfile(profile);
          const role = profile.role?.toLowerCase() || "";
          setIsAdmin(["admin", "manager"].includes(role));
        } else {
          console.warn("Sidebar: Profile not found for ID:", session.user.id);
          setUserProfile({ name: session.user.email?.split('@')[0], role: "Guest" });
        }
      } else {
        console.log("Sidebar: No session found");
      }
    };
    fetchProfile();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem('sb-xwvmbgtkrojsqomjlelm-auth-token');
    router.push("/");
  };

  const navItems = [

    { id: "dashboard", label: "Dashboard", Icon: Home, href: "/dashboard" },
    { id: "customer", label: "Customer", Icon: UserRoundCheck, href: "/dashboard/customer" },
    { id: "site", label: "Sites", Icon: Building2, href: "/dashboard/site" },
    { id: "user", label: "Users", Icon: Users, href: "/dashboard/users" },

  ];

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out border-r border-indigo-100 bg-gradient-to-br from-[#ffffff]/90 via-[#f3f0ff]/100 to-[#dbeafe]/100 text-gray-700 p-3 z-[100]
  ${collapsed ? "w-20 overflow-visible" : "w-70"}`}
    >
      {/* ===== SIDEBAR HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`font-semibold text-black transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
          {collapsed ? "" : "Business Management"}
        </h2>

        {collapsed && (
          <div className="flex justify-center w-full">
            <Building2 size={24} className="text-indigo-700" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl bg-white/60 hover:bg-white/90 text-indigo-700 border border-indigo-100 shadow-sm transition-all duration-200"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>


      {/* ===== NAVIGATION ===== */}
      <nav
        className={`flex-1 no-scrollbar ${collapsed ? "overflow-visible" : "overflow-y-auto"
          }`}
      >
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.id} className="group relative overflow-visible">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3.5 rounded-xl
              transition-all duration-200 group/link
              ${isActive
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm"
                      : "text-slate-700 hover:bg-white/70 hover:text-indigo-700"
                    }`}
                >
                  <item.Icon
                    size={20}
                    className={`shrink-0 transition-colors ${isActive
                      ? "text-indigo-700"
                      : "text-slate-500 group-hover/link:text-indigo-600"
                      }`}
                  />

                  {!collapsed && (
                    <span
                      className={`font-medium text-sm transition-colors ${isActive
                        ? "text-indigo-800 font-semibold"
                        : "text-slate-700 group-hover/link:text-indigo-700"
                        }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>

                {/* ===== COLLAPSED TOOLTIP ===== */}
                {collapsed && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-4
              px-2.5 py-1.5
              bg-slate-800
              text-white
              text-[13px]
              font-semibold
              rounded-lg
              opacity-0
              pointer-events-none
              group-hover:opacity-100
              transition-all duration-200
              z-[110]
              whitespace-nowrap
              shadow-xl
              border border-slate-700"
                  >
                    {item.label}

                    {/* Tooltip Arrow */}
                    <div
                      className="absolute top-1/2 -left-1
                -translate-y-1/2
                w-2 h-2
                bg-slate-800
                rotate-45
                border-l border-b border-slate-700"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>


      {/* ===== USER SECTION ===== */}
      <div className="mt-auto border-t border-indigo-100 pt-4 space-y-2">

        <div
          onClick={() => setShowLogout(!showLogout)}
          className={`flex items-center gap-3 p-2.5 rounded-2xl
      bg-white/60
      hover:bg-white/90
      border border-white/70
      shadow-sm
      transition-all duration-200
      cursor-pointer
      group
      relative
      ${collapsed ? "justify-center" : ""}`}
        >

          {/* User Avatar */}
          <div
            className="w-10 h-10 rounded-full
      bg-indigo-600
      flex items-center justify-center
      font-bold
      text-white
      shadow-md
      shrink-0
      border border-indigo-200"
          >
            {userProfile?.name?.charAt(0).toUpperCase() || "U"}
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {userProfile?.name || "Loading..."}
              </span>

              <span className="text-xs text-indigo-600 truncate font-medium">
                {userProfile?.role || "User"}
              </span>
            </div>
          )}

          {/* Collapsed Profile Tooltip */}
          {collapsed && (
            <div
              className="absolute left-full top-1/2
        -translate-y-1/2 ml-4
        px-2.5 py-1.5
        bg-slate-800
        text-white
        text-[11px]
        font-medium
        rounded-lg
        opacity-0
        pointer-events-none
        group-hover:opacity-100
        transition-all duration-200
        z-[110]
        whitespace-nowrap
        shadow-xl
        border border-slate-700"
            >
              Profile

              <div
                className="absolute top-1/2 -left-1
          -translate-y-1/2
          w-2 h-2
          bg-slate-800
          rotate-45
          border-l border-b border-slate-700"
              />
            </div>
          )}
        </div>


        {/* ===== LOGOUT BUTTON ===== */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showLogout
            ? "max-h-24 opacity-100"
            : "max-h-0 opacity-0"
            }`}
        >
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className={`w-full flex items-center gap-3
        p-3 rounded-xl
        text-red-600
        bg-red-50
        hover:bg-red-100
        border border-red-100
        transition-all duration-200
        font-medium text-sm
        ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />

            {!collapsed && (
              <span className="font-semibold">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>


      {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">

          {/* Backdrop */}
          <div
            className="absolute inset-0
      bg-slate-950/40
      backdrop-blur-[6px]
      transition-opacity
      animate-in fade-in duration-300"
            onClick={() => setIsLogoutDialogOpen(false)}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-sm
      transform overflow-hidden
      rounded-3xl
      bg-white
      p-4
      text-left
      align-middle
      shadow-2xl
      border border-slate-200
      transition-all
      animate-in zoom-in-95 duration-200"
          >

            <div className="flex flex-col items-center text-center space-y-4">

              {/* Logout Icon */}
              <div
                className="flex h-16 w-16
          items-center justify-center
          rounded-2xl
          bg-red-50
          text-red-500"
              >
                <LogOut size={32} strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Logout Confirmation
                </h3>

                <p className="text-slate-500 text-sm m-0 leading-relaxed">
                  Are you sure you want to end your current session?
                  You'll need to sign in again to access the dashboard.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex w-full gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="flex-1
            p-2.5
            rounded-xl
            font-semibold
            cursor-pointer
            text-sm
            bg-white
            border border-slate-200
            text-slate-700
            transition-all
            hover:bg-slate-50
            hover:border-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="flex-1
            rounded-xl
            px-4 py-3
            text-sm
            font-semibold
            text-white
            bg-red-500
            hover:bg-red-600
            shadow-lg
            shadow-red-500/20
            transition-all duration-200"
                >
                  Confirm Logout
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
