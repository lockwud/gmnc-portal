'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type FieldOption = string | { label: string; value: string };

type AssessmentFormField = {
  fieldCode: string;
  fieldKey?: string;
  question: string;
  expectedAnswerFormat: string;
  options?: FieldOption[];
  required?: boolean;
  helperText?: string;
};

type Props = {
  field: AssessmentFormField;
  value: unknown;
  onChange: (nextValue: unknown) => void;
};

function normalizeFormat(format?: string) {
  return String(format || '').toUpperCase();
}

const ASHWORTH_SCORE_LABELS: Record<string, string> = {
  '0': 'No increase in muscle tone',
  '1': 'Slight increase in muscle tone, manifested by a catch and release or by minimal resistance at the end of the range of motion when the affected part(s) is moved in flexion or extension',
  '1+': 'Slight increase in muscle tone, manifested by a catch, followed by minimal resistance throughout the remainder (less than half) of the ROM',
  '2': 'More marked increase in muscle tone through most of the ROM, but affected part(s) easily moved',
  '3': 'Considerable increase in muscle tone, passive movement difficult',
  '4': 'Affected part(s) rigid in flexion or extension',
};

function describeAshworthOption(option: { label: string; value: string }) {
  const trimmedValue = option.value.trim();
  if (trimmedValue in ASHWORTH_SCORE_LABELS) {
    return `${trimmedValue} — ${ASHWORTH_SCORE_LABELS[trimmedValue]}`;
  }
  if (ASHWORTH_SCORE_LABELS[option.label]) {
    return `${option.label} — ${ASHWORTH_SCORE_LABELS[option.label]}`;
  }
  return option.label;
}

function normalizeOptions(options?: FieldOption[]) {
  if (!Array.isArray(options)) return [];

  return options.map((option) => {
    if (typeof option === 'string') {
      const normalized = option.replace(/_/g, ' ');
      const described = normalized in ASHWORTH_SCORE_LABELS
        ? `${normalized} — ${ASHWORTH_SCORE_LABELS[normalized]}`
        : normalized;
      return { label: described, value: option };
    }

    const { label, value } = option;
    const described = describeAshworthOption({ label, value: String(value) });

    return { label: described, value: String(option.value) };
  });
}

export default function AssessmentFieldRenderer({
  field,
  value,
  onChange,
}: Props) {
  const format = normalizeFormat(field.expectedAnswerFormat);
  const normalizedOptions = useMemo(() => normalizeOptions(field.options), [field.options]);
  const hasOptions = normalizedOptions.length > 0;

  const label = field.question || field.fieldCode;
  const id = field.fieldKey || field.fieldCode;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (format === 'BOOLEAN') {
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ].map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (hasOptions) {
    const selectedValue = String(value ?? '');
    const selectedOption = normalizedOptions.find((option) => option.value === selectedValue);

    return (
      <div className="max-w-[220px] space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>

        <div ref={dropdownRef} className="relative">
          <button
            id={id}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left text-xs transition outline-none ${
              open
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
              {selectedOption ? selectedOption.label : 'Select'}
            </span>

            <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl"
            >
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[11px] transition ${
                    selectedValue === ''
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Select
                </button>

                {normalizedOptions.map((option) => {
                  const selected = selectedValue === option.value;
                  const showBadge = ['0', '1', '2', '3', 'NT'].includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[11px] transition ${
                        selected
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {showBadge ? (
                        <span className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                          option.value === 'NT' ? 'bg-slate-400 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {option.value}
                        </span>
                      ) : null}
                      <span className="truncate leading-tight">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (format === 'BOOLEAN') {
    return (
      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ].map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (format === 'NUMBER' || format === 'INTEGER' || format === 'FLOAT') {
    return (
      <div className="max-w-[280px] space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        <input
          id={id}
          type="number"
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
        />
      </div>
    );
  }

  if (format === 'NUMBER_OR_NT') {
    const numValue = value === 'NT' || value === 'nt' ? 'NT' : (value === undefined || value === null ? '' : String(Number(value)));
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            min="0"
            max="3"
            value={numValue === 'NT' ? '' : numValue}
            onChange={(e) => {
              const newVal = e.target.value === '' ? '' : Number(e.target.value);
              onChange(newVal);
            }}
            className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
          />
          <span className="text-slate-400">or</span>
          <button
            type="button"
            onClick={() => onChange('NT')}
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              value === 'NT' || value === 'nt'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            NT
          </button>
        </div>
        {field.helperText ? (
          <p className="text-xs text-slate-500">{field.helperText}</p>
        ) : null}
      </div>
    );
  }

  if (format === 'DATE') {
    return (
      <div className="max-w-[280px] space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        <input
          id={id}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>
    );
  }

  if (
    format === 'TEXTAREA' ||
    format === 'TEXT' ||
    format === 'LONG_TEXT' ||
    format === 'PARAGRAPH'
  ) {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        <textarea
          id={id}
          rows={8}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
      />
    </div>
  );
}