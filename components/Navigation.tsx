"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X, BarChart3, Upload, FileText, Settings, Shield, LogOut, CreditCard } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) {
    return (
      <nav className="flex items-center gap-2">
        <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
        <Link href="/login" className="btn-ghost text-sm">Log In</Link>
        <Link href="/signup" className="btn-primary text-sm">Sign Up</Link>
      </nav>
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/pricing", label: "Pricing", icon: CreditCard },
  ];

  if (user.role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-brand-accent text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden lg:block">{user.email}</span>
          <button onClick={handleLogout} className="btn-ghost text-sm p-2" title="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
      <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg md:hidden z-50">
          <div className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-brand-accent text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
