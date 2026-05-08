"use client";

import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date) => void;
  label?: string;
  error?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker = ({
  date,
  onChange,
  label,
  error,
  description,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDateClick = (day: Date) => {
    if (onChange) onChange(day);
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <button
        type="button"
        onClick={prevMonth}
        className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-bold text-slate-900">
        {format(currentMonth, "MMMM yyyy")}
      </span>
      <button
        type="button"
        onClick={nextMonth}
        className="p-1 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2 px-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-1 px-2 pb-2">
        {calendarDays.map((day, idx) => {
          const isSelected = date && isSameDay(day, date);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all relative group",
                !isCurrentMonth && "text-slate-300",
                isCurrentMonth && !isSelected && "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600",
                isSelected && "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
                isToday && !isSelected && "text-emerald-600"
              )}
            >
              {format(day, "d")}
              {isToday && !isSelected && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <FormField label={label} error={error} description={description}>
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium transition-all cursor-pointer",
            isOpen && "ring-4 ring-brand/5 border-brand bg-white",
            !date && "text-slate-400",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-rose-500 ring-rose-500/10"
          )}
        >
          <CalendarIcon size={18} className={cn("transition-colors", isOpen ? "text-brand" : "text-slate-400")} />
          <span className="flex-1 truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
          {date && !disabled && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (onChange) onChange(undefined as any);
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </FormField>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[60] mt-1 w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden origin-top-left"
          >
            {renderHeader()}
            <div className="p-2">
              {renderDays()}
              {renderCells()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
