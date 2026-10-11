import React, { useState } from 'react';
import { ThreatRecord, ThreatCategory, ThreatSeverity, ThreatStatus } from '../types';
import {
  Flame,
  ShieldAlert,
  Clock,
  MapPin,
  FileText,
  Send,
  PlusCircle,
  Upload,
  CheckCircle2,
  X,
  Filter
} from 'lucide-react';
import { SeverityBadge, ThreatStatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';

interface ThreatIntelligenceCenterProps {
  threats: ThreatRecord[];
  onUpdateThreat: (updatedThreat: ThreatRecord) => void;
  onThreatCreated?: (newThreat: ThreatRecord) => void;
  unmaskedCoordinates: boolean;
}

export function ThreatIntelligenceCenter({
  threats,
  onUpdateThreat,
  onThreatCreated,
  unmaskedCoordinates
}: ThreatIntelligenceCenterProps) {
  const [selectedThreatId, setSelectedThreatId] = useState<string>(threats[0]?.id || '');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [reviewerNotesInput, setReviewerNotesInput] = useState('');
  const [selectedStatusInput, setSelectedStatusInput] = useState<ThreatRecord['status']>('Ranger Investigating');

  // Record New Threat Modal State
  const [showNewThreatModal, setShowNewThreatModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ThreatCategory>('Illegal Snare / Trap');
  const [newSeverity, setNewSeverity] = useState<ThreatSeverity>('Critical');
  const [newLocation, setNewLocation] = useState('Bandipur Border Corridor - Sector 14');
  const [newLat, setNewLat] = useState(11.6700);
  const [newLng, setNewLng] = useState(76.6300);
  const [newSource, setNewSource] = useState<'Camera Trap Vision AI' | 'Acoustic Sentinel' | 'Satellite Disturbance' | 'Ranger Patrol'>('Ranger Patrol');
  const [newExplanation, setNewExplanation] = useState('Metallic wire snare identified across seasonal animal trail.');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80');
  const [isSubmittingThreat, setIsSubmittingThreat] = useState(false);

  const selectedThreat = threats.find(t => t.id === selectedThreatId) || threats[0];
  const filteredThreats = threats.filter(t => {
    if (selectedSeverity === 'All') return true;
    return t.severity === selectedSeverity;
  });

  const handleUpdateStatus = async () => {
    if (!selectedThreat) return;
    const res = await api.updateThreat(selectedThreat.id, {
      status: selectedStatusInput,
      reviewerNotes: reviewerNotesInput || 'Status updated via Threat Intelligence Center.',
      reviewedBy: 'Officer Triage Station'
    });
    if (res) {
      onUpdateThreat(res);
      setReviewerNotesInput('');
    }
  };

  const handleCreateThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmittingThreat(true);
    try {
      const generatedId = `THR-${Date.now().toString().slice(-4)}`;
      const newThreat: ThreatRecord = {
        id: generatedId,
        title: newTitle.trim(),
        category: newCategory,
        severity: newSeverity,
        status: 'Ranger Investigating',
        detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        locationName: newLocation.trim(),
        latitude: newLat,
        longitude: newLng,
        locationPrecision: 'Exact (Protected)',
        source: newSource,
        evidenceImageUrl: newEvidenceUrl,
        aiExplanation: newExplanation.trim(),
        confidenceScore: 0.92,
        reviewedBy: 'Field Triage Ranger',
        reviewerNotes: 'New incident logged by field team with attached photo evidence.',
        auditHistory: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
            actor: 'Field Triage Ranger',
            action: 'Incident Created & Evidence Attached',
            notes: `Logged ${newCategory} at ${newLocation}.`
          }
        ]
      };

      const saved = await api.createThreat(newThreat);
      if (onThreatCreated) {
        onThreatCreated(saved || newThreat);
      }
      setShowNewThreatModal(false);
      setSelectedThreatId(generatedId);
      setNewTitle('');
    } catch (err: any) {
      console.error('Failed to create threat:', err);
    } finally {
      setIsSubmittingThreat(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            Proactive Anti-Poaching & Habitat Defense
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Conservation Threat Intelligence Center
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Triage automated snare detections, acoustic logging signatures, and vehicle incursions with verifiable human audit trails.
          </p>
        </div>

        <button
          onClick={() => setShowNewThreatModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record New Threat Incident (Feature 3)</span>
        </button>
      </div>

      {/* Ethical Legal Notice */}
      <div className="bg-[#12362E] border border-amber-800/80 p-4 rounded-xl flex items-start gap-3 text-xs text-[#CBD8C6]">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Presumption of Human Review Protocol:</strong> BioSentinel AI separates automated preliminary risk indicators from verified judicial incidents. The system provides decision-support clues to forest rangers and never automatically accuses individuals or parties of a crime without corroborated physical evidence.
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Critical', 'High', 'Moderate', 'Low'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedSeverity === sev
                ? 'bg-[#2D6A4F] text-white shadow-md'
                : 'bg-[#12362E] text-[#A8B9A0] hover:text-white border border-[#1E4E42]'
            }`}
          >
            {sev} Severity
          </button>
        ))}
      </div>

      {/* Main Threat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Threat Records List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6] px-1">
            Active Threat Incidents ({filteredThreats.length})
          </div>
          <div className="space-y-2.5">
            {filteredThreats.map((threat) => {
              const isSelected = threat.id === selectedThreat?.id;
              return (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreatId(threat.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-[#173F35] border-amber-400 shadow-xl'
                      : 'bg-[#12362E] border-[#1E4E42] hover:border-[#2D6A4F]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-300 font-bold">{threat.id}</span>
                    <SeverityBadge severity={threat.severity} />
                  </div>
                  <div className="font-bold text-white text-sm leading-snug">{threat.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#A8B9A0] border-t border-[#1C473C] pt-2">
                    <ThreatStatusBadge status={threat.status} />
                    <span className="text-[10px]">{threat.detectedAt.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Threat Dossier & Verification Form (8 cols) */}
        {selectedThreat && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#12362E] rounded-xl p-6 border border-[#1E4E42] space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E4E42] pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {selectedThreat.id}
                    </span>
                    <SeverityBadge severity={selectedThreat.severity} />
                    <ThreatStatusBadge status={selectedThreat.status} />
                  </div>
                  <h2 className="font-serif-title text-2xl font-bold text-white mt-1">
                    {selectedThreat.title}
                  </h2>
                  <div className="text-xs text-[#A8B9A0] flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-[#7BB896]" />
                    <span>Detected: {selectedThreat.detectedAt}</span>
                    <span>• Source: {selectedThreat.source}</span>
                  </div>
                </div>

                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-center min-w-[120px]">
                  <div className="text-[11px] text-[#A8B9A0]">AI Confidence</div>
                  <div className="font-mono text-2xl font-bold text-amber-400">
                    {(selectedThreat.confidenceScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Evidence Photograph Attachment if present */}
              {selectedThreat.evidenceImageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#1E4E42] bg-[#0A1A17] max-h-56">
                  <img
                    src={selectedThreat.evidenceImageUrl}
                    alt={selectedThreat.title}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono">
                    Attached Evidence Photograph
                  </div>
                </div>
              )}

              {/* Location and Precision */}
              <div className="bg-[#0E2420] p-4 rounded-lg border border-[#1E4E42] space-y-2">
                <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7BB896]" /> Geospatial Sector
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-white font-medium">{selectedThreat.locationName}</div>
                  <div className="font-mono text-[#A8B9A0]">
                    {unmaskedCoordinates
                      ? `GPS: ${selectedThreat.latitude.toFixed(4)}, ${selectedThreat.longitude.toFixed(4)}`
                      : 'GPS: Masked (Anti-Poaching Protection)'}
                  </div>
                </div>
              </div>

              {/* Transparent AI Explanation */}
              <div className="bg-[#143B33] p-4 rounded-lg border border-[#2D6A4F] space-y-2 text-xs">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8AE3A6]" />
                  <span>Explainable AI Risk Indicator Summary</span>
                </div>
                <p className="leading-relaxed text-[#D8E6D5] text-xs">
                  {selectedThreat.aiExplanation}
                </p>
              </div>

              {/* Audit History & Ranger Actions */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6]">
                  Chain-of-Custody Incident Audit Trail
                </div>
                <div className="space-y-2">
                  {selectedThreat.auditHistory.map((item, idx) => (
                    <div key={idx} className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{item.actor}</span>
                        <span className="font-mono text-[#7BB896]">{item.timestamp}</span>
                      </div>
                      <div className="text-amber-300 font-medium">{item.action}</div>
                      <div className="text-[#A8B9A0]">{item.notes}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update & Human Triage Action Form */}
              <div className="border-t border-[#1E4E42] pt-5 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6]">
                  Ranger & Biologist Triage Action Form
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#A8B9A0] block mb-1">Set Resolution Status</label>
                    <select
                      value={selectedStatusInput}
                      onChange={(e) => setSelectedStatusInput(e.target.value as ThreatRecord['status'])}
                      className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
                    >
                      <option value="Unverified AI Indicator">Unverified AI Indicator</option>
                      <option value="Ranger Investigating">Ranger Investigating</option>
                      <option value="Verified Incident">Verified Incident</option>
                      <option value="False Positive">False Positive</option>
                      <option value="Resolved / Neutralized">Resolved / Neutralized</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#A8B9A0] block mb-1">Field Ranger Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Patrol dispatched from outpost; snare dismantled"
                      value={reviewerNotesInput}
                      onChange={(e) => setReviewerNotesInput(e.target.value)}
                      className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  className="px-5 py-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit Status Change & Sign Audit Log</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Record New Threat Modal (Feature 3) */}
      {showNewThreatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#102C27] border border-[#2D6A4F] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E4E42] pb-3">
              <div className="flex items-center gap-2 font-serif-title text-lg font-bold text-white">
                <Flame className="w-5 h-5 text-red-400" />
                <span>Log New Threat Incident & Evidence</span>
              </div>
              <button
                onClick={() => setShowNewThreatModal(false)}
                className="p-1 rounded text-[#A8B9A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateThreat} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#A8B9A0] block mb-1">Threat Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wire snare loop attached to tree base on game trail"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                  >
                    <option value="Illegal Snare / Trap">Illegal Snare / Trap</option>
                    <option value="Habitat Encroachment">Habitat Encroachment</option>
                    <option value="Unauthorized Vehicle / Vessel">Unauthorized Vehicle / Vessel</option>
                    <option value="Acoustic Disturbance">Acoustic Disturbance</option>
                    <option value="Poaching Risk Zone">Poaching Risk Zone</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Severity Tier</label>
                  <select
                    value={newSeverity}
                    onChange={(e: any) => setNewSeverity(e.target.value)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                  >
                    <option value="Critical">Critical Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Source</label>
                  <select
                    value={newSource}
                    onChange={(e: any) => setNewSource(e.target.value)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-2.5 py-2 text-white"
                  >
                    <option value="Ranger Patrol">Ranger Patrol</option>
                    <option value="Camera Trap Vision AI">Camera Trap Vision AI</option>
                    <option value="Acoustic Sentinel">Acoustic Sentinel</option>
                    <option value="Satellite Disturbance">Satellite Disturbance</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Location Name</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat}
                    onChange={(e) => setNewLat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#A8B9A0] block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng}
                    onChange={(e) => setNewLng(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#A8B9A0] block mb-1">Evidence Photo URL</label>
                <input
                  type="text"
                  value={newEvidenceUrl}
                  onChange={(e) => setNewEvidenceUrl(e.target.value)}
                  className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A8B9A0] block mb-1">Incident Explanation / Observation Notes</label>
                <textarea
                  rows={2}
                  required
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E4E42]">
                <button
                  type="button"
                  onClick={() => setShowNewThreatModal(false)}
                  className="px-4 py-2 rounded bg-[#173F35] text-[#A8B9A0] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingThreat}
                  className="px-5 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {isSubmittingThreat ? 'Persisting to Database...' : 'Persist Threat to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
