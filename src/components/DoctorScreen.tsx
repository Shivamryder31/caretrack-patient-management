import React, { useState, useEffect } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { Patient, DoctorVisit } from '../types';
import { FEVER_THRESHOLD_CELSIUS, checkDischargeEligibility, isDoctorVisitPendingToday } from '../utils/clinicalCalculations';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  UserCheck, 
  Bed, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const DoctorScreen: React.FC = () => {
  const { patients, todayStr, selectedPatientId, setSelectedPatientId, completeDoctorVisit } = useCareTrack();

  const admittedPatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');

  const [patientId, setPatientId] = useState<string>(selectedPatientId || (admittedPatients[0]?.id || ''));
  const [doctorName, setDoctorName] = useState<string>('Dr. Sarah Lin, MD');
  const [clinicalStatus, setClinicalStatus] = useState<'Critical' | 'Guarded' | 'Stable' | 'Improving'>('Stable');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');
  const [visitTime, setVisitTime] = useState<string>('10:00');

  useEffect(() => {
    if (selectedPatientId && admittedPatients.some(p => p.id === selectedPatientId)) {
      setPatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const currentPatient = patients.find(p => p.id === patientId);
  const elig = currentPatient ? checkDischargeEligibility(currentPatient) : null;
  const isVisitPending = currentPatient ? isDoctorVisitPendingToday(currentPatient, todayStr) : false;

  // Handle visit completion
  const handleCompleteVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    if (!clinicalNotes.trim()) {
      alert('Please enter clinical evaluation notes for this doctor round.');
      return;
    }

    completeDoctorVisit(
      currentPatient.id,
      todayStr,
      visitTime,
      doctorName,
      clinicalStatus,
      clinicalNotes,
      treatmentPlan
    );

    setClinicalNotes('');
    setTreatmentPlan('');
  };

  // Patients with pending visits
  const pendingVisitPatients = admittedPatients.filter(p => isDoctorVisitPendingToday(p, todayStr));

  // Sort logs chronologically for temperature chart
  const sortedLogs = currentPatient 
    ? [...currentPatient.temperatureLogs].sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Rounds & Clinical Review</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Evaluate temperature progressions, record clinical rounds, and assess discharge readiness.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
          Pending Rounds Today: <strong className="text-sky-700">{pendingVisitPatients.length}</strong>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Selector & Pending Queue (1 col) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <label htmlFor="doctor-patient-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Select Patient for Review
            </label>
            <select
              id="doctor-patient-select"
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                setSelectedPatientId(e.target.value);
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm font-medium focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
            >
              {admittedPatients.map((p) => {
                const isPending = isDoctorVisitPendingToday(p, todayStr);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — Bed {p.bedNumber} {isPending ? '★ Round Pending' : '✓ Round Done'}
                  </option>
                );
              })}
            </select>

            {/* Quick Pending Rounds List */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Pending Rounds Queue ({pendingVisitPatients.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {pendingVisitPatients.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    All doctor visits are completed for {todayStr}.
                  </p>
                ) : (
                  pendingVisitPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPatientId(p.id);
                        setSelectedPatientId(p.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-md border text-xs flex items-center justify-between transition-colors ${
                        p.id === patientId 
                          ? 'border-sky-500 bg-sky-50 text-sky-950 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-2xs text-slate-500">Bed {p.bedNumber} · {p.primaryDiagnosis}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Clinical Discharge Criteria Quick Card */}
          {currentPatient && elig && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                Discharge Eligibility Status
              </h3>

              <div className={`p-3.5 rounded-md border text-xs space-y-2 ${
                elig.isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">3-Day Afebrile Criteria:</span>
                  <span className={`font-bold font-mono ${elig.isEligible ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {elig.consecutiveFeverFreeDays} / 3 Days
                  </span>
                </div>

                <p className="text-2xs leading-relaxed text-slate-600">
                  {elig.reason}
                </p>

                {elig.isEligible && (
                  <div className="pt-2 border-t border-emerald-200 text-2xs font-semibold text-emerald-900">
                    ✓ Patient clinically meets discharge criteria. Eligible for Medical Director sign-off on Admin Screen.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Temperature History & Doctor Visit Form (2 cols) */}
        {currentPatient ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Header Strip */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{currentPatient.name}</h2>
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                    {currentPatient.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                  <span>Bed {currentPatient.bedNumber}</span>
                  <span>·</span>
                  <span>{currentPatient.ward}</span>
                  <span>·</span>
                  <span>Age {currentPatient.age}</span>
                  <span>·</span>
                  <span>Admitted {currentPatient.admissionDate}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Diagnosis:</div>
                <div className="text-sm font-semibold text-slate-800">{currentPatient.primaryDiagnosis}</div>
              </div>
            </div>

            {/* Visual Temperature Trend Chart */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Patient Temperature Progression</h3>
                  <p className="text-xs text-slate-500">Observed readings in Celsius (°C) over length of stay</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                    Fever Threshold (38.0°C)
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                    Afebrile
                  </span>
                </div>
              </div>

              {sortedLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No temperature records available to render progression chart.
                </div>
              ) : (
                <div className="mt-4">
                  {/* Visual SVG Chart */}
                  <div className="w-full h-44 overflow-x-auto">
                    <svg className="w-full h-full min-w-[400px]" viewBox="0 0 600 160">
                      {/* Grid Lines */}
                      {/* Y-axis guidelines: 36, 37, 38 (fever), 39, 40 */}
                      {/* Range 35°C (y=150) to 41°C (y=10) => 1°C = 140/6 = 23.33px */}
                      <line x1="40" y1="150" x2="580" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="30" y="153" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">35°C</text>

                      <line x1="40" y1="103" x2="580" y2="103" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="30" y="106" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">37°C</text>

                      {/* Fever Line at 38.0°C: y = 150 - (38-35)*23.33 = 150 - 70 = 80 */}
                      <line x1="40" y1="80" x2="580" y2="80" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x="30" y="83" textAnchor="end" fontSize="10" fill="#e11d48" fontWeight="bold" fontFamily="monospace">38°C</text>

                      <line x1="40" y1="33" x2="580" y2="33" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="30" y="36" textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">40°C</text>

                      {/* Line plot */}
                      {(() => {
                        const points = sortedLogs.map((log, idx) => {
                          const x = sortedLogs.length === 1 
                            ? 310 
                            : 60 + (idx / (sortedLogs.length - 1)) * 500;
                          const clampedTemp = Math.max(35, Math.min(41, log.temperature));
                          const y = 150 - ((clampedTemp - 35) / 6) * 140;
                          return { x, y, log };
                        });

                        const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                        return (
                          <g>
                            {points.length > 1 && (
                              <path d={pathData} fill="none" stroke="#0d9488" strokeWidth="2.5" />
                            )}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r={p.log.isFever ? 5 : 4} 
                                  fill={p.log.isFever ? '#e11d48' : '#0d9488'}
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                />
                                <text 
                                  x={p.x} 
                                  y={p.y - 8} 
                                  textAnchor="middle" 
                                  fontSize="9" 
                                  fontWeight="600"
                                  fill={p.log.isFever ? '#be123c' : '#0f766e'}
                                  fontFamily="monospace"
                                >
                                  {p.log.temperature.toFixed(1)}°
                                </text>
                                <text 
                                  x={p.x} 
                                  y="160" 
                                  textAnchor="middle" 
                                  fontSize="8.5" 
                                  fill="#64748b"
                                  fontFamily="monospace"
                                >
                                  {p.log.date.slice(5)}
                                </text>
                              </g>
                            ))}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Observations Table */}
                  <div className="mt-4 border border-slate-200 rounded-md overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Temperature</th>
                          <th className="py-2 px-3">Evaluation</th>
                          <th className="py-2 px-3">Observed Symptoms</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {sortedLogs.map((log) => (
                          <tr key={log.id} className={log.isFever ? 'bg-rose-50/50' : ''}>
                            <td className="py-2 px-3 text-slate-900 font-medium">{log.date}</td>
                            <td className="py-2 px-3 text-slate-500">{log.time}</td>
                            <td className={`py-2 px-3 font-bold ${log.isFever ? 'text-rose-700' : 'text-teal-700'}`}>
                              {log.temperature.toFixed(1)}°C
                            </td>
                            <td className="py-2 px-3 font-sans">
                              {log.isFever ? (
                                <span className="font-semibold text-rose-700">Fever (≥ 38.0°C)</span>
                              ) : (
                                <span className="text-teal-700">Afebrile (Fever-Free)</span>
                              )}
                              {log.isCorrection && (
                                <span className="text-2xs text-amber-800 ml-1">· Correction</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-sans text-slate-600">
                              {log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'None'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Doctor Visit Form: Mark as Completed */}
            <form onSubmit={handleCompleteVisit} className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-700" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Conduct Clinical Round — {todayStr}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {isVisitPending ? 'Round Pending' : 'Update Today\'s Notes'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="evaluating-doctor" className="block text-2xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Evaluating Doctor
                  </label>
                  <input
                    id="evaluating-doctor"
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label htmlFor="clinical-assessment-status" className="block text-2xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Clinical Assessment Status
                  </label>
                  <select
                    id="clinical-assessment-status"
                    value={clinicalStatus}
                    onChange={(e) => setClinicalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-teal-600 bg-white"
                  >
                    <option value="Improving">Improving (Resolving)</option>
                    <option value="Stable">Stable</option>
                    <option value="Guarded">Guarded</option>
                    <option value="Critical">Critical (ICU / Isolation)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="round-time" className="block text-2xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Round Time
                  </label>
                  <input
                    id="round-time"
                    type="time"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="clinical-findings-notes" className="block text-2xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Clinical Examination Findings & Progress Notes
                </label>
                <textarea
                  id="clinical-findings-notes"
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="e.g. Chest sounds clear bilaterally. Vitals stable. No neurological deficit. Day 2 of antiviral protocol completed."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label htmlFor="treatment-orders" className="block text-2xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Treatment Plan & Prescription Orders (Optional)
                </label>
                <input
                  id="treatment-orders"
                  type="text"
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="e.g. Continue IV maintenance fluid 100 mL/hr, taper antipretic protocol."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Doctor Visit as Completed</span>
                </button>
              </div>
            </form>

            {/* Past Doctor Visits Timeline */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">
                Doctor Rounds History ({currentPatient.doctorVisits.length})
              </h3>

              <div className="mt-3 space-y-3">
                {currentPatient.doctorVisits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No doctor visits recorded yet.</p>
                ) : (
                  currentPatient.doctorVisits.slice().reverse().map(visit => (
                    <div key={visit.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{visit.doctorName}</span>
                          <span className="font-mono text-slate-500 text-2xs">· {visit.date} {visit.time}</span>
                        </div>
                        <span className={`font-semibold text-xs ${
                          visit.clinicalStatus === 'Critical' ? 'text-rose-700' :
                          visit.clinicalStatus === 'Improving' ? 'text-teal-700' :
                          'text-sky-700'
                        }`}>
                          {visit.clinicalStatus}
                        </span>
                      </div>

                      <p className="mt-1.5 text-slate-700 leading-relaxed">
                        {visit.clinicalNotes}
                      </p>

                      {visit.treatmentPlan && (
                        <div className="mt-1 text-2xs text-slate-500">
                          <strong className="text-slate-600">Plan:</strong> {visit.treatmentPlan}
                        </div>
                      )}

                      <div className="mt-2 text-2xs text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Completed on {visit.completedAt ? visit.completedAt.slice(0, 10) : visit.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
            Select a patient from the left column to view temperature history and complete doctor rounds.
          </div>
        )}
      </div>
    </div>
  );
};
