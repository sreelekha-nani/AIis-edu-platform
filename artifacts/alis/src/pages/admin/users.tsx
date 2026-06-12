import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListUsers, useUpdateUser, useDeleteUser, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Search, Shield, GraduationCap, BookOpen, User, Plus, Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  admin:   { label: "Admin",   color: "bg-destructive/10 text-destructive",    icon: Shield },
  teacher: { label: "Teacher", color: "bg-purple-500/10 text-purple-600", icon: BookOpen },
  student: { label: "Student", color: "bg-primary/10 text-primary",  icon: GraduationCap },
  parent:  { label: "Parent",  color: "bg-green-500/10 text-green-600", icon: User },
};

const ROLES = ["student", "teacher", "parent", "admin"] as const;
type Role = typeof ROLES[number];

interface CreateForm { name: string; email: string; password: string; role: Role; grade: string; subject: string; }
interface EditForm { name: string; role: Role; grade: string; subject: string; }

function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const register = useRegister();
  const qc = useQueryClient();
  const [form, setForm] = useState<CreateForm>({ name: "", email: "", password: "", role: "student", grade: "", subject: "" });

  const set = (k: keyof CreateForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Name, email and password are required"); return;
    }
    register.mutate(
      { data: { name: form.name, email: form.email, password: form.password, role: form.role as any } },
      {
        onSuccess: () => {
          qc.invalidateQueries();
          toast.success(`${ROLE_CONFIG[form.role].label} account created!`);
          setForm({ name: "", email: "", password: "", role: "student", grade: "", subject: "" });
          onClose();
        },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? "Failed to create user"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Full Name</Label>
              <Input placeholder="Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email</Label>
              <Input placeholder="jane@alis.edu" type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Password</Label>
              <Input placeholder="Temporary password" type="password" value={form.password} onChange={e => set("password", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.role === "student" && (
              <div className="space-y-1.5">
                <Label>Grade (optional)</Label>
                <Input placeholder="e.g. Grade 10" value={form.grade} onChange={e => set("grade", e.target.value)} />
              </div>
            )}
            {form.role === "teacher" && (
              <div className="space-y-1.5">
                <Label>Subject (optional)</Label>
                <Input placeholder="e.g. Mathematics" value={form.subject} onChange={e => set("subject", e.target.value)} />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={register.isPending}>
            {register.isPending ? "Creating…" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user, open, onClose }: { user: any; open: boolean; onClose: () => void }) {
  const updateUser = useUpdateUser();
  const qc = useQueryClient();
  const [form, setForm] = useState<EditForm>({
    name: user.name,
    role: user.role as Role,
    grade: user.grade ?? "",
    subject: user.subject ?? "",
  });

  const set = (k: keyof EditForm, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    updateUser.mutate(
      { id: user.id, data: { name: form.name, role: form.role, grade: form.grade || undefined, subject: form.subject || undefined } },
      {
        onSuccess: () => { qc.invalidateQueries(); toast.success("User updated!"); onClose(); },
        onError: () => toast.error("Failed to update user"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User — {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => set("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {(form.role === "student") && (
            <div className="space-y-1.5">
              <Label>Grade</Label>
              <Input placeholder="e.g. Grade 10" value={form.grade} onChange={e => set("grade", e.target.value)} />
            </div>
          )}
          {(form.role === "teacher") && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input placeholder="e.g. Mathematics" value={form.subject} onChange={e => set("subject", e.target.value)} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">Email: {user.email} · Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateUser.isPending}>
            {updateUser.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const { data: users, isLoading } = useListUsers({});
  const deleteUser = useDeleteUser();
  const qc = useQueryClient();

  const filtered = (users ?? []).filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = (users ?? []).reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = (u: any) => {
    if (u.id === me?.id) { toast.error("Cannot delete your own account"); return; }
    setConfirmDelete(u);
  };

  const confirmDoDelete = () => {
    if (!confirmDelete) return;
    deleteUser.mutate(
      { id: confirmDelete.id },
      {
        onSuccess: () => { qc.invalidateQueries(); toast.success(`${confirmDelete.name} deleted`); setConfirmDelete(null); },
        onError: () => toast.error("Failed to delete user"),
      }
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Create, edit, and manage all platform users</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New User
          </Button>
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
              {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground shrink-0">{filtered.length} users</div>
        </div>

        {/* Users table */}
        {isLoading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No users found</p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={() => setShowCreate(true)}>
                <Plus className="w-3.5 h-3.5" /> Create first user
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-xs font-semibold text-muted-foreground bg-muted/30 rounded-t-xl">
                <div className="col-span-4">User</div>
                <div className="col-span-3 hidden sm:block">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2 hidden sm:block">Joined</div>
                <div className="col-span-1" />
              </div>
              {filtered.map(u => {
                const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.student;
                return (
                  <div key={u.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/40 transition-colors">
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
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
                    <div className="col-span-1 flex items-center justify-end gap-0.5">
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" onClick={() => setEditUser(u)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {u.id !== me?.id && (
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(u)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <CreateUserDialog open={showCreate} onClose={() => setShowCreate(false)} />
      {editUser && <EditUserDialog user={editUser} open={!!editUser} onClose={() => setEditUser(null)} />}

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={v => !v && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete <strong>{confirmDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDoDelete} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? "Deleting…" : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
