'use client';

import React, { useState, useRef, useEffect } from 'react';

type FieldOption = string | { label: string; value: string };

type OtAssessmentValues = Record<string, unknown>;

type OtAssessmentField = {
  fieldCode: string;
  fieldKey?: string;
  question: string;
  expectedAnswerFormat: string;
  options?: FieldOption[];
  required?: boolean;
  helperText?: string;
};

type OtAssessmentSection = {
  title: string;
  description?: string;
  fields: OtAssessmentField[];
  sectionCode?: string;
};

const ADL_OPTIONS = ['Able', 'With Difficulties', 'Need Adaptations', 'Unable'];

function normalizeOptions(options?: FieldOption[]): { label: string; value: string }[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) => {
    if (typeof option === 'string') return { label: option, value: option };
    return { label: option.label, value: String(option.value ?? option.label) };
  });
}

function toTitleFromId(value: string) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

type Props = {
  section: OtAssessmentSection;
  values: OtAssessmentValues;
  onFieldChange: (fieldKey: string, nextValue: unknown) => void;
};

function DropdownField({ field, value, onChange }: { field: OtAssessmentField; value: unknown; onChange: (next: unknown) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const key = field.fieldKey || field.fieldCode;
  const options = normalizeOptions(field.options);
  const selectedValue = String(value ?? '');
  const selectedOption = options.find((o) => o.value === selectedValue);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-block w-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 min-w-[130px] max-w-[200px] items-center justify-between rounded-full border border-slate-200 bg-white px-3 text-left text-[11px] text-slate-700 transition hover:border-slate-300"
      >
        <span className="truncate pr-1">{selectedOption ? selectedOption.label : <span className="text-slate-400">Select</span>}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 text-slate-400">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[200px] rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full rounded-xl px-3 py-1.5 text-left text-[11px] transition ${!selectedOption ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              Select
            </button>
            {options.map((option, idx) => {
              const active = selectedValue === option.value;
              return (
                <button
                  key={`${option.value}-${idx}`}
                  type="button"
                  onClick={() => { onChange(option.value); setOpen(false); }}
                  className={`w-full rounded-xl px-3 py-1.5 text-left text-[11px] transition ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AdlRadioField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const selectedValue = String(value ?? '');

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {ADL_OPTIONS.map((option) => {
        const active = selectedValue === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-left text-[14px] font-medium transition ${
              active
                ? 'border-emerald-600 bg-white text-emerald-700'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <span
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                active
                  ? 'border-emerald-600 bg-emerald-600'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {active && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>

            <span className="truncate leading-none">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
export default function OtAssessmentSection({ section, values, onFieldChange }: Props) {
  const responseKey = (field: OtAssessmentField) => field.fieldKey || field.fieldCode;

  const update = (field: OtAssessmentField, next: unknown) =>
    onFieldChange(responseKey(field), next);

  const toggleCheckboxItem = (field: OtAssessmentField, optionValue: string) => {
    const key = responseKey(field);
    const current = values[key];
    const arr: string[] = Array.isArray(current)
      ? current.filter((item): item is string => typeof item === 'string')
      : current && String(current).trim() !== ''
        ? [String(current)]
        : [];
    const next = arr.includes(optionValue)
      ? arr.filter((item) => item !== optionValue)
      : [...arr, optionValue];
    update(field, next);
  };

  const renderCheckboxGroup = (field: OtAssessmentField) => {
    const options = normalizeOptions(field.options);
    const selected = values[responseKey(field)];
    const selectedArr: string[] = Array.isArray(selected)
      ? selected.filter((item): item is string => typeof item === 'string')
      : selected && String(selected).trim() !== ''
        ? [String(selected)]
        : [];

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option, idx) => {
          const active = selectedArr.includes(option.value);
          return (
            <button
              key={`${option.value}-${idx}`}
              type="button"
              onClick={() => toggleCheckboxItem(field, option.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium whitespace-nowrap transition ${                active
                  ? 'border-emerald-400 bg-emerald-50/90 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span
                className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                  active ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                }`}
              >
                {active && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderRadioGroup = (field: OtAssessmentField) => {
    const options = normalizeOptions(field.options);
    const selectedValue = String(values[responseKey(field)] ?? '');

    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option, idx) => {
          const active = selectedValue === option.value;
          return (
            <button
              key={`${option.value}-${idx}`}
              type="button"
              onClick={() => update(field, option.value)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                active
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderField = (field: OtAssessmentField) => {
    const key = responseKey(field);
    const value = values[key];
    const rawFormat = String(field.expectedAnswerFormat || '').toUpperCase();
    // If backend returns `string` but provides `options`, treat as `SELECT`
    // so dropdowns render correctly (covers string or object option formats).
    const hasOptions = Array.isArray(field.options) && field.options.length > 0;
    const format = (rawFormat === 'STRING' && hasOptions) ? 'SELECT' : rawFormat;
    const isLabelField = (field.fieldKey === 'houseTypeAndLevel') || String(field.expectedAnswerFormat || '').toUpperCase() === 'LABEL';
    const options = normalizeOptions(field.options);

    if (isLabelField) {
      return (
        <div className="py-2">
          <div className="text-sm font-medium text-slate-800">{field.question}</div>
        </div>
      );
    }

    if (format === 'CHECKBOX') return renderCheckboxGroup(field);

    if (format === 'RADIO') {
      const isAdlField =
        field.options?.length === 4 &&
        field.options.every((o) => typeof o === 'string');

      if (isAdlField) {
        return <AdlRadioField value={value} onChange={(next) => onFieldChange(key, next)} />;
      }
      return renderRadioGroup(field);
    }

    if (format === 'TEXTAREA') {
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onFieldChange(key, e.target.value)}
          placeholder="Enter details"
          rows={3}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-500"
        />
      );
    }

    if (format === 'TEXT') {
      return (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onFieldChange(key, e.target.value)}
          placeholder={toTitleFromId(field.fieldCode || field.fieldKey || '')}
          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-500"
        />
      );
    }

    if (format === 'SELECT') {
      return <DropdownField field={field} value={value} onChange={(next) => onFieldChange(key, next)} />;
    }

    return (
      <input
        type="text"
        value={String(value ?? '')}
        onChange={(e) => onFieldChange(key, e.target.value)}
        placeholder="Enter value"
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-500"
      />
    );
  };

  const renderFieldWithLabel = (field: OtAssessmentField) => {
    const isLabel = (field.fieldKey === 'houseTypeAndLevel') || String(field.expectedAnswerFormat || '').toUpperCase() === 'LABEL';

    if (isLabel) {
      return (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-800">{field.question || field.fieldCode}</div>
          {field.helperText ? <p className="text-[11px] text-slate-500">{field.helperText}</p> : null}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          {field.question || field.fieldCode}
          {field.required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
        {renderField(field)}
        {field.helperText ? <p className="text-[11px] text-slate-500">{field.helperText}</p> : null}
      </div>
    );
  };

  const wideSections = new Set([
    'NEUROMOTOR',
    'UPPER_EXTREMITY',
    'ADL_DETAILED',
    'SENSORIMOTOR',
    'FINE_MOTOR',
    'SENSORY_BEHAVIOR',
    'SUMMARY_PROBLEMS',
    'OCCUPATIONAL_PROFILE'
  ]);
  const sectionCode = (section.sectionCode || '').toUpperCase();
  const isWide = wideSections.has(sectionCode);

  const gridClass = isWide ? 'grid-cols-1' : 'md:grid-cols-3';

  // remove duplicate fields with identical questions (normalized)
  const seenQuestions = new Set<string>();
  const uniqueFields = section.fields.filter((f) => {
    const q = String(f.question || f.fieldCode || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
    if (seenQuestions.has(q)) return false;
    seenQuestions.add(q);
    return true;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">{section.title}</h2>
        {section.description ? <p className="mt-1 text-xs text-slate-500">{section.description}</p> : null}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${gridClass}`}>
        {uniqueFields.map((field) => {
          const key = responseKey(field);
          return (
            <div key={key} className="md:col-span-1">
              {renderFieldWithLabel(field)}
            </div>
          );
        })}
      </div>
    </section>
  );
}
