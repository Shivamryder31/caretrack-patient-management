import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Patient, TemperatureLog, DoctorVisit, ActiveScreen, CenterStatistics } from '../types';
import { INITIAL_PATIENTS } from '../data/sampleData';
import { 
  TOTAL_BEDS, 
  FEVER_THRESHOLD_CELSIUS, 
  calculateCenterStatistics, 
  checkDischargeEligibility 
} from '../utils/clinicalCalculations';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface CareTrackContextType {
  patients: Patient[];
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  todayStr: string;
  setTodayStr: (date: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  stats: CenterStatistics;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Actions
  admitPatient: (data: Omit<Patient, 'id' | 'temperatureLogs' | 'doctorVisits' | 'status'>) => { success: boolean; message: string; patientId?: string };
  recordTemperature: (
    patientId: string, 
    tempCelsius: number, 
    date: string, 
    time: string, 
    nurseName: string, 
    symptoms?: string[], 
    isCorrection?: boolean, 
    correctionReason?: string
  ) => { success: boolean; duplicate?: boolean; existingReading?: number; message: string };
  completeDoctorVisit: (
    patientId: string, 
    date: string, 
    time: string, 
    doctorName: string, 
    clinicalStatus: 'Critical' | 'Guarded' | 'Stable' | 'Improving', 
    clinicalNotes: string, 
    treatmentPlan?: string
  ) => { success: boolean; message: string };
  approveDischarge: (
    patientId: string, 
    approvedBy: string, 
    dischargeSummary: string, 
    postDischargeAdvice?: string
  ) => { success: boolean; message: string };
  recordDeathOutcome: (
    patientId: string, 
    date: string, 
    cause: string, 
    confirmedBy: string, 
    notes?: string
  ) => { success: boolean; message: string };
  resetToSampleData: () => void;
  exportDataJson: () => void;
}

const STORAGE_KEY = 'caretrack_clinical_patients_v1';
const TODAY_STORAGE_KEY = 'caretrack_current_date_v1';

const CareTrackContext = createContext<CareTrackContextType | undefined>(undefined);

export const CareTrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize reference date: default to 2026-10-23 to match sample case timeline
  const [todayStr, setTodayStrState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(TODAY_STORAGE_KEY);
      return saved || '2026-10-23';
    } catch {
      return '2026-10-23';
    }
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stored patient data:', e);
    }
    return INITIAL_PATIENTS;
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Save changes to localStorage so records remain available after refreshing
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patient records to storage:', e);
    }
  }, [patients]);

  const setTodayStr = (date: string) => {
    setTodayStrState(date);
    try {
      localStorage.setItem(TODAY_STORAGE_KEY, date);
    } catch (e) {
      console.error('Failed to save date:', e);
    }
  };

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Centre statistics calculated dynamically
  const stats = useMemo(() => {
    return calculateCenterStatistics(patients, todayStr);
  }, [patients, todayStr]);

  // Action 1: Admit patient
  const admitPatient = (data: Omit<Patient, 'id' | 'temperatureLogs' | 'doctorVisits' | 'status'>) => {
    const activePatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');
    if (activePatients.length >= TOTAL_BEDS) {
      addToast('error', 'Admission Blocked', `Centre bed capacity limit reached (${TOTAL_BEDS}/${TOTAL_BEDS}). A bed must be vacated before new admissions.`);
      return { success: false, message: 'Bed capacity full' };
    }

    // Check if bed is already taken
    const bedTaken = activePatients.some(p => p.bedNumber.trim().toLowerCase() === data.bedNumber.trim().toLowerCase());
    if (bedTaken) {
      addToast('error', 'Bed Unavailable', `Bed ${data.bedNumber} is currently occupied. Please assign a vacant bed.`);
      return { success: false, message: `Bed ${data.bedNumber} is occupied` };
    }

    const nextNumber = 1000 + patients.length + 1;
    const newId = `CT-${nextNumber}`;
    const newPatient: Patient = {
      ...data,
      id: newId,
      status: 'Admitted',
      temperatureLogs: [],
      doctorVisits: [
        {
          id: `DV-${Date.now()}`,
          patientId: newId,
          date: todayStr,
          time: '09:00',
          doctorName: 'Attending Physician',
          clinicalStatus: 'Guarded',
          clinicalNotes: 'Initial admission assessment pending.',
          completed: false
        }
      ]
    };

    setPatients(prev => [newPatient, ...prev]);
    addToast('success', 'Patient Admitted', `Patient ${newPatient.name} admitted successfully to Bed ${newPatient.bedNumber}.`);
    return { success: true, message: 'Patient admitted successfully', patientId: newId };
  };

  // Action 2: Record Temperature with duplicate detection
  const recordTemperature = (
    patientId: string,
    tempCelsius: number,
    date: string,
    time: string,
    nurseName: string,
    symptoms?: string[],
    isCorrection: boolean = false,
    correctionReason?: string
  ) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
      addToast('error', 'Record Error', 'Patient record not found.');
      return { success: false, message: 'Patient not found' };
    }

    const patient = patients[patientIndex];

    // Duplicate Check: same patient, same calendar day
    const existingIndex = patient.temperatureLogs.findIndex(log => log.date === date);
    if (existingIndex !== -1 && !isCorrection) {
      const existing = patient.temperatureLogs[existingIndex];
      return {
        success: false,
        duplicate: true,
        existingReading: existing.temperature,
        message: `A reading of ${existing.temperature.toFixed(1)}°C was already recorded for ${patient.name} on ${date}. An authorized correction flag and justification are required to override.`
      };
    }

    const isFever = tempCelsius >= FEVER_THRESHOLD_CELSIUS;
    const logId = `TL-${Date.now()}`;
    const newLog: TemperatureLog = {
      id: logId,
      patientId,
      date,
      time: time || '08:00',
      temperature: Number(tempCelsius.toFixed(1)),
      isFever,
      recordedBy: nurseName.trim() || 'Staff Nurse',
      symptoms: symptoms || [],
      isCorrection,
      correctionReason: isCorrection ? correctionReason : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedPatients = [...patients];
    const targetPatient = { ...updatedPatients[patientIndex] };

    if (existingIndex !== -1 && isCorrection) {
      // Replace existing entry with corrected record
      const updatedLogs = [...targetPatient.temperatureLogs];
      updatedLogs[existingIndex] = newLog;
      targetPatient.temperatureLogs = updatedLogs;
    } else {
      // Append new entry
      targetPatient.temperatureLogs = [...targetPatient.temperatureLogs, newLog];
    }

    // If severe fever in critical range (>= 39.0°C), ensure status reflects condition
    if (tempCelsius >= 39.0 && targetPatient.status === 'Admitted') {
      targetPatient.status = 'Critical';
    }

    updatedPatients[patientIndex] = targetPatient;
    setPatients(updatedPatients);

    if (isFever) {
      addToast('warning', 'Fever Recorded', `${targetPatient.name}: ${tempCelsius.toFixed(1)}°C exceeds threshold (${FEVER_THRESHOLD_CELSIUS}°C). Discharge streak reset.`);
    } else {
      addToast('success', 'Observation Saved', `Normal temperature ${tempCelsius.toFixed(1)}°C recorded for ${targetPatient.name}.`);
    }

    return { success: true, message: 'Temperature recorded successfully' };
  };

  // Action 3: Complete Doctor Visit
  const completeDoctorVisit = (
    patientId: string,
    date: string,
    time: string,
    doctorName: string,
    clinicalStatus: 'Critical' | 'Guarded' | 'Stable' | 'Improving',
    clinicalNotes: string,
    treatmentPlan?: string
  ) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
      addToast('error', 'Error', 'Patient record not found.');
      return { success: false, message: 'Patient not found' };
    }

    const updatedPatients = [...patients];
    const targetPatient = { ...updatedPatients[patientIndex] };

    // Find existing visit for that day or create new
    const existingVisitIndex = targetPatient.doctorVisits.findIndex(v => v.date === date);
    const visitRecord: DoctorVisit = {
      id: existingVisitIndex !== -1 ? targetPatient.doctorVisits[existingVisitIndex].id : `DV-${Date.now()}`,
      patientId,
      date,
      time: time || '10:00',
      doctorName: doctorName.trim() || 'Attending Physician',
      clinicalStatus,
      clinicalNotes: clinicalNotes.trim(),
      treatmentPlan: treatmentPlan?.trim(),
      completed: true,
      completedAt: new Date().toISOString()
    };

    if (existingVisitIndex !== -1) {
      const visits = [...targetPatient.doctorVisits];
      visits[existingVisitIndex] = visitRecord;
      targetPatient.doctorVisits = visits;
    } else {
      targetPatient.doctorVisits = [...targetPatient.doctorVisits, visitRecord];
    }

    // Update patient clinical status
    if (clinicalStatus === 'Critical') {
      targetPatient.status = 'Critical';
    } else if (targetPatient.status === 'Critical' && (clinicalStatus === 'Stable' || clinicalStatus === 'Improving')) {
      targetPatient.status = 'Admitted';
    }

    updatedPatients[patientIndex] = targetPatient;
    setPatients(updatedPatients);

    addToast('success', 'Doctor Visit Completed', `Clinical evaluation completed for ${targetPatient.name} by ${visitRecord.doctorName}.`);
    return { success: true, message: 'Doctor visit saved successfully' };
  };

  // Action 4: Approve Discharge (Separated from Eligibility)
  const approveDischarge = (
    patientId: string,
    approvedBy: string,
    dischargeSummary: string,
    postDischargeAdvice?: string
  ) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
      addToast('error', 'Discharge Failed', 'Patient record not found.');
      return { success: false, message: 'Patient not found' };
    }

    const patient = patients[patientIndex];
    const eligibility = checkDischargeEligibility(patient);

    if (!eligibility.isEligible) {
      addToast('error', 'Eligibility Criteria Not Met', `Discharge blocked: ${eligibility.reason}`);
      return { success: false, message: eligibility.reason };
    }

    const updatedPatients = [...patients];
    const targetPatient = { ...updatedPatients[patientIndex] };

    targetPatient.status = 'Discharged';
    targetPatient.dischargeApproval = {
      approved: true,
      approvedBy: approvedBy.trim() || 'Medical Director',
      approvedAt: new Date().toISOString(),
      dischargeSummary: dischargeSummary.trim() || 'Patient afebrile for 72+ hours. Discharged recovered.',
      postDischargeAdvice: postDischargeAdvice?.trim()
    };

    updatedPatients[patientIndex] = targetPatient;
    setPatients(updatedPatients);

    addToast('success', 'Discharge Confirmed', `${targetPatient.name} has been officially discharged. Bed ${targetPatient.bedNumber} is now vacant.`);
    return { success: true, message: 'Patient successfully discharged' };
  };

  // Action 5: Record Death Outcome
  const recordDeathOutcome = (
    patientId: string,
    date: string,
    cause: string,
    confirmedBy: string,
    notes?: string
  ) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) {
      return { success: false, message: 'Patient not found' };
    }

    const updatedPatients = [...patients];
    const targetPatient = { ...updatedPatients[patientIndex] };

    targetPatient.status = 'Deceased';
    targetPatient.deathRecord = {
      date,
      cause: cause.trim(),
      confirmedBy: confirmedBy.trim() || 'Attending Physician',
      notes: notes?.trim()
    };

    updatedPatients[patientIndex] = targetPatient;
    setPatients(updatedPatients);

    addToast('warning', 'Outcome Recorded', `Official outcome recorded as Deceased for ${targetPatient.name}. Bed ${targetPatient.bedNumber} vacated.`);
    return { success: true, message: 'Outcome recorded' };
  };

  // Action 6: Reset to Sample Data
  const resetToSampleData = () => {
    setPatients(INITIAL_PATIENTS);
    setTodayStr('2026-10-23');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      localStorage.setItem(TODAY_STORAGE_KEY, '2026-10-23');
    } catch (e) {
      console.error(e);
    }
    addToast('info', 'System Reset', 'All records have been reset to default fictional demonstration data.');
  };

  // Action 7: Export data as JSON
  const exportDataJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `caretrack_records_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('info', 'Export Complete', 'CareTrack dataset exported as JSON backup.');
  };

  return (
    <CareTrackContext.Provider
      value={{
        patients,
        activeScreen,
        setActiveScreen,
        todayStr,
        setTodayStr,
        selectedPatientId,
        setSelectedPatientId,
        stats,
        toasts,
        addToast,
        removeToast,
        admitPatient,
        recordTemperature,
        completeDoctorVisit,
        approveDischarge,
        recordDeathOutcome,
        resetToSampleData,
        exportDataJson
      }}
    >
      {children}
    </CareTrackContext.Provider>
  );
};

export const useCareTrack = () => {
  const context = useContext(CareTrackContext);
  if (!context) {
    throw new Error('useCareTrack must be used within a CareTrackProvider');
  }
  return context;
};
