import {
  AssessmentPatientReportResponse,
  AssessmentReportResponse,
  AssessmentSubmitPayload,
  AssessmentSubmitResponse,
  AssessmentToolFormResponse,
  AssessmentToolsResponse,
} from './types';

let assessmentToolsPromise: Promise<AssessmentToolsResponse> | null = null;
const assessmentToolFormPromises = new Map<string, Promise<AssessmentToolFormResponse>>();

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    cache: 'no-store',
  });

  return parseJson<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const authToken = getToken();
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(body),
  });

  return parseJson<T>(res);
}

export async function getAssessmentTools(): Promise<AssessmentToolsResponse> {
  if (!assessmentToolsPromise) {
    assessmentToolsPromise = apiGet<{
      status: boolean;
      message?: string;
      data: AssessmentToolsResponse;
    }>('/api/assessment/tools').then((res) => res.data);
  }

  return assessmentToolsPromise;
}

export async function getAssessmentToolForm(toolCode: string): Promise<AssessmentToolFormResponse> {
  const normalizedToolCode = toolCode.trim();

  if (!assessmentToolFormPromises.has(normalizedToolCode)) {
    assessmentToolFormPromises.set(
      normalizedToolCode,
      apiGet<{
        status: boolean;
        message?: string;
        data: AssessmentToolFormResponse;
      }>(`/api/assessment/tools/${normalizedToolCode}/form`).then((res) => res.data),
    );
  }

  const existing = assessmentToolFormPromises.get(normalizedToolCode)!;
  const fallback = buildOccupationalTherapyForm(normalizedToolCode);

  return Promise.resolve(existing).catch(() => fallback);
}

export function clearAssessmentToolFormCache(toolCode?: string) {
  if (!toolCode) {
    assessmentToolFormPromises.clear();
    return;
  }

  const key = toolCode.trim();
  if (assessmentToolFormPromises.has(key)) {
    assessmentToolFormPromises.delete(key);
  }
}

