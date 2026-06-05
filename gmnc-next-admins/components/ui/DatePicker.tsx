'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [selectedYear, setSelectedYear] = useState<number>(currentMonth.getFullYear());
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setViewMode('calendar');
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentMonth.toLocaleString('en', { month: 'long' });
  const yearValue = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate year range for selector
  const startYear = Math.floor(selectedYear / 10) * 10;
  const yearOptions = Array.from({ length: 10 }, (_, i) => startYear + i);

  const [day, month, year] = value ? value.split('-').map(Number) : [0, 0, 0];
  const isSelected = (d: number) => d === day && monthIndex === month - 1 && yearValue === year;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl text-left flex items-center justify-between transition ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="text-slate-700">
          {value ? formatDate(value) : 'Select a date'}
        </span>
        <Calendar size={18} className="text-slate-400" />
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex">
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="w-80 p-5 border-r border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => handleMonthChange(-1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setViewMode('month')}
                      className="text-sm font-semibold text-slate-900 hover:text-emerald-700 transition"
                    >
                      {monthName} {yearValue}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMonthChange(1)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {dayLabels.map((label) => (
                    <div
                      key={label}
                      className="w-10 h-10 flex items-center justify-center text-xs font-semibold text-slate-500"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="w-10 h-10" />
                  ))}
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition ${
                        isSelected(day)
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <button
                  type="button"
                  onClick={() => setViewMode('year')}
                  className="w-full mt-4 text-xs font-semibold text-slate-600 hover:text-emerald-700 py-2 transition"
                >
                  {yearValue}
                </button>
              </div>
            )}

            {/* Year/Month Selector */}
            {viewMode === 'year' && (
              <div className="w-80 p-5">
                {/* Year Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedYear(selectedYear - 10)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ChevronLeft size={18} className="text-slate-600" />
                  </button>
                  <div className="text-sm font-semibold text-slate-900">
                    {startYear}-{startYear + 9}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedYear(selectedYear + 10)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <ChevronRight size={18} className="text-slate-600" />
                  </button>
                </div>

                {/* Year Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {yearOptions.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearChange(y)}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        yearValue === y
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                {/* Month Grid */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 mb-3">
                    {yearValue}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setCurrentMonth(new Date(yearValue, i, 1));
                          setViewMode('calendar');
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition ${
                          monthIndex === i && yearValue === year
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
