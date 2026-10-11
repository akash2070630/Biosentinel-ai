import React, { useState, useRef } from 'react';
import { IndividualAnimal, WildlifeObservation } from '../types';
import {
  Fingerprint,
  Calendar,
  MapPin,
  AlertCircle,
  Clock,
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface IndividualAnimalLabProps {
  individuals: IndividualAnimal[];
  observations: WildlifeObservation[];
  onSelectObservation: (obs: WildlifeObservation) => void;
  onIndividualAdded?: (ind: IndividualAnimal) => void;
}

const REID_TEST_BENCHMARKS = [
  {
    name: 'Bengal Tiger T-108 (Flank View)',
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
    speciesHint: 'Bengal Tiger',
    expectedProfile: 'T-108 (Ustad)'
  },
  {
    name: 'Snow Leopard SL-04 (Forehead View)',
    url: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=400&q=80',
    speciesHint: 'Snow Leopard',
    expectedProfile: 'SL-04 (Chomolung)'
  },
  {
    name: 'Asian Elephant AE-12 (Right Ear Notch)',
    url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80',
    speciesHint: 'Asian Elephant',
    expectedProfile: 'AE-12 (Balarama)'
  },
  {
    name: 'Uncataloged Individual Tiger (Uncertain / No Match Test)',
    url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=400&q=80',
    speciesHint: 'Bengal Tiger',
    expectedProfile: 'Candidate Match / Uncataloged'
  }
];

export function IndividualAnimalLab({
  individuals,
  observations,
  onSelectObservation,
  onIndividualAdded
}: IndividualAnimalLabProps) {
  const [activeTab, setActiveTab] = useState<'profiles' | 'matcher'>('profiles');
  const [selectedIndividualId, setSelectedIndividualId] = useState<string>(individuals[0]?.id || '');

  // Re-ID Matcher State
  const [matcherImageSrc, setMatcherImageSrc] = useState<string | null>(REID_TEST_BENCHMARKS[0].url);
  const [speciesHint, setSpeciesHint] = useState<string>('Bengal Tiger');
  const [isMatching, setIsMatching] = useState(false);
  const [matcherResult, setMatcherResult] = useState<any | null>(null);
  const [matcherError, setMatcherError] = useState<string | null>(null);

  // New Individual Registration Form State
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newSpeciesId, setNewSpeciesId] = useState('sp-tiger');
  const [newSex, setNewSex] = useState<'Male' | 'Female' | 'Unknown'>('Male');
  const [newAge, setNewAge] = useState(5);
  const [newTerritory, setNewTerritory] = useState('Northern Sanctuary Corridor');
  const [newPatternType, setNewPatternType] = useState<'Stripe Geometry' | 'Rosette Topology' | 'Ear Notch' | 'Facial Wrinkles' | 'Fin Scars'>('Stripe Geometry');
  const [newDistinctiveFeature, setNewDistinctiveFeature] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedIndividual = individuals.find(i => i.id === selectedIndividualId) || individuals[0];
  const individualObservations = observations.filter(
    o => o.individualId === selectedIndividual?.id
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMatcherError('Invalid image format. Supported: JPEG, PNG, WEBP.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMatcherImageSrc(reader.result as string);
      setMatcherResult(null);
      setMatcherError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunReId = async () => {
    if (!matcherImageSrc) return;
    setIsMatching(true);
    setMatcherError(null);
    setMatcherResult(null);

    try {
      let b64 = matcherImageSrc;
      if (matcherImageSrc.startsWith('http')) {
        const resp = await fetch(matcherImageSrc);
        const blob = await resp.blob();
        b64 = await new Promise(resolve => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      }

      const res = await api.reIdentifyWildlife(b64, 'image/jpeg', speciesHint);
      setMatcherResult(res);
    } catch (err: any) {
      setMatcherError(err.message || 'Re-ID analysis failed');
    } finally {
      setIsMatching(false);
    }
  };

  const handleRegisterIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim()) return;

    setIsRegistering(true);
    try {
      const newInd: IndividualAnimal = {
        id: `IND-${Date.now().toString().slice(-4)}`,
        codeName: newCodeName.trim(),
        speciesId: newSpeciesId,
        speciesName: newSpeciesId === 'sp-tiger' ? 'Bengal Tiger' : newSpeciesId === 'sp-snow-leopard' ? 'Snow Leopard' : 'Asian Elephant',
        sex: newSex,
        estimatedAgeYears: newAge,
        firstSightedDate: new Date().toISOString().split('T')[0],
        lastSightedDate: new Date().toISOString().split('T')[0],
        sightingCount: 1,
        primaryTerritory: newTerritory,
        patternType: newPatternType,
        distinctiveFeatures: newDistinctiveFeature.trim() ? [newDistinctiveFeature.trim()] : ['New distinctive biometric coat profile'],
        fingerprintImageUrl: matcherImageSrc || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
        reIdMatchConfidence: 91.0,
        status: 'Active Monitoring',
        baselineSightingFrequencyWeekly: 1.0,
        baselineDiurnalRatio: 0.6
      };

      const saved = await api.createIndividual(newInd);
      if (onIndividualAdded) {
        onIndividualAdded(saved || newInd);
      }
      setShowRegisterForm(false);
      setNewCodeName('');
      setSelectedIndividualId(newInd.id);
      setActiveTab('profiles');
    } catch (err: any) {
      setMatcherError(err.message || 'Failed to register individual');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Fingerprint className="w-4 h-4 text-amber-400" />
            Biometric Re-Identification & Sighting Timelines
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Individual Animal Lab & Wildlife Fingerprint
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Probabilistic re-identification matching based on invariant physical stripe geometry, rosette clustering, and ear notches.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2 bg-[#12362E] p-1 rounded-xl border border-[#1E4E42] text-xs">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'profiles'
                ? 'bg-[#2D6A4F] text-white shadow-md'
                : 'text-[#A8B9A0] hover:text-white'
            }`}
          >
            Individual Dossiers ({individuals.length})
          </button>
          <button
            onClick={() => setActiveTab('matcher')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'matcher'
                ? 'bg-[#2D6A4F] text-white shadow-md'
                : 'text-[#A8B9A0] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Biometric Matcher (Feature 1)</span>
          </button>
        </div>
      </div>

      {/* Scientific Principle Disclaimer Banner */}
      <div className="bg-[#12362E] border border-amber-800/60 p-4 rounded-xl flex items-start gap-3 text-xs text-[#CBD8C6]">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Probabilistic Identity Protocol:</strong> In accordance with wildlife conservation biology standards, all individual re-identifications are treated as probabilistic likelihood matches (e.g. 70%–96% confidence score) derived from invariant visual embeddings. BioSentinel never declares guaranteed identity without multi-angle secondary human biologist verification.
        </div>
      </div>

      {activeTab === 'matcher' ? (
        /* BIOMETRIC RE-ID MATCHER SECTION */
        <div className="space-y-6">
          {/* Benchmark selector */}
          <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] space-y-2">
            <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Benchmark Re-ID Test Imagery</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {REID_TEST_BENCHMARKS.map((bench, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMatcherImageSrc(bench.url);
                    setSpeciesHint(bench.speciesHint);
                    setMatcherResult(null);
                    setMatcherError(null);
                  }}
                  className={`p-3 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                    matcherImageSrc === bench.url
                      ? 'bg-[#1C4D43] border-[#7BB896] shadow-sm'
                      : 'bg-[#0E2420] border-[#1E4E42] hover:border-[#3E8E6A] text-[#A8B9A0]'
                  }`}
                >
                  <div className="font-bold text-white truncate">{bench.name}</div>
                  <div className="text-[11px] text-[#7BB896] mt-0.5">{bench.speciesHint}</div>
                  <div className="text-[10px] text-[#A8B9A0]/70 truncate mt-0.5">Target: {bench.expectedProfile}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Image & Matcher Trigger */}
            <div className="lg:col-span-6 bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E4E42] pb-3">
                <div className="font-bold text-white text-base">Candidate Wildlife Photograph</div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-xs text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#7BB896]" />
                    <span>Upload Field Photo</span>
                  </button>
                </div>
              </div>

              {matcherImageSrc ? (
                <div className="relative h-72 rounded-lg overflow-hidden bg-[#0A1A17] border border-[#1A473C]">
                  <img
                    src={matcherImageSrc}
                    alt="Re-ID candidate"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-72 rounded-lg bg-[#0A1A17] border border-dashed border-[#2D6A4F] flex flex-col items-center justify-center text-xs text-[#A8B9A0]">
                  <Upload className="w-8 h-8 text-[#7BB896] mb-2" />
                  <span>Upload or select a benchmark photograph</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-[#A8B9A0] block mb-1">Target Taxon / Species Context</label>
                  <select
                    value={speciesHint}
                    onChange={(e) => setSpeciesHint(e.target.value)}
                    className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
                  >
                    <option value="Bengal Tiger">Bengal Tiger (Panthera tigris)</option>
                    <option value="Snow Leopard">Snow Leopard (Panthera uncia)</option>
                    <option value="Asian Elephant">Asian Elephant (Elephas maximus)</option>
                    <option value="Red Panda">Red Panda (Ailurus fulgens)</option>
                  </select>
                </div>

                <button
                  onClick={handleRunReId}
                  disabled={isMatching || !matcherImageSrc}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${
                    isMatching
                      ? 'bg-[#1C4D43] text-[#A8B9A0] cursor-not-allowed'
                      : 'bg-[#2D6A4F] hover:bg-[#388463] text-white hover:scale-[1.01]'
                  }`}
                >
                  <Fingerprint className={`w-4 h-4 ${isMatching ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
                  <span>{isMatching ? 'Extracting Coat Biometrics & Matching...' : 'Run Biometric Re-Identification'}</span>
                </button>
              </div>

              {matcherError && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{matcherError}</span>
                </div>
              )}
            </div>

            {/* Right: Candidate Matches, Uncertainty States & Registration */}
            <div className="lg:col-span-6 space-y-4">
              {matcherResult ? (
                <div className="bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] space-y-5 shadow-xl">
                  {/* Result Header */}
                  <div className="border-b border-[#1E4E42] pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6]">
                        Biometric Re-ID Results
                      </span>
                      {matcherResult.matched ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Candidate Matched
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Uncertain / No Confident Match
                        </span>
                      )}
                    </div>

                    {matcherResult.bestMatch ? (
                      <div>
                        <h2 className="font-serif-title text-2xl font-bold text-white mt-1">
                          {matcherResult.bestMatch.codeName}
                        </h2>
                        <div className="text-xs text-[#A8B9A0]">
                          Catalog ID: <span className="font-mono text-white">{matcherResult.bestMatch.individualId}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="bg-[#0E2420] px-3 py-1 rounded border border-[#1A473C] text-xs">
                            <span className="text-[#A8B9A0]">Similarity Probability: </span>
                            <strong className="font-mono text-emerald-400 text-sm">
                              {(matcherResult.bestMatch.similarityScore * 100).toFixed(1)}%
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-amber-300 font-bold text-sm">
                        No catalog individual matched above the 70% certainty threshold.
                      </div>
                    )}
                  </div>

                  {/* Biological Explanation */}
                  <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-xs space-y-1">
                    <div className="font-bold text-[#8AE3A6] uppercase tracking-wider">
                      Biometric Feature Evaluation
                    </div>
                    <p className="text-[#D8E6D5] leading-relaxed">
                      {matcherResult.explanation}
                    </p>
                  </div>

                  {/* Prominent Uncertainty Banner */}
                  {matcherResult.isUncertain && (
                    <div className="p-3.5 rounded-lg bg-amber-950/70 border border-amber-600/70 text-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Uncertain / Uncataloged Specimen</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#F3E8CB]">
                        The biometric matcher could not align sufficient invariant stripe, rosette, or ear markings to existing database profiles. This animal may be a newly dispersing juvenile or uncataloged resident.
                      </p>
                      <button
                        onClick={() => setShowRegisterForm(true)}
                        className="mt-2 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Register as New Cataloged Individual</span>
                      </button>
                    </div>
                  )}

                  {/* Candidate Rankings List */}
                  {matcherResult.candidateMatches && matcherResult.candidateMatches.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
                        Ranked Candidate Similarities ({matcherResult.candidateMatches.length})
                      </div>
                      <div className="space-y-2">
                        {matcherResult.candidateMatches.map((cand: any, idx: number) => (
                          <div key={idx} className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{cand.codeName}</span>
                              <span className="font-mono text-emerald-400 font-bold">
                                {(cand.similarityScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            {/* Similarity Bar */}
                            <div className="w-full bg-[#173F35] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#2D6A4F] to-[#7BB896] h-full rounded-full"
                                style={{ width: `${cand.similarityScore * 100}%` }}
                              />
                            </div>
                            {cand.matchingFeatures && cand.matchingFeatures.length > 0 && (
                              <div className="text-[11px] text-[#A8B9A0]">
                                Matched: <span className="text-[#8AE3A6]">{cand.matchingFeatures.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Register New Individual Modal / Slide */}
                  {showRegisterForm && (
                    <form onSubmit={handleRegisterIndividual} className="bg-[#0B1E1A] p-4 rounded-xl border border-amber-600/60 space-y-3 text-xs">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 text-amber-400" />
                        <span>Register New Individual Animal Profile</span>
                      </div>
                      <div>
                        <label className="text-[11px] text-[#A8B9A0] block mb-1">Code Name / Identifier</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. T-112 (Sultan) or SL-09 (Karakoram)"
                          value={newCodeName}
                          onChange={(e) => setNewCodeName(e.target.value)}
                          className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-[#A8B9A0] block mb-1">Species</label>
                          <select
                            value={newSpeciesId}
                            onChange={(e) => setNewSpeciesId(e.target.value)}
                            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-2.5 py-1 text-xs text-white"
                          >
                            <option value="sp-tiger">Bengal Tiger</option>
                            <option value="sp-snow-leopard">Snow Leopard</option>
                            <option value="sp-elephant">Asian Elephant</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-[#A8B9A0] block mb-1">Pattern Type</label>
                          <select
                            value={newPatternType}
                            onChange={(e: any) => setNewPatternType(e.target.value)}
                            className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-2.5 py-1 text-xs text-white"
                          >
                            <option value="Stripe Geometry">Stripe Geometry</option>
                            <option value="Rosette Topology">Rosette Topology</option>
                            <option value="Ear Notch">Ear Notch</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-[#A8B9A0] block mb-1">Primary Territory</label>
                        <input
                          type="text"
                          value={newTerritory}
                          onChange={(e) => setNewTerritory(e.target.value)}
                          className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#A8B9A0] block mb-1">Distinctive Marking</label>
                        <input
                          type="text"
                          placeholder="e.g. Inverted chevron above right eye"
                          value={newDistinctiveFeature}
                          onChange={(e) => setNewDistinctiveFeature(e.target.value)}
                          className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowRegisterForm(false)}
                          className="px-3 py-1.5 rounded bg-[#143B33] text-[#A8B9A0] text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          {isRegistering ? 'Registering...' : 'Persist to Database'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-[#12362E] rounded-xl p-8 border border-[#1E4E42] text-center flex flex-col items-center justify-center gap-3 min-h-[360px] text-[#A8B9A0]">
                  <Fingerprint className="w-10 h-10 text-amber-400" />
                  <div className="font-bold text-white text-base">Re-Identification Matcher Ready</div>
                  <p className="text-xs max-w-xs">
                    Click "Run Biometric Re-Identification" to test automated matching against the cataloged individual animal profiles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL PROFILES LIST AND HISTORICAL TIMELINES */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tracked Individuals List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8AE3A6] px-1">
              <span>Tracked Individuals ({individuals.length})</span>
              <button
                onClick={() => {
                  setActiveTab('matcher');
                  setShowRegisterForm(true);
                }}
                className="text-[11px] text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
            <div className="space-y-2">
              {individuals.map((ind) => {
                const isSelected = ind.id === selectedIndividual?.id;
                const hasAnomaly = ind.status === 'Anomaly Flagged';
                return (
                  <div
                    key={ind.id}
                    onClick={() => setSelectedIndividualId(ind.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#173F35] border-[#7BB896] shadow-lg'
                        : 'bg-[#12362E] border-[#1E4E42] hover:border-[#2D6A4F]'
                    }`}
                  >
                    <img
                      src={ind.fingerprintImageUrl}
                      alt={ind.codeName}
                      className="w-14 h-14 object-cover rounded-lg border border-[#2D6A4F] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm truncate">{ind.codeName}</div>
                        {hasAnomaly && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>
                      <div className="text-xs text-[#A8B9A0]">{ind.speciesName}</div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7BB896]">
                        <span>{ind.sightingCount} Sightings</span>
                        <span>•</span>
                        <span>Last: {ind.lastSightedDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Profile, Biometrics & Sighting Timeline (8 cols) */}
          {selectedIndividual && (
            <div className="lg:col-span-8 space-y-6">
              {/* Dossier Card */}
              <div className="bg-[#12362E] rounded-xl p-6 border border-[#1E4E42] space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E4E42] pb-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedIndividual.fingerprintImageUrl}
                      alt={selectedIndividual.codeName}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-[#2D6A4F] shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#8AE3A6] bg-[#0E2420] px-2 py-0.5 rounded border border-[#1E4E42]">
                          {selectedIndividual.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          selectedIndividual.status === 'Active Monitoring'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                            : 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                        }`}>
                          {selectedIndividual.status}
                        </span>
                      </div>
                      <h2 className="font-serif-title text-2xl font-bold text-white mt-1">
                        {selectedIndividual.codeName}
                      </h2>
                      <div className="text-xs text-[#A8B9A0]">
                        {selectedIndividual.speciesName} • Sex: {selectedIndividual.sex} • Est. Age: ~{selectedIndividual.estimatedAgeYears} yrs
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] text-right">
                    <div className="text-[11px] text-[#A8B9A0]">Biometric Re-ID Match</div>
                    <div className="font-mono text-xl font-bold text-emerald-400">
                      {selectedIndividual.reIdMatchConfidence}%
                    </div>
                  </div>
                </div>

                {/* Territory & Biometric Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0E2420] p-4 rounded-lg border border-[#1E4E42] space-y-2">
                    <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#7BB896]" /> Primary Home Range
                    </div>
                    <p className="text-xs text-[#CBD8C6] leading-relaxed">
                      {selectedIndividual.primaryTerritory}
                    </p>
                    <div className="text-[11px] text-[#A8B9A0] pt-1">
                      First cataloged: <strong className="text-white">{selectedIndividual.firstSightedDate}</strong>
                    </div>
                  </div>

                  <div className="bg-[#0E2420] p-4 rounded-lg border border-[#1E4E42] space-y-2">
                    <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-amber-400" /> Biometric Key Features
                    </div>
                    <div className="text-xs text-[#A8B9A0]">
                      Pattern Type: <strong className="text-white">{selectedIndividual.patternType}</strong>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedIndividual.distinctiveFeatures.map((feat, idx) => (
                        <span key={idx} className="bg-[#173F35] text-[#8AE3A6] px-2 py-0.5 rounded text-[11px] border border-[#2D6A4F]">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Historical Sighting Timeline */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-title text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#7BB896]" />
                      Observation Sighting History ({individualObservations.length} in archive)
                    </h3>
                    <span className="text-xs text-[#A8B9A0]">
                      Average ~{selectedIndividual.baselineSightingFrequencyWeekly} sightings/week
                    </span>
                  </div>

                  {individualObservations.length > 0 ? (
                    <div className="space-y-3">
                      {individualObservations.map((obs) => (
                        <div
                          key={obs.id}
                          onClick={() => onSelectObservation(obs)}
                          className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] hover:border-[#3E8E6A] transition-colors cursor-pointer flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={obs.imageUrl}
                              alt={obs.speciesName}
                              className="w-12 h-12 object-cover rounded-md border border-[#1E4E42]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#8AE3A6]">{obs.id}</span>
                                <span className="text-xs text-white font-medium">{obs.locationName}</span>
                              </div>
                              <div className="text-[11px] text-[#A8B9A0] flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3 h-3 text-[#7BB896]" />
                                <span>{obs.observedAt}</span>
                                {obs.anomalyDetected && (
                                  <span className="text-red-400 font-bold">⚠️ Anomaly Flagged</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded bg-[#173F35] text-xs font-mono text-[#8AE3A6] border border-[#2D6A4F]">
                              {(obs.confidence * 100).toFixed(0)}% Conf
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0E2420] p-6 rounded-lg text-center text-xs text-[#A8B9A0]">
                      No camera trap captures archived in the current filter window for this individual.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
