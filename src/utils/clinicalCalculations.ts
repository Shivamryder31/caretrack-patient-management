import { Patient, TemperatureLog, DischargeEligibilityResult, CenterStatistics } from '../types';

export const TOTAL_BEDS = 74;
export const FEVER_THRESHOLD_CELSIUS = 38.0;
export const CONSECUTIVE_DAYS_REQUIRED = 3;
export const MORTALITY_ALERT_THRESHOLD = 15.0; // 15%

/**
 * Returns YYYY-MM-DD for today or given date
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determines whether two YYYY-MM-DD date strings represent consecutive days (d2 is exactly 1 day after d1)
 */
export function areConsecutiveDays(d1: string, d2: string): boolean {
  const date1 = new Date(d1 + 'T00:00:00');
  const date2 = new Date(d2 + 'T00:00:00');
  const diffTime = date2.getTime() - date1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calculates whether a patient is eligible for discharge:
 * Rule: "A patient is eligible for discharge only after three complete consecutive days without fever, based on recorded observations."
 */
export function checkDischargeEligibility(patient: Patient): DischargeEligibilityResult {
  // If already discharged or deceased, not actively eligible
  if (patient.status === 'Discharged' || patient.status === 'Deceased') {
    return {
      isEligible: false,
      consecutiveFeverFreeDays: 0,
      requiredDays: CONSECUTIVE_DAYS_REQUIRED,
      observationsChecked: patient.temperatureLogs.length,
      recentDailyTemps: [],
      reason: `Patient is already ${patient.status.toLowerCase()}.`
    };
  }

  if (!patient.temperatureLogs || patient.temperatureLogs.length === 0) {
    return {
      isEligible: false,
      consecutiveFeverFreeDays: 0,
      requiredDays: CONSECUTIVE_DAYS_REQUIRED,
      observationsChecked: 0,
      recentDailyTemps: [],
      reason: 'No temperature observations recorded yet.'
    };
  }

  // Group readings by date
  const dateMap = new Map<string, TemperatureLog[]>();
  patient.temperatureLogs.forEach(log => {
    const existing = dateMap.get(log.date) || [];
    existing.push(log);
    dateMap.set(log.date, existing);
  });

  // Sort unique dates chronologically
  const sortedDates = Array.from(dateMap.keys()).sort();

  // Create daily summary
  const dailySummaries = sortedDates.map(date => {
    const logs = dateMap.get(date)!;
    const maxTemp = Math.max(...logs.map(l => l.temperature));
    const hasFever = maxTemp >= FEVER_THRESHOLD_CELSIUS;
    return {
      date,
      maxTemp,
      hasFever,
      readingsCount: logs.length
    };
  });

  if (dailySummaries.length < CONSECUTIVE_DAYS_REQUIRED) {
    const feverFreeCount = dailySummaries.filter(d => !d.hasFever).length;
    return {
      isEligible: false,
      consecutiveFeverFreeDays: feverFreeCount,
      requiredDays: CONSECUTIVE_DAYS_REQUIRED,
      observationsChecked: dailySummaries.length,
      recentDailyTemps: dailySummaries.slice(-5),
      reason: `Only ${dailySummaries.length} day(s) of observations recorded. 3 consecutive complete days required.`
    };
  }

  // Calculate current streak of consecutive calendar days without fever from the most recent observation backward
  let streak = 0;
  for (let i = dailySummaries.length - 1; i >= 0; i--) {
    const currentDay = dailySummaries[i];

    // If this day had a fever, streak is broken
    if (currentDay.hasFever) {
      break;
    }

    // Check if consecutive with the day ahead of it (if not the first one we picked)
    if (streak > 0) {
      const nextDay = dailySummaries[i + 1];
      if (!areConsecutiveDays(currentDay.date, nextDay.date)) {
        // Gap between observation days
        break;
      }
    }

    streak++;
  }

  const isEligible = streak >= CONSECUTIVE_DAYS_REQUIRED;

  let reason = '';
  if (isEligible) {
    reason = `Criteria met: ${streak} consecutive days without fever (< ${FEVER_THRESHOLD_CELSIUS}°C). Eligible for discharge approval.`;
  } else if (streak > 0) {
    reason = `Currently ${streak} of ${CONSECUTIVE_DAYS_REQUIRED} consecutive fever-free days recorded. Needs ${CONSECUTIVE_DAYS_REQUIRED - streak} more day(s).`;
  } else {
    const lastDay = dailySummaries[dailySummaries.length - 1];
    reason = lastDay.hasFever 
      ? `Fever recorded on latest observation (${lastDay.date}: ${lastDay.maxTemp.toFixed(1)}°C >= ${FEVER_THRESHOLD_CELSIUS}°C). Streak reset to 0.`
      : 'Consecutive day observation sequence incomplete.';
  }

  return {
    isEligible,
    consecutiveFeverFreeDays: streak,
    requiredDays: CONSECUTIVE_DAYS_REQUIRED,
    observationsChecked: dailySummaries.length,
    recentDailyTemps: dailySummaries.slice(-5),
    reason
  };
}

/**
 * Checks if a patient needs a temperature check today
 */
export function isTempCheckPendingToday(patient: Patient, todayStr: string): boolean {
  if (patient.status === 'Discharged' || patient.status === 'Deceased') {
    return false;
  }
  return !patient.temperatureLogs.some(log => log.date === todayStr);
}

/**
 * Checks if a patient needs a doctor visit today
 */
export function isDoctorVisitPendingToday(patient: Patient, todayStr: string): boolean {
  if (patient.status === 'Discharged' || patient.status === 'Deceased') {
    return false;
  }
  const todayVisit = patient.doctorVisits.find(v => v.date === todayStr);
  if (!todayVisit) return true;
  return !todayVisit.completed;
}

/**
 * Aggregates all centre statistics
 */
export function calculateCenterStatistics(patients: Patient[], todayStr: string): CenterStatistics {
  const admittedPatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');
  const occupiedBeds = admittedPatients.length;
  const bedOccupancyRate = Math.round((occupiedBeds / TOTAL_BEDS) * 100);

  const pendingTempChecksToday = admittedPatients.filter(p => isTempCheckPendingToday(p, todayStr)).length;
  const pendingDoctorVisitsToday = admittedPatients.filter(p => isDoctorVisitPendingToday(p, todayStr)).length;

  const dischargeReadyCount = admittedPatients.filter(p => {
    const eligibility = checkDischargeEligibility(p);
    return eligibility.isEligible;
  }).length;

  const totalRecoveredDischarged = patients.filter(p => p.status === 'Discharged').length;
  const totalDeaths = patients.filter(p => p.status === 'Deceased').length;
  const totalResolvedCases = totalRecoveredDischarged + totalDeaths;

  // Case Fatality Rate (Mortality Rate among resolved outcomes)
  // CFR = (Deaths / (Deaths + Recoveries)) * 100
  const mortalityRate = totalResolvedCases > 0 
    ? Number(((totalDeaths / totalResolvedCases) * 100).toFixed(1)) 
    : 0;

  // Crude mortality rate (Deaths / Total Ever Admitted)
  const totalHistoricalAdmissions = patients.length;
  const crudeMortalityRate = totalHistoricalAdmissions > 0
    ? Number(((totalDeaths / totalHistoricalAdmissions) * 100).toFixed(1))
    : 0;

  const isMortalityAlertTriggered = mortalityRate > MORTALITY_ALERT_THRESHOLD;

  return {
    totalAdmittedPatients: admittedPatients.length,
    occupiedBeds,
    totalBedsCapacity: TOTAL_BEDS,
    bedOccupancyRate,
    pendingTempChecksToday,
    pendingDoctorVisitsToday,
    dischargeReadyCount,
    totalHistoricalAdmissions,
    totalRecoveredDischarged,
    totalDeaths,
    mortalityRate,
    crudeMortalityRate,
    isMortalityAlertTriggered
  };
}
