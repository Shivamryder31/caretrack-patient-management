import React, { useState } from 'react';
import { useCareTrack } from '../context/CareTrackContext';
import { ActiveScreen } from '../types';
import { 
  Activity, 
  Users, 
  Thermometer, 
  Stethoscope, 
  UserCheck, 
  BarChart3, 
  Menu, 
  X, 
  UserPlus,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onOpenAdmitModal: () => void;
  onOpenGuideModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmitModal, onOpenGuideModal }) => {
  const { activeScreen, setActiveScreen, stats } = useCareTrack();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveScreen; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Patient List', icon: Users, badge: stats.occupiedBeds },
    { id: 'nurse', label: 'Nurse Screen', icon: Thermometer, badge: stats.pendingTempChecksToday > 0 ? stats.pendingTempChecksToday : undefined },
    { id: 'doctor', label: 'Doctor Screen', icon: Stethoscope, badge: stats.pendingDoctorVisitsToday > 0 ? stats.pendingDoctorVisitsToday : undefined },
    { id: 'admin', label: 'Admin Discharge', icon: UserCheck, badge: stats.dischargeReadyCount > 0 ? stats.dischargeReadyCount : undefined },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleNav = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button 
            onClick={() => handleNav('dashboard')} 
            className="flex items-center gap-2.5 text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="whitespace-nowrap shrink-0">
              <span className="text-lg font-bold tracking-tight text-slate-900">CareTrack</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">Virus Treatment Centre</span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-xs px-1.5 py-0.2 rounded-sm font-mono tabular-nums ${
                      isActive ? 'bg-teal-200 text-teal-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenGuideModal}
              title="Deployment and local run instructions"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Run & Deploy Guide</span>
            </button>

            <button
              onClick={onOpenAdmitModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors whitespace-nowrap shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Patient</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md text-left ${
                  isActive ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
