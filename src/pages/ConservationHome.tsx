import React from 'react';
import {
  Compass,
  Camera,
  HeartPulse,
  Flame,
  Radio,
  Fingerprint,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { Species, WildlifeObservation, ThreatRecord, BehavioralAnomaly } from '../types';
import { IUCNBadge, SeverityBadge } from '../components/common/StatusBadge';

interface ConservationHomeProps {
  onNavigate: (page: string) => void;
  species: Species[];
  observations: WildlifeObservation[];
  threats: ThreatRecord[];
  anomalies: BehavioralAnomaly[];
  onSelectObservation: (obs: WildlifeObservation) => void;
}

export function ConservationHome({
  onNavigate,
  species,
  observations,
  threats,
  anomalies,
  onSelectObservation
}: ConservationHomeProps) {
  const criticalThreats = threats.filter(t => t.severity === 'Critical' || t.severity === 'High');
  const activeAnomalies = anomalies.filter(a => a.reviewStatus !== 'Sensor Artifact / Dismissed');

  return (
    <div className="space-y-12 pb-16">
      {/* Editorial Cinematic Hero Section */}
      <section className="relative rounded-2xl overflow-hidden border border-[#23584B] shadow-2xl bg-gradient-to-r from-[#0C221E] via-[#102C27] to-[#173F35]">
        {/* Ambient background glow and overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,106,79,0.4),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#173F35]/80 border border-[#3E8E6A] text-xs font-semibold text-[#8AE3A6]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Wildlife Intelligence Platform</span>
            </div>

            <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F7F6F0] tracking-tight leading-tight">
              Safeguarding Earth's Rarest Species Through Precision AI.
            </h1>

            <p className="text-sm sm:text-base text-[#D4E2D0] leading-relaxed max-w-2xl">
              BioSentinel AI unifies multi-camera trap computer vision, probabilistic individual re-identification,
              acoustic sentinel listening, and behavioral anomaly monitoring into an explainable, decision-support
              operating system for conservation teams worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('detect')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2D6A4F] hover:bg-[#398463] text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Launch Detection Studio</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-[#F7F6F0] font-semibold text-sm transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-[#7BB896]" />
                <span>Open Intelligence Center</span>
              </button>
            </div>
          </div>

          {/* Hero Featured Photograph */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-[#2D6A4F] shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80"
                alt="Bengal Tiger in natural habitat"
                className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif-title font-bold text-white text-base">Bengal Tiger (T-108)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[11px] border border-emerald-700">
                    98.4% Confidence
                  </span>
                </div>
                <p className="text-[#B2C5B0]">Ranthambore Sector 4 - Verified Flank Stripe Geometry</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Central Wildlife Intelligence Loop */}
      <section className="bg-[#12362E] rounded-xl p-6 sm:p-8 border border-[#1E4E42] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#7BB896]" />
              Architectural Innovation
            </div>
            <h2 className="font-serif-title text-2xl font-bold text-white mt-1">
              The Wildlife Intelligence Loop
            </h2>
          </div>
          <span className="text-xs text-[#A8B9A0] max-w-sm">
            Continuous loop transforming raw multimodal sensor feeds into actionable, verified ecological protection.
          </span>
        </div>

        {/* Pipeline Step Flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {[
            { step: '01', title: 'Input Feed', desc: 'Camera Trap / Audio', icon: Camera },
            { step: '02', title: 'AI Detection', desc: 'Object Localization', icon: Layers },
            { step: '03', title: 'Species ID', desc: 'Taxonomy Match', icon: Compass },
            { step: '04', title: 'Individual Re-ID', desc: 'Biometric Patterns', icon: Fingerprint },
            { step: '05', title: 'Baseline Record', desc: 'Temporal History', icon: Radio },
            { step: '06', title: 'Anomaly Check', desc: 'Silent Distress', icon: HeartPulse },
            { step: '07', title: 'Threat Assess', desc: 'Explainable Risk', icon: Flame },
            { step: '08', title: 'Human Audit', desc: 'Ranger Verification', icon: ShieldAlert },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0E2722] p-3 rounded-lg border border-[#1A473C] flex flex-col justify-between hover:border-[#3E8E6A] transition-colors relative"
              >
                <div className="flex items-center justify-between text-[10px] text-[#7BB896] font-mono mb-2">
                  <span>{item.step}</span>
                  <Icon className="w-3.5 h-3.5 text-[#A8B9A0]" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs leading-snug">{item.title}</div>
                  <div className="text-[10px] text-[#A8B9A0] mt-0.5">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Urgent Conservation Notices & Active Threats */}
      {criticalThreats.length > 0 && (
        <section className="bg-red-950/30 border border-red-800/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-400 animate-pulse" />
              <h3 className="font-serif-title text-lg font-bold text-red-200">
                Priority Conservation Alerts Requiring Review ({criticalThreats.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('threats')}
              className="text-xs text-red-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View All Threats</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalThreats.map((threat) => (
              <div
                key={threat.id}
                onClick={() => onNavigate('threats')}
                className="bg-[#122421] p-4 rounded-lg border border-red-900/50 hover:border-red-600 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-red-300 font-semibold">{threat.id}</span>
                  <SeverityBadge severity={threat.severity} />
                </div>
                <div className="font-bold text-white text-sm">{threat.title}</div>
                <p className="text-xs text-[#CBD8C6] line-clamp-2">{threat.aiExplanation}</p>
                <div className="flex items-center justify-between text-[11px] text-[#8EA692] pt-1">
                  <span>📍 {threat.locationName}</span>
                  <span className="text-amber-300">{threat.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Field Sightings Gallery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-title text-2xl font-bold text-white">
              Recent Field Observations
            </h2>
            <p className="text-xs text-[#A8B9A0] mt-0.5">
              Automated camera trap detections processed by BioSentinel-Vision.
            </p>
          </div>
          <button
            onClick={() => onNavigate('observations')}
            className="text-xs text-[#7BB896] hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Observation Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {observations.slice(0, 6).map((obs) => (
            <div
              key={obs.id}
              onClick={() => onSelectObservation(obs)}
              className="bg-[#12362E] rounded-xl overflow-hidden border border-[#1E4E42] hover:border-[#3E8E6A] transition-all hover:-translate-y-1 cursor-pointer group shadow-lg flex flex-col"
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
                  {(obs.confidence * 100).toFixed(0)}% Conf
                </div>
                {obs.anomalyDetected && (
                  <div className="absolute bottom-2 left-2 bg-red-900/90 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold border border-red-700 flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-red-400" />
                    <span>Silent Distress Flag</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base group-hover:text-[#8AE3A6] transition-colors">
                      {obs.speciesName}
                    </h3>
                    {obs.individualName && (
                      <span className="text-[11px] text-amber-300 font-semibold">
                        {obs.individualName}
                      </span>
                    )}
                  </div>
                  <div className="italic text-xs text-[#A8B9A0]">{obs.scientificName}</div>
                </div>

                <div className="text-xs text-[#8EA692] space-y-1 border-t border-[#1C473C] pt-2">
                  <div className="flex items-center justify-between">
                    <span>📍 {obs.locationName.split(' - ')[0]}</span>
                    <span>{obs.observedAt.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Endangered Species Spotlight */}
      <section className="bg-[#12362E] rounded-xl p-8 border border-[#1E4E42] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-title text-2xl font-bold text-white">
              Target Species Under Active BioSentinel Protection
            </h2>
            <p className="text-xs text-[#A8B9A0] mt-0.5">
              Critically endangered and endangered species with specialized re-identification algorithms.
            </p>
          </div>
          <button
            onClick={() => onNavigate('species')}
            className="text-xs text-[#7BB896] hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Full Species Atlas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {species.slice(0, 3).map((sp) => (
            <div
              key={sp.id}
              onClick={() => onNavigate('species')}
              className="bg-[#0E2722] rounded-lg p-4 border border-[#1E473C] hover:border-[#3E8E6A] transition-colors cursor-pointer space-y-3"
            >
              <img
                src={sp.imageUrl}
                alt={sp.commonName}
                className="w-full h-36 object-cover rounded-md"
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-white text-base">{sp.commonName}</div>
                  <IUCNBadge status={sp.iucnStatus} />
                </div>
                <div className="italic text-xs text-[#A8B9A0] mb-2">{sp.scientificName}</div>
                <p className="text-xs text-[#C2D2BF] line-clamp-2 leading-relaxed">{sp.description}</p>
              </div>
              <div className="text-[11px] bg-[#143B33] p-2 rounded text-[#A8B9A0] space-y-1">
                <div>
                  <strong className="text-white">Re-ID Method:</strong> {sp.reIdentificationMethod}
                </div>
                <div>
                  <strong className="text-white">Population:</strong> {sp.populationEstimate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Silent Distress Callout */}
      <section className="bg-gradient-to-r from-[#173F35] to-[#122D26] rounded-xl p-8 border border-[#2D6A4F] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2D6A4F]/60 text-xs font-bold text-emerald-300 border border-[#3E8E6A]">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Research Feature Highlight</span>
          </div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white">
            Silent Distress: Behavioral Anomaly Monitoring
          </h2>
          <p className="text-sm text-[#D4E2D0] leading-relaxed">
            Unlike superficial detection, BioSentinel tracks long-term biomechanical and diurnal baselines for each
            monitored individual. Deviations in stride frequency, limb loading, or sudden shifts to deep nocturnal
            activity trigger proactive alerts — enabling veterinarians and field rangers to intervene before injury turns fatal.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('silent-distress')}
              className="px-5 py-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Explore Silent Distress Anomaly Engine
            </button>
            <span className="text-xs text-[#A8B9A0]">
              Active Alerts: <strong className="text-amber-300">{activeAnomalies.length} Flagged</strong>
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0D2420] p-4 rounded-xl border border-[#1E4E42] text-xs space-y-3">
          <div className="font-bold text-white border-b border-[#1E4E42] pb-2 flex items-center justify-between">
            <span>Statistical Protocol</span>
            <span className="text-[#7BB896] font-mono">Z-Score | &gt; 3.0 σ</span>
          </div>
          <div className="space-y-1.5 text-[#B2C5B0]">
            <div>• Historical observation minimum: N ≥ 5 sightings</div>
            <div>• Locomotion asymmetry & duty factor indexing</div>
            <div>• Diurnal vs nocturnal circadian shift monitoring</div>
            <div>• Strict decision support: Never claims automated medical diagnosis</div>
          </div>
        </div>
      </section>
    </div>
  );
}
