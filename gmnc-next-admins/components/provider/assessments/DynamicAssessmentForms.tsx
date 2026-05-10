'use client';

import React from 'react';
import { AssessmentToolFormResponse } from '@/lib/api/types';
import AssessmentSection from './AssessmentSection';

type Props = {
  schema: AssessmentToolFormResponse;
  values: Record<string, unknown>;
  onFieldChange: (fieldKey: string, nextValue: unknown) => void;
};

export default function DynamicAssessmentForm({
  schema,
  values,
  onFieldChange,
}: Props) {
  return (
    <div className="space-y-4">
      {schema.sections?.map((section, index) => (
        <AssessmentSection
          key={`${section.title}-${index}`}
          section={section}
          values={values}
          onFieldChange={onFieldChange}
        />
      ))}
    </div>
  );
}