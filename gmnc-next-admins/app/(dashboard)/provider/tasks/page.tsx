"use client";

import * as React from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle, 
  User, 
  Plus,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const tasks = [
  { id: 1, name: "Stretching for kids - morning exercise", client: "Dromo Tijani", assignedTo: "Dr. Louisa Parker", category: "Physician Therapy", status: "In Progress", dueDate: "Today" },
  { id: 2, name: "Mouth and Tongue Exercises", client: "Serwaa Buaaduwaa", assignedTo: "Tijani Dromo", category: "Speech Therapy", status: "Pending", dueDate: "5/12/25" },
  { id: 3, name: "Lip and Jaw Exercise", client: "Isaac Dada Boat", assignedTo: "Samuel Aboagye", category: "Speech Therapy", status: "In Progress", dueDate: "Today" },
  { id: 4, name: "Speech and Sound Practice", client: "Sedem Gadokey", assignedTo: "Beryl Mensah", category: "Speech Therapy", status: "Completed", dueDate: "30/11/25" },
  { id: 5, name: "Upper Body Rotation", client: "Dromo Tijani", assignedTo: "Dr. Louisa Parker", category: "Physician Therapy", status: "In Progress", dueDate: "Today" },
];

export default function TasksPage() {
  const [showAssignTaskModal, setShowAssignTaskModal] = React.useState(false);

  return (
    <ProtectedRoute requiredPermission="appointment.read">
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Task Management</h1>
            <p className="text-slate-500 mt-1 font-medium">Track and monitor all assigned patient rehabilitation tasks.</p>
          </div>
          <Button 
            variant="amber" 
            className="gap-2 shrink-0 h-11 px-6 font-bold shadow-lg shadow-accent/20 rounded-xl"
            onClick={() => setShowAssignTaskModal(true)}
          >
            <Plus size={18} /> Assign New Task
          </Button>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Tasks", value: "2,000", icon: ClipboardList, color: "text-primary", bg: "bg-slate-50" },
            { label: "Pending", value: "400", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "In Progress", value: "150", icon: PlayCircle, color: "text-sky-500", bg: "bg-sky-50" },
            { label: "Completed", value: "1,005", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Overdue", value: "700", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
          ].map((stat, i) => (
            <Card key={i} className="p-5 border-none shadow-sm group hover:shadow-md transition-all flex flex-col items-center text-center">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                 <stat.icon size={22} />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
               <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
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
                  placeholder="Search tasks, clients or providers..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-12 px-5 text-slate-500 text-sm font-bold gap-2 hover:bg-slate-50 rounded-2xl border border-slate-50">
                  <Filter size={18} className="text-slate-400" /> Filters
                </Button>
                <Button variant="ghost" className="h-12 px-5 text-slate-500 text-sm font-bold gap-2 hover:bg-slate-50 rounded-2xl border border-slate-50">
                  <Layers size={18} className="text-slate-400" /> Category
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="text-[11px] font-bold text-slate-400 uppercase">Sort by:</span>
               <select className="bg-white border-none text-xs font-bold text-primary focus:ring-0 cursor-pointer">
                  <option>Newest First</option>
                  <option>Due Date</option>
                  <option>Priority</option>
               </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="p-5 pl-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Task Details</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Assigned To</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Category</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Due Date</th>
                  <th className="p-5 pr-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-emerald-50/30 transition-all group cursor-pointer">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all group-hover:shadow-sm">
                          <FileText size={20} strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-primary group-hover:text-emerald-600 transition-colors leading-tight">{task.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Client: {task.client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <User size={14} />
                         </div>
                         <span className="text-sm font-bold text-slate-600">{task.assignedTo}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-100 bg-white">
                        {task.category}
                      </Badge>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {task.status === "In Progress" && <PlayCircle size={16} className="text-sky-500" />}
                        {task.status === "Pending" && <Clock size={16} className="text-amber-500" />}
                        {task.status === "Completed" && <CheckCircle2 size={16} className="text-emerald-500" />}
                        <span className={cn(
                          "text-xs font-extrabold uppercase",
                          task.status === "In Progress" && "text-sky-600",
                          task.status === "Pending" && "text-amber-600",
                          task.status === "Completed" && "text-emerald-600",
                          task.status === "Overdue" && "text-rose-600",
                        )}>
                          {task.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-extrabold text-slate-500">{task.dueDate}</span>
                    </td>
                    <td className="p-5 pr-8 text-right">
                      <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-primary">
                        <MoreVertical size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assign Task Modal */}
        <Modal
          isOpen={showAssignTaskModal}
          onClose={() => setShowAssignTaskModal(false)}
          title="Assign New Task"
          className="max-w-md"
        >
          <form className="space-y-6">
             <div className="space-y-4">
                <Input label="Task Name" placeholder="e.g. Daily stretching routine" icon={<FileText size={18} className="text-slate-400" />} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-primary">Assign to Therapist</label>
                      <select className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer">
                          <option>Select Provider</option>
                          <option>Dr. Louisa Parker</option>
                          <option>Tijani Dromo</option>
                          <option>Samuel Aboagye</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-primary">Target Client</label>
                      <select className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer">
                          <option>Select Client</option>
                          <option>Dromo Tijani</option>
                          <option>Serwaa Buaaduwaa</option>
                          <option>Sedem Gadokey</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-primary">Therapy Category</label>
                      <select className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer">
                          <option>Select Category</option>
                          <option>Physio Therapy</option>
                          <option>Speech Therapy</option>
                          <option>Occupational Therapy</option>
                      </select>
                   </div>
                   <Input label="Due Date" type="date" icon={<Calendar size={18} className="text-slate-400" />} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">Task Description (Optional)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Additional instructions for the provider..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
                  />
                </div>
             </div>

             <div className="flex gap-3 pt-6 border-t border-slate-50 mt-4">
                <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-500" onClick={() => setShowAssignTaskModal(false)}>Cancel</Button>
                <Button variant="amber" className="flex-2 h-14 rounded-2xl font-bold px-12 shadow-lg shadow-accent/10">Assign Task</Button>
             </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
