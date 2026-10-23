/**
 * CareTrack Data Types
 * Clinical virus treatment centre management
 */

export type PatientStatus = 'Admitted' | 'Critical' | 'Discharged' | 'Deceased';

export type WardName = 'Ward A (Acute)' | 'Ward B (Subacute)' | 'Ward C (Convalescent)';

export interface TemperatureLog {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  temperature: number; // Celsius, e.g. 37.2
  isFever: boolean; // >= 38.0°C
  recordedBy: string;
  symptoms?: string[];
  isCorrection?: boolean;
  correctionReason?: string;
  createdAt: string;
}

export interface DoctorVisit {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string;
  doctorName: string;
  clinicalStatus: 'Critical' | 'Guarded' | 'Stable' | 'Improving';
  clinicalNotes: string;
  treatmentPlan?: string;
  completed: boolean;
  completedAt?: string;
}

export interface DischargeApproval {
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  dischargeSummary: string;
  postDischargeAdvice?: string;
}

export interface DeathRecord {
  date: string;
  cause: string;
  confirmedBy: string;
  notes?: string;
}

export interface Patient {
  id: string; // CT-XXXX
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string; // YYYY-MM-DD
  bedNumber: string; // e.g., "A-01", "B-14", "C-08"
  ward: WardName;
  status: PatientStatus;
  primaryDiagnosis: string;
  temperatureLogs: TemperatureLog[];
  doctorVisits: DoctorVisit[];
  dischargeApproval?: DischargeApproval;
  deathRecord?: DeathRecord;
}

export interface DischargeEligibilityResult {
  isEligible: boolean;
  consecutiveFeverFreeDays: number;
  requiredDays: number;
  observationsChecked: number;
  recentDailyTemps: {
    date: string;
    maxTemp: number;
    hasFever: boolean;
    readingsCount: number;
  }[];
  reason: string;
}

export interface CenterStatistics {
  totalAdmittedPatients: number; // Currently occupying a bed
  occupiedBeds: number;
  totalBedsCapacity: number; // 74
  bedOccupancyRate: number; // percentage
  pendingTempChecksToday: number;
  pendingDoctorVisitsToday: number;
  dischargeReadyCount: number;
  totalHistoricalAdmissions: number;
  totalRecoveredDischarged: number;
  totalDeaths: number;
  mortalityRate: number; // CFR %
  crudeMortalityRate: number; // crude %
  isMortalityAlertTriggered: boolean;
}

export type ActiveScreen = 
  | 'dashboard'
  | 'patients'
  | 'nurse'
  | 'doctor'
  | 'admin'
  | 'reports';
