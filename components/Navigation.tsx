"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  Menu, X, BarChart3, Upload, FileText, Settings, Shield, LogOut,
  CreditCard, TrendingUp, ChevronDown, User, Sun, Moon, MessageSquare
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navigation() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  if (!user) {
    return (
      <nav className="flex items-center gap-2">
        <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
        <Link href="/login" className="btn-ghost text-sm">Log In</Link>
        <Link href="/signup" className="btn-primary text-sm">Sign Up</Link>
        <button
          onClick={toggleTheme}
          className="ml-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </nav>
    );
  }

  const isPro = user.subscription?.status === "active" || user.subscription?.status === "trialing";

  const primaryNav = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/upload", label: "New Report", icon: Upload },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    ...(!isPro ? [{ href: "/pricing", label: "Upgrade", icon: CreditCard }] : []),
  ];

  const allMobileNav = [
    ...primaryNav,
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/support", label: "Support", icon: MessageSquare },
    ...(user.role === "ADMIN" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <>
      <nav className="hidden md:flex items-center gap-1">
        {primaryNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand-accent text-white"
                  : item.label === "Upgrade"
                    ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={toggleTheme}
          className="ml-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="ml-1 pl-2 border-l border-slate-200 dark:border-slate-700" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden lg:block max-w-[120px] truncate text-xs">{user.name || user.email}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-4 top-full mt-1 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-50 py-1 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                {isPro && (
                  <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent">
                    Pro
                  </span>
                )}
              </div>
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
              <Link
                href="/support"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Contact Support
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Shield className="h-4 w-4 text-slate-400" />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-1 md:hidden">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-lg md:hidden z-50">
          <div className="p-4 space-y-1">
            <div className="px-4 py-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name || user.email}</p>
              {isPro && (
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent">
                  Pro
                </span>
              )}
            </div>
            {allMobileNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-brand-accent text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
