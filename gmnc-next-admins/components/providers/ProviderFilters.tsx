"use client";

import * as React from "react";
import { ChevronDown, Filter, Maximize2, Minimize, Minimize2, Scan, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

interface ProviderFiltersProps {
  isZoomed: boolean;
  onToggleZoom: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAdd: () => void;
}

export function ProviderFilters({ 
  isZoomed, 
  onToggleZoom,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onAdd
}: ProviderFiltersProps) {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const statuses = ["All", "Verified", "Pending", "Suspended"];
  return (
    <div className="flex flex-col gap-6 p-8 pb-6 border-b border-slate-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <Input 
            placeholder="Search by name, ID or email..." 
            icon={<Search size={18} className="text-slate-400" />}
            className="h-12 border-slate-200/60 bg-slate-50/50 focus:bg-white rounded-2xl"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleZoom}
            className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-primary transition-all"
          >
            {isZoomed ? <Minimize size={20} /> : <Scan size={20} />}
          </Button>
          {!isZoomed && (
             <Button 
                onClick={onAdd}
                className="h-12 px-6 rounded-2xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
             >
                Add Provider
             </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={cn(
              "h-11 px-6 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold transition-all flex items-center gap-2",
              statusFilter !== "All" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {statusFilter === "All" ? "Select Status" : statusFilter}
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </button>
          
          {showStatusMenu && (
            <div className="absolute top-14 left-0 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
               {statuses.map(s => (
                 <button
                   key={s}
                   onClick={() => {
                     onStatusChange(s);
                     setShowStatusMenu(false);
                   }}
                   className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-all text-left"
                 >
                   {s}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Region Dropdown - Mock */}
        <div className="relative opacity-50">
          <button className="h-11 px-6 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-400 cursor-not-allowed flex items-center gap-2">
            Region
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </button>
        </div>

        {/* Date Dropdown - Mock */}
        <div className="relative opacity-50">
          <button className="h-11 px-6 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-400 cursor-not-allowed flex items-center gap-2">
            Joined Date
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />

        <Button variant="ghost" className="h-11 px-4 text-emerald-600 font-bold hover:bg-emerald-50 rounded-2xl">
           Export Data
        </Button>
      </div>
    </div>
  );
}
