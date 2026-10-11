export type ConservationStatus = 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern';

export interface BoundingBox {
  id: string;
  ymin: number; // 0-1000 normalized integer
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
  scientificName?: string;
  confidence: number;
  individualId?: string;
  individualName?: string;
  reIdConfidence?: number;
  distressAnomalyFlag?: boolean;
  visualFeatures?: string[];
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  iucnStatus: ConservationStatus;
  populationEstimate: string;
  trend: 'Decreasing' | 'Stable' | 'Increasing';
  threats: string[];
  habitat: string;
  rangeCountries: string[];
  reIdentificationMethod: string;
  acousticFeatures: string;
  imageUrl: string;
  photographerCredit: string;
  description: string;
  vitalStats: {
    averageWeight: string;
    lifespan: string;
    territorySize: string;
  };
}

export interface IndividualAnimal {
  id: string; // e.g. "IND-T108"
  codeName: string; // e.g. "T-108 (Ustad)"
  speciesId: string;
  speciesName: string;
  sex: 'Male' | 'Female' | 'Unknown';
  estimatedAgeYears: number;
  firstSightedDate: string;
  lastSightedDate: string;
  sightingCount: number;
  primaryTerritory: string;
  patternType: 'Stripe Geometry' | 'Rosette Topology' | 'Ear Notch' | 'Facial Wrinkles' | 'Fin Scars';
  distinctiveFeatures: string[];
  fingerprintImageUrl: string;
  reIdMatchConfidence: number;
  status: 'Active Monitoring' | 'Anomaly Flagged' | 'Signal Lost';
  baselineSightingFrequencyWeekly: number;
  baselineDiurnalRatio: number; // e.g. 0.70 daylight, 0.30 night
}

export interface BehavioralAnomaly {
  id: string;
  individualId: string;
  individualName: string;
  speciesName: string;
  observationId: string;
  detectionDate: string;
  anomalyScore: number; // 0 to 100
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  anomalyType: 'Gait Deviation' | 'Nocturnal Shift' | 'Territory Inversion' | 'Extreme Sighting Gap' | 'Unusual Posture';
  triggeredFeatures: {
    featureName: string;
    observedValue: string;
    historicalBaseline: string;
    zScore: number;
  }[];
  supportingEvidence: string;
  insufficientBaseline: boolean;
  scientificDisclaimer: string;
  reviewedBy?: string;
  reviewStatus: 'Pending Review' | 'Investigating' | 'Verified Anomaly' | 'Sensor Artifact / Dismissed';
}

export type ThreatSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ThreatCategory = 'Illegal Snare / Trap' | 'Habitat Encroachment' | 'Unauthorized Vehicle / Vessel' | 'Acoustic Disturbance' | 'Unnatural Sighting Anomaly' | 'Poaching Risk Zone';
export type ThreatStatus = 'Unverified AI Indicator' | 'Ranger Investigating' | 'Verified Incident' | 'False Positive' | 'Resolved / Neutralized';

export interface ThreatRecord {
  id: string;
  title: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  status: ThreatStatus;
  detectedAt: string;
  locationName: string;
  latitude: number;
  longitude: number;
  locationPrecision: 'Exact (Protected)' | 'Generalized (Fuzzed)';
  source: 'Camera Trap Vision AI' | 'Acoustic Sentinel' | 'Satellite Disturbance' | 'Ranger Patrol';
  evidenceImageUrl?: string;
  evidenceAudioUrl?: string;
  aiExplanation: string;
  confidenceScore: number;
  reviewedBy?: string;
  reviewerNotes?: string;
  auditHistory: {
    timestamp: string;
    actor: string;
    action: string;
    notes: string;
  }[];
}

export interface WildlifeObservation {
  id: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  conservationStatus: ConservationStatus;
  observedAt: string;
  locationName: string;
  latitude: number;
  longitude: number;
  isFuzzedCoordinates?: boolean;
  cameraTrapId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  confidence: number;
  modelUsed: string;
  isDemoData: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  boundingBoxes: BoundingBox[];
  individualId?: string;
  individualName?: string;
  reIdScore?: number;
  anomalyDetected?: boolean;
  environmentalConditions?: {
    temperatureC: number;
    weather: string;
    timeOfDay: 'Day' | 'Dusk' | 'Night' | 'Dawn';
  };
  notes?: string;
}

export interface AcousticRecording {
  id: string;
  title: string;
  timestamp: string;
  sensorNodeId: string;
  locationName: string;
  durationSeconds: number;
  soundCategory: string;
  speciesCandidate?: string;
  confidence: number;
  frequencyRangeHz: string;
  isThreatIndicator: boolean;
  explanation: string;
  waveformSnippet: number[];
  audioUrl?: string;
}

export interface ModelTelemetry {
  modelName: string;
  modelVersion: string;
  architecture: string;
  device: string;
  meanInferenceLatencyMs: number;
  speciesClassesCount: number;
  f1Score: number;
  lastTrainedDate: string;
  status: 'Online' | 'Degraded' | 'Simulation Mode';
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'Field Ranger' | 'Lead Ecologist' | 'Conservation Director' | 'Public Auditor';
  badgeNumber: string;
  canViewUnmaskedCoordinates: boolean;
  canVerifyIncidents: boolean;
}
