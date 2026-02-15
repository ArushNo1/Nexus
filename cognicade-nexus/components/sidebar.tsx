"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Trophy,
  Gamepad2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TEACHER_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Classrooms", href: "/classrooms", icon: Users },
  { label: "My Lessons", href: "/lessons", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Students", href: "/students", icon: Users },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Game Library", href: "/library", icon: Gamepad2 },
];

const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Classrooms", href: "/classrooms", icon: Users },
  { label: "Assigned Lessons", href: "/lessons", icon: BookOpen },
  { label: "My Progress", href: "/progress", icon: Target },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Game Library", href: "/library", icon: Gamepad2 },
];

const BOTTOM_ITEMS = [{ label: "Settings", href: "/settings", icon: Settings }];

// Skeleton placeholders shown while auth loads
const SKELETON_NAV_COUNT = 6;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setUserRole(profile.role);
        }
      }
      setReady(true);
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        collapsed ? "5rem" : "16rem",
      );
    }
  }, [collapsed]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const navItems =
    userRole === "teacher" ? TEACHER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed left-0 top-0 h-screen bg-[var(--sidebar-bg)] border-r-4 border-[var(--sidebar-border)] flex flex-col transition-all duration-300 z-50 shadow-2xl ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 200px, 200px 40px',
      }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b-2 border-[var(--sidebar-border)] flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-3">
          <img
            src="/NEXUSLOGO.png"
            alt="Nexus"
            className="w-10 h-10 object-contain"
          />
          {!collapsed && (
            <span className="text-xl text-[var(--sidebar-text)] font-serif-display">Nexus</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            aria-expanded="true"
            className="text-slate-400 hover:text-[var(--sidebar-text)] transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Expand Button (when collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          aria-expanded="false"
          className="absolute -right-3 top-24 bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-text)] rounded-full p-1 shadow-lg transition-all border-2 border-[var(--sidebar-border)]"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {!ready ? (
        <>
          {/* Skeleton user card */}
          {!collapsed && (
            <div className="mx-4 mt-4 p-4 bg-[var(--sidebar-border-faint)] border border-[var(--sidebar-border)] rounded-xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/5 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-white/5 rounded w-24 mb-2" />
                  <div className="h-2 bg-white/5 rounded w-14" />
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full" />
            </div>
          )}
          {/* Skeleton nav items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {Array.from({ length: SKELETON_NAV_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg animate-pulse"
                >
                  <div className="w-5 h-5 bg-white/5 rounded" />
                  {!collapsed && (
                    <div className="h-3 bg-white/5 rounded w-28" />
                  )}
                </div>
              ))}
            </div>
          </nav>
          {/* Skeleton bottom */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
              <div className="w-5 h-5 bg-white/5 rounded" />
              {!collapsed && <div className="h-3 bg-white/5 rounded w-20" />}
            </div>
            <div className="flex items-center gap-3 px-3 py-3 animate-pulse">
              <div className="w-5 h-5 bg-white/5 rounded" />
              {!collapsed && <div className="h-3 bg-white/5 rounded w-16" />}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* User Stats Card */}
          {!collapsed && userProfile && (
            <div className="mx-4 mt-4 p-4 bg-[var(--sidebar-border-faint)] border border-[var(--sidebar-border)] rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[var(--sidebar-text)] font-bold font-sans-clean border-2 border-[var(--sidebar-active-border)]">
                  {userProfile.full_name
                    ? userProfile.full_name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : userRole === "teacher"
                      ? "ED"
                      : "ST"}
                </div>
                <div>
                  <div className="text-[var(--sidebar-text)] font-bold text-sm font-sans-clean">
                    {userProfile.full_name ||
                      (userRole === "teacher" ? "Educator" : "Student")}
                  </div>
                  <div className="text-[var(--sidebar-text-tertiary)] text-xs font-sans-clean capitalize">
                    {userRole}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[var(--progress-icon)]" />
                <div className="flex-1 bg-[var(--progress-bg)] rounded-full h-2 overflow-hidden border border-[var(--sidebar-border)]">
                  <div className="bg-gradient-to-r from-[var(--progress-from)] to-[var(--progress-to)] h-full w-3/4"></div>
                </div>
                <span className="text-xs text-[var(--sidebar-text-tertiary)] font-sans-clean">
                  75%
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                    <div
                      className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--sidebar-border)] text-[var(--sidebar-text)] border border-[var(--sidebar-active-border)] shadow-lg"
                          : "text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-border-faint)] hover:text-[var(--sidebar-text)]"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={
                          isActive
                            ? "text-[var(--sidebar-text)]"
                            : "text-[var(--sidebar-text-secondary)] group-hover:text-[var(--sidebar-text)]"
                        }
                      />
                      {!collapsed && (
                        <span className="text-sm font-medium font-sans-clean">
                          {item.label}
                        </span>
                      )}
                      {isActive && !collapsed && (
                        <div className="ml-auto w-1.5 h-1.5 bg-[var(--sidebar-text)] rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t-2 border-[var(--sidebar-border)] p-3">
            {BOTTOM_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                  <div
                    className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer mb-2 ${
                      isActive
                        ? "bg-[var(--sidebar-border)] text-[var(--sidebar-text)]"
                        : "text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-border-faint)] hover:text-[var(--sidebar-text)]"
                    }`}
                  >
                    <Icon size={20} />
                    {!collapsed && (
                      <span className="text-sm font-medium font-sans-clean">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="w-full group flex items-center gap-3 px-3 py-3 rounded-lg text-red-300 hover:bg-red-900/20 transition-all border border-transparent hover:border-red-900/50"
            >
              <LogOut size={20} />
              {!collapsed && (
                <span className="text-sm font-medium font-sans-clean">
                  Logout
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
