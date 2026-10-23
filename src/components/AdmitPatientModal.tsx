import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { WardName } from '../types';
import { TOTAL_BEDS } from '../utils/clinicalCalculations';
import { UserPlus, X, Bed, AlertCircle } from 'lucide-react';

interface AdmitPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdmitPatientModal: React.FC<AdmitPatientModalProps> = ({ isOpen, onClose }) => {
  const { stats, todayStr, admitPatient, patients } = useCareTrack();

  const [name, setName] = useState('');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [ward, setWard] = useState<WardName>('Ward A (Acute)');
  const [bedNumber, setBedNumber] = useState('A-15');
  const [admissionDate, setAdmissionDate] = useState(todayStr);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('Viral Hemorrhagic Syndrome - Acute Phase');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isBedsFull = stats.occupiedBeds >= TOTAL_BEDS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isBedsFull) {
      setErrorMsg(`All ${TOTAL_BEDS} beds are currently occupied. Cannot admit until a patient is discharged.`);
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }

    if (!bedNumber.trim()) {
      setErrorMsg('Bed number assignment is required.');
      return;
    }

    const res = admitPatient({
      name: name.trim(),
      age: parseInt(age, 10) || 30,
      gender,
      ward,
      bedNumber: bedNumber.trim().toUpperCase(),
      admissionDate,
      primaryDiagnosis: primaryDiagnosis.trim()
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-700" />
            <h3 className="text-base font-bold text-slate-900">Admit Patient to Treatment Centre</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Indicator */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-slate-500" />
            <span>Facility Bed Census:</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            {stats.occupiedBeds} / {TOTAL_BEDS} Beds Occupied ({TOTAL_BEDS - stats.occupiedBeds} Available)
          </span>
        </div>

        {isBedsFull && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>CRITICAL: Bed capacity reached ({TOTAL_BEDS}/{TOTAL_BEDS}). You must process a discharge before new patient triage.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Patient Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samuel K. Jackson"
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Isolation Ward
              </label>
              <select
                value={ward}
                onChange={(e) => {
                  const newWard = e.target.value as WardName;
                  setWard(newWard);
                  if (newWard.includes('Acute')) setBedNumber('A-15');
                  else if (newWard.includes('Subacute')) setBedNumber('B-20');
                  else setBedNumber('C-18');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600 bg-white"
              >
                <option value="Ward A (Acute)">Ward A (Acute / ICU)</option>
                <option value="Ward B (Subacute)">Ward B (Subacute)</option>
                <option value="Ward C (Convalescent)">Ward C (Convalescent)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Assigned Bed ID
              </label>
              <input
                type="text"
                required
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g. A-15, B-08, C-02"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:outline-hidden focus:border-teal-600 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Admission Date
              </label>
              <input
                type="date"
                required
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:outline-hidden focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Primary Diagnosis
              </label>
              <input
                type="text"
                required
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="e.g. Viral Febrile Illness"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-teal-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBedsFull}
              className={`px-4 py-2 rounded text-white font-semibold flex items-center gap-1.5 ${
                isBedsFull ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Complete Admission</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
