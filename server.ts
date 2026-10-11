import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/data/store';
import {
  detectWildlifeInImage,
  classifyAcousticAudio,
  reIdentifyIndividual,
  evaluateIndividualSilentDistress,
  analyzeUploadedAudio
} from './server/services/aiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsed = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const parsed = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

const PORT = resolvePort();
const app = express();

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Health endpoint - securely reports PostgreSQL and system health without exposing credentials
app.get('/api/health', async (req, res) => {
  try {
    const telemetry = db.getTelemetry();
    const dbHealth = await db.getHealthInfo();
    res.json({
      status: dbHealth.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      telemetry,
      database: dbHealth
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

// Species endpoints
app.get('/api/species', async (req, res) => {
  try {
    const species = await db.getSpecies();
    res.json(species);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/species/:id', async (req, res) => {
  try {
    const species = await db.getSpeciesById(req.params.id);
    if (!species) return res.status(404).json({ error: 'Species not found' });
    res.json(species);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Individuals endpoints
app.get('/api/individuals', async (req, res) => {
  try {
    const individuals = await db.getIndividuals();
    res.json(individuals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/individuals/:id', async (req, res) => {
  try {
    const individual = await db.getIndividualById(req.params.id);
    if (!individual) return res.status(404).json({ error: 'Individual animal not found' });
    res.json(individual);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/individuals', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.codeName || !payload.speciesId) {
      return res.status(400).json({ error: 'Missing required fields: codeName and speciesId are required.' });
    }
    const created = await db.addIndividual({
      id: payload.id || `IND-${Date.now().toString().slice(-4)}`,
      codeName: payload.codeName,
      speciesId: payload.speciesId,
      speciesName: payload.speciesName || 'Flagship Species',
      sex: payload.sex || 'Unknown',
      estimatedAgeYears: payload.estimatedAgeYears || 5,
      firstSightedDate: payload.firstSightedDate || new Date().toISOString().split('T')[0],
      lastSightedDate: payload.lastSightedDate || new Date().toISOString().split('T')[0],
      sightingCount: payload.sightingCount || 1,
      primaryTerritory: payload.primaryTerritory || 'Core Protected Reserve',
      patternType: payload.patternType || 'Stripe Geometry',
      distinctiveFeatures: payload.distinctiveFeatures || [],
      fingerprintImageUrl: payload.fingerprintImageUrl || 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
      reIdMatchConfidence: payload.reIdMatchConfidence || 90.0,
      status: payload.status || 'Active Monitoring',
      baselineSightingFrequencyWeekly: payload.baselineSightingFrequencyWeekly || 1.0,
      baselineDiurnalRatio: payload.baselineDiurnalRatio || 0.5
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to register individual animal' });
  }
});

// Observations endpoints
app.get('/api/observations', async (req, res) => {
  try {
    const { speciesId, individualId, threatOnly, search } = req.query;
    const observations = await db.getObservations({
      speciesId: speciesId as string | undefined,
      individualId: individualId as string | undefined,
      threatOnly: threatOnly === 'true',
      search: search as string | undefined,
    });
    res.json(observations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/observations/:id', async (req, res) => {
  try {
    const obs = await db.getObservationById(req.params.id);
    if (!obs) return res.status(404).json({ error: 'Observation not found' });
    res.json(obs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/observations', async (req, res) => {
  try {
    const newObs = await db.addObservation(req.body);
    res.status(201).json(newObs);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create observation' });
  }
});

app.delete('/api/observations/:id', async (req, res) => {
  try {
    const success = await db.deleteObservation(req.params.id);
    if (success) {
      res.json({ message: 'Observation archived successfully' });
    } else {
      res.status(404).json({ error: 'Observation not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Silent Distress (Behavioral Anomalies)
app.get('/api/silent-distress', async (req, res) => {
  try {
    const anomalies = await db.getAnomalies();
    res.json(anomalies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/silent-distress/:id', async (req, res) => {
  try {
    const { status, reviewerName } = req.body;
    const updated = await db.updateAnomalyStatus(req.params.id, status, reviewerName || 'Verified Biologist');
    if (!updated) return res.status(404).json({ error: 'Anomaly record not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Threat Intelligence
app.get('/api/threats', async (req, res) => {
  try {
    const threats = await db.getThreats();
    res.json(threats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/threats', async (req, res) => {
  try {
    const created = await db.createThreat(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/threats/:id', async (req, res) => {
  try {
    const { status, reviewerNotes, reviewedBy } = req.body;
    const updated = await db.updateThreat(req.params.id, { status, reviewerNotes, reviewedBy });
    if (!updated) return res.status(404).json({ error: 'Threat record not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Acoustic Monitoring
app.get('/api/acoustic', (req, res) => {
  res.json(db.getAcousticRecordings());
});

app.post('/api/acoustic/analyze', async (req, res) => {
  try {
    const { textDescription, fileName } = req.body;
    const result = await classifyAcousticAudio(textDescription || '', fileName || 'recording.wav');
    
    // Save recording to store
    const newRec = db.addAcousticRecording({
      id: `AC-${Date.now()}`,
      title: `${result.soundCategory} (${fileName || 'Field Capture'})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      sensorNodeId: 'AUDIO-SENTINEL-ONLINE',
      locationName: 'Active Field Corridor',
      durationSeconds: 15,
      soundCategory: result.soundCategory,
      speciesCandidate: result.speciesCandidate,
      confidence: result.confidence,
      frequencyRangeHz: result.frequencyRangeHz,
      isThreatIndicator: result.isThreatIndicator,
      explanation: result.explanation,
      waveformSnippet: [0.12, 0.45, 0.78, 0.92, 0.84, 0.53, 0.31, 0.18, 0.42, 0.89, 0.65, 0.23],
    });

    res.json({ result, record: newRec });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Acoustic classification failed' });
  }
});

// Silent Distress Evaluation Endpoint
app.post('/api/silent-distress/evaluate', async (req, res) => {
  try {
    const { individualId } = req.body;
    if (!individualId) return res.status(400).json({ error: 'individualId is required' });
    const result = await evaluateIndividualSilentDistress(individualId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// AI Vision Detection Endpoint
app.post('/api/ai/detect', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
      return res.status(400).json({ error: 'Image data must be provided as a valid non-empty string.' });
    }
    const detection = await detectWildlifeInImage(imageBase64, mimeType || 'image/jpeg');
    res.json(detection);
  } catch (err: any) {
    console.error('Detection error:', err);
    const msg = err.message || 'Vision inference failed';
    const isClientError = msg.includes('Unsupported image format') ||
      msg.includes('exceeds the maximum allowed file size') ||
      msg.includes('Image data payload is empty') ||
      msg.includes('Image data must be provided');
    res.status(isClientError ? 400 : 500).json({ error: msg });
  }
});

// Individual Re-Identification Endpoint
app.post('/api/ai/re-identify', async (req, res) => {
  try {
    const { imageBase64, mimeType, speciesHint } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
      return res.status(400).json({ error: 'imageBase64 must be provided as a non-empty string.' });
    }
    const result = await reIdentifyIndividual(imageBase64, mimeType || 'image/jpeg', speciesHint);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Audio File Analysis Endpoint (Gemini 3.8 Flash Multimodal Audio)
app.post('/api/ai/audio-detect', async (req, res) => {
  try {
    const { audioBase64, mimeType, fileName } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string' || audioBase64.trim().length === 0) {
      return res.status(400).json({ error: 'audioBase64 payload must be provided as a non-empty string.' });
    }
    const result = await analyzeUploadedAudio(audioBase64, mimeType || 'audio/wav', fileName || 'recording.wav');
    
    // Save recording to store
    const newRec = db.addAcousticRecording({
      id: `AC-${Date.now()}`,
      title: `${result.soundCategory} (${fileName || 'Uploaded Audio'})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      sensorNodeId: 'AUDIO-SENTINEL-LIVE',
      locationName: 'Acoustic Grid Sensor #09',
      durationSeconds: 15,
      soundCategory: result.soundCategory,
      speciesCandidate: result.speciesCandidate,
      confidence: result.confidence,
      frequencyRangeHz: result.frequencyRangeHz,
      isThreatIndicator: result.isThreatIndicator,
      explanation: result.explanation,
      waveformSnippet: [0.15, 0.32, 0.65, 0.88, 0.94, 0.72, 0.45, 0.28, 0.55, 0.82, 0.76, 0.38]
    });

    res.json({ result, record: newRec });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Telemetry & System
app.get('/api/telemetry', (req, res) => {
  res.json(db.getTelemetry());
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export Endpoint
app.get('/api/export/csv', async (req, res) => {
  const type = req.query.type || 'observations';
  if (type === 'observations') {
    const observations = await db.getObservations();
    const headers = ['ID', 'Species', 'Scientific Name', 'IUCN Status', 'Date', 'Location', 'Latitude', 'Longitude', 'Confidence', 'Individual ID', 'Anomaly Flagged', 'Verified'];
    const rows = observations.map(o => [
      o.id,
      `"${o.speciesName}"`,
      `"${o.scientificName}"`,
      `"${o.conservationStatus}"`,
      `"${o.observedAt}"`,
      `"${o.locationName}"`,
      o.latitude,
      o.longitude,
      (o.confidence * 100).toFixed(1) + '%',
      o.individualName || 'None',
      o.anomalyDetected ? 'YES' : 'NO',
      o.isVerified ? 'YES' : 'NO'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="biosentinel_wildlife_observations.csv"');
    return res.send(csvContent);
  }
  if (type === 'threats') {
    const threats = await db.getThreats();
    const headers = ['ID', 'Title', 'Category', 'Severity', 'Status', 'Detected At', 'Location', 'Confidence', 'Reviewed By'];
    const rows = threats.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.severity,
      t.status,
      `"${t.detectedAt}"`,
      `"${t.locationName}"`,
      (t.confidenceScore * 100).toFixed(1) + '%',
      `"${t.reviewedBy || 'Unassigned'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="biosentinel_threat_records.csv"');
    return res.send(csvContent);
  }
  res.status(400).json({ error: 'Unsupported export type' });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize database schema
  try {
    await db.init();
  } catch (err: any) {
    console.error('[Server] Database initialization error:', err.message);
  }

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BioSentinel AI] Core Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
