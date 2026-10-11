import React, { useState } from 'react';
import {
  Activity,
  Layers,
  HeartPulse,
  Flame,
  Radio,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Filter,
  BarChart2,
  Cpu
} from 'lucide-react';
import { Species, WildlifeObservation, ThreatRecord, BehavioralAnomaly, ModelTelemetry } from '../types';
import { LeafletMap } from '../components/common/LeafletMap';
import { IUCNBadge, SeverityBadge, ThreatStatusBadge } from '../components/common/StatusBadge';

interface IntelligenceDashboardProps {
  species: Species[];
  observations: WildlifeObservation[];
  threats: ThreatRecord[];
  anomalies: BehavioralAnomaly[];
  telemetry: ModelTelemetry;
  onNavigate: (page: string) => void;
  onSelectObservation: (obs: WildlifeObservation) => void;
  onVerifyObservation: (obsId: string) => void;
  unmaskedCoordinates: boolean;
}

export function IntelligenceDashboard({
  species,
  observations,
  threats,
  anomalies,
  telemetry,
  onNavigate,
  onSelectObservation,
  onVerifyObservation,
  unmaskedCoordinates
}: IntelligenceDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | 'All'>('7d');

  const unverifiedCount = observations.filter(o => !o.isVerified).length;
  const criticalThreats = threats.filter(t => t.severity === 'Critical');
  const activeAnomalies = anomalies.filter(a => a.reviewStatus !== 'Sensor Artifact / Dismissed');

  // Species distribution breakdown
  const speciesCounts = species.map(sp => ({
    name: sp.commonName,
    count: observations.filter(o => o.speciesId === sp.id).length,
    status: sp.iucnStatus,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Activity className="w-4 h-4 text-[#7BB896]" />
            Real-Time Mission Telemetry
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Conservation Intelligence Dashboard
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Holistic situational awareness across camera traps, acoustic nodes, and ranger patrols.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-2 bg-[#143B33] p-1 rounded-lg border border-[#2D6A4F] text-xs">
          {(['24h', '7d', '30d', 'All'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                selectedTimeframe === tf
                  ? 'bg-[#2D6A4F] text-white shadow-sm'
                  : 'text-[#A8B9A0] hover:text-white'
              }`}
            >
              {tf === 'All' ? 'All Time' : `Last ${tf}`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-2">
            <span>Total Sightings</span>
            <Layers className="w-4 h-4 text-[#7BB896]" />
          </div>
          <div className="text-2xl font-bold font-serif-title text-white">{observations.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>+12.4% vs last cycle</span>
          </div>
        </div>

        <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-2">
            <span>Endangered Species</span>
            <Radio className="w-4 h-4 text-[#7BB896]" />
          </div>
          <div className="text-2xl font-bold font-serif-title text-white">{species.length}</div>
          <div className="text-[11px] text-[#A8B9A0] mt-1">Active monitored taxa</div>
        </div>

        <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-2">
            <span>Silent Distress Alerts</span>
            <HeartPulse className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-serif-title text-red-300">{activeAnomalies.length}</div>
          <div className="text-[11px] text-red-400 mt-1">Behavioral deviations</div>
        </div>

        <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-2">
            <span>Threat Incidents</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-serif-title text-amber-300">{threats.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">{criticalThreats.length} Critical status</div>
        </div>

        <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#A8B9A0] mb-2">
            <span>Inference Latency</span>
            <Cpu className="w-4 h-4 text-[#8AE3A6]" />
          </div>
          <div className="text-2xl font-bold font-serif-title text-[#8AE3A6]">{telemetry.meanInferenceLatencyMs} ms</div>
          <div className="text-[11px] text-emerald-300 mt-1">F1-Score: {telemetry.f1Score}</div>
        </div>
      </div>

      {/* Geospatial Map + Species Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (8 cols) */}
        <div className="lg:col-span-8 bg-[#12362E] rounded-xl p-4 border border-[#1E4E42] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-title text-lg font-bold text-white">
                Spatial Habitat Distribution Map
              </h2>
              <p className="text-xs text-[#A8B9A0]">
                Live sensor clusters, camera traps, and flagged threat coordinates.
              </p>
            </div>
            <button
              onClick={() => onNavigate('habitat')}
              className="text-xs text-[#7BB896] hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Full Screen Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LeafletMap
            observations={observations}
            threats={threats}
            unmasked={unmaskedCoordinates}
            onSelectObservation={onSelectObservation}
            className="h-[380px]"
          />
        </div>

        {/* Species Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif-title text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#7BB896]" /> Species Activity
              </h3>
              <span className="text-xs text-[#A8B9A0]">{observations.length} Sightings</span>
            </div>

            <div className="space-y-3">
              {speciesCounts.map((item, idx) => {
                const percentage = Math.round((item.count / (observations.length || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#E0E8DC]">{item.name}</span>
                      <span className="font-mono text-[#8AE3A6]">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#0E2420] h-2 rounded-full overflow-hidden border border-[#1A453A]">
                      <div
                        className="bg-gradient-to-r from-[#2D6A4F] to-[#7BB896] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1A453A] text-xs text-[#A8B9A0] space-y-1.5">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Model Telemetry Status</span>
              <span className="text-emerald-400 font-mono text-[11px]">Healthy 99.8%</span>
            </div>
            <div>Architecture: <span className="text-[#C5D5C1]">{telemetry.architecture.split('+')[0]}</span></div>
            <div>Device Host: <span className="text-[#C5D5C1]">{telemetry.device.split('(')[0]}</span></div>
          </div>
        </div>
      </div>

      {/* Priority Review & Human Verification Queue */}
      <section className="bg-[#12362E] rounded-xl p-6 border border-[#1E4E42] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif-title text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#7BB896]" /> Priority Verification Queue
            </h2>
            <p className="text-xs text-[#A8B9A0] mt-0.5">
              BioSentinel decision support protocol requires senior human review for high-impact events.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-[#0E2420] text-amber-300 border border-amber-900/60">
            {unverifiedCount} Observations Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#D8E6D5]">
            <thead className="bg-[#0E2420] text-[#8AE3A6] font-semibold border-b border-[#1E4E42]">
              <tr>
                <th className="p-3">Observation ID</th>
                <th className="p-3">Species</th>
                <th className="p-3">Location</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Re-ID Candidate</th>
                <th className="p-3">Silent Distress</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#173F35]">
              {observations.map((obs) => (
                <tr key={obs.id} className="hover:bg-[#153E35] transition-colors">
                  <td className="p-3 font-mono text-[#8AE3A6]">{obs.id}</td>
                  <td className="p-3">
                    <div className="font-bold text-white">{obs.speciesName}</div>
                    <div className="text-[11px] text-[#A8B9A0] italic">{obs.scientificName}</div>
                  </td>
                  <td className="p-3 text-[#B2C5B0]">{obs.locationName.split(' - ')[0]}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    {(obs.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="p-3">
                    {obs.individualName ? (
                      <span className="text-amber-300 font-semibold">{obs.individualName}</span>
                    ) : (
                      <span className="text-[#6C8573]">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {obs.anomalyDetected ? (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-800">
                        ANOMALY
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Nominal</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onSelectObservation(obs)}
                      className="px-2.5 py-1 rounded bg-[#173F35] hover:bg-[#1E4E42] text-white border border-[#2D6A4F] cursor-pointer"
                    >
                      Dossier
                    </button>
                    {!obs.isVerified && (
                      <button
                        onClick={() => onVerifyObservation(obs.id)}
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
