import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  LogOut, BookOpen, User, Book, GraduationCap, PenTool,
  LayoutDashboard, BrainCircuit, PlaySquare, LineChart,
  Home, Menu, X, ChevronRight
} from "lucide-react";

type Role = "student" | "teacher" | "parent" | "admin";

function getLinks(role: Role) {
  switch (role) {
    case "student": return [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/courses", label: "My Courses", icon: Book },
      { href: "/student/tests", label: "Assessments", icon: PenTool },
      { href: "/student/results", label: "Results", icon: GraduationCap },
      { href: "/student/live-classes", label: "Live Classes", icon: PlaySquare },
      { href: "/student/discussions", label: "Discussions", icon: BookOpen },
    ];
    case "teacher": return [
      { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
      { href: "/teacher/courses", label: "Courses", icon: Book },
      { href: "/teacher/tests", label: "Tests", icon: PenTool },
      { href: "/teacher/live-classes", label: "Live Classes", icon: PlaySquare },
      { href: "/teacher/students", label: "Students", icon: User },
      { href: "/teacher/analytics", label: "Analytics", icon: LineChart },
    ];
    case "parent": return [
      { href: "/parent", label: "Dashboard", icon: LayoutDashboard },
      { href: "/parent/children", label: "Children", icon: User },
      { href: "/parent/reports", label: "Reports", icon: LineChart },
    ];
    case "admin": return [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: User },
      { href: "/admin/courses", label: "Courses", icon: Book },
      { href: "/admin/analytics", label: "Analytics", icon: LineChart },
    ];
    default: return [];
  }
}

function NavLinks({ role, location, onClick }: { role: Role; location: string; onClick?: () => void }) {
  const links = getLinks(role);
  return (
    <>
      {links.map((link) => {
        const active = location === link.href || (link.href !== `/${role}` && location.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-white/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {link.label}
            {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
          </Link>
        );
      })}
    </>
  );
}

export function DashboardLayout({ children, role }: { children: React.ReactNode; role: Role }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const Sidebar = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight font-outfit text-white">
          <BrainCircuit className="text-primary w-7 h-7" />
          ALIS
        </div>
        <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">
          {roleLabel} Portal
        </p>
      </div>

      {/* Home link */}
      <div className="px-4 mb-2">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/65 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      <div className="px-4 mb-3">
        <div className="h-px bg-white/10" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        <NavLinks role={role} location={location} onClick={onLinkClick} />
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/25 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/65 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/75 hover:text-white hover:bg-white/10 gap-2 text-xs"
          onClick={() => logout()}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-sidebar text-sidebar-foreground hidden md:flex flex-col shrink-0 border-r border-white/5">
        <Sidebar />
      </aside>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-60 bg-sidebar z-50 md:hidden shadow-2xl"
            >
              <Sidebar onLinkClick={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 md:hidden shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 font-bold text-lg font-outfit text-primary">
            <BrainCircuit className="w-5 h-5" />
            ALIS
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
              <Home className="w-4 h-4" />
            </Link>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Header bar */}
        <header className="hidden md:flex h-12 border-b border-border bg-background items-center justify-between px-6 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize font-medium text-foreground">{roleLabel} Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="capitalize">{location.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Home className="w-3.5 h-3.5" />
                Home
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-background text-foreground">
          <div className="p-5 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
