import React, { useState } from 'react';
import { BehavioralAnomaly, IndividualAnimal } from '../types';
import {
  HeartPulse,
  AlertTriangle,
  ShieldCheck,
  Info,
  Cpu,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Search
} from 'lucide-react';
import { SeverityBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';

interface SilentDistressMonitorProps {
  anomalies: BehavioralAnomaly[];
  onUpdateAnomalyStatus: (anomalyId: string, newStatus: BehavioralAnomaly['reviewStatus']) => void;
  individuals?: IndividualAnimal[];
}

export function SilentDistressMonitor({
  anomalies,
  onUpdateAnomalyStatus,
  individuals = []
}: SilentDistressMonitorProps) {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(anomalies[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'All' | 'Investigating' | 'Verified Anomaly' | 'Pending Review'>('All');

  // Interactive Live Evaluation State
  const [selectedEvalIndividualId, setSelectedEvalIndividualId] = useState<string>(
    individuals[0]?.id || 'IND-SL04'
  );
  const [evalResult, setEvalResult] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const selectedAnomaly = anomalies.find(a => a.id === selectedAnomalyId) || anomalies[0];
  const filteredAnomalies = anomalies.filter(a => {
    if (activeTab === 'All') return true;
    return a.reviewStatus === activeTab;
  });

  const handleStatusChange = async (newStatus: BehavioralAnomaly['reviewStatus']) => {
    if (!selectedAnomaly) return;
    await api.updateAnomalyStatus(selectedAnomaly.id, newStatus, 'Dr. Wildlife Biologist');
    onUpdateAnomalyStatus(selectedAnomaly.id, newStatus);
  };

  const handleRunEvaluation = async () => {
    if (!selectedEvalIndividualId) return;
    setIsEvaluating(true);
    setEvalError(null);
    setEvalResult(null);

    try {
      const res = await api.evaluateSilentDistress(selectedEvalIndividualId);
      setEvalResult(res);
    } catch (err: any) {
      setEvalError(err.message || 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
          <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
          Signature Research Innovation
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Silent Distress: Individualized Behavioral Anomaly Monitoring
        </h1>
        <p className="text-xs text-[#A8B9A0] mt-0.5">
          Detecting subtle gait asymmetry, biomechanical velocity drops, and circadian nocturnal shifts by comparing sightings against longitudinal statistical baselines.
        </p>
      </div>

      {/* Mandatory Scientific Protocol Disclaimer */}
      <div className="bg-[#12362E] border border-amber-800/80 p-4 rounded-xl flex items-start gap-3 text-xs text-[#CBD8C6] shadow-lg">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white text-sm">
            Ethical AI & Decision-Support Scientific Disclaimer
          </div>
          <p className="leading-relaxed">
            Silent Distress is strictly a decision-support early warning indicator.
            <strong> It never claims to diagnose clinical pathology, verify fractures, or prove mortality from an image alone. </strong>
            All triggers require ground ranger binoculars, drone sweeps, or veterinary team corroboration before taking intervention actions.
          </p>
        </div>
      </div>

      {/* Interactive Individual Baseline Evaluator Section (Feature 2) */}
      <div className="bg-[#12362E] p-5 rounded-xl border border-[#1E4E42] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E4E42] pb-3">
          <div>
            <div className="font-serif-title font-bold text-white text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#7BB896]" />
              <span>Behavioral Baseline Evaluator & Statistical Testing</span>
            </div>
            <p className="text-xs text-[#A8B9A0] mt-0.5">
              Select an individual animal to test baseline data sufficiency (N ≥ 5 sightings) and compute Z-score deviations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedEvalIndividualId}
              onChange={(e) => {
                setSelectedEvalIndividualId(e.target.value);
                setEvalResult(null);
                setEvalError(null);
              }}
              className="bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
            >
              {individuals.length > 0 ? (
                individuals.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.codeName} ({ind.speciesName}) - {ind.sightingCount} sightings
                  </option>
                ))
              ) : (
                <>
                  <option value="IND-SL04">SL-04 (Chomolung) - 22 sightings (Sufficient)</option>
                  <option value="IND-T084">T-084 (Arrowhead) - 38 sightings (Sufficient)</option>
                  <option value="IND-RP07">RP-07 (Ruby) - 16 sightings (Sufficient)</option>
                </>
              )}
            </select>
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="px-4 py-1.5 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
            >
              <Cpu className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isEvaluating ? 'Evaluating...' : 'Test Baseline'}</span>
            </button>
          </div>
        </div>

        {/* Evaluation Output Banner */}
        {evalResult && (
          <div className="space-y-3 pt-1">
            {!evalResult.hasSufficientBaseline ? (
              /* Insufficient Baseline Alert */
              <div className="bg-amber-950/70 border border-amber-600/70 p-4 rounded-xl text-amber-200 text-xs space-y-2 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Insufficient Historical Baseline (Scientific Protocol Enforced)</span>
                </div>
                <p className="leading-relaxed text-[#F5E6CC]">
                  {evalResult.explanation}
                </p>
                <div className="text-[11px] bg-[#0E2420] p-2.5 rounded border border-amber-800/60 text-[#D8E6D5]">
                  <strong>Protocol:</strong> Longitudinal behavioral modeling requires at least 5 verified independent observations across distinct diurnal cycles to prevent false positive distress alerts caused by ambient weather or camera angle distortion.
                </div>
              </div>
            ) : (
              /* Sufficient Baseline Breakdown */
              <div className="bg-[#0E2420] p-4 rounded-xl border border-emerald-700/60 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Sufficient Historical Baseline Validated (N = {evalResult.observationCount} Observations)</span>
                  </div>
                  <div className="font-mono text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Anomaly Score: {evalResult.anomalyScore}/100 ({evalResult.severity} Severity)
                  </div>
                </div>
                <p className="text-[#CBD8C6] leading-relaxed">
                  {evalResult.explanation}
                </p>
                {evalResult.triggeredFeatures && evalResult.triggeredFeatures.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {evalResult.triggeredFeatures.map((feat: any, idx: number) => (
                      <div key={idx} className="bg-[#12362E] p-2.5 rounded border border-[#1E4E42] text-[11px] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{feat.featureName}</div>
                          <div className="text-[#A8B9A0]">Baseline: {feat.historicalBaseline} | Observed: {feat.observedValue}</div>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          Math.abs(feat.zScore) > 2.5 ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                        }`}>
                          Z = {feat.zScore > 0 ? `+${feat.zScore}` : feat.zScore}σ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {evalError && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
            {evalError}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Pending Review', 'Investigating', 'Verified Anomaly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[#2D6A4F] text-white shadow-md'
                : 'bg-[#12362E] text-[#A8B9A0] hover:text-white border border-[#1E4E42]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Anomaly List, Right Triggered Anomaly Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Anomalies List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6] px-1">
            Flagged Anomaly Incidents ({filteredAnomalies.length})
          </div>
          <div className="space-y-2.5">
            {filteredAnomalies.map((anom) => {
              const isSelected = anom.id === selectedAnomaly?.id;
              return (
                <div
                  key={anom.id}
                  onClick={() => setSelectedAnomalyId(anom.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#173F35] border-red-500 shadow-xl'
                      : 'bg-[#12362E] border-[#1E4E42] hover:border-[#2D6A4F]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-red-300 font-bold">{anom.id}</span>
                    <SeverityBadge severity={anom.severity} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{anom.individualName}</div>
                    <div className="text-xs text-[#A8B9A0]">{anom.speciesName} - {anom.anomalyType}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#A8B9A0] border-t border-[#1C473C] pt-2">
                    <span>Score: <strong className="text-red-400 font-mono">{anom.anomalyScore}/100</strong></span>
                    <span className="font-semibold text-amber-300">{anom.reviewStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Anomaly Analysis & Z-Score Breakdown (8 cols) */}
        {selectedAnomaly && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#12362E] rounded-xl p-6 border border-[#1E4E42] space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E4E42] pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                      {selectedAnomaly.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#173F35] text-[#8AE3A6] border border-[#2D6A4F]">
                      Observation: {selectedAnomaly.observationId}
                    </span>
                  </div>
                  <h2 className="font-serif-title text-2xl font-bold text-white">
                    {selectedAnomaly.individualName} - {selectedAnomaly.anomalyType}
                  </h2>
                  <div className="text-xs text-[#A8B9A0]">
                    Flagged: {selectedAnomaly.detectionDate} • Baseline Integrity: Validated (N ≥ 15 captures)
                  </div>
                </div>

                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-center min-w-[120px]">
                  <div className="text-[11px] text-[#A8B9A0]">Anomaly Index</div>
                  <div className="font-mono text-2xl font-bold text-red-400">
                    {selectedAnomaly.anomalyScore}
                    <span className="text-xs text-[#A8B9A0]">/100</span>
                  </div>
                </div>
              </div>

              {/* Insufficient Baseline Warning Check */}
              {selectedAnomaly.insufficientBaseline ? (
                <div className="bg-amber-950/70 border border-amber-800 p-4 rounded-lg text-amber-200 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold">Insufficient Historical Baseline Detected</div>
                    <div>
                      This individual has fewer than 5 validated observations. Deviation scores are statistically provisional until baseline confidence is achieved.
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Triggered Statistical Features Table */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#8AE3A6] uppercase tracking-wider flex items-center justify-between">
                  <span>Triggered Biomechanical / Circadian Features</span>
                  <span className="text-[#A8B9A0] font-normal">Threshold: |Z| &gt; 2.5 σ</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#1E4E42]">
                  <table className="w-full text-left text-xs text-[#D8E6D5]">
                    <thead className="bg-[#0E2420] text-[#7BB896] font-semibold border-b border-[#1E4E42]">
                      <tr>
                        <th className="p-3">Tracked Feature</th>
                        <th className="p-3">Observed Value</th>
                        <th className="p-3">Historical Baseline</th>
                        <th className="p-3 text-right">Z-Score Deviation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#173F35]">
                      {selectedAnomaly.triggeredFeatures.map((feat, idx) => (
                        <tr key={idx} className="hover:bg-[#153E35]">
                          <td className="p-3 font-medium text-white">{feat.featureName}</td>
                          <td className="p-3 font-mono text-red-300 font-bold">{feat.observedValue}</td>
                          <td className="p-3 font-mono text-[#A8B9A0]">{feat.historicalBaseline}</td>
                          <td className="p-3 font-mono font-bold text-right">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${
                              Math.abs(feat.zScore) > 3.0
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {feat.zScore > 0 ? `+${feat.zScore}` : feat.zScore}σ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supporting Evidence Description */}
              <div className="bg-[#0E2420] p-4 rounded-lg border border-[#1E4E42] space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#7BB896]" />
                  <span>Computer Vision & Temporal Supporting Evidence</span>
                </div>
                <p className="leading-relaxed text-[#CBD8C6]">
                  {selectedAnomaly.supportingEvidence}
                </p>
                <div className="text-[11px] text-[#A8B9A0] pt-2 border-t border-[#1C473C]">
                  {selectedAnomaly.scientificDisclaimer}
                </div>
              </div>

              {/* Verification & Action Workflow */}
              <div className="border-t border-[#1E4E42] pt-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs text-[#A8B9A0]">
                    Current Review State: <strong className="text-white">{selectedAnomaly.reviewStatus}</strong>
                    {selectedAnomaly.reviewedBy && (
                      <span className="text-[#7BB896]"> • Signed by {selectedAnomaly.reviewedBy}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStatusChange('Investigating')}
                      className="px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 text-xs font-semibold cursor-pointer"
                    >
                      Assign Ranger Patrol
                    </button>
                    <button
                      onClick={() => handleStatusChange('Verified Anomaly')}
                      className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 text-xs font-semibold cursor-pointer"
                    >
                      Verify as True Anomaly
                    </button>
                    <button
                      onClick={() => handleStatusChange('Sensor Artifact / Dismissed')}
                      className="px-3 py-1.5 rounded-lg bg-[#0E2420] hover:bg-[#153830] text-[#A8B9A0] border border-[#1E4E42] text-xs font-semibold cursor-pointer"
                    >
                      Dismiss (Sensor Artifact)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
