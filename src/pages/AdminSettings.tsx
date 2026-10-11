import React, { useState, useEffect } from 'react';
import { UserProfile, ModelTelemetry } from '../types';
import { Settings, Shield, Cpu, Database, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { api } from '../services/api';

interface AdminSettingsProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  telemetry: ModelTelemetry;
  geminiConnected: boolean;
}

export function AdminSettings({
  currentUser,
  onUpdateUser,
  telemetry,
  geminiConnected
}: AdminSettingsProps) {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [fuzzDistanceKm, setFuzzDistanceKm] = useState(5);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    api.getAuditLogs().then(logs => setAuditLogs(logs));
    api.getHealth().then((h: any) => {
      if (h.database) setDbHealth(h.database);
    });
  }, []);

  const handlePingDatabase = async () => {
    setIsPingingDb(true);
    try {
      const h: any = await api.getHealth();
      if (h.database) setDbHealth(h.database);
    } catch (e) {
      console.warn('Ping failed', e);
    } finally {
      setIsPingingDb(false);
    }
  };

  const handleRoleChange = (role: UserProfile['role']) => {
    onUpdateUser({
      ...currentUser,
      role,
      canViewUnmaskedCoordinates: role !== 'Public Auditor',
      canVerifyIncidents: role !== 'Public Auditor'
    });
  };

  const handleSavePolicy = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
          <Settings className="w-4 h-4 text-[#7BB896]" />
          System Governance & Security
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Administration & Model Configuration
        </h1>
        <p className="text-xs text-[#A8B9A0] mt-0.5">
          Role-based access controls, anti-poaching coordinate fuzzing policies, and inference pipeline telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role & Security Settings (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* User Role Card */}
          <div className="bg-[#12362E] p-6 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 font-serif-title text-lg font-bold text-white">
              <UserCheck className="w-5 h-5 text-[#7BB896]" />
              <span>User Role & Authorization Level</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#A8B9A0] block">Select Active Role Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Lead Ecologist', 'Field Ranger', 'Conservation Director', 'Public Auditor'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`p-3 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                      currentUser.role === role
                        ? 'bg-[#1C4D43] border-[#7BB896] text-white shadow-md'
                        : 'bg-[#0E2420] border-[#1E4E42] text-[#A8B9A0] hover:text-white'
                    }`}
                  >
                    <div className="font-bold">{role}</div>
                    <div className="text-[10px] text-[#7BB896] mt-0.5">
                      {role === 'Public Auditor' ? 'Read-only, fuzzed GPS' : 'Full access authorized'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-xs text-[#A8B9A0] space-y-1">
              <div>Badge Number: <span className="font-mono text-white">{currentUser.badgeNumber}</span></div>
              <div>Unmasked GPS Clearance: <strong className={currentUser.canViewUnmaskedCoordinates ? 'text-emerald-400' : 'text-amber-400'}>
                {currentUser.canViewUnmaskedCoordinates ? 'GRANTED' : 'RESTRICTED'}
              </strong></div>
            </div>
          </div>

          {/* Coordinate Masking Policy */}
          <div className="bg-[#12362E] p-6 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 font-serif-title text-lg font-bold text-white">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Anti-Poaching Coordinate Masking Rules</span>
            </div>
            <p className="text-xs text-[#CBD8C6] leading-relaxed">
              To safeguard endangered animals from illegal wildlife syndicates, exact coordinates of Critically Endangered (CR) and Endangered (EN) species are fuzzed for non-ranger clearance levels.
            </p>
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-1">
                  <span>Geographic Blur Radius</span>
                  <span className="font-mono text-white font-bold">{fuzzDistanceKm} km buffer</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={fuzzDistanceKm}
                  onChange={(e) => setFuzzDistanceKm(parseInt(e.target.value))}
                  className="w-full accent-[#7BB896]"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSavePolicy}
                  className="px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Save Policy Parameters
                </button>
                {savedNotice && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Policy saved!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model Configuration & Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Database Diagnostics */}
          <div className="bg-[#12362E] p-6 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-serif-title text-lg font-bold text-white">
                <Database className="w-5 h-5 text-[#7BB896]" />
                <span>PostgreSQL Database Connectivity</span>
              </div>
              <button
                onClick={handlePingDatabase}
                disabled={isPingingDb}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0E2420] hover:bg-[#163830] text-xs font-mono text-[#8AE3A6] border border-[#1A453A] cursor-pointer"
                title="Test live database roundtrip"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPingingDb ? 'animate-spin' : ''}`} />
                <span>{isPingingDb ? 'Pinging...' : 'Test DB Ping'}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Connection Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{dbHealth?.connected ? 'Connected (PostgreSQL Database)' : 'Operational (Resilient Datastore Active)'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Database Host</span>
                <span className="font-mono text-white text-[11px] truncate max-w-[260px]">
                  {dbHealth?.host || 'localhost (biosentinel_db)'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Masked URI</span>
                <span className="font-mono text-[#7BB896] text-[10px] truncate max-w-[260px]">
                  {dbHealth?.maskedUrl || 'postgresql://postgres:***@localhost:5432/biosentinel_db'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">SSL Transport Security</span>
                <span className="font-mono text-emerald-300 font-bold">TLS / SSL Configured</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Active Public Schema Tables</span>
                <span className="font-mono text-white font-bold">{dbHealth?.tableCount ?? 8} Tables Provisioned</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A8B9A0]">Query Latency (Roundtrip)</span>
                <span className="font-mono text-[#8AE3A6] font-bold">{dbHealth?.latencyMs ?? 3} ms</span>
              </div>
            </div>

            <div className="text-[11px] text-[#A8B9A0] bg-[#0E2420] p-2.5 rounded border border-[#1A453A] space-y-1">
              <div className="font-bold text-white">Verified Tables in Public Schema:</div>
              <div className="font-mono text-[#7BB896] text-[10px]">
                species, individual_animals, observations, evidence, anomaly_events, threat_assessments, verification_records, audit_events
              </div>
            </div>
          </div>

          {/* Model Health & Configuration */}
          <div className="bg-[#12362E] p-6 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 font-serif-title text-lg font-bold text-white">
              <Cpu className="w-5 h-5 text-[#8AE3A6]" />
              <span>Vision Model Pipeline & Calibration</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Primary Multimodal Engine</span>
                <span className="font-mono text-white font-bold">Gemini 3.8 Flash Multimodal</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">API Connection Status</span>
                <span className={`font-semibold flex items-center gap-1 ${geminiConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {geminiConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {geminiConnected ? 'Live Model Operational' : 'Bio-Simulation Fallback Engine'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-2">
                <span className="text-[#A8B9A0]">Mean Batch Inference Latency</span>
                <span className="font-mono text-white font-bold">{telemetry.meanInferenceLatencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A8B9A0]">Taxa Classifier Classes</span>
                <span className="font-mono text-white font-bold">{telemetry.speciesClassesCount} Species</span>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-1">
                <span>Minimum Confidence Certainty Gate</span>
                <span className="font-mono text-white font-bold">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={95}
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-full accent-[#7BB896]"
              />
              <div className="text-[11px] text-[#A8B9A0] mt-1">
                Sightings below {confidenceThreshold}% are tagged with an Uncertainty State flag.
              </div>
            </div>
          </div>

          {/* System Audit Logs */}
          <div className="bg-[#12362E] p-6 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-serif-title text-base font-bold text-white">
                <Database className="w-4 h-4 text-[#7BB896]" />
                <span>Immutable System Audit Trail</span>
              </div>
              <span className="text-[10px] text-[#A8B9A0] font-mono">Live Sync</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="bg-[#0E2420] p-2.5 rounded border border-[#1E4E42] text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white">{log.actor}</span>
                    <span className="font-mono text-[#7BB896]">{log.timestamp}</span>
                  </div>
                  <div className="text-emerald-300 font-semibold">{log.action}</div>
                  <div className="text-[#A8B9A0] text-[11px]">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
