import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { MORTALITY_ALERT_THRESHOLD, FEVER_THRESHOLD_CELSIUS } from '../utils/clinicalCalculations';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldAlert, 
  Info,
  Sliders,
  RotateCcw
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { patients, stats } = useCareTrack();

  const totalAdmissions = patients.length;
  const recoveries = patients.filter(p => p.status === 'Discharged').length;
  const deaths = patients.filter(p => p.status === 'Deceased').length;
  const activeInpatients = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical').length;
  const resolvedCases = recoveries + deaths;

  // Case Fatality Rate (CFR) = [Deaths / (Deaths + Recoveries)] * 100
  const actualMortalityRate = resolvedCases > 0 
    ? Number(((deaths / resolvedCases) * 100).toFixed(1))
    : 0;

  // Interactive Simulator State for What-If Analysis
  const [simRecoveries, setSimRecoveries] = useState<number>(recoveries);
  const [simDeaths, setSimDeaths] = useState<number>(deaths);

  const simResolved = simRecoveries + simDeaths;
  const simMortalityRate = simResolved > 0
    ? Number(((simDeaths / simResolved) * 100).toFixed(1))
    : 0;
  const isSimAlert = simMortalityRate > MORTALITY_ALERT_THRESHOLD;

  // Temperature distribution of active inpatients
  const tempStats = {
    normal: 0,
    elevated: 0,
    fever: 0,
    noData: 0
  };

  patients.filter(p => p.status === 'Admitted' || p.status === 'Critical').forEach(p => {
    if (p.temperatureLogs.length === 0) {
      tempStats.noData++;
    } else {
      const latest = p.temperatureLogs[p.temperatureLogs.length - 1];
      if (latest.temperature >= FEVER_THRESHOLD_CELSIUS) {
        tempStats.fever++;
      } else if (latest.temperature >= 37.5) {
        tempStats.elevated++;
      } else {
        tempStats.normal++;
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Epidemiological & Mortality Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Centre-wide clinical outcomes, case fatality rate (CFR) analysis, and threshold monitoring.
          </p>
        </div>
      </div>

      {/* MANDATORY WARNING BANNER: Triggers when mortality rate > 15% */}
      {stats.isMortalityAlertTriggered ? (
        <div className="p-5 bg-rose-50 border-2 border-rose-500 rounded-lg shadow-sm space-y-2">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            <h2 className="text-base font-bold text-rose-950 uppercase tracking-wide">
              CRITICAL CLINICAL ALERT: Mortality Rate Exceeds 15.0% Safety Threshold
            </h2>
          </div>
          <p className="text-sm text-rose-900 leading-relaxed">
            The current Case Fatality Rate (CFR) is <strong className="font-mono text-base font-bold text-rose-950">{stats.mortalityRate}%</strong> ({stats.totalDeaths} deaths out of {stats.totalRecoveredDischarged + stats.totalDeaths} resolved cases), which exceeds the viral containment centre safety threshold of <strong className="font-mono">15.0%</strong>.
          </p>
          <div className="pt-2 border-t border-rose-200 text-xs text-rose-800 space-y-1">
            <p><strong>Mandatory Action Protocols:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Immediate escalation to the Hospital Clinical Oversight Board and Regional Health Authority.</li>
              <li>Triage re-evaluation of all Ward A acute inpatients and audit of mechanical ventilation lines.</li>
              <li>Genomic sequencing of patient viral isolates to detect virulent pathogen mutations.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-950">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-900">Mortality Rate Nominal: </span>
              <span>Current rate of <strong className="font-mono font-bold">{stats.mortalityRate}%</strong> is safely within the target baseline threshold (&le; 15.0%).</span>
            </div>
          </div>
          <span className="font-mono text-2xs text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
            Threshold: &le; 15.0%
          </span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Admissions */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Total Cases Admitted</div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalAdmissions}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Cumulative registry census
          </div>
        </div>

        {/* Recoveries / Discharged */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Recoveries (Discharged)</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {recoveries}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Met 3-day afebrile criteria
          </div>
        </div>

        {/* Recorded Deaths */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Recorded Deaths</div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {deaths}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Confirmed virus-related fatalities
          </div>
        </div>

        {/* Mortality Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs font-medium text-slate-500">Case Fatality Rate (CFR)</div>
          <div className={`mt-2 text-2xl font-bold font-mono tabular-nums ${stats.isMortalityAlertTriggered ? 'text-rose-700' : 'text-slate-900'}`}>
            {stats.mortalityRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Threshold alert: &gt; 15.0%
          </div>
        </div>
      </div>

      {/* Detailed Math Explanation Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Info className="w-5 h-5 text-teal-700" />
          <h2 className="text-base font-bold text-slate-900">
            Transparent Mathematical Breakdown of the Mortality Calculation
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In clinical viral epidemiology, calculating mortality strictly on closed/resolved cases (Case Fatality Rate) provides an accurate snapshot of disease severity without artificially deflating figures with currently active inpatients whose outcomes are not yet determined.
        </p>

        {/* Visual Formula Box */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-3">
          <div className="text-center font-bold text-sm text-slate-900 py-1 bg-white border border-slate-200 rounded">
            Mortality Rate (%) = [ Total Deaths ÷ ( Total Deaths + Recovered Discharges ) ] × 100
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-2xs uppercase">Numerator (Fatalities)</span>
              <strong className="text-sm text-rose-800 font-bold">{deaths} Deaths</strong>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-2xs uppercase">Denominator (Resolved Cases)</span>
              <strong className="text-sm text-slate-900 font-bold">
                {deaths} Deaths + {recoveries} Recoveries = {resolvedCases} Cases
              </strong>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-slate-500 block text-2xs uppercase">Calculated Quotient</span>
              <strong className={`text-sm font-bold ${stats.isMortalityAlertTriggered ? 'text-rose-700' : 'text-teal-800'}`}>
                {resolvedCases > 0 ? `(${deaths} ÷ ${resolvedCases}) × 100 = ${actualMortalityRate}%` : '0.0%'}
              </strong>
            </div>
          </div>

          <div className="pt-2 text-2xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>
              Secondary Measure — Crude Population Mortality: [{deaths} Deaths ÷ {totalAdmissions} Total Admissions] × 100 = <strong className="text-slate-700 font-mono">{stats.crudeMortalityRate}%</strong>
            </span>
            <span className="font-semibold text-slate-700">
              Warning threshold: {MORTALITY_ALERT_THRESHOLD}.0%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive What-If Scenario Simulator */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Epidemiological Scenario Simulator (What-If Analysis)
              </h3>
              <p className="text-xs text-slate-500">
                Simulate how hypothetical shifts in recoveries or fatalities impact the mortality rate and trigger/clear the 15% safety alert.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSimRecoveries(recoveries);
              setSimDeaths(deaths);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Actual</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            {/* Simulator Deaths Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Simulated Deaths:</span>
                <span className="font-mono text-rose-700 font-bold">{simDeaths}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={simDeaths}
                  onChange={(e) => setSimDeaths(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600"
                />
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => setSimDeaths(Math.max(0, simDeaths - 1))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSimDeaths(simDeaths + 1)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Simulator Recoveries Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Simulated Recoveries:</span>
                <span className="font-mono text-emerald-700 font-bold">{simRecoveries}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simRecoveries}
                  onChange={(e) => setSimRecoveries(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => setSimRecoveries(Math.max(0, simRecoveries - 1))}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSimRecoveries(simRecoveries + 1)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Result Output */}
          <div className={`p-5 rounded-lg border text-center transition-colors ${
            isSimAlert 
              ? 'bg-rose-50 border-rose-300 text-rose-950' 
              : 'bg-teal-50 border-teal-300 text-teal-950'
          }`}>
            <span className="text-xs uppercase font-bold tracking-wider opacity-75">
              Simulated Mortality Rate
            </span>
            <div className="text-4xl font-extrabold font-mono tabular-nums my-1">
              {simMortalityRate}%
            </div>
            <div className="text-xs font-medium">
              {isSimAlert ? (
                <span className="text-rose-700 font-bold flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Triggers &gt; 15.0% Safety Warning
                </span>
              ) : (
                <span className="text-teal-800 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Within Safe Threshold (&le; 15.0%)
                </span>
              )}
            </div>
            <p className="text-2xs text-slate-500 mt-2 font-mono">
              Calculation: [{simDeaths} ÷ ({simDeaths} + {simRecoveries})] × 100
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Distribution Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outcome Breakdown Bar */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Case Status Proportions ({totalAdmissions} Total Admissions)
          </h3>

          <div className="space-y-3 text-xs">
            {/* Active Inpatients */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Active Inpatients (Under Treatment)</span>
                <span className="font-mono font-medium text-slate-900">{activeInpatients} ({Math.round((activeInpatients / totalAdmissions) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${(activeInpatients / totalAdmissions) * 100}%` }}
                />
              </div>
            </div>

            {/* Recovered & Discharged */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Discharged Recovered</span>
                <span className="font-mono font-medium text-emerald-700">{recoveries} ({Math.round((recoveries / totalAdmissions) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(recoveries / totalAdmissions) * 100}%` }}
                />
              </div>
            </div>

            {/* Fatalities */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-600">Fatalities (Deceased)</span>
                <span className="font-mono font-medium text-rose-700">{deaths} ({Math.round((deaths / totalAdmissions) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-rose-600 h-full rounded-full"
                  style={{ width: `${(deaths / totalAdmissions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current Inpatient Temperature Classification */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Inpatient Pyrexia Profile ({activeInpatients} Inpatients)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-2xs">Normal (&lt; 37.5°C)</span>
              <strong className="text-lg font-mono text-teal-800">{tempStats.normal}</strong>
              <div className="text-2xs text-slate-400 mt-0.5">Afebrile progression</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-800 block text-2xs">Elevated (37.5-37.9°C)</span>
              <strong className="text-lg font-mono text-amber-900">{tempStats.elevated}</strong>
              <div className="text-2xs text-amber-700 mt-0.5">Sub-febrile monitoring</div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-rose-800 block text-2xs">High Fever (&ge; 38.0°C)</span>
              <strong className="text-lg font-mono text-rose-900">{tempStats.fever}</strong>
              <div className="text-2xs text-rose-700 mt-0.5">Active viral acute phase</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-2xs">Pending Observations</span>
              <strong className="text-lg font-mono text-slate-800">{tempStats.noData}</strong>
              <div className="text-2xs text-slate-400 mt-0.5">Awaiting initial check</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
