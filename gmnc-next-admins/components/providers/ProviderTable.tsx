"use client";

import * as React from "react";
import { MoreVertical, User, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  sessions: number;
  joinDate: string;
}

interface ProviderTableProps {
  providers: Provider[];
  selectedId?: string;
  onSelect: (provider: Provider) => void;
  onEdit: (provider: Provider) => void;
  onDeactivate: (provider: Provider) => void;
}

export function ProviderTable({ 
  providers, 
  selectedId, 
  onSelect, 
  onEdit, 
  onDeactivate 
}: ProviderTableProps) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="overflow-x-auto px-4 pb-8">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="p-5 pl-10 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Provider</th>
            <th className="p-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Phone</th>
            <th className="p-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status</th>
            <th className="p-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">Sessions</th>
            <th className="p-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Join date</th>
            <th className="p-5 pr-10"></th>
          </tr>
        </thead>
        <tbody className="">
          {providers.map((provider) => (
            <tr 
              key={provider.id} 
              className={cn(
                "hover:bg-slate-50/50 transition-all cursor-pointer group relative",
                selectedId === provider.id && "bg-slate-50 border-emerald-500"
              )}
              onClick={() => onSelect(provider)}
            >
              <td className="p-6 pl-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white transition-all group-hover:shadow-sm">
                    <User size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm tracking-tight">{provider.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold lowercase tracking-tight">{provider.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-6">
                <span className="text-[13px] font-bold text-slate-500">{provider.phone}</span>
              </td>
              <td className="p-6">
                <span className="text-[13px] font-bold text-slate-900 border-none">
                  {provider.status}
                </span>
              </td>
              <td className="p-6 text-center">
                <span className="text-[13px] font-extrabold text-primary">{provider.sessions}</span>
              </td>
              <td className="p-6">
                <span className="text-[13px] font-bold text-slate-400">{provider.joinDate}</span>
              </td>
              <td className="p-6 pr-10 text-right relative">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-slate-300 group-hover:text-primary transition-all"
                    onClick={(e) => toggleMenu(e, provider.id)}
                >
                  <MoreVertical size={18} />
                </Button>

                {/* Ellipsis Actions Menu */}
                {activeMenu === provider.id && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 w-44 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 animate-in fade-in zoom-in duration-200">
                        <button 
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            onClick={(e) => { e.stopPropagation(); onEdit(provider); }}
                        >
                            <Edit size={16} className="text-slate-400" />
                            <span className="text-sm font-bold">Edit</span>
                        </button>
                        <button 
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            onClick={(e) => { e.stopPropagation(); onDeactivate(provider); }}
                        >
                            <Trash2 size={16} className="text-rose-400" />
                            <span className="text-sm font-bold">Deactivate</span>
                        </button>
                    </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
