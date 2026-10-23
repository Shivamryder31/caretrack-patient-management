import { Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  // 1. DISCHARGE ELIGIBLE (3 consecutive days without fever: Oct 21, 22, 23)
  {
    id: 'CT-1041',
    name: 'Elena Rostova',
    age: 34,
    gender: 'Female',
    admissionDate: '2026-10-16',
    bedNumber: 'C-04',
    ward: 'Ward C (Convalescent)',
    status: 'Admitted',
    primaryDiagnosis: 'Viral Respiratory Syndrome (Resolving)',
    temperatureLogs: [
      { id: 'TL-101', patientId: 'CT-1041', date: '2026-10-19', time: '08:00', temperature: 38.4, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['Chills', 'Cough'], createdAt: '2026-10-19T08:00:00Z' },
      { id: 'TL-102', patientId: 'CT-1041', date: '2026-10-20', time: '08:00', temperature: 38.1, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['Fatigue'], createdAt: '2026-10-20T08:00:00Z' },
      { id: 'TL-103', patientId: 'CT-1041', date: '2026-10-21', time: '08:00', temperature: 37.1, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Mild dry cough'], createdAt: '2026-10-21T08:00:00Z' },
      { id: 'TL-104', patientId: 'CT-1041', date: '2026-10-22', time: '08:00', temperature: 36.8, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['No acute distress'], createdAt: '2026-10-22T08:00:00Z' },
      { id: 'TL-105', patientId: 'CT-1041', date: '2026-10-23', time: '08:00', temperature: 36.6, isFever: false, recordedBy: 'Nurse A. Patel', symptoms: ['Asymptomatic'], createdAt: '2026-10-23T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-101', patientId: 'CT-1041', date: '2026-10-22', time: '10:30', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Improving', clinicalNotes: 'Vitals stable. Lung sounds clear bilaterally. Approaching discharge criteria.', completed: true, completedAt: '2026-10-22T10:45:00Z' },
      { id: 'DV-102', patientId: 'CT-1041', date: '2026-10-23', time: '09:15', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Improving', clinicalNotes: 'Criteria met. Day 3 afebrile. Ready for discharge approval by Medical Director.', completed: true, completedAt: '2026-10-23T09:30:00Z' }
    ]
  },

  // 2. DISCHARGE ELIGIBLE (3 consecutive days without fever: Oct 20, 21, 22 - Needs check for today Oct 23)
  {
    id: 'CT-1044',
    name: 'Marcus Vance',
    age: 48,
    gender: 'Male',
    admissionDate: '2026-10-15',
    bedNumber: 'C-08',
    ward: 'Ward C (Convalescent)',
    status: 'Admitted',
    primaryDiagnosis: 'Novel Filovirus Exposure - Moderate',
    temperatureLogs: [
      { id: 'TL-111', patientId: 'CT-1044', date: '2026-10-20', time: '08:30', temperature: 37.2, isFever: false, recordedBy: 'Nurse J. Zhao', symptoms: ['Fatigue'], createdAt: '2026-10-20T08:30:00Z' },
      { id: 'TL-112', patientId: 'CT-1044', date: '2026-10-21', time: '08:30', temperature: 36.9, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Mild headache'], createdAt: '2026-10-21T08:30:00Z' },
      { id: 'TL-113', patientId: 'CT-1044', date: '2026-10-22', time: '08:30', temperature: 36.7, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Asymptomatic'], createdAt: '2026-10-22T08:30:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-103', patientId: 'CT-1044', date: '2026-10-22', time: '11:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Stable', clinicalNotes: 'Afebrile 3 consecutive days. Recommend final lab panel and discharge review.', completed: true, completedAt: '2026-10-22T11:20:00Z' },
      { id: 'DV-104', patientId: 'CT-1044', date: '2026-10-23', time: '11:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Stable', clinicalNotes: 'Pending final sign-off rounds.', completed: false }
    ]
  },

  // 3. ACTIVE FEVER - WARD A (ACUTE)
  {
    id: 'CT-1052',
    name: 'David Okafor',
    age: 29,
    gender: 'Male',
    admissionDate: '2026-10-21',
    bedNumber: 'A-02',
    ward: 'Ward A (Acute)',
    status: 'Critical',
    primaryDiagnosis: 'Acute Viral Hemorrhagic Strain 4',
    temperatureLogs: [
      { id: 'TL-120', patientId: 'CT-1052', date: '2026-10-21', time: '09:00', temperature: 39.4, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['High fever', 'Severe malaise', 'Vomiting'], createdAt: '2026-10-21T09:00:00Z' },
      { id: 'TL-121', patientId: 'CT-1052', date: '2026-10-22', time: '08:15', temperature: 39.1, isFever: true, recordedBy: 'Nurse A. Patel', symptoms: ['Persistent fever', 'Petechiae noted'], createdAt: '2026-10-22T08:15:00Z' },
      { id: 'TL-122', patientId: 'CT-1052', date: '2026-10-23', time: '07:45', temperature: 38.9, isFever: true, recordedBy: 'Nurse A. Patel', symptoms: ['Tachycardia', 'Diaphoresis'], createdAt: '2026-10-23T07:45:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-105', patientId: 'CT-1052', date: '2026-10-22', time: '14:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Critical', clinicalNotes: 'Administered IV crystalloids and anti-pyretic protocol. Strict isolation bed A-02.', completed: true, completedAt: '2026-10-22T14:30:00Z' },
      { id: 'DV-106', patientId: 'CT-1052', date: '2026-10-23', time: '10:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Critical', clinicalNotes: 'Morning rounds pending bedside evaluation.', completed: false }
    ]
  },

  // 4. PENDING NURSE CHECK TODAY (Ward B)
  {
    id: 'CT-1055',
    name: 'Siti Nurhaliza',
    age: 41,
    gender: 'Female',
    admissionDate: '2026-10-20',
    bedNumber: 'B-07',
    ward: 'Ward B (Subacute)',
    status: 'Admitted',
    primaryDiagnosis: 'Viral Gastroenteritis & Pyrexia',
    temperatureLogs: [
      { id: 'TL-130', patientId: 'CT-1055', date: '2026-10-21', time: '08:30', temperature: 38.6, isFever: true, recordedBy: 'Nurse M. Henderson', symptoms: ['Nausea', 'Fever'], createdAt: '2026-10-21T08:30:00Z' },
      { id: 'TL-131', patientId: 'CT-1055', date: '2026-10-22', time: '08:30', temperature: 37.8, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Hydrated, mild nausea'], createdAt: '2026-10-22T08:30:00Z' },
      // Note: No entry for 2026-10-23 yet -> Pending Nurse Check!
    ],
    doctorVisits: [
      { id: 'DV-107', patientId: 'CT-1055', date: '2026-10-23', time: '11:30', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Guarded', clinicalNotes: 'Pending review of morning vitals.', completed: false }
    ]
  },

  // 5. PROGRESSING (2 consecutive fever-free days recorded)
  {
    id: 'CT-1058',
    name: 'Liam Chen',
    age: 22,
    gender: 'Male',
    admissionDate: '2026-10-18',
    bedNumber: 'B-11',
    ward: 'Ward B (Subacute)',
    status: 'Admitted',
    primaryDiagnosis: 'Zoonotic Febrile Virus',
    temperatureLogs: [
      { id: 'TL-140', patientId: 'CT-1058', date: '2026-10-20', time: '08:00', temperature: 38.5, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['Myalgia', 'Sweating'], createdAt: '2026-10-20T08:00:00Z' },
      { id: 'TL-141', patientId: 'CT-1058', date: '2026-10-21', time: '08:00', temperature: 38.2, isFever: true, recordedBy: 'Nurse M. Henderson', symptoms: ['Headache'], createdAt: '2026-10-21T08:00:00Z' },
      { id: 'TL-142', patientId: 'CT-1058', date: '2026-10-22', time: '08:00', temperature: 37.3, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Improving appetite'], createdAt: '2026-10-22T08:00:00Z' },
      { id: 'TL-143', patientId: 'CT-1058', date: '2026-10-23', time: '08:10', temperature: 37.0, isFever: false, recordedBy: 'Nurse A. Patel', symptoms: ['Normal energy'], createdAt: '2026-10-23T08:10:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-108', patientId: 'CT-1058', date: '2026-10-23', time: '10:15', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Improving', clinicalNotes: 'Patient responding well to antivirals. 2 consecutive days afebrile. Needs 1 more day.', completed: true, completedAt: '2026-10-23T10:30:00Z' }
    ]
  },

  // 6. PENDING NURSE CHECK & DOCTOR VISIT
  {
    id: 'CT-1060',
    name: 'Amina Al-Mansoor',
    age: 52,
    gender: 'Female',
    admissionDate: '2026-10-19',
    bedNumber: 'A-09',
    ward: 'Ward A (Acute)',
    status: 'Admitted',
    primaryDiagnosis: 'Acute Encephalitic Arbovirus',
    temperatureLogs: [
      { id: 'TL-150', patientId: 'CT-1060', date: '2026-10-21', time: '08:30', temperature: 38.8, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['Photophobia', 'Fever'], createdAt: '2026-10-21T08:30:00Z' },
      { id: 'TL-151', patientId: 'CT-1060', date: '2026-10-22', time: '08:30', temperature: 38.3, isFever: true, recordedBy: 'Nurse M. Henderson', symptoms: ['Mild disorientation'], createdAt: '2026-10-22T08:30:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-109', patientId: 'CT-1060', date: '2026-10-23', time: '11:45', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Guarded', clinicalNotes: 'Needs acute neurological check.', completed: false }
    ]
  },

  // 7. WARD C PATIENT - PENDING NURSE CHECK
  {
    id: 'CT-1063',
    name: 'Carlos Mendoza',
    age: 63,
    gender: 'Male',
    admissionDate: '2026-10-14',
    bedNumber: 'C-12',
    ward: 'Ward C (Convalescent)',
    status: 'Admitted',
    primaryDiagnosis: 'Post-Viral Asthenia',
    temperatureLogs: [
      { id: 'TL-160', patientId: 'CT-1063', date: '2026-10-21', time: '08:00', temperature: 37.0, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Mild joint pain'], createdAt: '2026-10-21T08:00:00Z' },
      { id: 'TL-161', patientId: 'CT-1063', date: '2026-10-22', time: '08:00', temperature: 36.9, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Walking unassisted'], createdAt: '2026-10-22T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-110', patientId: 'CT-1063', date: '2026-10-22', time: '15:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Stable', clinicalNotes: 'Ambulation tolerated well.', completed: true, completedAt: '2026-10-22T15:20:00Z' }
    ]
  },

  // 8. ADMITTED PATIENT WITH FEVER SPIKE
  {
    id: 'CT-1067',
    name: 'Grace Hopper-Smith',
    age: 38,
    gender: 'Female',
    admissionDate: '2026-10-17',
    bedNumber: 'B-03',
    ward: 'Ward B (Subacute)',
    status: 'Admitted',
    primaryDiagnosis: 'Viral Pneumonitis',
    temperatureLogs: [
      { id: 'TL-170', patientId: 'CT-1067', date: '2026-10-21', time: '08:00', temperature: 37.4, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Coughing'], createdAt: '2026-10-21T08:00:00Z' },
      { id: 'TL-171', patientId: 'CT-1067', date: '2026-10-22', time: '08:00', temperature: 37.2, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Productive sputum'], createdAt: '2026-10-22T08:00:00Z' },
      { id: 'TL-172', patientId: 'CT-1067', date: '2026-10-23', time: '07:30', temperature: 38.4, isFever: true, recordedBy: 'Nurse A. Patel', symptoms: ['Sudden chills', 'High fever spike'], createdAt: '2026-10-23T07:30:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-111', patientId: 'CT-1067', date: '2026-10-23', time: '09:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Guarded', clinicalNotes: 'Secondary viral flare. Ordered chest imaging and bacterial co-infection PCR.', completed: true, completedAt: '2026-10-23T09:25:00Z' }
    ]
  },

  // 9. NEWLY ADMITTED PATIENT
  {
    id: 'CT-1070',
    name: 'Tariq Al-Sabah',
    age: 45,
    gender: 'Male',
    admissionDate: '2026-10-22',
    bedNumber: 'A-14',
    ward: 'Ward A (Acute)',
    status: 'Admitted',
    primaryDiagnosis: 'Suspected Filoviral Enteritis',
    temperatureLogs: [
      { id: 'TL-180', patientId: 'CT-1070', date: '2026-10-22', time: '16:00', temperature: 39.2, isFever: true, recordedBy: 'Nurse J. Zhao', symptoms: ['Hyperpyrexia', 'Diarrhea'], createdAt: '2026-10-22T16:00:00Z' },
      { id: 'TL-181', patientId: 'CT-1070', date: '2026-10-23', time: '08:30', temperature: 38.7, isFever: true, recordedBy: 'Nurse A. Patel', symptoms: ['Dehydration'], createdAt: '2026-10-23T08:30:00Z' }
    ],
    doctorVisits: [
      { id: 'DV-112', patientId: 'CT-1070', date: '2026-10-22', time: '17:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Critical', clinicalNotes: 'Fluid resuscitation initiated.', completed: true, completedAt: '2026-10-22T17:30:00Z' },
      { id: 'DV-113', patientId: 'CT-1070', date: '2026-10-23', time: '14:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Guarded', clinicalNotes: 'Follow-up electrolyte balance.', completed: false }
    ]
  },

  // 10. SUBACUTE WARD PATIENT
  {
    id: 'CT-1072',
    name: 'Nadia Petrova',
    age: 31,
    gender: 'Female',
    admissionDate: '2026-10-18',
    bedNumber: 'B-18',
    ward: 'Ward B (Subacute)',
    status: 'Admitted',
    primaryDiagnosis: 'Viral Myocarditis (Subacute)',
    temperatureLogs: [
      { id: 'TL-190', patientId: 'CT-1072', date: '2026-10-21', time: '08:00', temperature: 37.6, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['Chest soreness'], createdAt: '2026-10-21T08:00:00Z' },
      { id: 'TL-191', patientId: 'CT-1072', date: '2026-10-22', time: '08:00', temperature: 37.1, isFever: false, recordedBy: 'Nurse M. Henderson', symptoms: ['ECG stable'], createdAt: '2026-10-22T08:00:00Z' },
      { id: 'TL-192', patientId: 'CT-1072', date: '2026-10-23', time: '08:45', temperature: 36.9, isFever: false, recordedBy: 'Nurse A. Patel', symptoms: ['Normal cardiac rhythm'], createdAt: '2026-10-23T08:45:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-114', patientId: 'CT-1072', date: '2026-10-23', time: '11:15', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Improving', clinicalNotes: 'Completed 3 days fever-free. Telemetry trace normal. Recommend discharge review.', completed: true, completedAt: '2026-10-23T11:35:00Z' }
    ]
  },

  // 11. HISTORICALLY DISCHARGED (RECOVERED)
  {
    id: 'CT-1020',
    name: 'Johan Lindstrom',
    age: 50,
    gender: 'Male',
    admissionDate: '2026-10-05',
    bedNumber: 'C-01',
    ward: 'Ward C (Convalescent)',
    status: 'Discharged',
    primaryDiagnosis: 'Severe Viral Fever (Resolved)',
    temperatureLogs: [
      { id: 'TL-201', patientId: 'CT-1020', date: '2026-10-15', time: '08:00', temperature: 36.8, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-15T08:00:00Z' },
      { id: 'TL-202', patientId: 'CT-1020', date: '2026-10-16', time: '08:00', temperature: 36.7, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-16T08:00:00Z' },
      { id: 'TL-203', patientId: 'CT-1020', date: '2026-10-17', time: '08:00', temperature: 36.6, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-17T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-201', patientId: 'CT-1020', date: '2026-10-17', time: '09:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Improving', clinicalNotes: 'Full recovery verified.', completed: true, completedAt: '2026-10-17T09:30:00Z' }
    ],
    dischargeApproval: {
      approved: true,
      approvedBy: 'Dr. Robert Sterling, Medical Director',
      approvedAt: '2026-10-17T14:00:00Z',
      dischargeSummary: 'Patient met 3-consecutive afebrile day criteria. Viral PCR negative twice.',
      postDischargeAdvice: 'Advised 7-day home rest with standard hydration protocol.'
    }
  },

  // 12. HISTORICALLY DISCHARGED (RECOVERED)
  {
    id: 'CT-1025',
    name: 'Kavita Iyer',
    age: 27,
    gender: 'Female',
    admissionDate: '2026-10-08',
    bedNumber: 'C-03',
    ward: 'Ward C (Convalescent)',
    status: 'Discharged',
    primaryDiagnosis: 'Viral Hemorrhagic Fever - Mild Grade',
    temperatureLogs: [
      { id: 'TL-210', patientId: 'CT-1025', date: '2026-10-17', time: '08:00', temperature: 36.8, isFever: false, recordedBy: 'Nurse J. Zhao', createdAt: '2026-10-17T08:00:00Z' },
      { id: 'TL-211', patientId: 'CT-1025', date: '2026-10-18', time: '08:00', temperature: 36.6, isFever: false, recordedBy: 'Nurse J. Zhao', createdAt: '2026-10-18T08:00:00Z' },
      { id: 'TL-212', patientId: 'CT-1025', date: '2026-10-19', time: '08:00', temperature: 36.5, isFever: false, recordedBy: 'Nurse J. Zhao', createdAt: '2026-10-19T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-205', patientId: 'CT-1025', date: '2026-10-19', time: '10:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Improving', clinicalNotes: 'Discharged in good health.', completed: true, completedAt: '2026-10-19T10:20:00Z' }
    ],
    dischargeApproval: {
      approved: true,
      approvedBy: 'Dr. Robert Sterling, Medical Director',
      approvedAt: '2026-10-19T13:30:00Z',
      dischargeSummary: 'Discharged afebrile for 72+ hours. Complete blood count within normal limits.'
    }
  },

  // 13. HISTORICALLY DISCHARGED (RECOVERED)
  {
    id: 'CT-1028',
    name: 'Samuel Osei',
    age: 39,
    gender: 'Male',
    admissionDate: '2026-10-09',
    bedNumber: 'C-07',
    ward: 'Ward C (Convalescent)',
    status: 'Discharged',
    primaryDiagnosis: 'Viral Encephalopathy (Cleared)',
    temperatureLogs: [
      { id: 'TL-220', patientId: 'CT-1028', date: '2026-10-18', time: '08:00', temperature: 36.9, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-18T08:00:00Z' },
      { id: 'TL-221', patientId: 'CT-1028', date: '2026-10-19', time: '08:00', temperature: 36.7, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-19T08:00:00Z' },
      { id: 'TL-222', patientId: 'CT-1028', date: '2026-10-20', time: '08:00', temperature: 36.5, isFever: false, recordedBy: 'Nurse M. Henderson', createdAt: '2026-10-20T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-208', patientId: 'CT-1028', date: '2026-10-20', time: '11:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Improving', clinicalNotes: 'Neurological exam fully normalized.', completed: true, completedAt: '2026-10-20T11:30:00Z' }
    ],
    dischargeApproval: {
      approved: true,
      approvedBy: 'Dr. Robert Sterling, Medical Director',
      approvedAt: '2026-10-20T15:00:00Z',
      dischargeSummary: 'Three consecutive days afebrile. Follow-up clinic appointment booked for Day 14.'
    }
  },

  // 14. DECEASED RECORD (Outcomes for Reports Screen)
  {
    id: 'CT-1015',
    name: 'Arthur Pendelton',
    age: 76,
    gender: 'Male',
    admissionDate: '2026-10-07',
    bedNumber: 'A-01',
    ward: 'Ward A (Acute)',
    status: 'Deceased',
    primaryDiagnosis: 'Fulminant Viral Sepsis with Multi-Organ Failure',
    temperatureLogs: [
      { id: 'TL-230', patientId: 'CT-1015', date: '2026-10-12', time: '08:00', temperature: 39.8, isFever: true, recordedBy: 'Nurse J. Zhao', createdAt: '2026-10-12T08:00:00Z' },
      { id: 'TL-231', patientId: 'CT-1015', date: '2026-10-13', time: '08:00', temperature: 40.1, isFever: true, recordedBy: 'Nurse J. Zhao', createdAt: '2026-10-13T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-212', patientId: 'CT-1015', date: '2026-10-13', time: '18:00', doctorName: 'Dr. Sarah Lin, MD', clinicalStatus: 'Critical', clinicalNotes: 'Refractory septic shock despite maximum inotropic support.', completed: true, completedAt: '2026-10-13T18:30:00Z' }
    ],
    deathRecord: {
      date: '2026-10-14',
      cause: 'Cardiopulmonary arrest secondary to fulminant viral sepsis',
      confirmedBy: 'Dr. Sarah Lin, MD',
      notes: 'Next of kin notified; containment protocol followed for biohazard transport.'
    }
  },

  // 15. DECEASED RECORD (Outcomes for Reports Screen)
  {
    id: 'CT-1018',
    name: 'Fatima El-Khoury',
    age: 69,
    gender: 'Female',
    admissionDate: '2026-10-10',
    bedNumber: 'A-05',
    ward: 'Ward A (Acute)',
    status: 'Deceased',
    primaryDiagnosis: 'Acute Respiratory Distress Syndrome (ARDS) - Viral Etiology',
    temperatureLogs: [
      { id: 'TL-240', patientId: 'CT-1018', date: '2026-10-14', time: '08:00', temperature: 39.3, isFever: true, recordedBy: 'Nurse A. Patel', createdAt: '2026-10-14T08:00:00Z' },
      { id: 'TL-241', patientId: 'CT-1018', date: '2026-10-15', time: '08:00', temperature: 39.5, isFever: true, recordedBy: 'Nurse A. Patel', createdAt: '2026-10-15T08:00:00Z' },
    ],
    doctorVisits: [
      { id: 'DV-215', patientId: 'CT-1018', date: '2026-10-15', time: '21:00', doctorName: 'Dr. Kenneth Thorne, MD', clinicalStatus: 'Critical', clinicalNotes: 'Severe hypoxemia unresponsive to mechanical ventilation.', completed: true, completedAt: '2026-10-15T21:40:00Z' }
    ],
    deathRecord: {
      date: '2026-10-16',
      cause: 'Refractory ARDS secondary to novel viral pathogen',
      confirmedBy: 'Dr. Kenneth Thorne, MD',
      notes: 'Official epidemiological death certificate registered with Health Ministry.'
    }
  }
];

export const DEMO_WARDS = [
  { id: 'Ward A (Acute)', name: 'Ward A - High Isolation (Acute)', totalBeds: 24, description: 'Negative-pressure isolation for acute symptomatic and febrile patients.' },
  { id: 'Ward B (Subacute)', name: 'Ward B - Step-Down (Subacute)', totalBeds: 26, description: 'Monitored step-down beds for stabilizing patients requiring observation.' },
  { id: 'Ward C (Convalescent)', name: 'Ward C - Pre-Discharge (Convalescent)', totalBeds: 24, description: 'Convalescent recovery ward tracking consecutive fever-free clearance.' },
];
