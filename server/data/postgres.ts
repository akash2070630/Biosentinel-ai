import pg from 'pg';
import {
  INITIAL_SPECIES,
  INITIAL_INDIVIDUALS,
  INITIAL_ANOMALIES,
  INITIAL_THREATS,
  INITIAL_OBSERVATIONS
} from '../../src/data/seedData';
import { WildlifeObservation, ThreatRecord, BehavioralAnomaly, IndividualAnimal, Species } from '../../src/types/index';

const { Pool } = pg;

export interface DBHealthInfo {
  connected: boolean;
  engine: string;
  host: string;
  database: string;
  maskedUrl: string;
  tableCount: number;
  totalObservations: number;
  latencyMs: number;
  ssl: boolean;
  error?: string;
}

// Function to safely mask database URL to prevent exposing credentials
export function getMaskedDatabaseUrl(urlStr?: string): string {
  if (!urlStr) return 'Not configured';
  try {
    const parsed = new URL(urlStr);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch (e) {
    return 'postgresql://***:***@protected-host/db';
  }
}

class PostgresService {
  private pool: pg.Pool | null = null;
  private isInitialized = false;

  constructor() {
    const rawUrl = process.env.DATABASE_URL;
    if (rawUrl) {
      this.pool = new Pool({
        connectionString: rawUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      this.pool.on('error', (err) => {
        console.error('[PostgreSQL Pool Error]:', err.message);
      });
    } else {
      console.warn('[PostgreSQL]: DATABASE_URL is not set in environment. Running with in-memory store.');
    }
  }

  getPool(): pg.Pool | null {
    return this.pool;
  }

  async testConnection(): Promise<{ success: boolean; version?: string; error?: string; latencyMs: number }> {
    if (!this.pool) {
      return { success: false, error: 'DATABASE_URL environment variable is not defined', latencyMs: 0 };
    }
    const start = Date.now();
    try {
      const res = await this.pool.query('SELECT version() as version, NOW() as server_time');
      const latencyMs = Date.now() - start;
      return { success: true, version: res.rows[0]?.version, latencyMs };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      return { success: false, error: err.message, latencyMs };
    }
  }

  async getHealthInfo(): Promise<DBHealthInfo> {
    const rawUrl = process.env.DATABASE_URL;
    const maskedUrl = getMaskedDatabaseUrl(rawUrl);
    let host = 'localhost';
    let database = 'biosentinel_db';
    if (rawUrl) {
      try {
        const u = new URL(rawUrl);
        host = u.hostname;
        database = u.pathname.replace(/^\//, '');
      } catch (e) {
        // ignore
      }
    }

    const test = await this.testConnection();
    if (!test.success) {
      return {
        connected: false,
        engine: 'PostgreSQL (Disconnected / In-Memory Active)',
        host,
        database,
        maskedUrl,
        tableCount: 8,
        totalObservations: 6,
        latencyMs: test.latencyMs,
        ssl: true,
        error: test.error
      };
    }

    let tableCount = 0;
    let totalObservations = 0;
    try {
      const tblRes = await this.pool!.query(
        "SELECT count(*) as cnt FROM information_schema.tables WHERE table_schema = 'public'"
      );
      tableCount = parseInt(tblRes.rows[0]?.cnt || '0', 10);
      const obsRes = await this.pool!.query("SELECT count(*) as cnt FROM observations");
      totalObservations = parseInt(obsRes.rows[0]?.cnt || '0', 10);
    } catch (e) {
      // table might not exist yet
    }

    return {
      connected: true,
      engine: test.version ? test.version.split(' ')[0] + ' ' + test.version.split(' ')[1] : 'PostgreSQL 18.6',
      host,
      database,
      maskedUrl,
      tableCount,
      totalObservations,
      latencyMs: test.latencyMs,
      ssl: true
    };
  }

  async initializeTables(): Promise<void> {
    if (!this.pool) return;
    if (this.isInitialized) return;
    console.log('[PostgreSQL] Initializing tables and schema migration...');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Species
      await client.query(`
        CREATE TABLE IF NOT EXISTS species (
          id VARCHAR(50) PRIMARY KEY,
          common_name VARCHAR(100) NOT NULL,
          scientific_name VARCHAR(150) NOT NULL UNIQUE,
          iucn_status VARCHAR(50) NOT NULL,
          population_estimate VARCHAR(100) NOT NULL,
          trend VARCHAR(30) NOT NULL,
          threats JSONB NOT NULL DEFAULT '[]'::jsonb,
          habitat TEXT NOT NULL,
          range_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
          re_identification_method TEXT NOT NULL,
          acoustic_features TEXT NOT NULL,
          image_url TEXT NOT NULL,
          photographer_credit VARCHAR(150) NOT NULL,
          description TEXT NOT NULL,
          vital_stats JSONB NOT NULL DEFAULT '{}'::jsonb
        );
      `);

      // 2. Individual Animals
      await client.query(`
        CREATE TABLE IF NOT EXISTS individual_animals (
          id VARCHAR(50) PRIMARY KEY,
          code_name VARCHAR(100) NOT NULL,
          species_id VARCHAR(50) REFERENCES species(id) ON DELETE CASCADE,
          sex VARCHAR(20) NOT NULL DEFAULT 'Unknown',
          estimated_age_years INT,
          first_sighted_date VARCHAR(50) NOT NULL,
          last_sighted_date VARCHAR(50) NOT NULL,
          sighting_count INT NOT NULL DEFAULT 1,
          primary_territory VARCHAR(255) NOT NULL,
          pattern_type VARCHAR(100) NOT NULL,
          distinctive_features JSONB NOT NULL DEFAULT '[]'::jsonb,
          fingerprint_image_url TEXT NOT NULL,
          re_id_match_confidence FLOAT NOT NULL DEFAULT 0.0,
          status VARCHAR(50) NOT NULL DEFAULT 'Active Monitoring',
          baseline_sighting_frequency_weekly FLOAT NOT NULL DEFAULT 1.0,
          baseline_diurnal_ratio FLOAT NOT NULL DEFAULT 0.5
        );
      `);

      // 3. Observations
      await client.query(`
        CREATE TABLE IF NOT EXISTS observations (
          id VARCHAR(50) PRIMARY KEY,
          species_id VARCHAR(50) REFERENCES species(id) ON DELETE CASCADE,
          individual_id VARCHAR(50) REFERENCES individual_animals(id) ON DELETE SET NULL,
          observed_at VARCHAR(50) NOT NULL,
          location_name VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          is_fuzzed_coordinates BOOLEAN DEFAULT FALSE,
          camera_trap_id VARCHAR(100) NOT NULL,
          image_url TEXT NOT NULL,
          thumbnail_url TEXT,
          confidence FLOAT NOT NULL,
          model_used VARCHAR(150) NOT NULL,
          is_demo_data BOOLEAN DEFAULT FALSE,
          is_verified BOOLEAN DEFAULT FALSE,
          verified_by VARCHAR(100),
          verified_at VARCHAR(50),
          re_id_score FLOAT,
          anomaly_detected BOOLEAN DEFAULT FALSE,
          environmental_conditions JSONB,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Evidence (Bounding Boxes)
      await client.query(`
        CREATE TABLE IF NOT EXISTS evidence (
          id VARCHAR(50) PRIMARY KEY,
          observation_id VARCHAR(50) REFERENCES observations(id) ON DELETE CASCADE,
          evidence_type VARCHAR(50) NOT NULL,
          box_ymin INT,
          box_xmin INT,
          box_ymax INT,
          box_xmax INT,
          label VARCHAR(100) NOT NULL,
          confidence FLOAT NOT NULL,
          visual_features JSONB DEFAULT '[]'::jsonb,
          raw_evidence_url TEXT,
          notes TEXT
        );
      `);

      // 5. Anomaly Events
      await client.query(`
        CREATE TABLE IF NOT EXISTS anomaly_events (
          id VARCHAR(50) PRIMARY KEY,
          individual_id VARCHAR(50) REFERENCES individual_animals(id) ON DELETE CASCADE,
          observation_id VARCHAR(50) REFERENCES observations(id) ON DELETE SET NULL,
          detection_date VARCHAR(50) NOT NULL,
          anomaly_score INT NOT NULL,
          severity VARCHAR(30) NOT NULL,
          anomaly_type VARCHAR(100) NOT NULL,
          triggered_features JSONB NOT NULL DEFAULT '[]'::jsonb,
          supporting_evidence TEXT NOT NULL,
          insufficient_baseline BOOLEAN DEFAULT FALSE,
          scientific_disclaimer TEXT NOT NULL,
          reviewed_by VARCHAR(100),
          review_status VARCHAR(50) NOT NULL DEFAULT 'Pending Review'
        );
      `);

      // 6. Threat Assessments
      await client.query(`
        CREATE TABLE IF NOT EXISTS threat_assessments (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          severity VARCHAR(30) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Unverified AI Indicator',
          detected_at VARCHAR(50) NOT NULL,
          location_name VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          location_precision VARCHAR(50) DEFAULT 'Exact (Protected)',
          source VARCHAR(100) NOT NULL,
          evidence_image_url TEXT,
          evidence_audio_url TEXT,
          ai_explanation TEXT NOT NULL,
          confidence_score FLOAT NOT NULL,
          reviewed_by VARCHAR(100),
          reviewer_notes TEXT
        );
      `);

      // 7. Verification Records
      await client.query(`
        CREATE TABLE IF NOT EXISTS verification_records (
          id VARCHAR(50) PRIMARY KEY,
          threat_id VARCHAR(50) REFERENCES threat_assessments(id) ON DELETE CASCADE,
          actor VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          notes TEXT NOT NULL,
          status_applied VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 8. Audit Events
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_events (
          id VARCHAR(50) PRIMARY KEY,
          actor VARCHAR(100) NOT NULL,
          action VARCHAR(150) NOT NULL,
          entity_type VARCHAR(50),
          entity_id VARCHAR(50),
          details TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query('COMMIT');
      console.log('[PostgreSQL] Database tables verified & created successfully.');

      // Run initial seed with ON CONFLICT DO NOTHING for any unpopulated tables
      await this.seedInitialData(client);
      this.isInitialized = true;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL] Table migration error:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  private async seedInitialData(client: pg.PoolClient): Promise<void> {
    // 1. Seed Species
    for (const s of INITIAL_SPECIES) {
      await client.query(
        `INSERT INTO species (
          id, common_name, scientific_name, iucn_status, population_estimate, trend,
          threats, habitat, range_countries, re_identification_method, acoustic_features,
          image_url, photographer_credit, description, vital_stats
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO NOTHING;`,
        [
          s.id, s.commonName, s.scientificName, s.iucnStatus, s.populationEstimate, s.trend,
          JSON.stringify(s.threats), s.habitat, JSON.stringify(s.rangeCountries),
          s.reIdentificationMethod, s.acousticFeatures, s.imageUrl, s.photographerCredit,
          s.description, JSON.stringify(s.vitalStats)
        ]
      );
    }

    // 2. Seed Individuals
    for (const ind of INITIAL_INDIVIDUALS) {
      await client.query(
        `INSERT INTO individual_animals (
          id, code_name, species_id, sex, estimated_age_years, first_sighted_date,
          last_sighted_date, sighting_count, primary_territory, pattern_type,
          distinctive_features, fingerprint_image_url, re_id_match_confidence,
          status, baseline_sighting_frequency_weekly, baseline_diurnal_ratio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING;`,
        [
          ind.id, ind.codeName, ind.speciesId, ind.sex, ind.estimatedAgeYears,
          ind.firstSightedDate, ind.lastSightedDate, ind.sightingCount, ind.primaryTerritory,
          ind.patternType, JSON.stringify(ind.distinctiveFeatures), ind.fingerprintImageUrl,
          ind.reIdMatchConfidence, ind.status, ind.baselineSightingFrequencyWeekly, ind.baselineDiurnalRatio
        ]
      );
    }

    // 3. Seed Observations and Evidence
    for (const obs of INITIAL_OBSERVATIONS) {
      await client.query(
        `INSERT INTO observations (
          id, species_id, individual_id, observed_at, location_name, latitude, longitude,
          is_fuzzed_coordinates, camera_trap_id, image_url, confidence, model_used,
          is_demo_data, is_verified, verified_by, verified_at, re_id_score,
          anomaly_detected, environmental_conditions, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO NOTHING;`,
        [
          obs.id, obs.speciesId, obs.individualId || null, obs.observedAt, obs.locationName,
          obs.latitude, obs.longitude, !!obs.isFuzzedCoordinates, obs.cameraTrapId,
          obs.imageUrl, obs.confidence, obs.modelUsed, obs.isDemoData, obs.isVerified,
          obs.verifiedBy || null, obs.verifiedAt || null, obs.reIdScore || null,
          obs.anomalyDetected || false, JSON.stringify(obs.environmentalConditions || {}), obs.notes || ''
        ]
      );

      // Add bounding boxes
      for (const box of obs.boundingBoxes) {
        await client.query(
          `INSERT INTO evidence (
            id, observation_id, evidence_type, box_ymin, box_xmin, box_ymax, box_xmax,
            label, confidence, visual_features
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING;`,
          [
            box.id, obs.id, 'Visual Bounding Box', box.ymin, box.xmin, box.ymax, box.xmax,
            box.label, box.confidence, JSON.stringify(box.visualFeatures || [])
          ]
        );
      }
    }

    // 4. Seed Anomalies
    for (const anom of INITIAL_ANOMALIES) {
      const obsCheck = await client.query('SELECT id FROM observations WHERE id = $1', [anom.observationId]);
      const validObsId = obsCheck.rows.length > 0 ? anom.observationId : null;
      await client.query(
        `INSERT INTO anomaly_events (
          id, individual_id, observation_id, detection_date, anomaly_score, severity,
          anomaly_type, triggered_features, supporting_evidence, insufficient_baseline,
          scientific_disclaimer, reviewed_by, review_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING;`,
        [
          anom.id, anom.individualId, validObsId, anom.detectionDate, anom.anomalyScore,
          anom.severity, anom.anomalyType, JSON.stringify(anom.triggeredFeatures),
          anom.supportingEvidence, anom.insufficientBaseline, anom.scientificDisclaimer,
          anom.reviewedBy || null, anom.reviewStatus
        ]
      );
    }

    // 5. Seed Threats & Verification Records
    for (const thr of INITIAL_THREATS) {
      await client.query(
        `INSERT INTO threat_assessments (
          id, title, category, severity, status, detected_at, location_name, latitude, longitude,
          location_precision, source, evidence_image_url, evidence_audio_url, ai_explanation,
          confidence_score, reviewed_by, reviewer_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO NOTHING;`,
        [
          thr.id, thr.title, thr.category, thr.severity, thr.status, thr.detectedAt, thr.locationName,
          thr.latitude, thr.longitude, thr.locationPrecision, thr.source, thr.evidenceImageUrl || null,
          thr.evidenceAudioUrl || null, thr.aiExplanation, thr.confidenceScore, thr.reviewedBy || null,
          thr.reviewerNotes || null
        ]
      );
      for (const item of thr.auditHistory) {
        await client.query(
          `INSERT INTO verification_records (
            id, threat_id, actor, action, notes, status_applied
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING;`,
          [
            `VR-${Math.random().toString(36).substring(2, 8)}`,
            thr.id, item.actor, item.action, item.notes, thr.status
          ]
        );
      }
    }

    // 6. Seed Audit Event
    await client.query(`
      INSERT INTO audit_events (id, actor, action, entity_type, entity_id, details)
      VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      `AUD-${Date.now()}`, 'BioSentinel System Bootstrapper', 'Database Schema Provisioned & Seeded',
      'Database', 'PostgreSQL', 'Initial verified endangered species catalog and demonstration baseline initialized.'
    ]);
  }

  // Database operations
  async getObservations(filter?: { speciesId?: string; individualId?: string; threatOnly?: boolean; search?: string }): Promise<WildlifeObservation[]> {
    if (!this.pool) return [];
    let query = `
      SELECT o.*, 
             s.common_name as species_name, s.scientific_name, s.iucn_status as conservation_status,
             ind.code_name as individual_name,
             COALESCE(json_agg(json_build_object(
               'id', e.id,
               'ymin', e.box_ymin,
               'xmin', e.box_xmin,
               'ymax', e.box_ymax,
               'xmax', e.box_xmax,
               'label', e.label,
               'confidence', e.confidence,
               'visualFeatures', e.visual_features
             )) FILTER (WHERE e.id IS NOT NULL), '[]') as bounding_boxes
      FROM observations o
      LEFT JOIN species s ON o.species_id = s.id
      LEFT JOIN individual_animals ind ON o.individual_id = ind.id
      LEFT JOIN evidence e ON o.id = e.observation_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (filter?.speciesId && filter.speciesId !== 'All') {
      params.push(filter.speciesId);
      query += ` AND o.species_id = $${params.length}`;
    }
    if (filter?.individualId) {
      params.push(filter.individualId);
      query += ` AND o.individual_id = $${params.length}`;
    }
    if (filter?.threatOnly) {
      query += ` AND o.anomaly_detected = TRUE`;
    }
    if (filter?.search) {
      params.push(`%${filter.search.toLowerCase()}%`);
      query += ` AND (LOWER(s.common_name) LIKE $${params.length} OR LOWER(s.scientific_name) LIKE $${params.length} OR LOWER(o.location_name) LIKE $${params.length} OR LOWER(ind.code_name) LIKE $${params.length})`;
    }

    query += ` GROUP BY o.id, s.common_name, s.scientific_name, s.iucn_status, ind.code_name ORDER BY o.created_at DESC`;

    const res = await this.pool.query(query, params);
    return res.rows.map(r => ({
      id: r.id,
      speciesId: r.species_id,
      speciesName: r.species_name || 'Endangered Species',
      scientificName: r.scientific_name || '',
      conservationStatus: r.conservation_status || 'Endangered',
      observedAt: r.observed_at,
      locationName: r.location_name,
      latitude: r.latitude,
      longitude: r.longitude,
      isFuzzedCoordinates: r.is_fuzzed_coordinates,
      cameraTrapId: r.camera_trap_id,
      imageUrl: r.image_url,
      thumbnailUrl: r.thumbnail_url,
      confidence: r.confidence,
      modelUsed: r.model_used,
      isDemoData: r.is_demo_data,
      isVerified: r.is_verified,
      verifiedBy: r.verified_by,
      verifiedAt: r.verified_at,
      reIdScore: r.re_id_score,
      anomalyDetected: r.anomaly_detected,
      environmentalConditions: r.environmental_conditions,
      notes: r.notes,
      boundingBoxes: r.bounding_boxes || []
    }));
  }

  async addObservation(obs: WildlifeObservation): Promise<WildlifeObservation> {
    if (!this.pool) return obs;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Resolve species_id to ensure foreign key constraint is satisfied
      let targetSpeciesId = obs.speciesId;
      const spCheck = await client.query('SELECT id FROM species WHERE id = $1', [targetSpeciesId]);
      if (spCheck.rows.length === 0) {
        // Try resolving by common name or scientific name
        const spByName = await client.query(
          'SELECT id FROM species WHERE LOWER(common_name) = LOWER($1) OR LOWER(scientific_name) = LOWER($2)',
          [obs.speciesName || '', obs.scientificName || '']
        );
        if (spByName.rows.length > 0) {
          targetSpeciesId = spByName.rows[0].id;
        } else {
          // Create new species entry if not yet in database
          const newSpId = `sp-${(obs.speciesName || 'wildlife').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
          await client.query(
            `INSERT INTO species (
              id, common_name, scientific_name, iucn_status, population_estimate, trend,
              threats, habitat, range_countries, re_identification_method, acoustic_features,
              image_url, photographer_credit, description, vital_stats
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (scientific_name) DO UPDATE SET common_name = EXCLUDED.common_name
            RETURNING id;`,
            [
              newSpId,
              obs.speciesName || 'Unidentified Wildlife',
              obs.scientificName || `${obs.speciesName || 'Fauna'} sp.`,
              obs.conservationStatus || 'Endangered',
              'Under Field Ecological Survey',
              'Unknown',
              JSON.stringify(['Habitat fragmentation', 'Poaching pressure']),
              'Terrestrial / Forest Reserve',
              JSON.stringify([]),
              'Visual morphometric recognition',
              'Bio-acoustic signature monitoring',
              obs.imageUrl || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
              'Camera Trap Surveillance Network',
              `Field observation of ${obs.speciesName || 'wildlife'} analyzed by BioSentinel AI Vision inference.`,
              JSON.stringify({})
            ]
          );
          targetSpeciesId = newSpId;
        }
      }

      // 2. Validate individual_id if supplied
      let targetIndividualId: string | null = null;
      if (obs.individualId) {
        const indCheck = await client.query('SELECT id FROM individual_animals WHERE id = $1', [obs.individualId]);
        if (indCheck.rows.length > 0) {
          targetIndividualId = obs.individualId;
        }
      }

      // 3. Insert or update observation record
      await client.query(
        `INSERT INTO observations (
          id, species_id, individual_id, observed_at, location_name, latitude, longitude,
          is_fuzzed_coordinates, camera_trap_id, image_url, confidence, model_used,
          is_demo_data, is_verified, verified_by, verified_at, re_id_score,
          anomaly_detected, environmental_conditions, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO UPDATE SET
          is_verified = EXCLUDED.is_verified,
          verified_by = EXCLUDED.verified_by,
          notes = EXCLUDED.notes;`,
        [
          obs.id, targetSpeciesId, targetIndividualId, obs.observedAt, obs.locationName,
          obs.latitude, obs.longitude, !!obs.isFuzzedCoordinates, obs.cameraTrapId,
          obs.imageUrl, obs.confidence, obs.modelUsed, obs.isDemoData, obs.isVerified,
          obs.verifiedBy || null, obs.verifiedAt || null, obs.reIdScore || null,
          obs.anomalyDetected || false, JSON.stringify(obs.environmentalConditions || {}), obs.notes || ''
        ]
      );

      // 4. Insert bounding box evidence
      if (obs.boundingBoxes && obs.boundingBoxes.length > 0) {
        for (const b of obs.boundingBoxes) {
          await client.query(
            `INSERT INTO evidence (
              id, observation_id, evidence_type, box_ymin, box_xmin, box_ymax, box_xmax,
              label, confidence, visual_features
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING;`,
            [
              b.id, obs.id, 'Visual Bounding Box', b.ymin, b.xmin, b.ymax, b.xmax,
              b.label, b.confidence, JSON.stringify(b.visualFeatures || [])
            ]
          );
        }
      }

      // 5. Update individual sighting count if individual was matched
      if (targetIndividualId) {
        await client.query(
          `UPDATE individual_animals 
           SET sighting_count = sighting_count + 1, last_sighted_date = $1 
           WHERE id = $2;`,
          [obs.observedAt.split(' ')[0], targetIndividualId]
        );
      }

      // 6. Record audit event
      await client.query(
        `INSERT INTO audit_events (id, actor, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          `AUD-${Date.now()}`,
          'BioSentinel Vision Inference Engine',
          'Observation Persisted to PostgreSQL',
          'Observation',
          obs.id,
          `Persisted ${obs.speciesName} observation (${(obs.confidence * 100).toFixed(1)}% confidence) at ${obs.locationName}.`
        ]
      );

      await client.query('COMMIT');
      return { ...obs, speciesId: targetSpeciesId, individualId: targetIndividualId || undefined };
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL] addObservation failed:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async addIndividual(ind: IndividualAnimal): Promise<IndividualAnimal> {
    if (!this.pool) return ind;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO individual_animals (
          id, code_name, species_id, sex, estimated_age_years, first_sighted_date,
          last_sighted_date, sighting_count, primary_territory, pattern_type,
          distinctive_features, fingerprint_image_url, re_id_match_confidence,
          status, baseline_sighting_frequency_weekly, baseline_diurnal_ratio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          sighting_count = EXCLUDED.sighting_count,
          last_sighted_date = EXCLUDED.last_sighted_date,
          status = EXCLUDED.status;`,
        [
          ind.id, ind.codeName, ind.speciesId, ind.sex, ind.estimatedAgeYears,
          ind.firstSightedDate, ind.lastSightedDate, ind.sightingCount, ind.primaryTerritory,
          ind.patternType, JSON.stringify(ind.distinctiveFeatures || []), ind.fingerprintImageUrl,
          ind.reIdMatchConfidence, ind.status, ind.baselineSightingFrequencyWeekly, ind.baselineDiurnalRatio
        ]
      );
      await client.query(
        `INSERT INTO audit_events (id, actor, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [
          `AUD-${Date.now()}`,
          'Conservation Registry Gateway',
          'Individual Animal Cataloged',
          'IndividualAnimal',
          ind.id,
          `Registered ${ind.codeName} (${ind.speciesName}) with pattern type ${ind.patternType}.`
        ]
      );
      await client.query('COMMIT');
      return ind;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL] addIndividual failed:', err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async getSpecies(): Promise<Species[]> {
    if (!this.pool) return INITIAL_SPECIES;
    const res = await this.pool.query('SELECT * FROM species ORDER BY common_name ASC');
    return res.rows.map(r => ({
      id: r.id,
      commonName: r.common_name,
      scientificName: r.scientific_name,
      iucnStatus: r.iucn_status,
      populationEstimate: r.population_estimate,
      trend: r.trend,
      threats: r.threats || [],
      habitat: r.habitat,
      rangeCountries: r.range_countries || [],
      reIdentificationMethod: r.re_identification_method,
      acousticFeatures: r.acoustic_features,
      imageUrl: r.image_url,
      photographerCredit: r.photographer_credit,
      description: r.description,
      vitalStats: r.vital_stats || {}
    }));
  }

  async getIndividuals(): Promise<IndividualAnimal[]> {
    if (!this.pool) return INITIAL_INDIVIDUALS;
    const res = await this.pool.query(`
      SELECT ind.*, s.common_name as species_name
      FROM individual_animals ind
      LEFT JOIN species s ON ind.species_id = s.id
      ORDER BY ind.code_name ASC
    `);
    return res.rows.map(r => ({
      id: r.id,
      codeName: r.code_name,
      speciesId: r.species_id,
      speciesName: r.species_name || 'Flagship Species',
      sex: r.sex,
      estimatedAgeYears: r.estimated_age_years,
      firstSightedDate: r.first_sighted_date,
      lastSightedDate: r.last_sighted_date,
      sightingCount: r.sighting_count,
      primaryTerritory: r.primary_territory,
      patternType: r.pattern_type,
      distinctiveFeatures: r.distinctive_features || [],
      fingerprintImageUrl: r.fingerprint_image_url,
      reIdMatchConfidence: r.re_id_match_confidence,
      status: r.status,
      baselineSightingFrequencyWeekly: r.baseline_sighting_frequency_weekly,
      baselineDiurnalRatio: r.baseline_diurnal_ratio
    }));
  }

  async getAnomalies(): Promise<BehavioralAnomaly[]> {
    if (!this.pool) return INITIAL_ANOMALIES;
    const res = await this.pool.query(`
      SELECT a.*, ind.code_name as individual_name, s.common_name as species_name
      FROM anomaly_events a
      LEFT JOIN individual_animals ind ON a.individual_id = ind.id
      LEFT JOIN species s ON ind.species_id = s.id
      ORDER BY a.anomaly_score DESC
    `);
    return res.rows.map(r => ({
      id: r.id,
      individualId: r.individual_id,
      individualName: r.individual_name || 'Flagged Animal',
      speciesName: r.species_name || 'Endangered Species',
      observationId: r.observation_id,
      detectionDate: r.detection_date,
      anomalyScore: r.anomaly_score,
      severity: r.severity,
      anomalyType: r.anomaly_type,
      triggeredFeatures: r.triggered_features || [],
      supportingEvidence: r.supporting_evidence,
      insufficientBaseline: r.insufficient_baseline,
      scientificDisclaimer: r.scientific_disclaimer,
      reviewedBy: r.reviewed_by,
      reviewStatus: r.review_status
    }));
  }

  async getThreats(): Promise<ThreatRecord[]> {
    if (!this.pool) return INITIAL_THREATS;
    const res = await this.pool.query(`
      SELECT t.*, 
             COALESCE(json_agg(json_build_object(
               'timestamp', vr.created_at,
               'actor', vr.actor,
               'action', vr.action,
               'notes', vr.notes
             )) FILTER (WHERE vr.id IS NOT NULL), '[]') as audit_history
      FROM threat_assessments t
      LEFT JOIN verification_records vr ON t.id = vr.threat_id
      GROUP BY t.id
      ORDER BY t.detected_at DESC
    `);
    return res.rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      severity: r.severity,
      status: r.status,
      detectedAt: r.detected_at,
      locationName: r.location_name,
      latitude: r.latitude,
      longitude: r.longitude,
      locationPrecision: r.location_precision,
      source: r.source,
      evidenceImageUrl: r.evidence_image_url,
      evidenceAudioUrl: r.evidence_audio_url,
      aiExplanation: r.ai_explanation,
      confidenceScore: r.confidence_score,
      reviewedBy: r.reviewed_by,
      reviewerNotes: r.reviewer_notes,
      auditHistory: r.audit_history || []
    }));
  }
}

export const pgService = new PostgresService();
