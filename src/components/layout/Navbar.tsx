import React, { useState } from 'react';
import {
  ShieldAlert,
  Compass,
  Activity,
  Layers,
  Camera,
  Fingerprint,
  HeartPulse,
  Flame,
  Volume2,
  FileText,
  Settings,
  Menu,
  X,
  UserCheck,
  Lock,
  Unlock,
  Radio
} from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  threatCount: number;
  anomalyCount: number;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  threatCount,
  anomalyCount,
  currentUser,
  onUpdateUser
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'detect', label: 'Detection Studio', badge: 'M1', icon: Camera, highlight: true },
    { id: 'individuals', label: 'Identity Fingerprint', badge: 'M2', icon: Fingerprint },
    { id: 'silent-distress', label: 'Silent Distress', badge: 'M3', icon: HeartPulse, count: anomalyCount },
    { id: 'threats', label: 'Threat Intelligence', badge: 'M4', icon: Flame, count: threatCount, alert: threatCount > 0 },
    { id: 'habitat', label: 'Habitat Watch', badge: 'M5', icon: Radio },
    { id: 'acoustic', label: 'Bio-Acoustics', badge: 'M6', icon: Volume2 },
    { id: 'observations', label: 'Observations & Reports', badge: 'M7', icon: Camera },
    { id: 'species', label: 'Species Atlas', icon: Layers },
    { id: 'settings', label: 'Governance & Health', badge: 'M8', icon: Settings },
  ];

  const handleRoleToggle = () => {
    if (currentUser.role === 'Lead Ecologist') {
      onUpdateUser({
        ...currentUser,
        role: 'Field Ranger',
        canViewUnmaskedCoordinates: true,
        canVerifyIncidents: true
      });
    } else if (currentUser.role === 'Field Ranger') {
      onUpdateUser({
        ...currentUser,
        role: 'Conservation Director',
        canViewUnmaskedCoordinates: true,
        canVerifyIncidents: true
      });
    } else {
      onUpdateUser({
        ...currentUser,
        role: 'Lead Ecologist',
        canViewUnmaskedCoordinates: false,
        canVerifyIncidents: true
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#102C27]/95 backdrop-blur-md border-b border-[#1E4E42] text-[#F7F6F0]">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#173F35] to-[#2D6A4F] border border-[#3E8E6A] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-[#A8B9A0] group-hover:text-emerald-300 transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-bold text-lg tracking-wider text-[#F7F6F0]">
                  BioSentinel<span className="text-[#7BB896]">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#173F35] text-[#8AE3A6] border border-[#2D6A4F]">
                  v4.2 Live
                </span>
              </div>
              <p className="text-[11px] text-[#A8B9A0] tracking-wide hidden sm:block">
                Endangered Wildlife Intelligence & Sentinel Monitoring
              </p>
            </div>
          </div>

          {/* User role & Sensitive coordinates shield */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-2 px-3 py-1 rounded bg-[#173F35]/80 hover:bg-[#1E4E42] border border-[#2D6A4F] text-xs text-[#E1EAD8] transition-colors cursor-pointer"
              title="Click to switch role"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#7BB896]" />
              <span>Role: <strong className="text-white">{currentUser.role}</strong></span>
            </button>

            <button
              onClick={() => onUpdateUser({ ...currentUser, canViewUnmaskedCoordinates: !currentUser.canViewUnmaskedCoordinates })}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs border transition-colors cursor-pointer ${
                currentUser.canViewUnmaskedCoordinates
                  ? 'bg-amber-950/40 border-amber-700/60 text-amber-300'
                  : 'bg-[#173F35]/60 border-[#2D6A4F] text-[#A8B9A0]'
              }`}
              title="Toggle coordinates protection"
            >
              {currentUser.canViewUnmaskedCoordinates ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPS Unmasked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GPS Anti-Poach Fuzzed</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#A8B9A0] hover:text-white hover:bg-[#173F35]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-[#0E2420] border-t border-[#183E34] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#173F35] text-white border-b-2 border-[#7BB896] shadow-sm'
                      : item.highlight
                      ? 'bg-[#1A4B3F]/60 text-emerald-200 hover:bg-[#1E4E42] border border-[#2D6A4F]/60'
                      : 'text-[#A8B9A0] hover:text-white hover:bg-[#153830]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#7BB896]' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#0A1C18] text-[#7BB896] border border-[#1A473C]">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        item.alert
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#2D6A4F] text-[#8AE3A6]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D2420] border-b border-[#1E4E42] px-4 pt-2 pb-6 space-y-1">
          <div className="py-2 mb-2 border-b border-[#1E4E42] flex items-center justify-between text-xs text-[#A8B9A0]">
            <span>Current: <strong>{currentUser.role}</strong></span>
            <button
              onClick={handleRoleToggle}
              className="text-[#7BB896] underline cursor-pointer"
            >
              Switch Role
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded text-xs font-medium ${
                    isActive
                      ? 'bg-[#173F35] text-white border-l-2 border-[#7BB896]'
                      : 'text-[#A8B9A0] hover:bg-[#153830]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
