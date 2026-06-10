import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, User, Book, GraduationCap, PenTool, LayoutDashboard, BrainCircuit, PlaySquare, CalendarDays, LineChart, Settings } from "lucide-react";

export function DashboardLayout({ children, role }: { children: React.ReactNode, role: "student" | "teacher" | "parent" | "admin" }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getLinks = () => {
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
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight font-outfit text-white">
            <BrainCircuit className="text-primary w-8 h-8" />
            ALIS
          </div>
          <p className="text-sidebar-accent-foreground text-xs font-medium uppercase tracking-wider mt-1 opacity-70">
            {role} Portal
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => {
            const active = location === link.href || (link.href !== `/${role}` && location.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-sidebar-accent-foreground hover:bg-sidebar-accent/10 hover:text-white'}`}>
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-accent-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-sidebar-accent-foreground hover:text-white hover:bg-sidebar-accent/10" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 md:hidden">
          <div className="font-bold text-xl font-outfit text-primary">ALIS</div>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
