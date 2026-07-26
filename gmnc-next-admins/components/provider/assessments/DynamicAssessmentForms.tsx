'use client';

import React from 'react';
import { AssessmentToolFormResponse } from '@/lib/api/types';
import AssessmentSection from './AssessmentSection';
import OtAssessmentSection from './OtAssessmentSection';
import type { OtAssessmentSectionData } from './OtAssessmentSection';

type Props = {
  schema: AssessmentToolFormResponse;
  values: Record<string, unknown>;
  onFieldChange: (fieldKey: string, nextValue: unknown) => void;
};

const OT_TOOL_CODES = ['OT_CP_CLINICAL_ASSESSMENT', 'OT_CP_CLINICAL', 'OT_CLINICAL', 'OT', 'OCCUPATIONAL_THERAPY'];

function isOtTool(schema: AssessmentToolFormResponse) {
  const code = (schema.toolCode || '').trim().toUpperCase();
  return OT_TOOL_CODES.includes(code);
}

export default function DynamicAssessmentForm({
  schema,
  values,
  onFieldChange,
}: Props) {
  const sections = schema.sections ?? [];

  if (!isOtTool(schema)) {
    return (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <AssessmentSection
            key={`${section.sectionCode ?? section.title}-${index}`}
            section={section}
            values={values}
            onFieldChange={onFieldChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const sectionCode = section.sectionCode || '';

        if (sectionCode === 'clinical_notes') {
          return (
            <AssessmentSection
              key={`${section.title}-${index}`}
              section={section}
              values={values}
              onFieldChange={onFieldChange}
            />
          );
        }

        return (
          <OtAssessmentSection
            key={`${section.title}-${index}`}
            section={section as OtAssessmentSectionData}
            values={values}
            onFieldChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}
