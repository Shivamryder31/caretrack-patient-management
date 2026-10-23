import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { Patient, PatientStatus, WardName } from '../types';
import { checkDischargeEligibility, isTempCheckPendingToday, isDoctorVisitPendingToday } from '../utils/clinicalCalculations';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Thermometer, 
  Stethoscope, 
  Calendar, 
  Bed, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

interface PatientListScreenProps {
  onOpenAdmitModal: () => void;
}

export const PatientListScreen: React.FC<PatientListScreenProps> = ({ onOpenAdmitModal }) => {
  const { patients, todayStr, setActiveScreen, setSelectedPatientId } = useCareTrack();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [selectedPatientModal, setSelectedPatientModal] = useState<Patient | null>(null);

  // Filter logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'discharge_ready' ? checkDischargeEligibility(patient).isEligible :
      patient.status === statusFilter;

    const matchesWard = wardFilter === 'all' ? true : patient.ward === wardFilter;

    return matchesSearch && matchesStatus && matchesWard;
  });

  const handleOpenPatientDetail = (patient: Patient) => {
    setSelectedPatientModal(patient);
  };

  const navigateToNurse = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('nurse');
  };

  const navigateToDoctor = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('doctor');
  };

  const navigateToAdmin = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveScreen('admin');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Active admissions, fever observation status, and historical clinical records.
          </p>
        </div>

        <button
          onClick={onOpenAdmitModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors shadow-2xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Admit New Patient</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, ID (e.g. CT-1041), or bed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter Segment */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'All Patients' },
              { id: 'Admitted', label: 'Admitted' },
              { id: 'Critical', label: 'Critical' },
              { id: 'discharge_ready', label: 'Discharge Ready' },
              { id: 'Discharged', label: 'Discharged' },
              { id: 'Deceased', label: 'Deceased' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter: Ward Selection */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter Ward:</span>
          <div className="flex items-center gap-2">
            {['all', 'Ward A (Acute)', 'Ward B (Subacute)', 'Ward C (Convalescent)'].map(ward => (
              <button
                key={ward}
                onClick={() => setWardFilter(ward)}
                className={`text-xs hover:underline ${
                  wardFilter === ward ? 'font-semibold text-teal-800' : 'text-slate-600'
                }`}
              >
                {ward === 'all' ? 'All Wards' : ward}
              </button>
            ))}
          </div>
          <span className="ml-auto text-slate-400 font-mono tabular-nums">
            Showing {filteredPatients.length} of {patients.length} records
          </span>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Patient Name & Age</th>
                <th className="py-3 px-4">Bed & Isolation Ward</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Status & Clinical State</th>
                <th className="py-3 px-4">Fever-Free Streak</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No patients match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const elig = checkDischargeEligibility(patient);
                  const isTempPending = isTempCheckPendingToday(patient, todayStr);
                  const isDocPending = isDoctorVisitPendingToday(patient, todayStr);

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 tabular-nums">
                        {patient.id}
                      </td>

                      {/* Name & Age */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{patient.name}</div>
                        <div className="text-xs text-slate-500">
                          {patient.age} yrs · {patient.gender} · {patient.primaryDiagnosis}
                        </div>
                      </td>

                      {/* Bed & Ward */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>Bed {patient.bedNumber}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {patient.ward}
                        </div>
                      </td>

                      {/* Admission Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums text-xs">
                        {patient.admissionDate}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          {patient.status === 'Critical' && (
                            <span className="font-semibold text-rose-700">Critical Isolation</span>
                          )}
                          {patient.status === 'Admitted' && (
                            <span className="font-medium text-teal-800">Admitted (Active)</span>
                          )}
                          {patient.status === 'Discharged' && (
                            <span className="font-medium text-slate-600">Discharged (Recovered)</span>
                          )}
                          {patient.status === 'Deceased' && (
                            <span className="font-semibold text-slate-700">Deceased</span>
                          )}
                        </div>
                        {/* Inline queues */}
                        {(patient.status === 'Admitted' || patient.status === 'Critical') && (
                          <div className="mt-1 flex items-center gap-2 text-2xs text-slate-500">
                            {isTempPending && (
                              <span className="text-amber-700 font-medium">· Temp pending</span>
                            )}
                            {isDocPending && (
                              <span className="text-sky-700 font-medium">· Doctor round pending</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Fever-Free Streak */}
                      <td className="py-3.5 px-4">
                        {patient.status === 'Discharged' ? (
                          <span className="text-xs text-slate-500">Completed clearance</span>
                        ) : patient.status === 'Deceased' ? (
                          <span className="text-xs text-slate-400">N/A</span>
                        ) : elig.isEligible ? (
                          <div className="text-xs">
                            <span className="font-semibold text-emerald-700">Eligible (3/3 days)</span>
                            <div className="text-2xs text-slate-500 mt-0.5">Ready for discharge approval</div>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-mono tabular-nums text-slate-800 font-medium">
                              {elig.consecutiveFeverFreeDays} of 3 days
                            </span>
                            <div className="text-2xs text-slate-500 mt-0.5">
                              {elig.consecutiveFeverFreeDays === 0 ? 'Fever active or unconfirmed' : 'Afebrile streak'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPatientDetail(patient)}
                            title="View full medical history and charts"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(patient.status === 'Admitted' || patient.status === 'Critical') && (
                            <>
                              <button
                                onClick={() => navigateToNurse(patient.id)}
                                title="Record temperature for nurse shift"
                                className="p-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <Thermometer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigateToDoctor(patient.id)}
                                title="Doctor evaluation & visit log"
                                className="p-1.5 text-sky-700 hover:text-sky-800 hover:bg-sky-50 rounded-md transition-colors"
                              >
                                <Stethoscope className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedPatientModal.name}</h3>
                  <span className="font-mono text-xs text-slate-500">{selectedPatientModal.id}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bed {selectedPatientModal.bedNumber} · {selectedPatientModal.ward} · Admitted {selectedPatientModal.admissionDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Clinical summary banner */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Diagnosis:</span>
                  <span className="font-medium text-slate-900">{selectedPatientModal.primaryDiagnosis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-slate-900">{selectedPatientModal.status}</span>
                </div>
                {selectedPatientModal.status === 'Discharged' && selectedPatientModal.dischargeApproval && (
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <span className="font-semibold text-emerald-800">Discharge Authorized:</span>
                    <p className="mt-1 text-slate-700">{selectedPatientModal.dischargeApproval.dischargeSummary}</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Approved by: {selectedPatientModal.dischargeApproval.approvedBy}</p>
                  </div>
                )}
                {selectedPatientModal.status === 'Deceased' && selectedPatientModal.deathRecord && (
                  <div className="pt-2 mt-2 border-t border-slate-200 text-rose-900">
                    <span className="font-semibold">Deceased Record:</span>
                    <p className="mt-1">{selectedPatientModal.deathRecord.cause}</p>
                    <p className="text-2xs text-slate-500 mt-0.5">Date: {selectedPatientModal.deathRecord.date} · Confirmed: {selectedPatientModal.deathRecord.confirmedBy}</p>
                  </div>
                )}
              </div>

              {/* Temperature History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Temperature Observation Logs ({selectedPatientModal.temperatureLogs.length})
                  </h4>
                  {selectedPatientModal.status !== 'Discharged' && selectedPatientModal.status !== 'Deceased' && (
                    <button
                      onClick={() => {
                        setSelectedPatientModal(null);
                        navigateToNurse(selectedPatientModal.id);
                      }}
                      className="text-xs text-amber-700 hover:underline font-medium"
                    >
                      + Add Temperature
                    </button>
                  )}
                </div>

                {selectedPatientModal.temperatureLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic">No temperature observations logged yet.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Time</th>
                          <th className="py-2 px-3">Reading (°C)</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPatientModal.temperatureLogs.map((log) => (
                          <tr key={log.id} className={log.isFever ? 'bg-rose-50/40' : ''}>
                            <td className="py-2 px-3 font-mono">{log.date}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{log.time}</td>
                            <td className="py-2 px-3 font-mono font-bold">
                              {log.temperature.toFixed(1)}°C
                            </td>
                            <td className="py-2 px-3">
                              {log.isFever ? (
                                <span className="font-semibold text-rose-700">Fever (≥ 38.0°C)</span>
                              ) : (
                                <span className="text-teal-700 font-medium">Normal / Afebrile</span>
                              )}
                              {log.isCorrection && (
                                <span className="ml-1 text-2xs text-amber-800">· Corrected</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-500">{log.recordedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Doctor Visits */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Doctor Rounds & Clinical Notes ({selectedPatientModal.doctorVisits.length})
                  </h4>
                  {selectedPatientModal.status !== 'Discharged' && selectedPatientModal.status !== 'Deceased' && (
                    <button
                      onClick={() => {
                        setSelectedPatientModal(null);
                        navigateToDoctor(selectedPatientModal.id);
                      }}
                      className="text-xs text-sky-700 hover:underline font-medium"
                    >
                      + Conduct Round
                    </button>
                  )}
                </div>

                {selectedPatientModal.doctorVisits.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 italic">No doctor visits recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPatientModal.doctorVisits.map((visit) => (
                      <div key={visit.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{visit.doctorName}</span>
                          <span className="font-mono text-slate-500">{visit.date} · {visit.time}</span>
                        </div>
                        <div className="mt-1 text-slate-700">
                          <strong>Assessment:</strong> {visit.clinicalStatus} — {visit.clinicalNotes}
                        </div>
                        {visit.treatmentPlan && (
                          <div className="mt-1 text-slate-600">
                            <strong>Plan:</strong> {visit.treatmentPlan}
                          </div>
                        )}
                        <div className="mt-2 text-2xs text-slate-400">
                          Status: {visit.completed ? 'Completed' : 'Pending Round'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
