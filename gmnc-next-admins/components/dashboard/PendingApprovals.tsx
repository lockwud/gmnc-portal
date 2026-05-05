import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { User, Check, X, Clock, Filter } from "lucide-react";
import { useUI } from "@/lib/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";

const pendingProviders = [
  { no: 1, name: "Dr. Louisa Parker", type: "Occupational Therapist", time: "Today, 10:00 AM", files: 3, status: "Verified" },
  { no: 2, name: "Tijani Dromo", type: "Physiotherapist", time: "Today, 09:15 AM", files: 2, status: "Verified" },
  { no: 3, name: "Samuel Aboagye", type: "Speech Therapist", time: "Yesterday, 02:20 PM", files: 4, status: "Verified" },
  { no: 4, name: "Beryl Mensah", type: "Psychologist", time: "Yesterday, 11:30 AM", files: 5, status: "Verified" },
];

export function PendingApprovals() {
  const [providers, setProviders] = React.useState(pendingProviders);
  const { addToast } = useUI();

  const handleAction = (id: number, name: string, type: "accept" | "reject") => {
    setProviders(prev => prev.filter(p => p.no !== id));
    if (type === "accept") {
      addToast(`${name} has been verified successfully.`, "success");
    } else {
      addToast(`Registration for ${name} was declined.`, "info");
    }
  };

  return (
    <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden rounded-[2rem] mt-8">
      <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
        <CardTitle className="text-xl font-bold text-primary">Pending Approvals</CardTitle>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Sort</span>
           <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-all">
             <Filter size={18} />
           </Button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto px-2 pb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-6 pl-10 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap w-20">No.</th>
              <th className="p-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Therapist (Name)</th>
              <th className="p-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Type</th>
              <th className="p-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Request time</th>
              <th className="p-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Files</th>
              <th className="p-6 pr-10 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50 text-[13px]">
            <AnimatePresence initial={false}>
              {providers.map((provider) => (
                <motion.tr 
                  key={provider.no} 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="hover:bg-slate-50/30 transition-all group overflow-hidden"
                >
                  <td className="p-6 pl-10">
                    <span className="text-xs font-bold text-slate-400">{provider.no}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all">
                        <User size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary text-sm tracking-tight">{provider.name}</h4>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-500">{provider.type}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold text-slate-400">{provider.time}</span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-extrabold text-primary">{provider.files}</span>
                    </div>
                  </td>
                  <td className="p-6 pr-10 text-right">
                    <div className="flex justify-end gap-3">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-rose-500 bg-rose-50/30 hover:bg-rose-50 rounded-xl transition-colors"
                        onClick={() => handleAction(provider.no, provider.name, "reject")}
                      >
                        <X size={18} strokeWidth={3} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-emerald-500 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl transition-colors"
                        onClick={() => handleAction(provider.no, provider.name, "accept")}
                      >
                        <Check size={18} strokeWidth={3} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Check size={32} />
                      </div>
                      <p className="font-bold text-slate-400">All pending approvals have been cleared.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
