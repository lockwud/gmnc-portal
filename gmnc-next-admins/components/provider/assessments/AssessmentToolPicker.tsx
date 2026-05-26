'use client';

import React from 'react';
import { AssessmentToolItem } from '@/lib/api/types';

type Props = {
  tools: AssessmentToolItem[];
  selectedToolCode?: string | null;
  onSelect: (tool: AssessmentToolItem) => void;
  canUseRestrictedTools?: boolean;
};

export default function AssessmentToolPicker({
  tools,
  selectedToolCode,
  onSelect,
  canUseRestrictedTools = false,
}: Props) {
  const professionStyles: Record<string, string> = {
    PHYSIOTHERAPIST: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    OCCUPATIONAL_THERAPIST: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
    SPEECH_THERAPIST: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
    CLINICAL_PSYCHOLOGIST: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    GENERAL_PAEDIATRICIAN: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  };

  const abbreviate = (value: string) =>
    value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  return (
    <div className="space-y-3">
      {tools.map((tool) => {
        const selected = selectedToolCode === tool.toolCode;
        const disabled = !canUseRestrictedTools && !tool.canCurrentUserUse;
        const toolAccent = selected
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-100 text-slate-600';

        return (
          <button
            key={tool.toolCode}
            type="button"
            onClick={() => !disabled && onSelect(tool)}
            disabled={disabled}
            className={`w-full min-w-0 rounded-2xl border px-4 py-3 text-left transition ${
              selected
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${toolAccent}`}
                >
                  {abbreviate(tool.toolCode || tool.toolName || 'TL')}
                </span>

                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {tool.toolName || tool.toolCode}
                  </h3>
                  <p className="mt-1 truncate text-[11px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                    {tool.toolCode}
                  </p>
                </div>
              </div>

              {selected && (
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white">
                  Selected
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(tool.whoCanUseTool || []).map((role) => (
                <span
                  key={role}
                  title={role}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2.5 text-[10px] font-semibold uppercase ${
                    professionStyles[role] ?? 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                  }`}
                >
                  {abbreviate(role)}
                </span>
              ))}
            </div>

            {!canUseRestrictedTools && !tool.canCurrentUserUse && (
              <p className="mt-3 text-xs text-red-600">
                You are not authorized to use this tool for your profession.
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
