import {
  Species,
  IndividualAnimal,
  BehavioralAnomaly,
  ThreatRecord,
  WildlifeObservation,
  AcousticRecording,
  ModelTelemetry
} from '../../src/types/index';
import {
  INITIAL_SPECIES,
  INITIAL_INDIVIDUALS,
  INITIAL_ANOMALIES,
  INITIAL_THREATS,
  INITIAL_OBSERVATIONS,
  INITIAL_ACOUSTIC,
  INITIAL_MODEL_TELEMETRY
} from '../../src/data/seedData';
import { pgService, DBHealthInfo } from './postgres';

class BioDataStore {
  private fallbackSpecies: Species[] = [...INITIAL_SPECIES];
  private fallbackIndividuals: IndividualAnimal[] = [...INITIAL_INDIVIDUALS];
  private fallbackAnomalies: BehavioralAnomaly[] = [...INITIAL_ANOMALIES];
  private fallbackThreats: ThreatRecord[] = [...INITIAL_THREATS];
  private fallbackObservations: WildlifeObservation[] = [...INITIAL_OBSERVATIONS];
  private acousticRecordings: AcousticRecording[] = [...INITIAL_ACOUSTIC];
  private telemetry: ModelTelemetry = { ...INITIAL_MODEL_TELEMETRY };
  private auditLogs: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }> = [
    {
      id: 'log-1',
      timestamp: '2026-10-10 18:05:00 UTC',
      actor: 'Senior Biologist M. Sharma',
      action: 'Observation Verified',
      details: 'Confirmed OBS-7740 as Bengal Tiger adult male T-108.'
    },
    {
      id: 'log-2',
      timestamp: '2026-10-10 04:32:00 UTC',
      actor: 'Ranger K. Raman',
      action: 'Threat Status Escalation',
      details: 'Updated THR-2026-014 from Unverified to Ranger Investigating.'
    }
  ];

  async init(): Promise<void> {
    try {
      await pgService.initializeTables();
    } catch (err: any) {
      console.warn('[DataStore] PostgreSQL initialization notice, maintaining unified store:', err.message);
    }
  }

  async getHealthInfo(): Promise<DBHealthInfo> {
    return await pgService.getHealthInfo();
  }

  // Species
  async getSpecies(): Promise<Species[]> {
    if (pgService.getPool()) {
      try {
        const dbSpecies = await pgService.getSpecies();
        if (dbSpecies && dbSpecies.length > 0) return dbSpecies;
      } catch (e) {
        // fallback
      }
    }
    return this.fallbackSpecies;
  }

  async getSpeciesById(id: string): Promise<Species | undefined> {
    const list = await this.getSpecies();
    return list.find(s => s.id === id);
  }

  // Individuals
  async getIndividuals(): Promise<IndividualAnimal[]> {
    if (pgService.getPool()) {
      try {
        const dbInds = await pgService.getIndividuals();
        if (dbInds && dbInds.length > 0) return dbInds;
      } catch (e) {
        // fallback
      }
    }
    return this.fallbackIndividuals;
  }

  async getIndividualById(id: string): Promise<IndividualAnimal | undefined> {
    const list = await this.getIndividuals();
    return list.find(i => i.id === id);
  }

  async addIndividual(ind: IndividualAnimal): Promise<IndividualAnimal> {
    this.fallbackIndividuals.unshift(ind);
    try {
      await pgService.addIndividual(ind);
    } catch (e: any) {
      console.warn('[DataStore] PostgreSQL addIndividual warning:', e.message);
    }
    this.addAuditLog({
      actor: 'Conservation Biologist',
      action: 'Individual Animal Profile Registered',
      details: `Registered individual ${ind.id}: ${ind.codeName} (${ind.speciesName}, ${ind.patternType}).`
    });
    return ind;
  }

  async deleteIndividual(id: string): Promise<boolean> {
    if (pgService.getPool()) {
      try {
        await pgService.getPool()?.query('DELETE FROM individual_animals WHERE id = $1', [id]);
      } catch (e) {}
    }
    const idx = this.fallbackIndividuals.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.fallbackIndividuals.splice(idx, 1);
    }
    return true;
  }

  // Observations
  async getObservations(filter?: {
    speciesId?: string;
    threatOnly?: boolean;
    individualId?: string;
    search?: string;
  }): Promise<WildlifeObservation[]> {
    try {
      const dbObs = await pgService.getObservations(filter);
      if (dbObs && dbObs.length > 0) return dbObs;
    } catch (e) {
      // fallback
    }
    return this.fallbackObservations.filter(obs => {
      if (filter?.speciesId && filter.speciesId !== 'All' && obs.speciesId !== filter.speciesId) return false;
      if (filter?.individualId && obs.individualId !== filter.individualId) return false;
      if (filter?.threatOnly && !obs.anomalyDetected) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        const matchesName = obs.speciesName.toLowerCase().includes(q);
        const matchesSci = obs.scientificName.toLowerCase().includes(q);
        const matchesLoc = obs.locationName.toLowerCase().includes(q);
        const matchesInd = obs.individualName?.toLowerCase().includes(q);
        if (!matchesName && !matchesSci && !matchesLoc && !matchesInd) return false;
      }
      return true;
    });
  }

  async getObservationById(id: string): Promise<WildlifeObservation | undefined> {
    const all = await this.getObservations();
    return all.find(o => o.id === id);
  }

  async addObservation(obs: WildlifeObservation): Promise<WildlifeObservation> {
    this.fallbackObservations.unshift(obs);
    try {
      await pgService.addObservation(obs);
    } catch (e: any) {
      console.warn('[DataStore] PostgreSQL persist notice, stored in memory cache:', e.message);
    }
    this.addAuditLog({
      actor: 'BioSentinel Vision Inference Engine',
      action: 'New Wildlife Observation Recorded',
      details: `Observation ${obs.id}: ${obs.speciesName} at ${obs.locationName} (${(obs.confidence * 100).toFixed(1)}% conf).`
    });
    return obs;
  }

  async deleteObservation(id: string): Promise<boolean> {
    try {
      const pool = pgService.getPool();
      if (pool) {
        await pool.query('DELETE FROM observations WHERE id = $1', [id]);
      }
    } catch (e) {
      // fallback
    }
    const idx = this.fallbackObservations.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.fallbackObservations.splice(idx, 1);
      return true;
    }
    return true;
  }

  // Anomalies
  async getAnomalies(): Promise<BehavioralAnomaly[]> {
    try {
      const dbAnoms = await pgService.getAnomalies();
      if (dbAnoms && dbAnoms.length > 0) return dbAnoms;
    } catch (e) {
      // fallback
    }
    return this.fallbackAnomalies;
  }

  async updateAnomalyStatus(id: string, status: BehavioralAnomaly['reviewStatus'], reviewerName: string): Promise<BehavioralAnomaly | null> {
    try {
      const pool = pgService.getPool();
      if (pool) {
        await pool.query(
          'UPDATE anomaly_events SET review_status = $1, reviewed_by = $2 WHERE id = $3',
          [status, reviewerName, id]
        );
      }
    } catch (e) {
      // fallback
    }
    const anom = this.fallbackAnomalies.find(a => a.id === id);
    if (anom) {
      anom.reviewStatus = status;
      anom.reviewedBy = reviewerName;
    }
    this.addAuditLog({
      actor: reviewerName,
      action: `Silent Distress Status: ${status}`,
      details: `Updated anomaly ${id}.`
    });
    return anom || null;
  }

  // Threats
  async getThreats(): Promise<ThreatRecord[]> {
    if (pgService.getPool()) {
      try {
        const dbThreats = await pgService.getThreats();
        if (dbThreats && dbThreats.length > 0) return dbThreats;
      } catch (e) {
        // fallback
      }
    }
    return this.fallbackThreats;
  }

  async updateThreat(
    id: string,
    update: {
      status?: ThreatRecord['status'];
      reviewerNotes?: string;
      reviewedBy?: string;
    }
  ): Promise<ThreatRecord | null> {
    try {
      const pool = pgService.getPool();
      if (pool) {
        await pool.query(
          'UPDATE threat_assessments SET status = COALESCE($1, status), reviewer_notes = COALESCE($2, reviewer_notes), reviewed_by = COALESCE($3, reviewed_by) WHERE id = $4',
          [update.status || null, update.reviewerNotes || null, update.reviewedBy || null, id]
        );
        if (update.status && update.reviewedBy) {
          await pool.query(
            `INSERT INTO verification_records (id, threat_id, actor, action, notes, status_applied) 
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              `VR-${Date.now()}`, id, update.reviewedBy, `Status: ${update.status}`,
              update.reviewerNotes || 'Status update logged.', update.status
            ]
          );
        }
      }
    } catch (e) {
      // fallback
    }
    const threat = this.fallbackThreats.find(t => t.id === id);
    if (threat) {
      if (update.status) threat.status = update.status;
      if (update.reviewerNotes) threat.reviewerNotes = update.reviewerNotes;
      if (update.reviewedBy) threat.reviewedBy = update.reviewedBy;
      threat.auditHistory.push({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        actor: update.reviewedBy || 'Field Reviewer',
        action: `Status: ${update.status || threat.status}`,
        notes: update.reviewerNotes || 'Status review logged.'
      });
    }
    return threat || null;
  }

  async createThreat(threat: ThreatRecord): Promise<ThreatRecord> {
    this.fallbackThreats.unshift(threat);
    try {
      const pool = pgService.getPool();
      if (pool) {
        await pool.query(
          `INSERT INTO threat_assessments (
            id, title, category, severity, status, detected_at, location_name, latitude, longitude,
            location_precision, source, evidence_image_url, evidence_audio_url, ai_explanation,
            confidence_score, reviewed_by, reviewer_notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING;`,
          [
            threat.id, threat.title, threat.category, threat.severity, threat.status,
            threat.detectedAt, threat.locationName, threat.latitude, threat.longitude,
            threat.locationPrecision, threat.source, threat.evidenceImageUrl || null,
            threat.evidenceAudioUrl || null, threat.aiExplanation, threat.confidenceScore,
            threat.reviewedBy || null, threat.reviewerNotes || null
          ]
        );
      }
    } catch (e) {
      // fallback
    }
    return threat;
  }

  async getThreatById(id: string): Promise<ThreatRecord | undefined> {
    const list = await this.getThreats();
    return list.find(t => t.id === id);
  }

  async addThreat(threat: ThreatRecord): Promise<ThreatRecord> {
    return this.createThreat(threat);
  }

  async deleteThreat(id: string): Promise<boolean> {
    if (pgService.getPool()) {
      try {
        await pgService.getPool()?.query('DELETE FROM threat_assessments WHERE id = $1', [id]);
      } catch (e) {}
    }
    const idx = this.fallbackThreats.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.fallbackThreats.splice(idx, 1);
    }
    return true;
  }

  // Acoustic
  getAcousticRecordings(): AcousticRecording[] {
    return this.acousticRecordings;
  }

  addAcousticRecording(rec: AcousticRecording): AcousticRecording {
    this.acousticRecordings.unshift(rec);
    return rec;
  }

  // Telemetry
  getTelemetry(): ModelTelemetry {
    return this.telemetry;
  }

  // Audit Logs
  async getAuditLogs() {
    try {
      const pool = pgService.getPool();
      if (pool) {
        const res = await pool.query('SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT 100');
        if (res.rows && res.rows.length > 0) {
          return res.rows.map(r => ({
            id: r.id,
            timestamp: r.timestamp?.toISOString ? r.timestamp.toISOString() : String(r.timestamp),
            actor: r.actor,
            action: r.action,
            details: r.details
          }));
        }
      }
    } catch (e) {
      // fallback
    }
    return this.auditLogs;
  }

  addAuditLog(entry: { actor: string; action: string; details: string }) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      ...entry
    });
    if (this.auditLogs.length > 100) {
      this.auditLogs.pop();
    }
  }

  async logAudit(action: string, actor: string, details: string) {
    this.addAuditLog({ actor, action, details });
  }
}

export const db = new BioDataStore();
