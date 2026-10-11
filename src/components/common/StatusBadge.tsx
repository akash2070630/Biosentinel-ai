import React from 'react';
import { ConservationStatus, ThreatSeverity, ThreatStatus } from '../../types';

export function IUCNBadge({ status }: { status: ConservationStatus }) {
  const styles: Record<ConservationStatus, string> = {
    'Critically Endangered': 'bg-red-950/80 text-red-300 border-red-700/60 shadow-red-950/30',
    'Endangered': 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-amber-950/30',
    'Vulnerable': 'bg-yellow-950/80 text-yellow-300 border-yellow-700/50 shadow-yellow-950/30',
    'Near Threatened': 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50 shadow-emerald-950/30',
    'Least Concern': 'bg-teal-950/80 text-teal-300 border-teal-700/50 shadow-teal-950/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border shadow-xs ${styles[status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: ThreatSeverity }) {
  const styles: Record<ThreatSeverity, string> = {
    'Critical': 'bg-red-950 text-red-300 border-red-700 animate-pulse',
    'High': 'bg-orange-950 text-orange-300 border-orange-700',
    'Moderate': 'bg-amber-950 text-amber-300 border-amber-700',
    'Low': 'bg-emerald-950 text-emerald-300 border-emerald-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide border ${styles[severity] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {severity} Risk
    </span>
  );
}

export function ThreatStatusBadge({ status }: { status: ThreatStatus }) {
  const styles: Record<ThreatStatus, string> = {
    'Unverified AI Indicator': 'bg-yellow-950/70 text-yellow-300 border-yellow-700/50',
    'Ranger Investigating': 'bg-blue-950/70 text-blue-300 border-blue-700/50',
    'Verified Incident': 'bg-red-950/70 text-red-300 border-red-700/50',
    'False Positive': 'bg-slate-900 text-slate-400 border-slate-700',
    'Resolved / Neutralized': 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide border ${styles[status] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
      {status}
    </span>
  );
}
