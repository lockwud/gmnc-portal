"use client";

import * as React from "react";
import { Search, Filter, MoreVertical, User, Calendar, MapPin, AlertCircle, Activity, UserPlus, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useUI } from "@/lib/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const clients = [
  { id: "CP-882-001", name: "Tijani Dromo", email: "tijani@example.com", phone: "024 234 5678", region: "Greater Accra", status: "Verified", sessions: 3, joinDate: "1/12/25" },
  { id: "CP-882-002", name: "Samuel Aboagye", email: "samuel@example.com", phone: "024 555 9012", region: "Ashanti Region", status: "Verified", sessions: 8, joinDate: "1/12/25" },
  { id: "CP-882-003", name: "Beryl Mensah", email: "beryl@example.com", phone: "024 111 2222", region: "Central Region", status: "Verified", sessions: 5, joinDate: "1/12/25" },
  { id: "CP-882-004", name: "Isaac Dada Boat", email: "isaac@example.com", phone: "024 999 8888", region: "Eastern Region", status: "Deactivated", sessions: 0, joinDate: "1/12/25" },
  { id: "CP-882-005", name: "Louisa Parker", email: "louisa@example.com", phone: "024 333 1241", region: "Greater Accra", status: "Verified", sessions: 12, joinDate: "1/12/25" },
];

export default function ClientsPage() {
  const [data, setData] = React.useState(clients);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [regionFilter, setRegionFilter] = React.useState("All Regions");
  const [showAddClientModal, setShowAddClientModal] = React.useState(false);
  const { addToast } = useUI();

  const filteredClients = data.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "All Regions" || c.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const handleDeactivate = (id: string, name: string) => {
    setData(prev => prev.filter(c => c.id !== id));
    addToast(`Account for ${name} has been deactivated.`, "info");
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddClientModal(false);
    addToast("New client registered successfully awaiting verification.", "success");
  };

  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Caregiver Management</h1>
            <p className="text-slate-500 mt-1 font-medium">View, verify and manage all caregiver and parent accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="amber" 
              className="gap-2 shrink-0 h-11 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl"
              onClick={() => setShowAddClientModal(true)}
            >
              <UserPlus size={18} /> Add New Client
            </Button>
          </div>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Clients", value: "1,002", icon: User, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Active", value: "993", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "New Joiners", value: "12", icon: Calendar, color: "text-sky-500", bg: "bg-sky-50" },
            { label: "Flagged", value: "10", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
            { label: "Suspended", value: "10", icon: MoreVertical, color: "text-slate-400", bg: "bg-slate-50" },
          ].map((stat, i) => (
            <Card key={i} className="p-5 border-none shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                 <stat.icon size={22} />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
               <p className="text-2xl font-extrabold text-primary mt-1">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden border border-slate-100 shadow-sm rounded-[2rem] bg-white">
          {/* Toolbar */}
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-1 items-center gap-3">
               <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Search by name, ID or email..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Button variant="ghost" className={cn(
                      "h-12 px-5 text-slate-500 text-sm font-bold gap-2 hover:bg-slate-50 rounded-2xl border border-slate-50",
                      regionFilter !== "All Regions" && "border-emerald-500 bg-emerald-50 text-emerald-700"
                  )}>
                    <Filter size={18} className="text-slate-400" /> {regionFilter}
                  </Button>
                  <div className="absolute top-14 left-0 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in duration-200">
                      {["All Regions", "Greater Accra", "Ashanti Region", "Central Region", "Eastern Region"].map(r => (
                          <button key={r} onClick={() => setRegionFilter(r)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-all text-left">{r}</button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="gap-2 h-11 border-slate-100 bg-white font-bold text-slate-400 text-xs px-6 rounded-xl hover:bg-slate-50">
               Export Data
            </Button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="p-5 pl-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Client</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Location</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Phone</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Sessions</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Join Date</th>
                  <th className="p-5 pr-8 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                  {filteredClients.map((client) => (
                    <motion.tr 
                      key={client.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-emerald-50/30 transition-all group cursor-pointer"
                    >
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-white transition-all group-hover:shadow-sm">
                            <User size={22} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-bold text-primary group-hover:text-emerald-600 transition-colors">{client.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                           <MapPin size={14} className="text-slate-300" />
                           <span className="text-sm font-bold text-slate-600">{client.region}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-bold text-slate-600">{client.phone}</span>
                      </td>
                      <td className="p-5">
                        <Badge variant={client.status === "Verified" ? "success" : "danger"} className="text-[10px] uppercase font-bold border-none px-2.5 py-1">
                          {client.status}
                        </Badge>
                      </td>
                      <td className="p-5 text-center">
                        <span className="text-sm font-extrabold text-primary">{client.sessions}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-bold text-slate-400">{client.joinDate}</span>
                      </td>
                      <td className="p-5 pr-8 text-right relative">
                        <div className="group/menu relative inline-block">
                          <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary">
                            <MoreVertical size={18} />
                          </Button>
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl p-2 hidden group-hover/menu:block z-50 animate-in fade-in zoom-in duration-200">
                             <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-600 transition-all">Edit Profile</button>
                             <button onClick={() => handleDeactivate(client.id, client.name)} className="w-full text-left px-4 py-2 hover:bg-rose-50 rounded-lg text-sm font-bold text-rose-500 transition-all">Deactivate</button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Client Modal */}
        <Modal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          title="Register New Client"
          className="max-w-md"
        >
          <form className="space-y-8" onSubmit={handleAddClient}>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <Input label="First Name" placeholder="e.g. John" icon={<User size={18} className="text-slate-400" />} />
                   <Input label="Last Name" placeholder="e.g. Doe" icon={<User size={18} className="text-slate-400" />} />
                </div>
                <Input label="Email address" placeholder="email@example.com" icon={<Mail size={18} className="text-slate-400" />} />
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Phone Number" placeholder="+233..." icon={<Phone size={18} className="text-slate-400" />} />
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-primary">Region</label>
                      <select className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer">
                          <option>Select Region</option>
                          <option>Greater Accra</option>
                          <option>Ashanti Region</option>
                          <option>Central Region</option>
                      </select>
                   </div>
                </div>
                <Input label="Home Address" placeholder="Digital address / Street" icon={<Home size={18} className="text-slate-400" />} />
             </div>

             <div className="flex gap-3 pt-4 border-t border-slate-50 pt-8">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-500" onClick={() => setShowAddClientModal(false)}>Cancel</Button>
                <Button variant="amber" className="flex-2 h-14 rounded-2xl font-bold px-12 shadow-lg shadow-accent/10">Register Client</Button>
             </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
