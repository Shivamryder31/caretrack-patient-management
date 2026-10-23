import React, { useState, useEffect } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { Patient, TemperatureLog } from '../types';
import { FEVER_THRESHOLD_CELSIUS, isTempCheckPendingToday } from '../utils/clinicalCalculations';
import { 
  Thermometer, 
  Calendar, 
  Clock, 
  User, 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  FileEdit,
  Search,
  Bed
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  'Asymptomatic',
  'Dry Cough',
  'Productive Cough',
  'Shortness of Breath',
  'Chills / Rigors',
  'Fatigue / Malaise',
  'Headache',
  'Myalgia (Muscle Aches)',
  'Nausea / Vomiting',
  'Petechiae / Rash'
];

export const NurseScreen: React.FC = () => {
  const { patients, todayStr, selectedPatientId, setSelectedPatientId, recordTemperature } = useCareTrack();

  const admittedPatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical');

  // Form State
  const [patientId, setPatientId] = useState<string>(selectedPatientId || (admittedPatients[0]?.id || ''));
  const [temperature, setTemperature] = useState<string>('37.0');
  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>('08:00');
  const [nurseName, setNurseName] = useState<string>('Nurse M. Henderson');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Asymptomatic']);
  
  // Authorized Correction State
  const [isCorrection, setIsCorrection] = useState<boolean>(false);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  
  // Validation and Submission feedback
  const [formError, setFormError] = useState<string | null>(null);

  // Sync if selectedPatientId changes from other screens
  useEffect(() => {
    if (selectedPatientId && admittedPatients.some(p => p.id === selectedPatientId)) {
      setPatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const currentPatient = patients.find(p => p.id === patientId);

  // Check if a reading already exists for this patient on this date
  const existingLogForDate: TemperatureLog | undefined = currentPatient?.temperatureLogs.find(
    log => log.date === date
  );

  // Reset correction toggle when patient or date changes
  useEffect(() => {
    setIsCorrection(false);
    setCorrectionReason('');
    setFormError(null);
  }, [patientId, date]);

  const tempNum = parseFloat(temperature);
  const isTempValid = !isNaN(tempNum) && tempNum >= 34.0 && tempNum <= 44.0;
  const isFever = isTempValid && tempNum >= FEVER_THRESHOLD_CELSIUS;

  const toggleSymptom = (sym: string) => {
    if (sym === 'Asymptomatic') {
      setSelectedSymptoms(['Asymptomatic']);
      return;
    }

    const withoutAsymptomatic = selectedSymptoms.filter(s => s !== 'Asymptomatic');
    if (withoutAsymptomatic.includes(sym)) {
      const remaining = withoutAsymptomatic.filter(s => s !== sym);
      setSelectedSymptoms(remaining.length === 0 ? ['Asymptomatic'] : remaining);
    } else {
      setSelectedSymptoms([...withoutAsymptomatic, sym]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!patientId) {
      setFormError('Please select a patient.');
      return;
    }

    if (!isTempValid) {
      setFormError('Please enter a realistic clinical temperature between 34.0°C and 44.0°C.');
      return;
    }

    if (!date) {
      setFormError('Please select a valid observation date.');
      return;
    }

    // Duplicate prevention validation
    if (existingLogForDate && !isCorrection) {
      setFormError('Duplicate entry detected! Duplicate entries for the same patient on the same day are blocked unless authorized as a clinical correction.');
      return;
    }

    if (existingLogForDate && isCorrection && !correctionReason.trim()) {
      setFormError('Please state the clinical authorization reason for correcting this existing record.');
      return;
    }

    const result = recordTemperature(
      patientId,
      tempNum,
      date,
      time,
      nurseName,
      selectedSymptoms,
      isCorrection,
      correctionReason
    );

    if (result.success) {
      // Reset form fields
      setIsCorrection(false);
      setCorrectionReason('');
      setFormError(null);
    } else {
      setFormError(result.message);
    }
  };

  // Pending checks today list
  const pendingPatients = admittedPatients.filter(p => isTempCheckPendingToday(p, todayStr));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nurse Station — Temperature Logging</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Record mandatory viral pyrexia observations. Fever threshold is strictly defined at <strong className="text-slate-800">≥ {FEVER_THRESHOLD_CELSIUS.toFixed(1)}°C</strong>.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recording Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-900">Patient Observation Form</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Reference Date: {todayStr}</span>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Field 1: Patient Selection */}
            <div>
              <label htmlFor="patient-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Select Patient (Admitted Inpatients Only)
              </label>
              <select
                id="patient-select"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setSelectedPatientId(e.target.value);
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
              >
                {admittedPatients.map((p) => {
                  const isPending = isTempCheckPendingToday(p, todayStr);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — Bed {p.bedNumber} · {p.ward} {isPending ? '★ Pending Today' : '✓ Logged'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Patient Context Card */}
            {currentPatient && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-900">{currentPatient.name}</span>
                  <span className="text-slate-500">· {currentPatient.age} yrs · {currentPatient.gender}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span>Bed: <strong className="text-slate-900">{currentPatient.bedNumber}</strong></span>
                  <span>·</span>
                  <span>{currentPatient.ward}</span>
                  <span>·</span>
                  <span>Diagnosis: <strong className="text-slate-900">{currentPatient.primaryDiagnosis}</strong></span>
                </div>
              </div>
            )}

            {/* Field 2: Date & Time Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date-picker" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Observation Date
                </label>
                <div className="relative">
                  <input
                    id="date-picker"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time-picker" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Time of Measurement
                </label>
                <div className="relative">
                  <input
                    id="time-picker"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Field 3: Temperature in Celsius (°C) with Real-Time Clinical Gauge */}
            <div>
              <label htmlFor="temp-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Body Temperature (°C Celsius)
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    id="temp-input"
                    type="number"
                    step="0.1"
                    min="34.0"
                    max="44.0"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-4 py-2.5 text-lg font-mono font-bold border border-slate-300 rounded-md focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                    °C
                  </span>
                </div>

                {/* Instant Clinical Evaluation Pill */}
                <div className="sm:w-60 flex items-center justify-center p-2.5 rounded-md border text-xs font-medium transition-colors">
                  {!isTempValid ? (
                    <span className="text-slate-500">Enter valid reading (34-44°C)</span>
                  ) : tempNum < 36.0 ? (
                    <span className="text-sky-800 font-semibold">Hypothermia Risk (&lt; 36.0°C)</span>
                  ) : tempNum < 37.5 ? (
                    <span className="text-teal-800 font-semibold">Normal / Afebrile (&lt; 37.5°C)</span>
                  ) : tempNum < FEVER_THRESHOLD_CELSIUS ? (
                    <span className="text-amber-800 font-semibold">Elevated (37.5 - 37.9°C)</span>
                  ) : (
                    <span className="text-rose-800 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      FEVER ALERT (≥ {FEVER_THRESHOLD_CELSIUS}°C)
                    </span>
                  )}
                </div>
              </div>

              {/* Quick temp buttons for nurse convenience */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-2xs text-slate-400">Presets:</span>
                {[36.5, 36.8, 37.0, 37.5, 38.0, 38.5, 39.2].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemperature(t.toFixed(1))}
                    className="px-2 py-0.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                  >
                    {t.toFixed(1)}°C
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Symptoms observed */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Observed Clinical Symptoms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-left px-2.5 py-1.5 rounded border text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-medium'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{sym}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 5: Nurse Staff Name */}
            <div>
              <label htmlFor="nurse-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Recorded By (Nurse Name / ID)
              </label>
              <input
                id="nurse-name"
                type="text"
                value={nurseName}
                onChange={(e) => setNurseName(e.target.value)}
                placeholder="e.g. Nurse M. Henderson, RN"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-hidden focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* DUPLICATE DETECTION WARNING & AUTHORIZED CORRECTION SECTION */}
            {existingLogForDate && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Duplicate Entry Detected on {date}
                    </h4>
                    <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                      A temperature of <strong className="font-mono text-amber-950">{existingLogForDate.temperature.toFixed(1)}°C</strong> was already recorded for {currentPatient?.name} on {date} at {existingLogForDate.time} by {existingLogForDate.recordedBy}.
                    </p>
                    <p className="text-2xs text-amber-800 mt-1">
                      Rule: Duplicate temperature entries for the same patient on the same day are prohibited unless an authorized correction is made.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-950">
                    <input
                      type="checkbox"
                      checked={isCorrection}
                      onChange={(e) => setIsCorrection(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>Authorize clinical re-measurement / correction override</span>
                  </label>

                  {isCorrection && (
                    <div className="mt-2 space-y-1">
                      <label htmlFor="correction-reason" className="block text-2xs uppercase tracking-wider font-semibold text-amber-900">
                        Required: Clinical Justification for Correction
                      </label>
                      <input
                        id="correction-reason"
                        type="text"
                        placeholder="e.g. Repeat test after 30 min with digital probe; initial probe calibration verified."
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {isFever ? '⚠️ High fever will reset afebrile streak.' : '✓ Normal reading contributes to 3-day afebrile criteria.'}
              </span>

              <button
                type="submit"
                disabled={Boolean(existingLogForDate && !isCorrection)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2 ${
                  existingLogForDate && !isCorrection
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : isCorrection
                    ? 'bg-amber-700 hover:bg-amber-800 text-white'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                {existingLogForDate ? (
                  isCorrection ? (
                    <>
                      <FileEdit className="w-4 h-4" />
                      <span>Save Authorized Correction</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Duplicate Blocked</span>
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Observation Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Pending Checks Today Queue & Patient History */}
        <div className="space-y-6">
          {/* Pending Checks Today */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pending Checks for {todayStr}
              </h3>
              <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {pendingPatients.length} remaining
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {pendingPatients.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  All temperature rounds completed for {todayStr}!
                </div>
              ) : (
                pendingPatients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPatientId(p.id);
                      setSelectedPatientId(p.id);
                    }}
                    className={`w-full text-left py-2.5 px-2 rounded flex items-center justify-between transition-colors ${
                      p.id === patientId ? 'bg-amber-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{p.name}</div>
                      <div className="text-2xs text-slate-500">Bed {p.bedNumber} · {p.ward}</div>
                    </div>
                    <span className="text-2xs text-amber-800 font-mono">Select →</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Current Patient's Recent History */}
          {currentPatient && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
                Recorded History: {currentPatient.name}
              </h3>

              <div className="mt-3 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {currentPatient.temperatureLogs.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No previous temperature logs recorded.</p>
                ) : (
                  currentPatient.temperatureLogs.slice().reverse().map(log => (
                    <div key={log.id} className="py-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-600">{log.date} · {log.time}</span>
                        <span className={`font-mono font-bold ${log.isFever ? 'text-rose-700' : 'text-teal-700'}`}>
                          {log.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-2xs text-slate-500">
                        <span>{log.recordedBy}</span>
                        {log.isCorrection ? (
                          <span className="text-amber-800 font-medium">Authorized correction</span>
                        ) : log.isFever ? (
                          <span className="text-rose-600 font-medium">Fever</span>
                        ) : (
                          <span className="text-teal-700">Afebrile</span>
                        )}
                      </div>
                      {log.correctionReason && (
                        <div className="mt-1 text-2xs italic text-amber-900 bg-amber-50 p-1 rounded">
                          Reason: {log.correctionReason}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
