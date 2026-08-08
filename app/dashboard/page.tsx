"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Users, Building2, UserCheck, TrendingUp, ArrowUpRight, Activity } from "lucide-react";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  iconBgClass: string;
  change: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Admin");
  const [stats, setStats] = useState({
    userCount: 0,
    siteCount: 0,
    customerCount: 0,
    brokerCount: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      setUserEmail(session.user.email ?? null);

      // Fetch profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.name) setUserName(profile.name);

      // Fetch user count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch site count (if table exists, otherwise 0)
      let siteCount = 0;
      try {
        const { count } = await supabase
          .from("sites")
          .select("*", { count: "exact", head: true });
        siteCount = count ?? 0;
      } catch {
        siteCount = 0;
      }

      // Fetch customer count from customers table
      let customerCount = 0;
      try {
        const { count } = await supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("type", "customer");
        customerCount = count ?? 0;
      } catch {
        customerCount = 0;
      }

      // Fetch broker count from customers table
      let brokerCount = 0;
      try {
        const { count } = await supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("type", "broker");
        brokerCount = count ?? 0;
      } catch {
        brokerCount = 0;
      }

      setStats({
        userCount: userCount ?? 0,
        siteCount,
        customerCount,
        brokerCount,
      });

      setLoading(false);
    };
    loadDashboard();
  }, [router]);

  const statCards: StatCard[] = [
    {
      label: "Total Users",
      value: stats.userCount,
      icon: Users,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-600",
      iconBgClass: "bg-blue-50 text-blue-600",
      change: "+12%",
    },
    {
      label: "Total Sites",
      value: stats.siteCount,
      icon: Building2,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500",
      iconBgClass: "bg-amber-50 text-amber-500",
      change: "+8%",
    },
    {
      label: "Total Customers",
      value: stats.customerCount,
      icon: UserCheck,
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500",
      iconBgClass: "bg-emerald-50 text-emerald-500",
      change: "+24%",
    },
    {
      label: "Total Brokers",
      value: stats.brokerCount,
      icon: Activity,
      colorClass: "text-violet-500",
      bgClass: "bg-violet-500",
      iconBgClass: "bg-violet-50 text-violet-500",
      change: "+5%",
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Here's what's happening with your construction projects today.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald-700 text-xs font-semibold">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default"
          >
            {/* Accent bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${card.bgClass} rounded-t-2xl`}
            />

            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBgClass}`}
              >
                <card.icon size={24} strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                <ArrowUpRight size={14} className="text-emerald-600" strokeWidth={2.5} />
                <span className="text-xs text-emerald-600 font-bold">
                  {card.change}
                </span>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-slate-800 text-3xl font-bold tracking-tight leading-none">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          Quick Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              title: "Manage Users",
              desc: "View and manage team accounts",
              href: "/dashboard/users",
              icon: Users,
              iconColor: "text-blue-600",
              iconBg: "bg-blue-50",
              hoverBorder: "hover:border-blue-200",
            },
            {
              title: "Payments",
              desc: "Track payment transactions",
              href: "/dashboard/payments",
              icon: TrendingUp,
              iconColor: "text-amber-500",
              iconBg: "bg-amber-50",
              hoverBorder: "hover:border-amber-200",
            },
            {
              title: "Accounting",
              desc: "Financial records & reports",
              href: "/dashboard/account",
              icon: Activity,
              iconColor: "text-emerald-500",
              iconBg: "bg-emerald-50",
              hoverBorder: "hover:border-emerald-200",
            },
          ].map((action) => (
            <a
              key={action.title}
              href={action.href}
              className={`block p-5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 ${action.hoverBorder} hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3.5 ${action.iconBg}`}
              >
                <action.icon
                  size={20}
                  className={action.iconColor}
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {action.desc}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
