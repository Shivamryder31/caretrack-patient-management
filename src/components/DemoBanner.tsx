import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { Calendar, RotateCcw, Download, AlertTriangle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { todayStr, setTodayStr, resetToSampleData, exportDataJson } = useCareTrack();
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(todayStr);

  const handleDateSave = () => {
    if (tempDate) {
      setTodayStr(tempDate);
      setIsEditingDate(false);
    }
  };

  return (
    <aside aria-label="Demonstration Notice" className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center md:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-950">DEMONSTRATION SYSTEM:</strong> Built with fictional patient cases for workflow evaluation. Not certified for clinical diagnosis or real healthcare administration.
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-700 bg-white border border-amber-200 rounded px-2 py-0.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-slate-500">Simulated Today:</span>
            {isEditingDate ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="px-1 py-0.5 border border-slate-300 rounded text-xs font-mono"
                />
                <button
                  onClick={handleDateSave}
                  className="px-1.5 py-0.5 bg-amber-700 text-white rounded text-xs hover:bg-amber-800"
                >
                  Set
                </button>
                <button
                  onClick={() => setIsEditingDate(false)}
                  className="px-1 py-0.5 text-slate-500 text-xs hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempDate(todayStr);
                  setIsEditingDate(true);
                }}
                className="font-mono font-medium hover:text-amber-800 underline decoration-dotted"
                title="Click to shift simulated clinical calendar day"
              >
                {todayStr}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportDataJson}
              title="Backup current patient records as JSON"
              className="flex items-center gap-1 text-slate-700 hover:text-slate-900 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <span className="text-amber-300">|</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all patients, bed assignments, and logs to initial demonstration data?')) {
                  resetToSampleData();
                }
              }}
              title="Restore initial fictional dataset"
              className="flex items-center gap-1 text-slate-700 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
