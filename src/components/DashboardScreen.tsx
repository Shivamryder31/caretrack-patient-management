import React from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { checkDischargeEligibility, isTempCheckPendingToday, isDoctorVisitPendingToday } from '../utils/clinicalCalculations';
import { 
  Users, 
  Bed, 
  Thermometer, 
  Stethoscope, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

interface DashboardScreenProps {
  onOpenAdmitModal: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onOpenAdmitModal }) => {
  const { patients, stats, todayStr, setActiveScreen, setSelectedPatientId } = useCareTrack();

  const admittedPatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');

  // Specific lists
  const pendingTempPatients = admittedPatients.filter(p => isTempCheckPendingToday(p, todayStr));
  const pendingDoctorPatients = admittedPatients.filter(p => isDoctorVisitPendingToday(p, todayStr));
  const dischargeReadyPatients = admittedPatients.filter(p => checkDischargeEligibility(p).isEligible);

  const wardAOccupied = admittedPatients.filter(p => p.ward === 'Ward A (Acute)').length;
  const wardBOccupied = admittedPatients.filter(p => p.ward === 'Ward B (Subacute)').length;
  const wardCOccupied = admittedPatients.filter(p => p.ward === 'Ward C (Convalescent)').length;

  const navigateToNurseWithPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('nurse');
  };

  const navigateToDoctorWithPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('doctor');
  };

  const navigateToAdminWithPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('admin');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time viral isolation centre census and daily shift operations for <span className="font-mono text-slate-700">{todayStr}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdmitModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors shadow-2xs whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit to Bed</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Inpatients */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Inpatients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.occupiedBeds}
            </span>
            <span className="text-xs text-slate-500">active cases</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Critical isolation:</span>
            <span className="font-mono font-medium text-rose-700 tabular-nums">
              {admittedPatients.filter(p => p.status === 'Critical').length}
            </span>
          </div>
        </div>

        {/* Metric 2: Occupied Beds out of 74 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bed Occupancy</span>
            <Bed className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.occupiedBeds} / {stats.totalBedsCapacity}
            </span>
            <span className="text-xs font-semibold text-teal-700 font-mono tabular-nums">
              {stats.bedOccupancyRate}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${stats.bedOccupancyRate > 90 ? 'bg-rose-500' : stats.bedOccupancyRate > 75 ? 'bg-amber-500' : 'bg-teal-600'}`}
                style={{ width: `${Math.min(stats.bedOccupancyRate, 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-slate-500">
              <span>Available:</span>
              <span className="font-mono font-medium text-slate-700">
                {stats.totalBedsCapacity - stats.occupiedBeds} beds
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Temperature Checks */}
        <button 
          onClick={() => setActiveScreen('nurse')}
          className="text-left bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-amber-400 hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Nurse Checks</span>
            <Thermometer className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${stats.pendingTempChecksToday > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {stats.pendingTempChecksToday}
            </span>
            <span className="text-xs text-slate-500">today</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Open Nurse Screen</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Metric 4: Pending Doctor Visits */}
        <button 
          onClick={() => setActiveScreen('doctor')}
          className="text-left bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-sky-400 hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Doctor Visits</span>
            <Stethoscope className="w-4 h-4 text-sky-600 group-hover:text-sky-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${stats.pendingDoctorVisitsToday > 0 ? 'text-sky-700' : 'text-slate-900'}`}>
              {stats.pendingDoctorVisitsToday}
            </span>
            <span className="text-xs text-slate-500">today</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Start Clinical Rounds</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>

        {/* Metric 5: Discharge-Ready Patients */}
        <button 
          onClick={() => setActiveScreen('admin')}
          className="text-left bg-white border border-slate-200 rounded-lg p-4 transition-all hover:border-emerald-400 hover:shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Discharge Ready</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {stats.dischargeReadyCount}
            </span>
            <span className="text-xs text-slate-500">criteria met</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Review & Approve</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </button>
      </div>

      {/* Ward Occupancy Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ward Isolation Capacity Breakdown</h2>
            <p className="text-xs text-slate-500">Total capacity: 74 beds across 3 specialized bio-containment zones</p>
          </div>
          <div className="text-xs font-mono text-slate-600">
            Total Inpatients: <span className="font-semibold text-slate-900">{stats.occupiedBeds}</span> / 74 Beds
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ward A */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Ward A (Acute)</span>
              <span className="text-xs font-mono text-slate-600">{wardAOccupied} / 24 beds</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-rose-600 h-full rounded-full transition-all"
                style={{ width: `${Math.round((wardAOccupied / 24) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Negative pressure</span>
              <span className="font-mono">{Math.round((wardAOccupied / 24) * 100)}% full</span>
            </div>
          </div>

          {/* Ward B */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Ward B (Subacute)</span>
              <span className="text-xs font-mono text-slate-600">{wardBOccupied} / 26 beds</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all"
                style={{ width: `${Math.round((wardBOccupied / 26) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Step-down observation</span>
              <span className="font-mono">{Math.round((wardBOccupied / 26) * 100)}% full</span>
            </div>
          </div>

          {/* Ward C */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Ward C (Convalescent)</span>
              <span className="text-xs font-mono text-slate-600">{wardCOccupied} / 24 beds</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{ width: `${Math.round((wardCOccupied / 24) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>Pre-discharge clearance</span>
              <span className="font-mono">{Math.round((wardCOccupied / 24) * 100)}% full</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pending Nurse Temperature Checks */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">Pending Temperature Checks ({pendingTempPatients.length})</h2>
            </div>
            <button
              onClick={() => setActiveScreen('nurse')}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Nurse Screen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {pendingTempPatients.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-slate-700">All Temperature Checks Complete</p>
                <p className="mt-0.5">Every admitted patient has an observation recorded for {todayStr}.</p>
              </div>
            ) : (
              pendingTempPatients.slice(0, 5).map(patient => (
                <div key={patient.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{patient.name}</span>
                      <span className="text-xs font-mono text-slate-500">{patient.id}</span>
                      <span className="text-xs text-slate-500">· Bed {patient.bedNumber}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {patient.ward} · Admitted {patient.admissionDate}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToNurseWithPatient(patient.id)}
                    className="px-2.5 py-1 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors shrink-0"
                  >
                    Log Temp
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Pending Doctor Visits & Rounds */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-semibold text-slate-900">Pending Doctor Visits ({pendingDoctorPatients.length})</h2>
            </div>
            <button
              onClick={() => setActiveScreen('doctor')}
              className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Doctor Screen</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {pendingDoctorPatients.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-medium text-slate-700">All Doctor Rounds Complete</p>
                <p className="mt-0.5">All scheduled bedside clinical evaluations have been completed for {todayStr}.</p>
              </div>
            ) : (
              pendingDoctorPatients.slice(0, 5).map(patient => (
                <div key={patient.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{patient.name}</span>
                      <span className="text-xs font-mono text-slate-500">{patient.id}</span>
                      <span className="text-xs text-slate-500">· Bed {patient.bedNumber}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {patient.primaryDiagnosis}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToDoctorWithPatient(patient.id)}
                    className="px-2.5 py-1 text-xs font-medium text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors shrink-0"
                  >
                    Conduct Round
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Discharge-Ready Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900">Patients Meeting Discharge Criteria ({dischargeReadyPatients.length})</h2>
          </div>
          <button
            onClick={() => setActiveScreen('admin')}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Admin Discharge Screen</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Clinical standard: Patient must complete <strong>3 complete consecutive days without fever (&lt; 38.0°C)</strong> to qualify for discharge approval.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dischargeReadyPatients.length === 0 ? (
            <div className="col-span-full py-6 text-center text-slate-500 text-xs">
              <p>No patients currently meet the 3-day afebrile criteria. Patients are progressing in step-down observation.</p>
            </div>
          ) : (
            dischargeReadyPatients.map(patient => {
              const elig = checkDischargeEligibility(patient);
              return (
                <div key={patient.id} className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">{patient.name}</span>
                      <span className="text-xs font-mono text-emerald-800 font-medium">Eligible</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      <span>ID: {patient.id}</span> · <span>Bed: {patient.bedNumber}</span> · <span>{patient.ward}</span>
                    </div>
                    <div className="mt-3 text-xs bg-white p-2 rounded border border-emerald-100 text-slate-700">
                      <span className="font-medium text-emerald-800">{elig.consecutiveFeverFreeDays} consecutive days afebrile:</span>
                      <div className="mt-1 flex gap-2 font-mono text-2xs text-slate-600">
                        {elig.recentDailyTemps.map(d => (
                          <span key={d.date} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {d.date.slice(5)}: {d.maxTemp.toFixed(1)}°C
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-100 flex justify-end">
                    <button
                      onClick={() => navigateToAdminWithPatient(patient.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors"
                    >
                      Process Discharge
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
