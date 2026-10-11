import React, { useState } from 'react';
import { WildlifeObservation, ThreatRecord, Species } from '../types';
import { Radio, Filter, Lock, Unlock } from 'lucide-react';
import { LeafletMap } from '../components/common/LeafletMap';
import { ObservationModal } from '../components/common/ObservationModal';

interface HabitatWatchMapProps {
  observations: WildlifeObservation[];
  threats: ThreatRecord[];
  species: Species[];
  unmaskedCoordinates: boolean;
  onToggleCoordinateMask: () => void;
  onVerifyObservation: (obsId: string) => void;
}

export function HabitatWatchMap({
  observations,
  threats,
  species,
  unmaskedCoordinates,
  onToggleCoordinateMask,
  onVerifyObservation
}: HabitatWatchMapProps) {
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('All');
  const [showThreatsLayer, setShowThreatsLayer] = useState(true);
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [activeModalObs, setActiveModalObs] = useState<WildlifeObservation | null>(null);

  const filteredObservations = observations.filter((obs) => {
    if (selectedSpeciesFilter !== 'All' && obs.speciesId !== selectedSpeciesFilter) return false;
    if (showAnomaliesOnly && !obs.anomalyDetected) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Radio className="w-4 h-4 text-[#7BB896]" />
            Geospatial Ecological Intelligence
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Habitat Watch & Sensor Grid
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Real-time interactive map overlaying camera trap sightings, acoustic sentinel arrays, and habitat threat alerts.
          </p>
        </div>

        {/* Anti-Poaching Coordinate Privacy Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleCoordinateMask}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              unmaskedCoordinates
                ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                : 'bg-[#143B33] border-[#2D6A4F] text-[#8AE3A6]'
            }`}
          >
            {unmaskedCoordinates ? (
              <>
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>Exact GPS Coordinates (Authorized Ranger Clearance)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Anti-Poaching Coordinate Protection Active (Fuzzed)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sensitive Species Protection Policy Notice */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
        unmaskedCoordinates
          ? 'bg-amber-950/50 border-amber-700 text-amber-200'
          : 'bg-[#12362E] border-[#2D6A4F] text-[#CBD8C6]'
      }`}>
        {unmaskedCoordinates ? (
          <Unlock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-bold text-white text-sm">
            {unmaskedCoordinates ? 'Unmasked GPS Mode Enabled (Confidential)' : 'Sensitive Endangered-Species Coordinate Masking Active'}
          </div>
          <p className="leading-relaxed">
            {unmaskedCoordinates
              ? 'You are viewing unmasked exact coordinates. Exporting or broadcasting these locations is restricted under Wildlife Protection Regulations to protect animals from wildlife trafficking syndicates.'
              : 'Coordinates for Endangered and Critically Endangered species (Tigers, Snow Leopards, Elephants, Gharials) are automatically fuzzed by a 5 km protective jitter. Field rangers with verified clearance may unlock exact telemetry.'}
          </p>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#A8B9A0]">
            <Filter className="w-3.5 h-3.5 text-[#7BB896]" />
            <span>Species:</span>
          </div>
          <select
            value={selectedSpeciesFilter}
            onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
            className="bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
          >
            <option value="All">All Species ({observations.length})</option>
            {species.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.commonName}
              </option>
            ))}
          </select>

          <span className="text-[#1E4E42]">|</span>

          {/* Toggle Layer Checkboxes */}
          <label className="flex items-center gap-2 text-xs text-[#CBD8C6] cursor-pointer">
            <input
              type="checkbox"
              checked={showThreatsLayer}
              onChange={(e) => setShowThreatsLayer(e.target.checked)}
              className="accent-[#7BB896] rounded"
            />
            <span>Show Threat Alerts ({threats.length})</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-[#CBD8C6] cursor-pointer">
            <input
              type="checkbox"
              checked={showAnomaliesOnly}
              onChange={(e) => setShowAnomaliesOnly(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span>Anomalies Only (Silent Distress)</span>
          </label>
        </div>

        <div className="text-xs text-[#8AE3A6] font-mono">
          Rendering {filteredObservations.length} sightings on map
        </div>
      </div>

      {/* Map View */}
      <div className="w-full">
        <LeafletMap
          observations={filteredObservations}
          threats={showThreatsLayer ? threats : []}
          unmasked={unmaskedCoordinates}
          onSelectObservation={(obs) => setActiveModalObs(obs)}
          className="h-[620px] rounded-xl"
        />
      </div>

      {/* Modal for clicked observation */}
      <ObservationModal
        observation={activeModalObs}
        onClose={() => setActiveModalObs(null)}
        onVerify={onVerifyObservation}
        unmaskedCoordinates={unmaskedCoordinates}
      />
    </div>
  );
}
