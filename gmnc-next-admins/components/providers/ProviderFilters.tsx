"use client";

import * as React from "react";
import { ChevronDown, Minimize, Scan, Search, X } from "lucide-react";
import Button from "@/components/ui/Button";
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
  onAdd,
}: ProviderFiltersProps) {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const statuses = ["All", "Verified", "Pending", "Suspended"];

  return (
    <div className="flex flex-col gap-6 border-b border-slate-50 p-8 pb-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Input
            placeholder="Search by name, ID or email..."
            icon={<Search size={18} className="text-slate-400" />}
            className="h-12 rounded-2xl border-slate-200/60 bg-slate-50/50 focus:bg-white"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleZoom}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 transition-all hover:text-primary"
          >
            {isZoomed ? <Minimize size={20} /> : <Scan size={20} />}
          </button>

          {!isZoomed && (
            <Button
              onClick={onAdd}
              className="flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              Add Provider
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 pr-12 text-[13px] font-bold transition-all",
              statusFilter !== "All"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {statusFilter === "All" ? "Select Status" : statusFilter}
            <ChevronDown
              size={14}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"
            />
          </button>

          {showStatusMenu && (
            <div className="animate-in fade-in zoom-in absolute top-14 left-0 z-50 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl duration-200">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setShowStatusMenu(false);
                  }}
                  className="w-full rounded-xl px-4 py-2 text-left text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative opacity-50">
          <button className="flex h-11 cursor-not-allowed items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 pr-12 text-[13px] font-bold text-slate-400">
            Region
            <ChevronDown
              size={14}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"
            />
          </button>
        </div>

        <div className="relative opacity-50">
          <button className="flex h-11 cursor-not-allowed items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 pr-12 text-[13px] font-bold text-slate-400">
            Joined Date
            <ChevronDown
              size={14}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400"
            />
          </button>
        </div>

        <div className="mx-2 hidden h-8 w-px bg-slate-100 md:block" />

        <button
          type="button"
          className="h-11 rounded-2xl px-4 font-bold text-emerald-600 transition-all hover:bg-emerald-50"
        >
          Export Data
        </button>
      </div>
    </div>
  );
}
