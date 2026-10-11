import dotenv from 'dotenv';
dotenv.config();
import { detectWildlifeInImage } from '../server/services/aiService';
import { db } from '../server/data/store';
import { WildlifeObservation } from '../src/types/index';

async function runEndToEnd() {
  console.log('=== BioSentinel AI Phase 2 End-to-End Verification ===\n');

  // STEP 1: Fetch Real Camera Trap Image & Run Genuine Gemini 3.8 Flash Inference
  console.log('[1/4] Running genuine multimodal vision inference with Gemini 3.8 Flash...');
  const testImgUrl = 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80';
  const imgResp = await fetch(testImgUrl);
  if (!imgResp.ok) throw new Error('Failed to fetch test wildlife photograph');
  const buffer = await imgResp.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const detection = await detectWildlifeInImage(base64, 'image/jpeg');
  console.log('Detection Result:', {
    detected: detection.detected,
    speciesName: detection.speciesName,
    scientificName: detection.scientificName,
    conservationStatus: detection.conservationStatus,
    confidence: `${(detection.confidence * 100).toFixed(1)}%`,
    isUncertain: detection.isUncertain,
    modelUsed: detection.modelUsed,
    boundingBoxCount: detection.boundingBoxes.length,
    coordinates: detection.boundingBoxes[0]
      ? `ymin:${detection.boundingBoxes[0].ymin}, xmin:${detection.boundingBoxes[0].xmin}, ymax:${detection.boundingBoxes[0].ymax}, xmax:${detection.boundingBoxes[0].xmax}`
      : 'None'
  });

  // STEP 2: Human Review & Persistence to Database
  console.log('\n[2/4] Simulating human ecologist confirmation and database persistence...');
  const obsId = `OBS-E2E-${Date.now().toString().slice(-4)}`;
  const observation: WildlifeObservation = {
    id: obsId,
    speciesId: 'sp-tiger',
    speciesName: detection.speciesName,
    scientificName: detection.scientificName,
    conservationStatus: detection.conservationStatus,
    observedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    locationName: 'Sundarbans Mangrove Reserve - Core Block C2',
    latitude: 21.9497,
    longitude: 89.1833,
    cameraTrapId: 'CT-E2E-01',
    imageUrl: testImgUrl,
    confidence: detection.confidence,
    modelUsed: detection.modelUsed,
    isDemoData: false,
    isVerified: true,
    verifiedBy: 'Lead Ecologist Dr. Evelyn Reed',
    verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    boundingBoxes: detection.boundingBoxes,
    individualId: detection.individualCandidate?.individualId,
    individualName: detection.individualCandidate?.individualName,
    reIdScore: detection.individualCandidate?.reIdConfidence,
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 26,
      weather: 'Clear Ambient Sensor Field',
      timeOfDay: 'Day'
    },
    notes: `Model identified diagnostic markers: ${detection.explanation}`
  };

  const saved = await db.addObservation(observation);
  console.log(`Successfully persisted observation ID: ${saved.id}`);

  // STEP 3: Retrieve Saved Observation & Validate Evidence Linkage
  console.log('\n[3/4] Querying database to verify observation and evidence table records...');
  const retrieved = await db.getObservationById(obsId);
  if (!retrieved) throw new Error(`Observation ${obsId} was not found in database!`);
  console.log('Retrieved Database Record:', {
    id: retrieved.id,
    species: retrieved.speciesName,
    scientificName: retrieved.scientificName,
    location: retrieved.locationName,
    isVerified: retrieved.isVerified,
    verifiedBy: retrieved.verifiedBy,
    boundingBoxCount: retrieved.boundingBoxes.length
  });

  // STEP 4: Validate Audit Trail Generation
  console.log('\n[4/4] Verifying immutable audit trail recording...');
  const auditLogs = await db.getAuditLogs();
  const matchedAudit = auditLogs.find(l => l.details.includes(obsId));
  if (!matchedAudit) throw new Error(`Audit event for ${obsId} not found!`);
  console.log('Audit Trail Record:', matchedAudit);

  console.log('\n=== E2E VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runEndToEnd().catch(err => {
  console.error('E2E Verification Failed:', err);
  process.exit(1);
});
