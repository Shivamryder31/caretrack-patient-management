import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { Patient } from '../types';
import { checkDischargeEligibility, FEVER_THRESHOLD_CELSIUS, areConsecutiveDays } from '../utils/clinicalCalculations';
import { 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Bed, 
  X, 
  AlertTriangle,
  History,
  ClipboardList,
  UserX
} from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const { patients, todayStr, approveDischarge, recordDeathOutcome, setSelectedPatientId, setActiveScreen } = useCareTrack();

  const [activeTab, setActiveTab] = useState<'eligible' | 'tracking' | 'archive'>('eligible');
  
  // Discharge Approval Modal State
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<Patient | null>(null);
  const [approvedBy, setApprovedBy] = useState<string>('Dr. Robert Sterling, Medical Director');
  const [dischargeSummary, setDischargeSummary] = useState<string>('Patient has achieved 72+ consecutive afebrile hours with stable cardiopulmonary parameters. Discharged in good condition.');
  const [postDischargeAdvice, setPostDischargeAdvice] = useState<string>('Continue oral hydration and adhere to 7-day post-isolation home convalescence.');
  
  // Deceased Outcome Modal State
  const [selectedPatientForDeath, setSelectedPatientForDeath] = useState<Patient | null>(null);
  const [deathCause, setDeathCause] = useState<string>('');
  const [deathDate, setDeathDate] = useState<string>(todayStr);
  const [deathConfirmedBy, setDeathConfirmedBy] = useState<string>('Dr. Sarah Lin, MD');

  const admittedPatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');

  // Eligible patients (criteria met)
  const eligiblePatients = admittedPatients.filter(p => checkDischargeEligibility(p).isEligible);

  // Historical resolved
  const resolvedPatients = patients.filter(p => p.status === 'Discharged' || p.status === 'Deceased');

  const handleOpenDischargeModal = (patient: Patient) => {
    const elig = checkDischargeEligibility(patient);
    if (!elig.isEligible) {
      alert(`Cannot open discharge: ${elig.reason}`);
      return;
    }
    setSelectedPatientForDischarge(patient);
    setDischargeSummary(`Patient met standard clinical discharge criteria with ${elig.consecutiveFeverFreeDays} consecutive days afebrile (< ${FEVER_THRESHOLD_CELSIUS}°C). Discharged home in stable condition.`);
  };

  const handleConfirmDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForDischarge) return;

    if (!approvedBy.trim()) {
      alert('Medical Director or Administrative Authority name is required.');
      return;
    }

    const res = approveDischarge(
      selectedPatientForDischarge.id,
      approvedBy,
      dischargeSummary,
      postDischargeAdvice
    );

    if (res.success) {
      setSelectedPatientForDischarge(null);
    }
  };

  const handleConfirmDeath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForDeath) return;

    if (!deathCause.trim()) {
      alert('Please specify the clinical cause of death.');
      return;
    }

    const res = recordDeathOutcome(
      selectedPatientForDeath.id,
      deathDate,
      deathCause,
      deathConfirmedBy
    );

    if (res.success) {
      setSelectedPatientForDeath(null);
      setDeathCause('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discharge Administration & Governance</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Independent administrative verification of clinical discharge eligibility and official bed turnover sign-offs.
          </p>
        </div>
      </div>

      {/* Important Regulatory Concept Explainer */}
      <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-lg text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-teal-950">
            Clinical Rule: Separation of Eligibility vs. Administrative Approval
          </h4>
          <p className="text-teal-900 leading-relaxed">
            <strong>Eligibility</strong> is an automated objective clinical calculation: A patient is eligible for discharge <em>only after three complete consecutive days without fever (&lt; 38.0°C)</em> based on recorded observations.
            <strong> Approval</strong> is a separate administrative action requiring medical director sign-off to officially release the patient and vacate bed capacity.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'eligible' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Eligible for Discharge</span>
          <span className="font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
            {eligiblePatients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'tracking' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-sky-600" />
          <span>Afebrile Progress Tracker</span>
          <span className="font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
            {admittedPatients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'archive' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-slate-600" />
          <span>Resolved Outcomes & Archive</span>
          <span className="font-mono px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
            {resolvedPatients.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Eligible for Discharge */}
      {activeTab === 'eligible' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Patients Currently Meeting 3-Day Afebrile Clearance ({eligiblePatients.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Ready for Medical Director Sign-off
            </span>
          </div>

          {eligiblePatients.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-sm">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-800">No Patients Awaiting Discharge Approval</p>
              <p className="text-xs text-slate-500 mt-1">
                Patients who complete 3 consecutive calendar days without fever will automatically appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligiblePatients.map(patient => {
                const elig = checkDischargeEligibility(patient);
                return (
                  <div key={patient.id} className="bg-white border border-emerald-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{patient.name}</h3>
                          <p className="text-xs text-slate-500 font-mono">{patient.id} · Bed {patient.bedNumber}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Criteria Met
                        </span>
                      </div>

                      <div className="mt-3 text-xs space-y-2 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Isolation Ward:</span>
                          <span className="font-medium">{patient.ward}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Admission Date:</span>
                          <span className="font-mono">{patient.admissionDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Primary Diagnosis:</span>
                          <span className="font-medium">{patient.primaryDiagnosis}</span>
                        </div>

                        {/* Verified Observations Breakdown */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="font-semibold text-emerald-900 block mb-1">
                            Verified Afebrile Observations ({elig.consecutiveFeverFreeDays} consecutive days):
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 font-mono text-2xs">
                            {elig.recentDailyTemps.map(d => (
                              <div key={d.date} className="p-1.5 bg-emerald-50/70 border border-emerald-100 rounded text-center">
                                <div className="text-slate-500">{d.date.slice(5)}</div>
                                <div className="font-bold text-emerald-800">{d.maxTemp.toFixed(1)}°C</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-2xs text-slate-500">Separated approval workflow</span>
                      <button
                        onClick={() => handleOpenDischargeModal(patient)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm & Approve Discharge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Afebrile Progress Tracker */}
      {activeTab === 'tracking' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Inpatient Discharge Readiness Tracking</h2>
              <p className="text-xs text-slate-500">Tracking daily afebrile progression towards 3-consecutive-day qualification</p>
            </div>
            <span className="text-xs font-mono text-slate-600">{admittedPatients.length} Active Inpatients</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Bed / Ward</th>
                  <th className="py-3 px-4">Consecutive Afebrile Streak</th>
                  <th className="py-3 px-4">Eligibility Status</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admittedPatients.map(patient => {
                  const elig = checkDischargeEligibility(patient);
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-xs">{patient.name}</div>
                        <div className="text-2xs font-mono text-slate-500">{patient.id} · Admitted {patient.admissionDate}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-medium text-slate-800">Bed {patient.bedNumber}</span>
                        <div className="text-2xs text-slate-500">{patient.ward}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${elig.isEligible ? 'bg-emerald-600' : 'bg-teal-600'}`}
                              style={{ width: `${Math.min((elig.consecutiveFeverFreeDays / 3) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {elig.consecutiveFeverFreeDays} / 3 days
                          </span>
                        </div>
                        <div className="text-2xs text-slate-500 mt-0.5">{elig.reason}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {elig.isEligible ? (
                          <span className="font-bold text-emerald-700">Eligible (Criteria Met)</span>
                        ) : (
                          <span className="text-slate-500">In Observation (Needs {3 - elig.consecutiveFeverFreeDays} more)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {elig.isEligible ? (
                            <button
                              onClick={() => handleOpenDischargeModal(patient)}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                            >
                              Approve Discharge
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPatientForDeath(patient);
                                setDeathCause(`Severe complication secondary to ${patient.primaryDiagnosis}`);
                              }}
                              title="Record mortality in case of critical outcome"
                              className="px-2 py-1 text-2xs font-medium text-slate-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                            >
                              Record Outcome
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Historical Resolved Outcomes & Archive */}
      {activeTab === 'archive' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Historical Case Outcomes & Discharge Logs</h2>
              <p className="text-xs text-slate-500">Archived discharge clearances and mortality records</p>
            </div>
            <span className="text-xs font-mono text-slate-600">{resolvedPatients.length} Resolved Cases</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="py-3 px-4">Patient ID & Name</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4">Resolution Details</th>
                  <th className="py-3 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {resolvedPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="font-mono text-2xs text-slate-500">{patient.id} · Age {patient.age}</div>
                    </td>
                    <td className="py-3 px-4">
                      {patient.status === 'Discharged' ? (
                        <span className="font-semibold text-emerald-800">Discharged (Recovered)</span>
                      ) : (
                        <span className="font-semibold text-rose-800">Deceased</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {patient.admissionDate}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {patient.status === 'Discharged' && patient.dischargeApproval && (
                        <div>
                          <p>{patient.dischargeApproval.dischargeSummary}</p>
                          <span className="text-2xs text-slate-500 font-mono">
                            Discharged: {patient.dischargeApproval.approvedAt.slice(0, 10)}
                          </span>
                        </div>
                      )}
                      {patient.status === 'Deceased' && patient.deathRecord && (
                        <div>
                          <p className="text-rose-900 font-medium">{patient.deathRecord.cause}</p>
                          <span className="text-2xs text-slate-500 font-mono">
                            Date: {patient.deathRecord.date}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {patient.dischargeApproval?.approvedBy || patient.deathRecord?.confirmedBy || 'Medical Staff'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISCHARGE APPROVAL MODAL */}
      {selectedPatientForDischarge && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Discharge Authorization
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientForDischarge(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist */}
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Eligibility Criteria Verified</span>
              </div>
              <p>
                Patient <strong>{selectedPatientForDischarge.name} ({selectedPatientForDischarge.id})</strong> has satisfied the mandatory 3-day afebrile criteria.
              </p>
              <div className="text-2xs text-emerald-800">
                Vacating Bed {selectedPatientForDischarge.bedNumber} ({selectedPatientForDischarge.ward}).
              </div>
            </div>

            <form onSubmit={handleConfirmDischarge} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Approving Authority / Medical Director
                </label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Official Discharge Summary
                </label>
                <textarea
                  rows={3}
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Post-Discharge Instructions & Isolation Advice
                </label>
                <input
                  type="text"
                  value={postDischargeAdvice}
                  onChange={(e) => setPostDischargeAdvice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForDischarge(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Release Bed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MORTALITY OUTCOME MODAL */}
      {selectedPatientForDeath && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-rose-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Record Critical Mortality Outcome
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientForDeath(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Recording an outcome as Deceased updates the centre mortality registry and frees up Bed {selectedPatientForDeath.bedNumber}.
            </p>

            <form onSubmit={handleConfirmDeath} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Primary Cause of Death
                </label>
                <input
                  type="text"
                  value={deathCause}
                  onChange={(e) => setDeathCause(e.target.value)}
                  placeholder="e.g. Fulminant respiratory distress syndrome secondary to viral pathogen"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-rose-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Date of Death
                  </label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Certifying Physician
                  </label>
                  <input
                    type="text"
                    value={deathConfirmedBy}
                    onChange={(e) => setDeathConfirmedBy(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForDeath(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold"
                >
                  Confirm Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
