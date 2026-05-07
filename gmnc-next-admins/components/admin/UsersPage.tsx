"use client";

import React, { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SearchIcon, UserPlusIcon, MoreVerticalIcon, ShieldCheckIcon, GhostIcon, UserIcon, MailIcon, PhoneIcon } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
};

const MOCK_USERS: UserRecord[] = [
  { id: "USR-001", name: "Dr. Louisa Parker", email: "louisa@example.com", roles: ["provider"], status: "Active" },
  { id: "USR-002", name: "Admin User", email: "admin@gmnc.com", roles: ["admin"], status: "Active" },
  { id: "USR-003", name: "Tijani Dromo", email: "tijani@care.com", roles: ["caregiver"], status: "Active" },
  { id: "USR-004", name: "Inactive Tester", email: "tester@test.com", roles: ["tester"], status: "Deactivated" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const handleEditUser = (user: UserRecord) => {
    setSelectedUser(user);
    setIsEditing(false);
    setIsEditModalOpen(true);
  };

  const filteredUsers = MOCK_USERS.filter((user) => user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">User Management</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Manage system users, roles, and access states.</p>
          </div>
          <Button className="gap-2 rounded px-2 shadow-lg shadow-accent/20 cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
            <UserPlusIcon size={16} /> Add User
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search by name, email or ID..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-accent focus:ring-4 focus:ring-accent/5"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Table
          title="System Users"
          data={filteredUsers}
          columns={[
            {
              header: "User",
              accessor: (item: UserRecord) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <ShieldCheckIcon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{item.email}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Roles",
              accessor: (item: UserRecord) => (
                <div className="flex gap-1">
                  {item.roles.map((role) => (
                    <Badge key={role} variant="outline" className="border-slate-100 text-[9px] font-bold uppercase">
                      {role}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (item: UserRecord) => (
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                    item.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}
                >
                  {item.status}
                </span>
              ),
            },
          ]}
          actions={(item: UserRecord) => (
            <div className="flex items-center gap-2">
              <button aria-label="Impersonate user" className="rounded-lg p-2 text-slate-300 transition-all hover:bg-accent/5 hover:text-accent" title="Impersonate">
                <GhostIcon size={18} />
              </button>
              <button
                aria-label="Edit user"
                className="rounded-lg p-2 text-slate-300 transition-all hover:bg-slate-50 hover:text-primary"
                onClick={() => handleEditUser(item)}
              >
                <MoreVerticalIcon size={18} />
              </button>
            </div>
          )}
        />

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add new user">
          <div className="space-y-6">
            <p className="text-xs font-medium text-slate-400">Create an account and assign a role. Permissions follow the role and can be fine-tuned.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <Input className="pl-11" placeholder="Jane Doe" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <div className="relative">
                    <MailIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className="pl-11" placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone (optional)</label>
                  <div className="relative">
                    <PhoneIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <Input className="pl-11" placeholder="+1 555 0100" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</label>
                <select aria-label="New user role" className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/5">
                  <option>Provider</option>
                  <option>Admin</option>
                  <option>Caregiver</option>
                </select>
                <p className="mt-1 text-[10px] font-bold text-slate-400">Clinical access — patients, appointments, notes and prescriptions.</p>
              </div>

              <div className="flex items-center gap-2 p-1">
                <input type="checkbox" className="h-4 w-4 rounded border border-slate-200 text-brand focus:ring-brand" id="permissions" />
                <label htmlFor="permissions" className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <ShieldCheckIcon size={14} className="text-brand" /> Permissions
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2 rounded-2xl bg-brand py-6 text-white shadow-lg shadow-brand/20 hover:bg-brand-hover">
                <UserPlusIcon size={18} /> Create user
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={selectedUser?.name || "Edit user"}>
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedUser?.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Viewing user record</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Edit</span>
                <button
                  aria-label="Toggle edit mode"
                  onClick={() => setIsEditing((current) => !current)}
                  className={cn("relative h-5 w-10 rounded-full p-1 transition-all", isEditing ? "bg-brand" : "bg-slate-200")}
                >
                  <div className={cn("h-3 w-3 rounded-full bg-white transition-all", isEditing ? "ml-5" : "ml-0")} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full name</label>
                <Input disabled={!isEditing} defaultValue={selectedUser?.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <Input disabled={!isEditing} defaultValue={selectedUser?.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</label>
                  <select
                    aria-label="Edit user role"
                    disabled={!isEditing}
                    defaultValue={selectedUser?.roles[0]}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  >
                    <option value="provider">Provider</option>
                    <option value="admin">Admin</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => setIsEditModalOpen(false)}>
                Close
              </Button>
              {isEditing && (
                <Button className="flex-1 gap-2 rounded-2xl bg-brand py-6 text-white shadow-lg shadow-brand/20">Save Changes</Button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}