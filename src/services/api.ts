import {
  Species,
  IndividualAnimal,
  BehavioralAnomaly,
  ThreatRecord,
  WildlifeObservation,
  AcousticRecording,
  ModelTelemetry
} from '../types';
import {
  INITIAL_SPECIES,
  INITIAL_INDIVIDUALS,
  INITIAL_ANOMALIES,
  INITIAL_THREATS,
  INITIAL_OBSERVATIONS,
  INITIAL_ACOUSTIC,
  INITIAL_MODEL_TELEMETRY
} from '../data/seedData';

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export const api = {
  async getHealth(): Promise<{ status: string; geminiConfigured: boolean; telemetry: ModelTelemetry; database?: any }> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      // offline fallback
    }
    return {
      status: 'offline-mode',
      geminiConfigured: false,
      telemetry: INITIAL_MODEL_TELEMETRY
    };
  },

  async getSpecies(): Promise<Species[]> {
    try {
      const res = await fetch(`${BASE_URL}/species`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed species');
    }
    return INITIAL_SPECIES;
  },

  async getIndividuals(): Promise<IndividualAnimal[]> {
    try {
      const res = await fetch(`${BASE_URL}/individuals`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed individuals');
    }
    return INITIAL_INDIVIDUALS;
  },

  async createIndividual(individual: Partial<IndividualAnimal>): Promise<IndividualAnimal | null> {
    try {
      const res = await fetch(`${BASE_URL}/individuals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(individual)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to register individual');
    }
    return null;
  },

  async getObservations(filter?: { speciesId?: string; individualId?: string; threatOnly?: boolean; search?: string }): Promise<WildlifeObservation[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.speciesId) params.append('speciesId', filter.speciesId);
      if (filter?.individualId) params.append('individualId', filter.individualId);
      if (filter?.threatOnly) params.append('threatOnly', 'true');
      if (filter?.search) params.append('search', filter.search);
      const res = await fetch(`${BASE_URL}/observations?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed observations');
    }
    return INITIAL_OBSERVATIONS;
  },

  async createObservation(obs: WildlifeObservation): Promise<WildlifeObservation> {
    try {
      const res = await fetch(`${BASE_URL}/observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obs)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to save to server, local mock updated');
    }
    return obs;
  },

  async deleteObservation(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/observations/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async getAnomalies(): Promise<BehavioralAnomaly[]> {
    try {
      const res = await fetch(`${BASE_URL}/silent-distress`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed anomalies');
    }
    return INITIAL_ANOMALIES;
  },

  async updateAnomalyStatus(id: string, status: string, reviewerName: string): Promise<BehavioralAnomaly | null> {
    try {
      const res = await fetch(`${BASE_URL}/silent-distress/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewerName })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to update anomaly status');
    }
    return null;
  },

  async getThreats(): Promise<ThreatRecord[]> {
    try {
      const res = await fetch(`${BASE_URL}/threats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed threats');
    }
    return INITIAL_THREATS;
  },

  async updateThreat(id: string, update: { status?: string; reviewerNotes?: string; reviewedBy?: string }): Promise<ThreatRecord | null> {
    try {
      const res = await fetch(`${BASE_URL}/threats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to update threat');
    }
    return null;
  },

  async createThreat(threat: Partial<ThreatRecord>): Promise<ThreatRecord | null> {
    try {
      const res = await fetch(`${BASE_URL}/threats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(threat)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Failed to record threat');
    }
    return null;
  },

  async getAcoustic(): Promise<AcousticRecording[]> {
    try {
      const res = await fetch(`${BASE_URL}/acoustic`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using client seed acoustic');
    }
    return INITIAL_ACOUSTIC;
  },

  async analyzeAcoustic(textDescription: string, fileName: string) {
    try {
      const res = await fetch(`${BASE_URL}/acoustic/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textDescription, fileName })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Acoustic analysis failed');
    }
    return null;
  },

  async detectWildlife(imageBase64: string, mimeType: string = 'image/jpeg') {
    const res = await fetch(`${BASE_URL}/ai/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Inference service error: ${res.statusText}`);
    }
    return await res.json();
  },

  async reIdentifyWildlife(imageBase64: string, mimeType: string = 'image/jpeg', speciesHint?: string) {
    const res = await fetch(`${BASE_URL}/ai/re-identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, speciesHint })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Re-ID service error: ${res.statusText}`);
    }
    return await res.json();
  },

  async evaluateSilentDistress(individualId: string) {
    const res = await fetch(`${BASE_URL}/silent-distress/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individualId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Silent Distress service error: ${res.statusText}`);
    }
    return await res.json();
  },

  async analyzeUploadedAudio(audioBase64: string, mimeType: string = 'audio/wav', fileName?: string) {
    const res = await fetch(`${BASE_URL}/ai/audio-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, fileName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Audio analysis error: ${res.statusText}`);
    }
    return await res.json();
  },

  async getAuditLogs() {
    try {
      const res = await fetch(`${BASE_URL}/audit-logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }
    return [];
  }
};
