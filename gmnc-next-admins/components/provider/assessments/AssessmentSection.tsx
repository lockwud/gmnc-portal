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
  const isClinicalNotes = section.sectionCode === 'clinical_notes';

  const regularField = isClinicalNotes
    ? section.fields.find((field) => field.fieldKey === 'isRegularPerformance') ?? null
    : null;

  const commentField = isClinicalNotes
    ? section.fields.find((field) => field.fieldKey === 'clinicalNotesComment') ?? null
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
        {section.description ? (
          <p className="mt-1 text-xs text-slate-500">{section.description}</p>
        ) : null}
      </div>

      {isClinicalNotes && regularField && commentField ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AssessmentFieldRenderer
              field={regularField}
              value={values[fieldResponseKey(regularField)]}
              onChange={(nextValue) => onFieldChange(fieldResponseKey(regularField), nextValue)}
            />
          </div>
          <div className="lg:col-span-2">
            <AssessmentFieldRenderer
              field={commentField}
              value={values[fieldResponseKey(commentField)]}
              onChange={(nextValue) => onFieldChange(fieldResponseKey(commentField), nextValue)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      )}
    </section>
  );
}
