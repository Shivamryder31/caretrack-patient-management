import React, { useState } from 'react';
import { CareTrackProvider, useCareTrack } from './context/CareTrackContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { ToastContainer } from './components/ToastContainer';
import { DashboardScreen } from './components/DashboardScreen';
import { PatientListScreen } from './components/PatientListScreen';
import { NurseScreen } from './components/NurseScreen';
import { DoctorScreen } from './components/DoctorScreen';
import { AdminScreen } from './components/AdminScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { AdmitPatientModal } from './components/AdmitPatientModal';
import { GuideModal } from './components/GuideModal';

const AppContent: React.FC = () => {
  const { activeScreen, stats } = useCareTrack();
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demonstration Notice */}
      <DemoBanner />

      {/* Primary Top Bar */}
      <Navbar 
        onOpenAdmitModal={() => setIsAdmitModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeScreen === 'dashboard' && (
          <DashboardScreen onOpenAdmitModal={() => setIsAdmitModalOpen(true)} />
        )}
        {activeScreen === 'patients' && (
          <PatientListScreen onOpenAdmitModal={() => setIsAdmitModalOpen(true)} />
        )}
        {activeScreen === 'nurse' && (
          <NurseScreen />
        )}
        {activeScreen === 'doctor' && (
          <DoctorScreen />
        )}
        {activeScreen === 'admin' && (
          <AdminScreen />
        )}
        {activeScreen === 'reports' && (
          <ReportsScreen />
        )}
      </main>

      {/* Quiet Healthcare Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-800">CareTrack Bio-Containment Management System</span>
            <span className="hidden sm:inline mx-2">·</span>
            <span className="block sm:inline mt-1 sm:mt-0">Fictional patient demonstration environment</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Capacity: <strong className="font-mono text-slate-800">{stats.occupiedBeds}/74 Beds</strong></span>
            <span>·</span>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-teal-700 underline transition-colors"
            >
              Run & Deploy Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <AdmitPatientModal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CareTrackProvider>
      <AppContent />
    </CareTrackProvider>
  );
}
