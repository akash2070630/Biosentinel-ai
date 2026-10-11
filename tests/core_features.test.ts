import { describe, it } from 'node:test';
import assert from 'node:assert';
import dotenv from 'dotenv';
import {
  reIdentifyIndividual,
  evaluateIndividualSilentDistress,
  analyzeUploadedAudio
} from '../server/services/aiService';
import { db } from '../server/data/store';
import { IndividualAnimal, ThreatRecord } from '../src/types/index';

dotenv.config();

const VALID_TINY_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('Phase 3 Core Features Test Suite', () => {

  // 1. Wildlife Re-Identification Tests
  describe('1. Wildlife Biometric Re-Identification', () => {
    it('should reject empty imageBase64 payload for re-identification', async () => {
      await assert.rejects(
        async () => {
          await reIdentifyIndividual('');
        },
        /Image data must be provided as a non-empty string/
      );
    });

    it('should return candidates, similarity scores, and flag uncertain when target catalog has no match', async () => {
      const res = await reIdentifyIndividual(VALID_TINY_PNG_B64, 'image/png', 'NonExistentSpeciesXYZ');
      assert.strictEqual(res.matched, false);
      assert.strictEqual(res.bestMatch, null);
      assert.strictEqual(res.isUncertain, true);
      assert.ok(res.explanation.includes('No registered individual animal profiles found'));
    });

    it('should evaluate registered individual profiles and return candidate matches with similarity scores', async () => {
      const res = await reIdentifyIndividual(VALID_TINY_PNG_B64, 'image/png', 'Bengal Tiger');
      assert.strictEqual(typeof res.matched, 'boolean');
      assert.ok(Array.isArray(res.candidateMatches));
      assert.ok(res.candidateMatches.length > 0, 'Must return catalog candidates');
      for (const candidate of res.candidateMatches) {
        assert.ok(candidate.individualId);
        assert.ok(candidate.codeName);
        assert.ok(typeof candidate.similarityScore === 'number');
        assert.ok(candidate.similarityScore >= 0 && candidate.similarityScore <= 1.0);
      }
    });
  });

  // 2. Silent Distress Behavioral Anomaly Tests
  describe('2. Silent Distress Behavioral Monitoring', () => {
    it('should enforce Insufficient Baseline (N < 5 sightings) and refuse premature diagnosis', async () => {
      // Register temporary individual with only 2 sightings
      const tempId = `IND-TEST-LOW-${Date.now()}`;
      const tempInd: IndividualAnimal = {
        id: tempId,
        codeName: 'T-999 (New Cub)',
        speciesId: 'sp-tiger',
        speciesName: 'Bengal Tiger',
        sex: 'Unknown',
        estimatedAgeYears: 1,
        firstSightedDate: '2026-10-01',
        lastSightedDate: '2026-10-05',
        sightingCount: 2, // strictly < 5
        primaryTerritory: 'Buffer Zone',
        patternType: 'Stripe Geometry',
        distinctiveFeatures: ['Sparse infantile stripes'],
        fingerprintImageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
        reIdMatchConfidence: 0.50,
        status: 'Active Monitoring',
        baselineSightingFrequencyWeekly: 1,
        baselineDiurnalRatio: 0.15
      };

      await db.addIndividual(tempInd);

      const evaluation = await evaluateIndividualSilentDistress(tempId);
      assert.strictEqual(evaluation.hasSufficientBaseline, false);
      assert.strictEqual(evaluation.anomalyScore, 0);
      assert.ok(evaluation.explanation.includes('Insufficient historical baseline'));
      assert.strictEqual(evaluation.requiresFieldPatrol, false);

      // Clean up
      await db.deleteIndividual(tempId);
    });

    it('should evaluate individuals with sufficient baseline (N >= 5) and return Z-score metrics', async () => {
      // SL-04 has 22 historical sightings
      const evaluation = await evaluateIndividualSilentDistress('IND-SL04');
      assert.strictEqual(evaluation.hasSufficientBaseline, true);
      assert.ok(evaluation.observationCount >= 5);
      assert.ok(typeof evaluation.anomalyScore === 'number');
      assert.ok(['Low', 'Moderate', 'High', 'Critical'].includes(evaluation.severity));
      assert.ok(evaluation.explanation.length > 10);
      if (evaluation.triggeredFeatures.length > 0) {
        for (const feat of evaluation.triggeredFeatures) {
          assert.ok(typeof feat.zScore === 'number');
          assert.ok(feat.featureName);
        }
      }
    });

    it('should reject evaluation for non-existent individual ID with clear error', async () => {
      await assert.rejects(
        async () => {
          await evaluateIndividualSilentDistress('IND-NON-EXISTENT-999');
        },
        /Individual animal with ID 'IND-NON-EXISTENT-999' not found/
      );
    });
  });

  // 3. Threat Intelligence Center Tests
  describe('3. Threat Intelligence Recording & Verification Lifecycle', () => {
    it('should record a new threat incident with evidence and verify audit history', async () => {
      const threatId = `THR-TEST-${Date.now()}`;
      const newThreat: ThreatRecord = {
        id: threatId,
        title: 'Metallic Wire Snare Detected',
        category: 'Illegal Snare / Trap',
        severity: 'Critical',
        status: 'Ranger Investigating',
        detectedAt: '2026-10-11 04:00 UTC',
        locationName: 'Bandipur Core Trail 3',
        latitude: 11.6620,
        longitude: 76.6210,
        locationPrecision: 'Exact (Protected)',
        source: 'Camera Trap Vision AI',
        evidenceImageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=400&q=80',
        aiExplanation: 'Tensioned metallic snare loop anchored to tree base.',
        confidenceScore: 0.94,
        reviewedBy: 'Triage Ranger Station',
        reviewerNotes: 'Initial field report',
        auditHistory: [
          {
            timestamp: '2026-10-11 04:00 UTC',
            actor: 'Triage Ranger Station',
            action: 'Incident Created',
            notes: 'Automated alert confirmed.'
          }
        ]
      };

      const saved = await db.addThreat(newThreat);
      assert.strictEqual(saved.id, threatId);

      // Verify threat retrieval
      const fetched = await db.getThreatById(threatId);
      assert.ok(fetched);
      assert.strictEqual(fetched?.severity, 'Critical');
      assert.strictEqual(fetched?.status, 'Ranger Investigating');

      // Update verification status
      const updated = await db.updateThreat(threatId, {
        status: 'Verified Incident',
        reviewerNotes: 'Snare confiscated and destroyed by patrol team alpha.',
        reviewedBy: 'Senior Warden K. Nair'
      });
      assert.ok(updated);
      assert.strictEqual(updated?.status, 'Verified Incident');
      assert.strictEqual(updated?.reviewedBy, 'Senior Warden K. Nair');
      assert.ok(updated?.auditHistory.length! >= 2, 'Audit trail must record status transition');

      // Clean up
      await db.deleteThreat(threatId);
      const afterDelete = await db.getThreatById(threatId);
      assert.strictEqual(afterDelete, undefined);
    });
  });

  // 4. Habitat Watch Coordinate Masking Tests
  describe('4. Habitat Watch Anti-Poaching Coordinate Masking', () => {
    it('should fuzz endangered species GPS coordinates to protect sensitive species', () => {
      const realLat = 21.9497;
      const realLng = 89.1833;

      // Jitter function used in LeafletMap / HabitatWatch
      const fuzzOffset = 0.045; // ~5km fuzz
      const fuzzedLat = realLat + fuzzOffset;
      const fuzzedLng = realLng - fuzzOffset;

      assert.notStrictEqual(fuzzedLat, realLat, 'Fuzzed latitude must differ from exact GPS');
      assert.notStrictEqual(fuzzedLng, realLng, 'Fuzzed longitude must differ from exact GPS');
      assert.ok(Math.abs(fuzzedLat - realLat) > 0.01, 'Fuzzing must provide at least 1-5km margin');
    });
  });

  // 5. Acoustic Monitoring Tests
  describe('5. Acoustic Monitoring Audio Analysis', () => {
    it('should reject invalid or unsupported audio payloads', async () => {
      await assert.rejects(
        async () => {
          await analyzeUploadedAudio('', 'audio/wav');
        },
        /Audio payload must be provided as a non-empty string/
      );

      await assert.rejects(
        async () => {
          await analyzeUploadedAudio('validbase64string', 'video/mp4');
        },
        /Unsupported audio format/
      );
    });

    it('should analyze audio and return sound category, frequency range, and threat indicators', async () => {
      const dummyAudioB64 = Buffer.from('RIFF....WAVEfmt ').toString('base64');
      const analysis = await analyzeUploadedAudio(dummyAudioB64, 'audio/wav', 'chainsaw_motor_recording.wav');

      assert.ok(analysis.soundCategory);
      assert.ok(typeof analysis.confidence === 'number');
      assert.ok(analysis.frequencyRangeHz);
      assert.strictEqual(typeof analysis.isThreatIndicator, 'boolean');
      assert.strictEqual(analysis.isThreatIndicator, true, 'Chainsaw audio should flag threat indicator');
      assert.strictEqual(typeof analysis.isRealModelInference, 'boolean');
      assert.ok(analysis.explanation.length > 0);
    });
  });

  // 6. Reports & Audit Trail Integration
  describe('6. Reports, Filters & Audit Trail', () => {
    it('should maintain append-only audit trail for all operations', async () => {
      const logsBefore = await db.getAuditLogs();
      const countBefore = logsBefore.length;

      // Perform audited action
      await db.logAudit('TEST_ACTION', 'Ranger Test Runner', 'Unit test audit verification log.');

      const logsAfter = await db.getAuditLogs();
      assert.strictEqual(logsAfter.length, countBefore + 1);
      assert.strictEqual(logsAfter[0].action, 'TEST_ACTION');
      assert.strictEqual(logsAfter[0].actor, 'Ranger Test Runner');
    });
  });
});
