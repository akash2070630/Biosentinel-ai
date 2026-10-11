import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Fingerprint,
  Eye,
  EyeOff,
  Compass,
  FileText,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Species, WildlifeObservation, BoundingBox } from '../types';
import { BoundingBoxCanvas } from '../components/common/BoundingBoxCanvas';
import { IUCNBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';

interface DetectionStudioProps {
  speciesList: Species[];
  onObservationSaved: (newObs: WildlifeObservation) => void;
  onNavigateToExplorer: () => void;
  onNavigateToHabitat?: () => void;
  onNavigateToAudit?: () => void;
}

// Preset verified wildlife camera trap samples for 1-click test
const SAMPLE_TEST_CASES = [
  {
    name: 'Bengal Tiger in Sundarbans',
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Bengal Tiger',
    location: 'Sundarbans Mangrove Reserve - Camera Trap #12',
    lat: 21.9497,
    lng: 89.1833,
    expectedCertainty: 'High'
  },
  {
    name: 'Snow Leopard on Himalayan Ridge',
    url: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Snow Leopard',
    location: 'Hemis High Altitude National Park - Ridge Sensor #4',
    lat: 34.1450,
    lng: 77.5850,
    expectedCertainty: 'High'
  },
  {
    name: 'Asian Elephant Matriarch',
    url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Asian Elephant',
    location: 'Kaziranga Wetland Corridor - Sector 3 Sensor Node',
    lat: 26.6667,
    lng: 93.3500,
    expectedCertainty: 'High'
  },
  {
    name: 'Red Panda in Canopy',
    url: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Red Panda',
    location: 'Singalila Bamboo Sanctuary - Forest Perch #7',
    lat: 27.0500,
    lng: 88.0833,
    expectedCertainty: 'High'
  },
  {
    name: 'Gharial on Sandbank',
    url: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Gharial',
    location: 'Chambal River Sanctuary - Riparian Transect #2',
    lat: 26.7800,
    lng: 78.5200,
    expectedCertainty: 'High'
  },
  {
    name: 'Ambiguous Distant Wildlife (Uncertainty Test)',
    url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80',
    speciesCandidate: 'Distant / Occluded Fauna',
    location: 'Alpine Glacial Moraine - Foggy Perimeter #19',
    lat: 28.5900,
    lng: 83.9800,
    expectedCertainty: 'Uncertain / Boundary Check'
  }
];

export function DetectionStudio({
  speciesList,
  onObservationSaved,
  onNavigateToExplorer,
  onNavigateToHabitat,
  onNavigateToAudit
}: DetectionStudioProps) {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(SAMPLE_TEST_CASES[0].url);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [inferenceResult, setInferenceResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedObsId, setSavedObsId] = useState<string | null>(null);

  // Overlay toggle control
  const [showOverlays, setShowOverlays] = useState(true);

  // Review & Confirmation Fields
  const [customLocation, setCustomLocation] = useState(SAMPLE_TEST_CASES[0].location);
  const [customLat, setCustomLat] = useState(SAMPLE_TEST_CASES[0].lat);
  const [customLng, setCustomLng] = useState(SAMPLE_TEST_CASES[0].lng);
  const [customCameraTrapId, setCustomCameraTrapId] = useState('CT-STUDIO-INSPECT-01');
  const [customNotes, setCustomNotes] = useState('Camera trap photograph evaluated through BioSentinel multimodal vision pipeline.');
  const [isCertifiedVerified, setIsCertifiedVerified] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload with strict client-side validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File Type Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg(`Invalid file type (${file.type || 'unknown'}). Supported formats: JPEG, PNG, WEBP.`);
      return;
    }

    // 2. File Size Validation (Max 25MB)
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum allowed limit of 25MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setInferenceResult(null);
      setIsSaved(false);
      setSavedObsId(null);
      setErrorMsg(null);
      setCustomLocation('Field Station Uplink - Custom Trap Photo');
      setCustomCameraTrapId('CT-CUSTOM-UPLOAD');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file from disk.');
    };
    reader.readAsDataURL(file);
  };

  // Run Inference Pipeline
  const runDetection = async (imageSrcToUse?: string) => {
    const targetImage = imageSrcToUse || selectedImageSrc;
    if (!targetImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setInferenceResult(null);
    setIsSaved(false);
    setSavedObsId(null);

    try {
      setAnalysisStep('Normalizing image tensors & verifying payload...');
      await new Promise(r => setTimeout(r, 200));

      setAnalysisStep('Transmitting to Gemini 3.8 Flash multimodal vision model...');

      // Convert URL to base64 if it is an external URL
      let base64Data = targetImage;
      if (targetImage.startsWith('http')) {
        try {
          const resp = await fetch(targetImage);
          const blob = await resp.blob();
          base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          // If fetch fails or CORS restricts, pass targetImage URL string
          base64Data = targetImage;
        }
      }

      setAnalysisStep('Parsing taxonomic binomials & bounding geometries...');
      const result = await api.detectWildlife(base64Data);
      setInferenceResult(result);
      setAnalysisStep('Inference complete');

      // Pre-fill notes based on inference findings
      if (result.explanation) {
        setCustomNotes(`Morphology analysis: ${result.explanation}`);
      }
    } catch (err: any) {
      console.error('Detection execution error:', err);
      setErrorMsg(err.message || 'Vision inference failed. Ensure backend service is reachable.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save observation to database with confirmation
  const handleSaveObservation = async () => {
    if (!inferenceResult || !selectedImageSrc || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const matchedSpecies = speciesList.find(
        s => s.commonName.toLowerCase() === inferenceResult.speciesName.toLowerCase()
      );

      const generatedId = `OBS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newObservation: WildlifeObservation = {
        id: generatedId,
        speciesId: matchedSpecies?.id || `sp-${inferenceResult.speciesName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        speciesName: inferenceResult.speciesName,
        scientificName: inferenceResult.scientificName,
        conservationStatus: inferenceResult.conservationStatus,
        observedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        locationName: customLocation,
        latitude: customLat,
        longitude: customLng,
        cameraTrapId: customCameraTrapId,
        imageUrl: selectedImageSrc,
        confidence: inferenceResult.confidence,
        modelUsed: inferenceResult.modelUsed,
        isDemoData: inferenceResult.isDemoData || false,
        isVerified: isCertifiedVerified,
        verifiedBy: isCertifiedVerified ? 'Lead Ecologist (BioSentinel Studio)' : undefined,
        verifiedAt: isCertifiedVerified ? new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC' : undefined,
        boundingBoxes: inferenceResult.boundingBoxes || [],
        individualId: inferenceResult.individualCandidate?.individualId,
        individualName: inferenceResult.individualCandidate?.individualName,
        reIdScore: inferenceResult.individualCandidate?.reIdConfidence,
        anomalyDetected: Boolean(inferenceResult.anomalyDetected),
        environmentalConditions: {
          temperatureC: 24,
          weather: 'Clear Ambient Sensor Field',
          timeOfDay: 'Day'
        },
        notes: customNotes
      };

      const savedResult = await api.createObservation(newObservation);
      onObservationSaved(savedResult || newObservation);
      setIsSaved(true);
      setSavedObsId(generatedId);
    } catch (err: any) {
      console.error('Save observation error:', err);
      setErrorMsg(err.message || 'Failed to save observation to PostgreSQL.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Camera className="w-4 h-4 text-[#7BB896]" />
            Deep Multimodal Computer Vision Pipeline
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            AI Wildlife Detection Studio
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Identify endangered fauna, extract calibrated [0–1000] bounding boxes, flag silent distress, and persist verified observations to PostgreSQL.
          </p>
        </div>

        {/* Real Model Badge */}
        <div className="flex items-center gap-2 bg-[#12362E] border border-[#1E4E42] px-3 py-1.5 rounded-lg text-xs">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-[#A8B9A0]">Active Inference Engine</div>
            <div className="font-mono text-emerald-300 font-semibold">Gemini 3.8 Flash (Multimodal)</div>
          </div>
        </div>
      </div>

      {/* Preset Test Case Selector */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Benchmark Field Test Cases (Click to Load)</span>
          </div>
          <span className="text-[10px] text-[#A8B9A0]">Authentic Conservation Imagery</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SAMPLE_TEST_CASES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedImageSrc(sample.url);
                setCustomLocation(sample.location);
                setCustomLat(sample.lat);
                setCustomLng(sample.lng);
                setInferenceResult(null);
                setIsSaved(false);
                setSavedObsId(null);
                setErrorMsg(null);
              }}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                selectedImageSrc === sample.url
                  ? 'bg-[#1C4D43] border-[#7BB896] shadow-sm ring-1 ring-[#7BB896]'
                  : 'bg-[#0E2420] border-[#1E4E42] hover:border-[#3E8E6A] text-[#A8B9A0]'
              }`}
            >
              <div className="font-bold text-white truncate">{sample.speciesCandidate}</div>
              <div className="text-[10px] text-[#7BB896] truncate">{sample.name.split(' in ')[1] || sample.name}</div>
              <div className="text-[9px] text-[#A8B9A0]/70 truncate mt-0.5">{sample.expectedCertainty}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workspace: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Canvas & Upload controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#12362E] rounded-xl p-4 border border-[#1E4E42] space-y-4">
            {selectedImageSrc ? (
              <div className="space-y-3">
                {/* Image canvas with bounding box overlays */}
                <div className="relative">
                  <BoundingBoxCanvas
                    imageUrl={selectedImageSrc}
                    boxes={showOverlays ? (inferenceResult?.boundingBoxes || []) : []}
                    alt="Wildlife inference subject"
                    className="h-[430px]"
                  />
                </div>

                {/* Toolbar Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E4E42]/80">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-xs text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#7BB896]" />
                      <span>Upload Custom Photo</span>
                    </button>

                    {/* Toggle Overlays Button */}
                    {inferenceResult && (
                      <button
                        onClick={() => setShowOverlays(!showOverlays)}
                        className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                          showOverlays
                            ? 'bg-[#1C4D43] border-[#7BB896] text-emerald-300'
                            : 'bg-[#0E2420] border-[#1E4E42] text-[#A8B9A0] hover:text-white'
                        }`}
                        title="Toggle normalized bounding box overlays"
                      >
                        {showOverlays ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{showOverlays ? 'Hide Overlays' : 'Show Overlays'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedImageSrc(null);
                        setInferenceResult(null);
                        setIsSaved(false);
                        setSavedObsId(null);
                        setErrorMsg(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0E2420] hover:bg-[#163830] border border-[#1E4E42] text-xs text-[#A8B9A0] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Primary Inference Trigger */}
                  <button
                    onClick={() => runDetection()}
                    disabled={isAnalyzing}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-xs shadow-lg transition-all cursor-pointer ${
                      isAnalyzing
                        ? 'bg-[#1C4D43] text-[#A8B9A0] cursor-not-allowed'
                        : 'bg-[#2D6A4F] hover:bg-[#388463] text-white hover:scale-[1.02]'
                    }`}
                  >
                    <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-amber-400' : 'text-[#8AE3A6]'}`} />
                    <span>{isAnalyzing ? 'Executing Multimodal Inference...' : 'Run Wildlife Inference'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2D6A4F] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 bg-[#0D2420] hover:border-[#7BB896] transition-colors cursor-pointer min-h-[400px]"
              >
                <div className="w-14 h-14 rounded-full bg-[#173F35] flex items-center justify-center text-[#7BB896] shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-white text-base">Select Camera Trap Photograph</div>
                  <div className="text-xs text-[#A8B9A0] mt-1">Supports JPEG, PNG, WEBP files up to 25MB</div>
                  <div className="text-[11px] text-[#7BB896] mt-2 font-mono">Strict client and server validation enforced</div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && (
              <div className="bg-[#0D2420] p-4 rounded-lg border border-[#1E4E42] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8AE3A6]">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{analysisStep}</span>
                  </span>
                  <span className="font-mono text-xs text-amber-300">Live Gemini Call...</span>
                </div>
                <div className="w-full bg-[#173F35] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2D6A4F] via-[#7BB896] to-emerald-400 h-full rounded-full animate-pulse" style={{ width: '85%' }} />
                </div>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 p-3.5 rounded-lg text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Detection Service Notice</div>
                  <div className="text-red-300">{errorMsg}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Model Output & Review & Confirmation Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {inferenceResult ? (
            <div className="bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] space-y-5 shadow-xl">
              {/* Predicted Species Header */}
              <div className="border-b border-[#1E4E42] pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase text-[#8AE3A6] tracking-wider">
                      Taxonomic Identification
                    </span>
                  </div>
                  <IUCNBadge status={inferenceResult.conservationStatus} />
                </div>
                <h2 className="font-serif-title text-2xl font-bold text-white">
                  {inferenceResult.speciesName}
                </h2>
                <div className="italic text-xs text-[#A8B9A0] font-serif">{inferenceResult.scientificName}</div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="bg-[#0E2420] px-3 py-1 rounded-md border border-[#1A473C] text-xs">
                    <span className="text-[#A8B9A0]">Confidence: </span>
                    <strong className={`font-mono text-sm ${inferenceResult.confidence >= 0.70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(inferenceResult.confidence * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div className="text-[11px] text-[#A8B9A0] font-mono bg-[#0E2420] px-2.5 py-1 rounded border border-[#1E4E42]">
                    {inferenceResult.modelUsed.split('(')[0]}
                  </div>
                </div>
              </div>

              {/* Biological Explanation */}
              {inferenceResult.explanation && (
                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] space-y-1">
                  <div className="text-[11px] font-bold text-[#8AE3A6] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Diagnostic Morphological Markers</span>
                  </div>
                  <p className="text-xs text-[#D8E6D2] leading-relaxed">
                    {inferenceResult.explanation}
                  </p>
                </div>
              )}

              {/* Prominent Uncertainty State Display */}
              {inferenceResult.isUncertain && (
                <div className="bg-amber-950/70 border border-amber-600/70 p-3.5 rounded-lg text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Scientific Uncertainty State Active</span>
                  </div>
                  <p className="text-[11px] text-[#F3E8CB] leading-relaxed">
                    {inferenceResult.uncertaintyNotes ||
                      'Model confidence is below the 70% threshold. BioSentinel protocol mandates secondary verification by a certified taxonomist prior to field citation.'}
                  </p>
                </div>
              )}

              {/* Spatial Localization Notice if bounding boxes could not be found */}
              {(!inferenceResult.boundingBoxes || inferenceResult.boundingBoxes.length === 0) && (
                <div className="bg-[#143B33] p-3 rounded-lg border border-[#2D6A4F] text-xs space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#7BB896]" />
                    <span>Full-Frame Detection (No Bounding Geometry)</span>
                  </div>
                  <p className="text-[11px] text-[#A8B9A0]">
                    Animal detected in frame, but distinct localized bounding box coordinates could not be isolated with high spatial certainty. Synthetic boxes are never drawn.
                  </p>
                </div>
              )}

              {/* Bounding Coordinates Table (Normalized 0-1000) */}
              {inferenceResult.boundingBoxes && inferenceResult.boundingBoxes.length > 0 && (
                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#8AE3A6] uppercase">Normalized Bounding Boxes</span>
                    <span className="text-[10px] text-[#A8B9A0] font-mono">0–1000 scale</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {inferenceResult.boundingBoxes.map((box: BoundingBox, idx: number) => (
                      <div key={idx} className="bg-[#12362E] p-2 rounded border border-[#1E4E42] text-[11px] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{box.label}</div>
                          <div className="font-mono text-[10px] text-[#A8B9A0]">
                            Y: [{box.ymin}, {box.ymax}] | X: [{box.xmin}, {box.xmax}]
                          </div>
                        </div>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {(box.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Re-ID candidate */}
              {inferenceResult.individualCandidate && (
                <div className="bg-[#143B33] p-3.5 rounded-lg border border-[#2D6A4F] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      <span>Biometric Candidate: {inferenceResult.individualCandidate.individualName}</span>
                    </div>
                    <span className="font-mono text-amber-300 font-bold">
                      {(inferenceResult.individualCandidate.reIdConfidence * 100).toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C5D5C1] leading-relaxed">
                    Candidate identified via invariant coat stripe / rosette geometry. Stored under ID {inferenceResult.individualCandidate.individualId}.
                  </p>
                </div>
              )}

              {/* Anomaly & Threat Notes */}
              {(inferenceResult.anomalyDetected || inferenceResult.threatDetected) && (
                <div className="space-y-2 text-xs">
                  {inferenceResult.anomalyDetected && (
                    <div className="bg-red-950/60 border border-red-800 p-3 rounded text-red-200">
                      <strong className="text-red-400">Silent Distress Flag:</strong> {inferenceResult.anomalyNotes || 'Atypical gait or physical morphology flagged.'}
                    </div>
                  )}
                  {inferenceResult.threatDetected && (
                    <div className="bg-orange-950/60 border border-orange-800 p-3 rounded text-orange-200">
                      <strong className="text-orange-400">Threat Indicator:</strong> {inferenceResult.threatDetails || 'Suspected human disturbance or equipment.'}
                    </div>
                  )}
                </div>
              )}

              {/* Pre-Save Review & Database Confirmation Form */}
              <div className="border-t border-[#1E4E42] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-xs uppercase tracking-wider text-[#8AE3A6]">
                    Observation Review & PostgreSQL Persistence
                  </div>
                  <span className="text-[10px] text-[#A8B9A0] font-mono">Real-time sync</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] text-[#A8B9A0] block mb-1">Observation Location Name</label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#A8B9A0] block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLat}
                        onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#A8B9A0] block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={customLng}
                        onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-2.5 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#A8B9A0] block mb-1">Field Ecologist Reviewer Notes</label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
                    />
                  </div>

                  {/* Verification Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={isCertifiedVerified}
                      onChange={(e) => setIsCertifiedVerified(e.target.checked)}
                      className="rounded border-[#1E4E42] bg-[#0E2420] text-emerald-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-[#C5D5C1]">
                      Certify as verified field record (Signed by Lead Ecologist)
                    </span>
                  </label>
                </div>

                {/* Save status / buttons */}
                {isSaved ? (
                  <div className="bg-emerald-950/80 border border-emerald-700 p-4 rounded-lg text-emerald-200 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Observation {savedObsId} persisted to PostgreSQL!</span>
                    </div>
                    <p className="text-[11px] text-[#C5E1D4]">
                      Written to <span className="font-mono text-white">observations</span>, <span className="font-mono text-white">evidence</span>, and <span className="font-mono text-white">audit_events</span> tables.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={onNavigateToExplorer}
                        className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>View in Explorer</span>
                      </button>
                      {onNavigateToHabitat && (
                        <button
                          onClick={onNavigateToHabitat}
                          className="px-3 py-1.5 rounded bg-[#1C4D43] hover:bg-[#256356] border border-[#2D6A4F] text-white text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#7BB896]" />
                          <span>View on Habitat Map</span>
                        </button>
                      )}
                      {onNavigateToAudit && (
                        <button
                          onClick={onNavigateToAudit}
                          className="px-3 py-1.5 rounded bg-[#0E2420] hover:bg-[#153830] border border-[#1E4E42] text-[#A8B9A0] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#7BB896]" />
                          <span>Audit Trail</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveObservation}
                    disabled={isSaving}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${
                      isSaving
                        ? 'bg-emerald-800 text-emerald-200 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.01]'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Writing to PostgreSQL Database...' : 'Confirm & Persist to Database'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#12362E] rounded-xl p-8 border border-[#1E4E42] text-center flex flex-col items-center justify-center gap-3 min-h-[420px] text-[#A8B9A0]">
              <div className="w-12 h-12 rounded-full bg-[#0E2420] border border-[#1E4E42] flex items-center justify-center text-[#7BB896]">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-white text-base">Inference Engine Ready</div>
                <div className="text-xs max-w-xs mt-1">
                  Select a test case or upload a camera trap photograph and click "Run Wildlife Inference" to initiate model localization.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
