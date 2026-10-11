import React, { useState } from 'react';
import { WildlifeObservation, Species } from '../types';
import { Camera, Search, Download, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { IUCNBadge } from '../components/common/StatusBadge';
import { ObservationModal } from '../components/common/ObservationModal';

interface ObservationExplorerProps {
  observations: WildlifeObservation[];
  species: Species[];
  onSelectObservation: (obs: WildlifeObservation) => void;
  onVerifyObservation: (obsId: string) => void;
  unmaskedCoordinates: boolean;
  onNavigateToReports?: () => void;
}

export function ObservationExplorer({
  observations,
  species,
  onSelectObservation,
  onVerifyObservation,
  unmaskedCoordinates,
  onNavigateToReports
}: ObservationExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeModalObs, setActiveModalObs] = useState<WildlifeObservation | null>(null);

  const filteredObservations = observations.filter((obs) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      obs.speciesName.toLowerCase().includes(q) ||
      obs.scientificName.toLowerCase().includes(q) ||
      obs.locationName.toLowerCase().includes(q) ||
      (obs.individualName && obs.individualName.toLowerCase().includes(q));
    const matchesSpecies = selectedSpecies === 'All' || obs.speciesId === selectedSpecies;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Verified' && obs.isVerified) ||
      (selectedStatus === 'Pending' && !obs.isVerified) ||
      (selectedStatus === 'Anomaly' && obs.anomalyDetected);
    return matchesSearch && matchesSpecies && matchesStatus;
  });

  // Export current filtered set as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Species', 'Scientific Name', 'IUCN Status', 'Date', 'Location', 'Latitude', 'Longitude', 'Confidence', 'Individual ID', 'Anomaly Flagged', 'Verified'];
    const rows = filteredObservations.map(o => [
      o.id,
      `"${o.speciesName}"`,
      `"${o.scientificName}"`,
      `"${o.conservationStatus}"`,
      `"${o.observedAt}"`,
      `"${o.locationName}"`,
      unmaskedCoordinates ? o.latitude : o.latitude.toFixed(1) + ' (Protected)',
      unmaskedCoordinates ? o.longitude : o.longitude.toFixed(1) + ' (Protected)',
      (o.confidence * 100).toFixed(1) + '%',
      o.individualName || 'None',
      o.anomalyDetected ? 'YES' : 'NO',
      o.isVerified ? 'YES' : 'NO'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `biosentinel_observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Camera className="w-4 h-4 text-[#7BB896]" />
            Longitudinal Wildlife Registry
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Wildlife Observation Explorer
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Searchable photographic repository with verified bounding boxes, biometric IDs, and environmental telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-xs font-bold text-white transition-colors cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Mission Reports & Audit</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-xs font-bold text-[#F7F6F0] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-[#7BB896]" />
            <span>Export Filtered CSV ({filteredObservations.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7BB896]" />
          <input
            type="text"
            placeholder="Search species, location, individual ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#6E8875] focus:outline-hidden focus:border-[#7BB896]"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
          >
            <option value="All">All Species ({observations.length})</option>
            {species.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.commonName}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
          >
            <option value="All">All Verification States</option>
            <option value="Verified">Verified by Human</option>
            <option value="Pending">Pending Audit</option>
            <option value="Anomaly">Silent Distress Flagged</option>
          </select>
        </div>
      </div>

      {/* Photo-First Observation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObservations.map((obs) => (
          <div
            key={obs.id}
            onClick={() => setActiveModalObs(obs)}
            className="bg-[#12362E] rounded-xl overflow-hidden border border-[#1E4E42] hover:border-[#3E8E6A] transition-all hover:-translate-y-1 cursor-pointer flex flex-col shadow-xl group"
          >
            <div className="relative h-48 overflow-hidden bg-[#0D2420]">
              <img
                src={obs.imageUrl}
                alt={obs.speciesName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <IUCNBadge status={obs.conservationStatus} />
              </div>
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 border border-emerald-900">
                {(obs.confidence * 100).toFixed(0)}%
              </div>
              {obs.anomalyDetected && (
                <div className="absolute bottom-2 left-2 bg-red-950/90 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold border border-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>Silent Distress Flag</span>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#8AE3A6]">{obs.id}</span>
                  {obs.individualName && (
                    <span className="text-xs text-amber-300 font-bold">
                      {obs.individualName}
                    </span>
                  )}
                </div>
                <h3 className="font-serif-title font-bold text-white text-lg mt-0.5">
                  {obs.speciesName}
                </h3>
                <div className="italic text-xs text-[#A8B9A0]">{obs.scientificName}</div>
              </div>

              <div className="border-t border-[#1C473C] pt-2 text-xs text-[#A8B9A0] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="truncate">📍 {obs.locationName.split(' - ')[0]}</span>
                  <span>{obs.observedAt.split(' ')[0]}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span>Trap: {obs.cameraTrapId}</span>
                  {obs.isVerified ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">Pending Review</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredObservations.length === 0 && (
        <div className="bg-[#12362E] p-12 rounded-xl text-center text-[#A8B9A0] border border-[#1E4E42]">
          <Camera className="w-8 h-8 mx-auto text-[#7BB896] mb-2" />
          <div className="font-bold text-white text-base">No observations found matching filters</div>
          <p className="text-xs mt-1">Try clearing your search terms or changing species filters.</p>
        </div>
      )}

      {/* Observation Modal */}
      <ObservationModal
        observation={activeModalObs}
        onClose={() => setActiveModalObs(null)}
        onVerify={onVerifyObservation}
        unmaskedCoordinates={unmaskedCoordinates}
      />
    </div>
  );
}