function buildOccupationalTherapyForm(toolCode: string): AssessmentToolFormResponse {
  const code = toolCode.trim().toUpperCase();
  if (!['OT_CP_CLINICAL', 'OT_CLINICAL', 'OT', 'OCCUPATIONAL_THERAPY'].includes(code)) {
    return {
      toolCode,
      sections: [],
    };
  }

  const adlOptions = [
    { label: 'Able', value: 'ABLE' },
    { label: 'With Difficulties', value: 'WITH_DIFFICULTIES' },
    { label: 'Need Adaptations', value: 'NEED_ADAPTATIONS' },
    { label: 'Unable', value: 'UNABLE' },
  ];

  return {
    toolCode,
    toolName: 'Occupational Therapy Assessment Form',
    sections: [
      {
        title: 'Family & Home Environment',
        description: '',
        sectionCode: 'family_home',
        fields: [
          { fieldCode: 'ground_surface', question: 'Ground Surface', expectedAnswerFormat: 'STRING', options: [{ label: 'Even (Concrete/asphalt)', value: 'EVEN' }, { label: 'Sand', value: 'SAND' }, { label: 'Gravel', value: 'GRAVEL' }, { label: 'Uneven; specify:', value: 'UNEVEN' }] },
          { fieldCode: 'main_entrance', question: 'Main Entrance', expectedAnswerFormat: 'SELECT', options: [{ label: 'Leveled/even', value: 'LEVELLED_EVEN' }, { label: 'Few Steps', value: 'FEW_STEPS' }, { label: 'Ramp', value: 'RAMP' }, { label: 'Elevator', value: 'ELEVATOR' }] },
          { fieldCode: 'doors_hallways', question: 'Doors/Hallways', expectedAnswerFormat: 'SELECT', options: [{ label: 'Wheelchair accessible', value: 'WHEELCHAIR_ACCESSIBLE' }, { label: 'Narrow', value: 'NARROW' }] },
          { fieldCode: 'stairs_inside', question: 'Stairs inside the house', expectedAnswerFormat: 'STRING', options: [{ label: 'Banisters (railing)', value: 'BANISTERS' }, { label: 'N/A', value: 'NA' }] },
          { fieldCode: 'bedroom', question: 'Bedroom', expectedAnswerFormat: 'STRING', options: [{ label: 'Bed', value: 'BED' }, { label: 'Mattress on the ground', value: 'MATTRESS_GROUND' }, { label: 'Main floor', value: 'MAIN_FLOOR' }, { label: 'Higher level', value: 'HIGHER_LEVEL' }] },
          { fieldCode: 'accessibility_issues', question: 'Accessibility issues (if any)', expectedAnswerFormat: 'TEXTAREA' },
          { fieldCode: 'equipment_in_use', question: 'Equipment in use (if any)', expectedAnswerFormat: 'STRING', options: [{ label: 'Manual Wheelchair', value: 'MANUAL_WHEELCHAIR' }, { label: 'Powered Wheelchair', value: 'POWERED_WHEELCHAIR' }, { label: 'Elbow Gaiter', value: 'ELBOW_GAITER' }, { label: 'RT Wrist Splint', value: 'RT_WRIST_SPLINT' }, { label: 'LT Wrist Splint', value: 'LT_WRIST_SPLINT' }, { label: 'RT Hand Splint', value: 'RT_HAND_SPLINT' }, { label: 'LT Hand Splint', value: 'LT_HAND_SPLINT' }] },
          { fieldCode: 'pushchair_stroller', question: 'Pushchair/Stroller', expectedAnswerFormat: 'STRING', options: [{ label: 'Feeding chair', value: 'FEEDING_CHAIR' }, { label: 'Car-seat', value: 'CAR_SEAT' }, { label: 'Toilet chair', value: 'TOILET_CHAIR' }, { label: 'Shower chair', value: 'SHOWER_CHAIR' }, { label: 'Special Tables', value: 'SPECIAL_TABLES' }, { label: 'Adapted Eating Aids', value: 'ADAPTED_EATING_AIDS' }, { label: 'Other', value: 'OTHER' }] },
          { fieldCode: 'equipment_source', question: 'Source of Equipment', expectedAnswerFormat: 'TEXTAREA' },
          { fieldCode: 'house_type', question: 'House Type', expectedAnswerFormat: 'RADIO', options: [{ label: 'Initial', value: 'INITIAL' }, { label: 'Re-Assessment', value: 'RE_ASSESSMENT' }] },
        ],
      },
      {
        title: 'Clinical Section',
        description: '',
        sectionCode: 'clinical_section',
        fields: [
          { fieldCode: 'assessment_date', question: 'Date', expectedAnswerFormat: 'DATE' },
          { fieldCode: 'clinical_program', question: 'Clinical Program', expectedAnswerFormat: 'RADIO', options: [{ label: 'EIP', value: 'EIP' }, { label: 'IP1', value: 'IP1' }] },
        ],
      },
      {
        title: 'School Section',
        description: '',
        sectionCode: 'school_section',
        fields: [
          { fieldCode: 'school_program', question: 'School Program', expectedAnswerFormat: 'RADIO', options: [{ label: 'IP2', value: 'IP2' }, { label: 'OP', value: 'OP' }, { label: 'GS', value: 'GS' }, { label: 'PS', value: 'PS' }, { label: 'ECP', value: 'ECP' }] },
          { fieldCode: 'school_level', question: 'Level', expectedAnswerFormat: 'STRING' },
        ],
      },
      {
        title: 'ADL Skills - Self Feeding',
        fields: [
          { fieldCode: 'self_feeding', question: 'Self-Feeding', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'ADL Skills - Dressing',
        fields: [
          { fieldCode: 'dressing_upper', question: 'Dressing - Upper Body', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'dressing_lower', question: 'Dressing - Lower Body', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'undressing_upper', question: 'Undressing - Upper Body', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'undressing_lower', question: 'Undressing - Lower Body', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'ADL Skills - Grooming',
        fields: [
          { fieldCode: 'grooming', question: 'Grooming', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'ADL Skills - Bathing/Hygiene',
        fields: [
          { fieldCode: 'tooth_brushing', question: 'Tooth brushing', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'bathing', question: 'Bathing', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'transfer_tub_shower', question: 'Transfer - Tub/Shower', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'ADL Skills - Toileting',
        fields: [
          { fieldCode: 'toileting', question: 'Toileting', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'ADL Skills - Mobility',
        fields: [
          { fieldCode: 'functional_mobility', question: 'Functional mobility', expectedAnswerFormat: 'STRING', options: adlOptions },
          { fieldCode: 'transfer_bed_chair', question: 'Transfer - Bed, Chair, W/C', expectedAnswerFormat: 'STRING', options: adlOptions },
        ],
      },
      {
        title: 'Reflexes',
        description: 'Primitive and Protective Reflexes',
        sectionCode: 'reflexes',
        fields: [
          { fieldCode: 'reflexes', question: 'Integrated / Developed - Comments if any', expectedAnswerFormat: 'CHECKBOX', options: [{ label: 'Moro Reflex (6 Months)', value: 'MORO' }, { label: 'ATNR (4 months)', value: 'ATNR' }, { label: 'Protective Reaction – Forward (6 months)', value: 'PROTECTIVE_FORWARD' }, { label: 'Protective Reaction – Side (6 months)', value: 'PROTECTIVE_SIDE' }, { label: 'Protective Reaction – Backward (10 months)', value: 'PROTECTIVE_BACKWARD' }] },
        ],
      },
      {
        title: 'Gross Motor',
        description: 'Gross Motor Milestones',
        sectionCode: 'gross_motor',
        fields: [
          { fieldCode: 'gross_motor', question: 'Gross Motor Milestones - Comments if any', expectedAnswerFormat: 'CHECKBOX', options: [{ label: 'Pull to sit', value: 'PULL_TO_SIT' }, { label: 'Rolling Prone', value: 'ROLLING_PRONE' }, { label: 'Head Control Trunk Control', value: 'HEAD_TRUNK' }, { label: 'Prone – on – forearm', value: 'PRONE_FOREARM' }, { label: 'Crawling', value: 'CRAWLING' }, { label: 'Sitting Balance Static', value: 'SITTING_STATIC' }, { label: 'Sitting Balance Dynamic', value: 'SITTING_DYNAMIC' }, { label: 'Prone – on – Open hands', value: 'PRONE_OPEN_HANDS' }, { label: 'Walking', value: 'WALKING' }, { label: 'Standing Balance Static', value: 'STANDING_STATIC' }, { label: 'Standing Balance Dynamic', value: 'STANDING_DYNAMIC' }] },
        ],
      },
      {
        title: 'GMFCS Level',
        fields: [
          { fieldCode: 'gmfcs', question: 'GMFCS Level', expectedAnswerFormat: 'RADIO', options: [{ label: 'Level I', value: 'LEVEL_I' }, { label: 'Level II', value: 'LEVEL_II' }, { label: 'Level III', value: 'LEVEL_III' }, { label: 'Level IV', value: 'LEVEL_IV' }, { label: 'Level V', value: 'LEVEL_V' }] },
        ],
      },
      ...buildOtRomSections(),
      {
        title: 'Upper-extremity Modified Ashworth Scale',
        fields: [
          { fieldCode: 'upper_ashworth', question: 'Upper-extremity Modified Ashworth Scale', expectedAnswerFormat: 'STRING', options: [{ label: '0 — No increase in muscle tone', value: '0' }, { label: '1 — Slight increase, catch and release or minimal resistance at end of range of motion', value: '1' }, { label: '1+ — Slight increase, catch then minimal resistance through remainder (less than half) of ROM', value: '1+' }, { label: '2 — More marked increase through most of ROM, part(s) easily moved', value: '2' }, { label: '3 — Considerable increase, passive movement difficult', value: '3' }, { label: '4 — Affected part(s) rigid in flexion or extension', value: '4' }] },
        ],
      },
    ],
  };
}

type RomDimension = { code: string; name: string; start: number; end: number };

const RIGHT_ROM_DIMENSIONS: RomDimension[] = [
  { code: 'rom_r_shoulder', name: 'Shoulder Flexion/Abduction/IR/ER', start: 1, end: 4 },
  { code: 'rom_r_elbow', name: 'Elbow Flexion/Extension', start: 1, end: 2 },
  { code: 'rom_r_forearm', name: 'Forearm Supination/Pronation', start: 1, end: 2 },
  { code: 'rom_r_wrist', name: 'Wrist Flexion/Extension/Radial/Ulnar Deviation', start: 1, end: 4 },
  { code: 'rom_r_thumb', name: 'Thumb Abduction', start: 1, end: 1 },
  { code: 'rom_r_fingers', name: 'Finger MCP/PIP/DIP Flexion', start: 1, end: 3 },
];

const LEFT_ROM_DIMENSIONS: RomDimension[] = [
  { code: 'rom_l_shoulder', name: 'Shoulder Flexion/Abduction/IR/ER', start: 1, end: 4 },
  { code: 'rom_l_elbow', name: 'Elbow Flexion/Extension', start: 1, end: 2 },
  { code: 'rom_l_forearm', name: 'Forearm Supination/Pronation', start: 1, end: 2 },
  { code: 'rom_l_wrist', name: 'Wrist Flexion/Extension/Radial/Ulnar Deviation', start: 1, end: 4 },
  { code: 'rom_l_thumb', name: 'Thumb Abduction', start: 1, end: 1 },
  { code: 'rom_l_fingers', name: 'Finger MCP/PIP/DIP Flexion', start: 1, end: 3 },
];

function buildRomFields(dimensions: RomDimension[], side: 'R' | 'L') {
  const prefix = side.toLowerCase();
  const sideLabel = side === 'R' ? 'Right' : 'Left';

  return dimensions.flatMap((dim, dimIndex) => {
    const jointItems = Array.from({ length: dim.end - dim.start + 1 }, (_, i) => {
      const num = dim.start + i;
      return {
        fieldCode: `${prefix}_rom_${dim.code}_${num}`,
        fieldKey: `${prefix}_rom_${dim.code}_${num}`,
        question: `${sideLabel} ${dim.name} - Item ${num}`,
        expectedAnswerFormat: 'STRING',
        options: [{ label: 'Normal', value: 'NORMAL' }, { label: 'Limited, specify ROM:', value: 'LIMITED' }],
      };
    });

    const mmtField = {
      fieldCode: `${prefix}_rom_${dim.code}_mmt`,
      fieldKey: `${prefix}_rom_${dim.code}_mmt`,
      question: `${sideLabel} ${dim.name} - MMT (Score 0-5)`,
      expectedAnswerFormat: 'STRING',
      options: [{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }],
    };

    return [...jointItems, mmtField];
  });
}

function buildOtRomSections() {
  const rightFields = buildRomFields(RIGHT_ROM_DIMENSIONS, 'R');
  const leftFields = buildRomFields(LEFT_ROM_DIMENSIONS, 'L');

  return [
    {
      title: 'Range of Motion - Right Upper Extremity',
      description: '',
      sectionCode: 'rom_right',
      fields: rightFields,
    },
    {
      title: 'Range of Motion - Left Upper Extremity',
      description: '',
      sectionCode: 'rom_left',
      fields: leftFields,
    },
  ];
}

export async function warmAssessmentToolForms(toolCodes: string[]): Promise<void> {
  await Promise.allSettled(
    toolCodes
      .map((toolCode) => toolCode.trim())
      .filter(Boolean)
      .map((toolCode) => getAssessmentToolForm(toolCode)),
  );
}

export async function getPatientAssessments(patientId: string): Promise<AssessmentPatientReportResponse> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentPatientReportResponse;
  }>(`/api/assessment/patient/${patientId}/reports`);

  return res.data;
}

export async function getAssessmentReport(assessmentId: string): Promise<AssessmentReportResponse> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: AssessmentReportResponse;
  }>(`/api/assessment/${assessmentId}/report`);

  return res.data;
}

export async function submitAssessment(payload: AssessmentSubmitPayload): Promise<AssessmentSubmitResponse> {
  const res = await apiPost<{
    status: boolean;
    message?: string;
    data: AssessmentSubmitResponse;
  }>('/api/assessment/submit', payload);

  return res.data;
}

export async function getAssessmentById(assessmentId: string): Promise<{ id: string; patientId: string; providerId: string; toolCode: string; status: string; assessedAt?: string }> {
  const res = await apiGet<{
    status: boolean;
    message?: string;
    data: { id: string; patientId: string; providerId: string; toolCode: string; status: string; assessedAt?: string };
  }>(`/api/assessment/${assessmentId}`);

  return res.data;
}