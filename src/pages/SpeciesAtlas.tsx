import React, { useState } from 'react';
import { Species } from '../types';
import { Search, Filter, Layers, Globe, Volume2, Fingerprint, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { IUCNBadge } from '../components/common/StatusBadge';

interface SpeciesAtlasProps {
  species: Species[];
  onNavigateToObservations: (speciesId: string) => void;
}

export function SpeciesAtlas({ species, onNavigateToObservations }: SpeciesAtlasProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeSpeciesModal, setActiveSpeciesModal] = useState<Species | null>(null);

  const filteredSpecies = species.filter((sp) => {
    const matchesSearch =
      sp.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.habitat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || sp.iucnStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
          <Layers className="w-4 h-4 text-[#7BB896]" />
          Biodiversity Taxonomy & Identification Profiles
        </div>
        <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Species Atlas & Biometric Profiles
        </h1>
        <p className="text-xs text-[#A8B9A0] mt-0.5">
          Taxonomic reference manual, individual re-ID visual criteria, and acoustic bio-signatures.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7BB896]" />
          <input
            type="text"
            placeholder="Search common name, scientific taxonomy, habitat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#6E8875] focus:outline-hidden focus:border-[#7BB896]"
          />
        </div>

        {/* IUCN Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', 'Critically Endangered', 'Endangered', 'Vulnerable'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#2D6A4F] text-white shadow-md'
                  : 'bg-[#0E2420] text-[#A8B9A0] hover:text-white border border-[#1E4E42]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Species Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecies.map((sp) => (
          <div
            key={sp.id}
            onClick={() => setActiveSpeciesModal(sp)}
            className="bg-[#12362E] rounded-xl overflow-hidden border border-[#1E4E42] hover:border-[#3E8E6A] transition-all hover:-translate-y-1 cursor-pointer flex flex-col shadow-xl group"
          >
            <div className="relative h-52 overflow-hidden bg-[#0D2420]">
              <img
                src={sp.imageUrl}
                alt={sp.commonName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3">
                <IUCNBadge status={sp.iucnStatus} />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#A8B9A0]">
                {sp.photographerCredit}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-serif-title font-bold text-white text-xl group-hover:text-[#8AE3A6] transition-colors">
                  {sp.commonName}
                </h3>
                <div className="italic text-xs text-[#A8B9A0] mb-2">{sp.scientificName}</div>
                <p className="text-xs text-[#CBD8C6] line-clamp-3 leading-relaxed">
                  {sp.description}
                </p>
              </div>

              {/* Re-ID & Acoustic Indicators */}
              <div className="space-y-2 border-t border-[#1C473C] pt-3 text-[11px]">
                <div className="flex items-start gap-1.5 text-[#B2C5B0]">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Re-ID Method:</strong> {sp.reIdentificationMethod}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-[#B2C5B0]">
                  <Globe className="w-3.5 h-3.5 text-[#7BB896] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Habitat:</strong> {sp.habitat.split(',')[0]}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#7BB896] font-semibold border-t border-[#1C473C]">
                <span>Inspect Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Species Modal */}
      {activeSpeciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#102C27] border border-[#2D6A4F] rounded-xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={activeSpeciesModal.imageUrl}
                alt={activeSpeciesModal.commonName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102C27] via-[#102C27]/40 to-transparent" />
              <button
                onClick={() => setActiveSpeciesModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white">
                    {activeSpeciesModal.commonName}
                  </h2>
                  <IUCNBadge status={activeSpeciesModal.iucnStatus} />
                </div>
                <div className="italic text-sm text-[#A8B9A0]">{activeSpeciesModal.scientificName}</div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#CBD8C6]">
              {/* Biological Overview */}
              <div>
                <h4 className="font-bold text-white text-sm mb-1.5 uppercase tracking-wider text-[#8AE3A6]">
                  Ecological Description
                </h4>
                <p className="leading-relaxed text-sm text-[#D8E6D5]">{activeSpeciesModal.description}</p>
              </div>

              {/* Vital Statistics Grid */}
              <div className="grid grid-cols-3 gap-3 bg-[#143B33] p-4 rounded-lg border border-[#1E4E42]">
                <div>
                  <div className="text-[#A8B9A0]">Average Mass</div>
                  <div className="text-white font-bold text-sm">{activeSpeciesModal.vitalStats.averageWeight}</div>
                </div>
                <div>
                  <div className="text-[#A8B9A0]">Lifespan (Wild)</div>
                  <div className="text-white font-bold text-sm">{activeSpeciesModal.vitalStats.lifespan}</div>
                </div>
                <div>
                  <div className="text-[#A8B9A0]">Territory Range</div>
                  <div className="text-white font-bold text-sm">{activeSpeciesModal.vitalStats.territorySize}</div>
                </div>
              </div>

              {/* Biometric Re-Identification Protocol */}
              <div className="bg-[#12362E] p-4 rounded-lg border border-[#2D6A4F] space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                  <span>Computer Vision Re-Identification Criteria</span>
                </div>
                <p className="leading-relaxed text-[#B2C5B0]">
                  {activeSpeciesModal.reIdentificationMethod}. Algorithms isolate visual feature vectors across key anatomical regions and compute cosine distance against cataloged individuals.
                </p>
              </div>

              {/* Acoustic Signatures */}
              <div className="bg-[#12362E] p-4 rounded-lg border border-[#1E4E42] space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Volume2 className="w-4 h-4 text-[#7BB896]" />
                  <span>Acoustic Profile & Vocalizations</span>
                </div>
                <p className="leading-relaxed text-[#B2C5B0]">
                  {activeSpeciesModal.acousticFeatures}
                </p>
              </div>

              {/* Major Threats & Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Key Threats
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#A8B9A0]">
                    {activeSpeciesModal.threats.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#7BB896]" /> Range Countries
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSpeciesModal.rangeCountries.map((c, idx) => (
                      <span key={idx} className="bg-[#173F35] text-white px-2 py-0.5 rounded text-[11px] border border-[#2D6A4F]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#143730] border-t border-[#255F52] flex items-center justify-between">
              <span className="text-xs text-[#A8B9A0]">
                Population: <strong className="text-white">{activeSpeciesModal.populationEstimate}</strong>
              </span>
              <button
                onClick={() => {
                  onNavigateToObservations(activeSpeciesModal.id);
                  setActiveSpeciesModal(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white font-bold text-xs cursor-pointer"
              >
                <span>View Field Observations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
