'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

type Props = {
  anchorRef: HTMLElement | null;
  open: boolean;
  selected?: Date;
  onSelect: (date?: Date) => void;
  onApply: () => void;
  onCancel: () => void;
  minWidth?: number;
  yearRange?: number;
};

export default function CalendarPopover({
  anchorRef,
  open,
  selected,
  onSelect,
  onApply,
  onCancel,
  minWidth = 220,
  yearRange = 10,
}: Props) {
  const popRef = useRef<HTMLDivElement | null>(null);
  const prevRef = useRef<Date | undefined>(selected);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const [visibleMonth, setVisibleMonth] = useState<Date>(selected ?? new Date());
  const centerOffset = Math.floor((yearRange - 1) / 2);

  const [yearPageStart, setYearPageStart] = useState<number>(() => {
    const y = (selected ?? new Date()).getFullYear();
    return y - centerOffset;
  });

  useEffect(() => {
    prevRef.current = selected;
    if (selected) {
      setVisibleMonth(selected);
      const y = selected.getFullYear();
      setYearPageStart(y - centerOffset);
    }
  }, [selected, centerOffset]);

  useEffect(() => {
    if (!open || !anchorRef) return;
    const rect = anchorRef.getBoundingClientRect();
    const left = Math.max(8, rect.left);
    const top = rect.bottom + 6 + window.scrollY;
    setPosition({ left, top });
  }, [open, anchorRef]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        onSelect(prevRef.current);
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onSelect]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const portal = document.body;

  const months = Array.from({ length: 12 }).map((_, i) =>
    new Date(0, i).toLocaleString(undefined, { month: 'short' })
  );
  // Use selected date's month if available, otherwise visibleMonth
  const currentYear = visibleMonth.getFullYear();
  const monthIndex = selected ? selected.getMonth() : visibleMonth.getMonth();

  const years = Array.from({ length: yearRange }).map((_, i) => yearPageStart + i);

  const selectedValue = selected
    ? new Date(selected.getTime() - selected.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10)
    : '';

  function Header() {

    function setMonth(m: number) {
      // If a date is selected, preserve the day, otherwise use 1
      const day = selected ? selected.getDate() : 1;
      const newDate = new Date(currentYear, m, day);
      setVisibleMonth(newDate);
      onSelect(newDate);
    }

    function setYear(y: number) {
      const newDate = new Date(y, monthIndex, 1);
      setVisibleMonth(newDate);
      setYearPageStart(y - centerOffset);
      onSelect(newDate);
    }


    const prevYear = () => {
      const y = currentYear - 1;
      const newDate = new Date(y, monthIndex, 1);
      setVisibleMonth(newDate);
      setYearPageStart(y - centerOffset);
      onSelect(newDate);
    };

    const nextYear = () => {
      const y = currentYear + 1;
      const newDate = new Date(y, monthIndex, 1);
      setVisibleMonth(newDate);
      setYearPageStart(y - centerOffset);
      onSelect(newDate);
    };

    return (
      <div className="calendar-header flex items-center justify-between gap-2 mb-2">
        <select
          value={monthIndex}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="calendar-select month-select"
        >
          {months.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <button
            onClick={prevYear}
            className="h-6 w-6 rounded-full border border-slate-200 text-xs flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition"
            tabIndex={-1}
            aria-label="Previous year"
            type="button"
          >
            ‹
          </button>
          <select
            value={currentYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="calendar-select year-select"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={nextYear}
            className="h-6 w-6 rounded-full border border-slate-200 text-xs flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition"
            tabIndex={-1}
            aria-label="Next year"
            type="button"
          >
            ›
          </button>
        </div>
      </div>
    );
  }

  const popover = (
    <div
      ref={popRef}
      className="bg-white rounded-xl shadow-xl border border-slate-100 p-2"
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        minWidth,
        zIndex: 99999,
        fontSize: 13,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
      }}
    >
      <Header />

      <div className="space-y-2 rounded-lg border border-slate-100 p-2 bg-slate-50">
        <input
          type="date"
          value={selectedValue}
          onChange={(event) => {
            if (!event.target.value) {
              onSelect(undefined);
              return;
            }
            const nextDate = new Date(`${event.target.value}T00:00:00`);
            onSelect(nextDate);
            setVisibleMonth(nextDate);
            setYearPageStart(nextDate.getFullYear() - centerOffset);
          }}
          className="h-8 w-full rounded-full border border-slate-200 px-3 text-xs outline-none transition-all focus:border-blue-400 bg-white"
        />
        <p className="text-[10px] text-slate-500">
          Use the native date picker to select a day, then apply the change.
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => {
            onSelect(prevRef.current);
            onCancel();
          }}
          className="h-7 px-3 text-xs border border-slate-200 rounded-full bg-white hover:bg-slate-100 transition"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          className="h-7 px-3 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          type="button"
        >
          Apply
        </button>
      </div>
      <style jsx global>{`
        .calendar-select {
          height: 24px;
          font-size: 11px;
          padding: 0 8px;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .month-select { min-width: 70px; }
        .year-select { min-width: 55px; }
      `}</style>
    </div>
  );

  return ReactDOM.createPortal(popover, portal);
}