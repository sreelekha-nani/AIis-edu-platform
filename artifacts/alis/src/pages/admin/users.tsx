import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, GraduationCap, BookOpen, User } from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  admin: { label: "Admin", color: "bg-red-100 text-red-700", icon: Shield },
  teacher: { label: "Teacher", color: "bg-purple-100 text-purple-700", icon: BookOpen },
  student: { label: "Student", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
  parent: { label: "Parent", color: "bg-green-100 text-green-700", icon: User },
};

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, isLoading } = useListUsers({});

  const filtered = (users ?? []).filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = (users ?? []).reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage all platform users</p>
        </div>

        {/* Role breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
            <Card
              key={role}
              className={`cursor-pointer hover:shadow-sm transition-all ${roleFilter === role ? "ring-2 ring-primary" : ""}`}
              onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <cfg.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-bold text-lg leading-none">{counts[role] ?? 0}</div>
                  <div className="text-xs text-muted-foreground">{cfg.label}s</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground shrink-0">
            {filtered.length} users
          </div>
        </div>

        {/* Users table */}
        {isLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-muted-foreground text-sm">No users found</p></CardContent></Card>
        ) : (
          <Card>
            <div className="divide-y">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-xs font-semibold text-muted-foreground bg-gray-50/80 rounded-t-xl">
                <div className="col-span-5">User</div>
                <div className="col-span-3 hidden sm:block">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2 hidden sm:block">Joined</div>
              </div>
              {filtered.map(u => {
                const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.student;
                return (
                  <div key={u.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-gray-50/60 transition-colors">
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate sm:hidden">{u.email}</p>
                      </div>
                    </div>
                    <div className="col-span-3 hidden sm:block">
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge className={`text-xs border-0 ${cfg.color}`}>{cfg.label}</Badge>
                    </div>
                    <div className="col-span-2 hidden sm:block">
                      <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
