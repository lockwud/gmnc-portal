'use client';

import React from 'react';
import { AssessmentToolFormResponse } from '@/lib/api/types';
import AssessmentSection from './AssessmentSection';

type Props = {
  schema: AssessmentToolFormResponse;
  values: Record<string, unknown>;
  onFieldChange: (fieldKey: string, nextValue: unknown) => void;
};

function buildSectionsFromDimensions(schema: AssessmentToolFormResponse) {
  const dimensions = schema.dimensions ?? [];
  const sections = [];
  
  for (const dim of dimensions) {
    const fields = [];
    for (let i = dim.start; i <= dim.end; i++) {
      fields.push({
        fieldCode: `${dim.code}${i}`,
        fieldKey: `${dim.code}${i}`,
        question: `${dim.code}${i}`,
        expectedAnswerFormat: 'NUMBER_OR_NT',
      });
    }
    sections.push({
      title: dim.name,
      description: '',
      fields,
    });
  }
  
  return sections;
}

export default function DynamicAssessmentForm({
  schema,
  values,
  onFieldChange,
}: Props) {
  let sections = schema.sections ?? [];
  
  if (schema.dimensions && schema.dimensions.length > 0) {
    sections = buildSectionsFromDimensions(schema);
  }
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
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