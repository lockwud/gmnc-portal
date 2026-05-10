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

function normalizeOptions(options?: FieldOption[]) {
  if (!Array.isArray(options)) return [];

  return options.map((option) => {
    if (typeof option === 'string') {
      return {
        label: option.replace(/_/g, ' '),
        value: option,
      };
    }

    return {
      label: option.label,
      value: option.value,
    };
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

  if (hasOptions) {
    const selectedValue = String(value ?? '');
    const selectedOption = normalizedOptions.find((option) => option.value === selectedValue);

    return (
      <div className="max-w-[320px] space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label}
        </label>

        <div ref={dropdownRef} className="relative">
          <button
            id={id}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-sm transition outline-none ${
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

            <span className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                width="12"
                height="12"
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
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                  className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${
                    selectedValue === ''
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Select
                </button>

                {normalizedOptions.map((option) => {
                  const selected = selectedValue === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${
                        selected
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {field.helperText ? (
          <p className="text-xs text-slate-500">{field.helperText}</p>
        ) : null}
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
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
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
          rows={4}
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