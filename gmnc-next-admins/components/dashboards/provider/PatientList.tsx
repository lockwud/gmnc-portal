"use client";

import * as React from "react";
import { Table } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Filter, UserPlus, Heart, Calendar, ArrowRight, MoreHorizontal, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";

const MOCK_PATIENTS = [
  { id: 'PAT-001', name: 'Kojo Mensah', age: 45, gender: 'Male', diagnosis: 'Migraine', lastVisit: '2 days ago', nextAppt: 'Nov 12', status: 'Stable' },
  { id: 'PAT-002', name: 'Ama Serwaa', age: 32, gender: 'Female', diagnosis: 'Epilepsy', lastVisit: '1 week ago', nextAppt: 'Nov 15', status: 'Monitoring' },
  { id: 'PAT-003', name: 'John Smith', age: 68, gender: 'Male', diagnosis: 'Parkinson\'s', lastVisit: 'Yesterday', nextAppt: 'Nov 10', status: 'Critical' },
  { id: 'PAT-004', name: 'Efua Boateng', age: 29, gender: 'Female', diagnosis: 'Multiple Sclerosis', lastVisit: '1 month ago', nextAppt: 'Dec 05', status: 'Stable' },
];

export function PatientList() {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);

  const handleEditClick = (patient: any) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Heart className="text-rose-500" size={28} />
             Patient Directory
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
             Manage your active patients, review clinical histories, and monitor care states.
          </p>
        </div>
        <Button 
          className="h-12 gap-2 px-6 rounded-2xl bg-brand hover:bg-brand-hover text-white border-none font-bold shadow-xl shadow-brand/20 transition-all"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          Register New Patient
        </Button>
      </div>

      {/* Filters */}
        <div className="flex items-center gap-2">
           <Button 
            variant="gray" 
            className="h-11 rounded-xl font-bold border border-slate-100 bg-white gap-2"
            onClick={() => toast.success('Filter options opened')}
           >
              <Filter size={16} />
              Filter
           </Button>
           <Button 
            variant="gray" 
            className="h-11 rounded-xl font-bold border border-slate-100 bg-white gap-2"
            onClick={() => toast.success('Patient directory exported to Excel')}
           >
              <FileText size={16} />
              Export Directory
           </Button>
        </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <Table 
          data={MOCK_PATIENTS}
          columns={[
            { header: 'Patient Info', accessor: (item) => (
              <div className="flex items-center gap-4">
                 <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id}`} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.gender}, {item.age}y</p>
                 </div>
              </div>
            )},
            { header: 'Primary Diagnosis', accessor: (item) => (
              <span className="text-sm font-bold text-slate-700">{item.diagnosis}</span>
            )},
            { header: 'Care State', accessor: (item) => (
              <Badge 
                variant={item.status === 'Critical' ? 'rose' : item.status === 'Monitoring' ? 'amber' : 'emerald'}
                className="rounded-lg font-bold uppercase tracking-wider text-[9px]"
              >
                {item.status}
              </Badge>
            )},
            { header: 'Visits', accessor: (item) => (
              <div>
                 <p className="text-xs font-bold text-slate-900">Last: {item.lastVisit}</p>
                 <p className="text-[10px] text-slate-400 font-bold">Next: {item.nextAppt}</p>
              </div>
            )},
          ]}
          actions={(item) => (
            <div className="flex items-center justify-end gap-1">
               <button 
                onClick={() => router.push(`/provider/patients/${item.id}`)}
                className="p-2.5 text-slate-400 hover:text-brand hover:bg-emerald-50 rounded-xl transition-all group"
               >
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button 
                  onClick={() => handleEditClick(item)}
                  className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
               >
                  <MoreHorizontal size={18} />
               </button>
            </div>
          )}
        />
      </div>

      {/* Register Patient Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Admit New Patient"
        className="max-w-2xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-4">Enter the patient's neurological intake details.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full name</label>
              <Input placeholder="Jane Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of birth</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MRN</label>
                <Input placeholder="NC-00000" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ward</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Neuro ICU</option>
                  <option>Stroke Unit</option>
                  <option>EMU</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary diagnosis</label>
              <Input placeholder="e.g. Ischemic stroke" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neurological status</label>
                <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none">
                  <option>Alert</option>
                  <option>Stable</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GCS (3–15)</label>
                <Input type="number" placeholder="15" min="3" max="15" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attending neurologist</label>
              <Input placeholder="Dr. ..." />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission notes</label>
              <textarea 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none resize-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all"
                placeholder="Presenting symptoms, NIHSS, plan..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
            >
              Close
            </button>
            <button 
              onClick={() => {
                setIsAddModalOpen(false);
                toast.success('New patient admitted successfully');
              }}
              className="flex-1 py-2.5 bg-brand text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-hover shadow-xl shadow-brand/20 transition-all"
            >
              Admit patient
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Information"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500 font-medium px-1">
            Update clinical information for <span className="font-bold text-slate-900">{selectedPatient?.name}</span>.
          </p>
          
          <div className="space-y-4">
             <FormField label="Full Name" required>
                <input defaultValue={selectedPatient?.name} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none" />
             </FormField>
             <div className="grid grid-cols-2 gap-4">
                <FormField label="Age" required>
                   <input type="number" defaultValue={selectedPatient?.age} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none" />
                </FormField>
                <FormField label="Gender" required>
                   <select defaultValue={selectedPatient?.gender} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                   </select>
                </FormField>
             </div>
             <FormField label="Primary Diagnosis">
                <input defaultValue={selectedPatient?.diagnosis} className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm outline-none" />
             </FormField>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="gray" className="flex-1 h-14 rounded-2xl font-bold border border-slate-100" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 h-14 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white border-none shadow-xl shadow-slate-900/10"
              onClick={() => { toast.success("Patient record updated!"); setIsEditModalOpen(false); }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
