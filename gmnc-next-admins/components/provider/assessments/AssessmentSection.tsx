'use client';

import React from 'react';
import { AssessmentFormSection } from '@/lib/api/types';
import AssessmentFieldRenderer from './AssessmentFieldRender';

type Props = {
  section: AssessmentFormSection;
  values: Record<string, unknown>;
  onFieldChange: (fieldKey: string, nextValue: unknown) => void;
};

function fieldResponseKey(field: { fieldKey?: string; fieldCode: string }) {
  return field.fieldKey || field.fieldCode;
}

export default function AssessmentSection({
  section,
  values,
  onFieldChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
        {section.description ? (
          <p className="mt-1 text-xs text-slate-500">{section.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {section.fields.map((field) => {
          const responseKey = fieldResponseKey(field);

          return (
            <div
              key={responseKey}
              className="md:col-span-1"
            >
              <AssessmentFieldRenderer
                field={field}
                value={values[responseKey]}
                onChange={(nextValue) => onFieldChange(responseKey, nextValue)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}