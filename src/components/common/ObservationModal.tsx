import React from 'react';
import { WildlifeObservation } from '../../types';
import { X, CheckCircle, Calendar, MapPin, Cpu, ShieldCheck, Thermometer, Cloud, Clock, AlertTriangle, Fingerprint } from 'lucide-react';
import { BoundingBoxCanvas } from './BoundingBoxCanvas';
import { IUCNBadge } from './StatusBadge';

interface ObservationModalProps {
  observation: WildlifeObservation | null;
  onClose: () => void;
  onVerify?: (obsId: string) => void;
  unmaskedCoordinates: boolean;
}

export function ObservationModal({
  observation,
  onClose,
  onVerify,
  unmaskedCoordinates
}: ObservationModalProps) {
  if (!observation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#102C27] border border-[#2D6A4F] rounded-xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#143730] border-b border-[#255F52]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#8AE3A6] bg-[#0E2420] px-2 py-0.5 rounded border border-[#2D6A4F]">
              {observation.id}
            </span>
            <h2 className="font-serif-title text-xl font-bold text-white">
              {observation.speciesName}
            </h2>
            <IUCNBadge status={observation.conservationStatus} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A8B9A0] hover:text-white hover:bg-[#1C4D43] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#E0E8DC]">
          {/* Main Visual with Bounding Boxes */}
          <div className="w-full">
            <BoundingBoxCanvas
              imageUrl={observation.imageUrl}
              boxes={observation.boundingBoxes}
              alt={observation.speciesName}
              className="h-[360px]"
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#173F35] p-3 rounded-lg border border-[#2D6A4F]/60">
              <div className="text-xs text-[#A8B9A0] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#7BB896]" /> Sighting Timestamp
              </div>
              <div className="font-mono font-medium text-white text-xs">{observation.observedAt}</div>
            </div>

            <div className="bg-[#173F35] p-3 rounded-lg border border-[#2D6A4F]/60">
              <div className="text-xs text-[#A8B9A0] flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#7BB896]" /> Field Coordinates
              </div>
              <div className="font-mono font-medium text-white text-xs">
                {unmaskedCoordinates
                  ? `${observation.latitude.toFixed(4)}, ${observation.longitude.toFixed(4)}`
                  : 'Protected (Fuzzed anti-poach)'}
              </div>
            </div>

            <div className="bg-[#173F35] p-3 rounded-lg border border-[#2D6A4F]/60">
              <div className="text-xs text-[#A8B9A0] flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5 text-[#7BB896]" /> Model Confidence
              </div>
              <div className="font-bold text-[#8AE3A6] text-sm">
                {(observation.confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-[#173F35] p-3 rounded-lg border border-[#2D6A4F]/60">
              <div className="text-xs text-[#A8B9A0] flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7BB896]" /> Verification
              </div>
              <div className="font-medium text-xs">
                {observation.isVerified ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified by Human
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Pending Ranger Audit</span>
                )}
              </div>
            </div>
          </div>

          {/* Individual Animal Re-ID dossier if linked */}
          {observation.individualName && (
            <div className="p-4 rounded-lg bg-[#143B33] border border-amber-600/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white">
                    Probabilistic Re-Identification: {observation.individualName}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Candidate ID: {observation.individualId}
                </span>
              </div>
              <p className="text-xs text-[#C6DAC9]">
                Visual pattern geometry match probability: <strong>{((observation.reIdScore || 0.9) * 100).toFixed(1)}%</strong>.
                Re-ID is treated as a probabilistic candidate match based on stripe/rosette topology, not an absolute guarantee.
              </p>
            </div>
          )}

          {/* Anomaly warning if flagged */}
          {observation.anomalyDetected && (
            <div className="p-4 rounded-lg bg-red-950/60 border border-red-700/60 text-red-200">
              <div className="flex items-center gap-2 mb-1 text-red-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Silent Distress: Behavioral Anomaly Triggered
              </div>
              <p className="text-xs">
                Movement or activity features in this frame deviated beyond historical baseline thresholds. Flagged for priority ecological review.
              </p>
            </div>
          )}

          {/* Environmental Sensors & Field Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#12362E] p-4 rounded-lg border border-[#1E4E42]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6] mb-3">
                Telemetry & Sensor Metadata
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A8B9A0] flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" /> Ambient Temperature
                  </span>
                  <span className="font-mono text-white">
                    {observation.environmentalConditions?.temperatureC ?? 24}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A8B9A0] flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5" /> Weather Condition
                  </span>
                  <span className="text-white">
                    {observation.environmentalConditions?.weather ?? 'Clear'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A8B9A0] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Diurnal Phase
                  </span>
                  <span className="text-white">
                    {observation.environmentalConditions?.timeOfDay ?? 'Day'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A8B9A0]">Sensor Unit ID</span>
                  <span className="font-mono text-white">{observation.cameraTrapId}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#12362E] p-4 rounded-lg border border-[#1E4E42]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6] mb-3">
                Field Notes & Model Remarks
              </div>
              <p className="text-xs leading-relaxed text-[#D2E0CE]">
                {observation.notes || 'Observation captured during routine camera trap array patrol. No unnatural interference noted.'}
              </p>
              <div className="mt-3 pt-3 border-t border-[#1C4D43] text-[11px] text-[#A8B9A0]">
                Model Pipeline: <span className="font-mono text-white">{observation.modelUsed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#143730] border-t border-[#255F52] flex items-center justify-between">
          <div className="text-xs text-[#A8B9A0]">
            Location: <span className="text-white font-medium">{observation.locationName}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#173F35] text-white hover:bg-[#1E4E42] text-xs font-medium cursor-pointer transition-colors"
            >
              Close Dossier
            </button>
            {!observation.isVerified && onVerify && (
              <button
                onClick={() => onVerify(observation.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Observation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
