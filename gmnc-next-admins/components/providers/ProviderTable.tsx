"use client";

import * as React from "react";
import { MoreVertical, User, Edit, Trash2 } from "lucide-react";
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
  onDeactivate,
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
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="whitespace-nowrap p-5 pl-10 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Provider
            </th>
            <th className="whitespace-nowrap p-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Phone
            </th>
            <th className="whitespace-nowrap p-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Status
            </th>
            <th className="whitespace-nowrap p-5 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Sessions
            </th>
            <th className="whitespace-nowrap p-5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Join date
            </th>
            <th className="p-5 pr-10"></th>
          </tr>
        </thead>

        <tbody>
          {providers.map((provider) => (
            <tr
              key={provider.id}
              className={cn(
                "group relative cursor-pointer transition-all hover:bg-slate-50/50",
                selectedId === provider.id && "border-emerald-500 bg-slate-50"
              )}
              onClick={() => onSelect(provider)}
            >
              <td className="p-6 pl-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:bg-white group-hover:shadow-sm">
                    <User size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-tight text-primary">
                      {provider.name}
                    </h4>
                    <p className="text-[10px] font-bold lowercase tracking-tight text-slate-400">
                      {provider.email}
                    </p>
                  </div>
                </div>
              </td>

              <td className="p-6">
                <span className="text-[13px] font-bold text-slate-500">
                  {provider.phone}
                </span>
              </td>

              <td className="p-6">
                <span className="border-none text-[13px] font-bold text-slate-900">
                  {provider.status}
                </span>
              </td>

              <td className="p-6 text-center">
                <span className="text-[13px] font-extrabold text-primary">
                  {provider.sessions}
                </span>
              </td>

              <td className="p-6">
                <span className="text-[13px] font-bold text-slate-400">
                  {provider.joinDate}
                </span>
              </td>

              <td className="relative p-6 pr-10 text-right">
                <button
                  type="button"
                  className="h-10 w-10 text-slate-300 transition-all group-hover:text-primary"
                  onClick={(e) => toggleMenu(e, provider.id)}
                >
                  <MoreVertical size={18} />
                </button>

                {activeMenu === provider.id && (
                  <div className="animate-in fade-in zoom-in absolute top-1/2 right-12 z-50 w-44 -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl duration-200">
                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 transition-all hover:bg-slate-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(provider);
                      }}
                    >
                      <Edit size={16} className="text-slate-400" />
                      <span className="text-sm font-bold">Edit</span>
                    </button>

                    <button
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-rose-500 transition-all hover:bg-rose-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeactivate(provider);
                      }}
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