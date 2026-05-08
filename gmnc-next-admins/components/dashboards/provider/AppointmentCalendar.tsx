"use client";

import * as React from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Video, MapPin, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MOCK_APPOINTMENTS = [
  { id: 'APT-101', patient: 'Kojo Mensah', time: '09:00 AM', type: 'Virtual', reason: 'Follow-up', status: 'Confirmed' },
  { id: 'APT-102', patient: 'Ama Serwaa', time: '10:30 AM', type: 'In-person', reason: 'Initial Consultation', status: 'Arrived' },
  { id: 'APT-103', patient: 'John Smith', time: '13:00 PM', type: 'Virtual', reason: 'Urgent Review', status: 'Pending' },
  { id: 'APT-104', patient: 'Efua Boateng', time: '15:45 PM', type: 'Virtual', reason: 'Medication Check', status: 'Confirmed' },
];

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(startOfToday());
  const [filter, setFilter] = React.useState<'all' | 'virtual' | 'in-person'>('all');

  const filteredAppointments = MOCK_APPOINTMENTS.filter(apt => {
    if (filter === 'all') return true;
    return apt.type.toLowerCase() === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <CalendarIcon className="text-emerald-500" size={28} />
             Clinical Schedule
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
             Manage your daily consultations and telehealth sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="gray" 
            className="h-12 rounded-2xl font-bold border border-slate-100 bg-white gap-2"
            onClick={() => toast.success('Availability settings opened')}
           >
              <Clock size={18} />
              Manage Availability
           </Button>
           <Button 
            className="h-12 gap-2 px-8 rounded-2xl bg-brand hover:bg-brand-hover text-white border-none font-bold shadow-xl shadow-brand/20 transition-all"
            onClick={() => toast.success('Appointment booking modal opened')}
           >
              <Plus size={18} />
              Book Appointment
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         {/* Date Sidebar */}
         <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 px-2">Select Date</h4>
               <DatePicker 
                date={selectedDate} 
                onChange={(d) => d && setSelectedDate(d)} 
                className="w-full"
               />
               
               <div className="mt-8 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 px-2">Quick Filters</h4>
                  {[
                    { id: 'all', label: 'All Sessions', count: 12 },
                    { id: 'virtual', label: 'Telehealth', count: 8 },
                    { id: 'in-person', label: 'In-Clinic', count: 4 },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                        filter === f.id ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                       <span className="text-sm font-bold">{f.label}</span>
                       <Badge color="gray" className={cn("font-black border-none px-2", filter === f.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                          {f.count}
                       </Badge>
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
               <div className="relative z-10">
                  <h4 className="text-sm font-bold opacity-80 mb-2">Today's Progress</h4>
                  <p className="text-4xl font-black mb-6">75%</p>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                     <div className="w-3/4 h-full bg-white rounded-full" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">9 of 12 Patients seen</p>
               </div>
               <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
         </div>

         {/* Schedule View */}
         <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-4 mb-2">
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {format(selectedDate, "EEEE, MMMM do")}
               </h3>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-500">3 Sessions Pending</span>
               </div>
            </div>

            <div className="space-y-4">
               <AnimatePresence mode="popLayout">
                  {filteredAppointments.map((apt) => (
                    <motion.div
                      key={apt.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "p-6 rounded-[32px] border bg-white transition-all flex flex-col md:flex-row md:items-center gap-6 group",
                        apt.status === 'Confirmed' ? "border-slate-100 shadow-sm" : "border-emerald-100 bg-emerald-50/10 shadow-lg shadow-emerald-500/5"
                      )}
                    >
                       <div className="flex flex-col items-center justify-center min-w-[100px] border-r border-slate-50 pr-6">
                          <span className="text-lg font-black text-slate-900">{apt.time.split(' ')[0]}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{apt.time.split(' ')[1]}</span>
                       </div>

                       <div className="flex-1 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.patient}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 tracking-tight">{apt.patient}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                                <Badge color="gray" className="bg-slate-50 border-none font-bold text-[9px] uppercase tracking-wider">{apt.reason}</Badge>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                   {apt.type === 'Virtual' ? <Video size={12} className="text-emerald-500" /> : <MapPin size={12} className="text-blue-500" />}
                                   {apt.type}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <Badge 
                               variant={apt.status === 'Arrived' ? 'emerald' : apt.status === 'Confirmed' ? 'blue' : 'amber'}
                               className="rounded-lg font-bold uppercase tracking-wider text-[9px]"
                             >
                                {apt.status}
                             </Badge>
                             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{apt.id}</p>
                          </div>
                          <div className="h-10 w-[1px] bg-slate-100 hidden md:block mx-2" />
                          <div className="flex items-center gap-2">
                             {apt.type === 'Virtual' && (
                               <Button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold text-xs px-4">
                                  Start Session
                               </Button>
                             )}
                             <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                <MoreHorizontal size={18} />
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
}
