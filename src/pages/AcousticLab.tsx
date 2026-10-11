import React, { useState, useRef } from 'react';
import { AcousticRecording } from '../types';
import {
  Volume2,
  Play,
  Pause,
  Upload,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Radio,
  FileAudio,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

interface AcousticLabProps {
  recordings: AcousticRecording[];
  onAddRecording: (newRec: AcousticRecording) => void;
}

const PRESET_AUDIO_SAMPLES = [
  {
    name: 'Bengal Tiger Territorial Roar (Infrasonic)',
    file: 'tiger_territorial_call_01.wav',
    notes: 'Low-frequency resonant acoustic broadcast recorded at midnight in gorge. Suspected apex carnivore.',
    duration: 12.4
  },
  {
    name: 'Motorized Chainsaw Logging Disturbance',
    file: 'chainsaw_twostroke_highpitch.wav',
    notes: 'Sustained two-stroke engine RPM fluctuations at 2400 Hz harmonic pitch in river buffer zone.',
    duration: 24.0
  },
  {
    name: 'Asian Elephant Infrasonic Herd Rumble',
    file: 'elephant_subaudible_rumble.wav',
    notes: 'Sub-20Hz infrasonic acoustic pulse between matriarch and herd traversing marsh.',
    duration: 18.2
  },
  {
    name: 'Sharp Acoustic Transient / Impulse (Echo)',
    file: 'impulse_shockwave_transient.wav',
    notes: 'High rise-time impulse transient recorded on ridge. Possible firearm discharge or high scree rockfall.',
    duration: 8.5
  }
];

export function AcousticLab({ recordings, onAddRecording }: AcousticLabProps) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_AUDIO_SAMPLES[0]);
  const [customNotes, setCustomNotes] = useState(PRESET_AUDIO_SAMPLES[0].notes);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Uploaded Audio State
  const [uploadedAudioFile, setUploadedAudioFile] = useState<{
    name: string;
    b64: string;
    mime: string;
    objectUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate audio file formats
    const validAudioTypes = [
      'audio/wav', 'audio/x-wav', 'audio/wave',
      'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/flac', 'audio/aac'
    ];

    if (!validAudioTypes.includes(file.type)) {
      setAudioError(`Unsupported audio format (${file.type || 'unknown'}). Supported: WAV, MP3, OGG, WEBM, FLAC.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAudioError('Audio file exceeds the maximum 25MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      const objectUrl = URL.createObjectURL(file);
      setUploadedAudioFile({
        name: file.name,
        b64,
        mime: file.type,
        objectUrl
      });
      setAnalysisResult(null);
      setAudioError(null);
      setCustomNotes(`Uploaded field recording: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAudioError(null);

    try {
      if (uploadedAudioFile) {
        // Run genuine Gemini 3.8 Flash multimodal audio inference on the uploaded audio file
        const data = await api.analyzeUploadedAudio(
          uploadedAudioFile.b64,
          uploadedAudioFile.mime,
          uploadedAudioFile.name
        );
        if (data) {
          setAnalysisResult(data.result);
          if (data.record) {
            onAddRecording(data.record);
          }
        }
      } else {
        // Run preset classification
        const data = await api.analyzeAcoustic(customNotes, selectedPreset.file);
        if (data) {
          setAnalysisResult(data.result);
          if (data.record) {
            onAddRecording(data.record);
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setAudioError(e.message || 'Acoustic classification service error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayback = () => {
    if (uploadedAudioFile?.objectUrl && audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(null);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(uploadedAudioFile.name);
      }
    } else {
      setIsPlaying(isPlaying ? null : selectedPreset.file);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-[#7BB896]" />
            Bio-Acoustic Sentinel Analysis (Gemini Multimodal Audio)
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Acoustic Wildlife Monitoring Lab
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Classify infrasonic carnivore calls, elephant herd rumbles, and illegal chainsaw logging audio signatures with live audio uploads.
          </p>
        </div>

        {/* Upload Audio Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAudioFileUpload}
            accept="audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/webm,audio/flac"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-300" />
            <span>Upload Field Audio File (.wav, .mp3)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="bg-[#12362E] border border-amber-800/80 p-4 rounded-xl flex items-start gap-3 text-xs text-[#CBD8C6]">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Acoustic Classification Protocol:</strong> Audio models evaluate Fourier harmonic envelopes and rise times. BioSentinel AI <strong>never labels an impulsive audio recording as a verified poaching event</strong> unless corroborated by spent cartridge casing recovery or ground ranger verification, preventing false alarms from natural rockfalls or thunder reverberations.
        </div>
      </div>

      {/* Preset Sound Samples Selector */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#8AE3A6] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Benchmark Bio-Acoustic Library</span>
          </div>
          {uploadedAudioFile && (
            <button
              onClick={() => {
                setUploadedAudioFile(null);
                setAnalysisResult(null);
                setCustomNotes(selectedPreset.notes);
              }}
              className="text-[11px] text-[#7BB896] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Back to Library Presets</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_AUDIO_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUploadedAudioFile(null);
                setSelectedPreset(sample);
                setCustomNotes(sample.notes);
                setAnalysisResult(null);
              }}
              className={`p-3 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                !uploadedAudioFile && selectedPreset.file === sample.file
                  ? 'bg-[#1C4D43] border-[#7BB896] shadow-sm'
                  : 'bg-[#0E2420] border-[#1E4E42] hover:border-[#3E8E6A] text-[#A8B9A0]'
              }`}
            >
              <div className="font-bold text-white truncate">{sample.name}</div>
              <div className="text-[11px] font-mono text-[#8AE3A6] mt-0.5">{sample.duration}s • {sample.file}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Waveform & Analysis Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waveform Player & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E4E42] pb-3">
            <div>
              <div className="font-bold text-white text-base">
                {uploadedAudioFile ? uploadedAudioFile.name : selectedPreset.name}
              </div>
              <div className="text-xs font-mono text-[#7BB896]">
                {uploadedAudioFile ? `Custom Upload (${uploadedAudioFile.mime})` : selectedPreset.file}
              </div>
            </div>
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white font-bold text-xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Audio' : 'Play / Simulate Audio'}</span>
            </button>
          </div>

          {/* Hidden audio player for uploaded file */}
          {uploadedAudioFile && (
            <audio
              ref={audioPlayerRef}
              src={uploadedAudioFile.objectUrl}
              onEnded={() => setIsPlaying(null)}
              className="hidden"
            />
          )}

          {/* Dynamic Waveform & Spectrogram Visualization */}
          <div className="bg-[#0A1A17] p-5 rounded-lg border border-[#173F35] space-y-4">
            <div className="text-xs text-[#A8B9A0] flex items-center justify-between">
              <span>Time-Domain Acoustic Envelope</span>
              <span className="font-mono text-[#7BB896]">Sample Rate: 48.0 kHz</span>
            </div>

            {/* Dynamic Waveform Bars */}
            <div className="h-28 flex items-end gap-1.5 px-2">
              {[15, 30, 45, 80, 95, 70, 40, 25, 60, 90, 85, 45, 30, 20, 50, 75, 90, 65, 35, 15, 40, 70, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all duration-300 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-[#2D6A4F] to-[#8AE3A6] animate-pulse'
                      : 'bg-[#1C473C]'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Spectrogram Frequency Spectrum */}
            <div className="h-10 bg-gradient-to-r from-emerald-950 via-teal-900 to-amber-950 rounded border border-[#1A473C] flex items-center justify-between px-3 text-[10px] text-[#A8B9A0] font-mono">
              <span>0 Hz (Infrasound)</span>
              <span>2,000 Hz</span>
              <span>8,000 Hz</span>
              <span>20,000 Hz</span>
            </div>
          </div>

          {/* Form to run analysis */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#A8B9A0] block mb-1">
                Field Microphone Sensor Metadata / Spectrogram Notes
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#7BB896]"
              />
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg ${
                isAnalyzing
                  ? 'bg-[#1C4D43] text-[#A8B9A0] cursor-not-allowed'
                  : 'bg-[#2D6A4F] hover:bg-[#388463] text-white hover:scale-[1.01]'
              }`}
            >
              <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-amber-400' : ''}`} />
              <span>
                {isAnalyzing
                  ? 'Running Multimodal Audio Analysis...'
                  : uploadedAudioFile
                  ? 'Analyze Uploaded Audio File (Gemini 3.8 Flash)'
                  : 'Execute Bio-Acoustic Inference'}
              </span>
            </button>

            {audioError && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Inference Results Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {analysisResult ? (
            <div className="bg-[#12362E] rounded-xl p-5 border border-[#1E4E42] space-y-5 shadow-xl">
              <div className="border-b border-[#1E4E42] pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6]">
                    Acoustic Classification
                  </span>
                  {analysisResult.isThreatIndicator ? (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-xs font-bold border border-red-800">
                      THREAT INDICATOR
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
                      BIO-CALL CONFIRMED
                    </span>
                  )}
                </div>
                <h3 className="font-serif-title text-xl font-bold text-white">
                  {analysisResult.soundCategory}
                </h3>
                {analysisResult.speciesCandidate && (
                  <div className="text-xs text-[#A8B9A0] italic mt-0.5">
                    {analysisResult.speciesCandidate}
                  </div>
                )}
                {/* Clear Labeling: Real Model Inference vs Sample Result */}
                <div className="mt-2">
                  {analysisResult.isRealModelInference ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Live Gemini 3.8 Flash Audio Inference
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
                      <AlertTriangle className="w-3 h-3" /> Sample Baseline Heuristics
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42]">
                  <div className="text-[#A8B9A0]">Confidence Score</div>
                  <div className="font-mono text-xl font-bold text-emerald-400">
                    {(analysisResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-[#0E2420] p-3 rounded-lg border border-[#1E4E42]">
                  <div className="text-[#A8B9A0]">Frequency Band</div>
                  <div className="font-mono text-xs font-bold text-white truncate">
                    {analysisResult.frequencyRangeHz}
                  </div>
                </div>
              </div>

              <div className="bg-[#143B33] p-4 rounded-lg border border-[#2D6A4F] text-xs space-y-1.5">
                <div className="font-bold text-white">Fourier Analysis Explanation:</div>
                <p className="text-[#D8E6D5] leading-relaxed">
                  {analysisResult.explanation}
                </p>
              </div>

              <div className="p-3 bg-[#0E2420] rounded border border-[#1E4E42] text-[11px] text-[#A8B9A0]">
                Acoustic node synchronized. Added to historical sensor array log and database.
              </div>
            </div>
          ) : (
            <div className="bg-[#12362E] rounded-xl p-8 border border-[#1E4E42] text-center flex flex-col items-center justify-center gap-3 min-h-[340px] text-[#A8B9A0]">
              <Volume2 className="w-8 h-8 text-[#7BB896]" />
              <div className="font-bold text-white text-base">Acoustic Classifier Ready</div>
              <p className="text-xs max-w-xs">
                Upload a field audio recording or pick a preset sound to test wildlife vocalizations or chainsaw disturbance signatures.
              </p>
            </div>
          )}

          {/* Prior Acoustic Events Archive */}
          <div className="bg-[#12362E] rounded-xl p-4 border border-[#1E4E42] space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8AE3A6]">
              Recent Acoustic Detections ({recordings.length})
            </div>
            <div className="space-y-2">
              {recordings.slice(0, 3).map((rec) => (
                <div key={rec.id} className="bg-[#0E2420] p-2.5 rounded border border-[#1E4E42] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white truncate">{rec.title}</div>
                    <div className="text-[10px] text-[#A8B9A0]">{rec.timestamp} • {rec.locationName}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rec.isThreatIndicator ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {(rec.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
