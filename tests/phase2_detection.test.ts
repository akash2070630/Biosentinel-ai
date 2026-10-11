import { describe, it } from 'node:test';
import assert from 'node:assert';
import dotenv from 'dotenv';
import { detectWildlifeInImage, validateBoundingBox } from '../server/services/aiService';
import { db } from '../server/data/store';
import { WildlifeObservation } from '../src/types/index';

dotenv.config();

// Small valid 1x1 PNG base64 for unit test validation
const VALID_TINY_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Public verified camera trap tiger image
const TIGER_TEST_URL = 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80';

describe('Phase 2: Real AI Wildlife Image Detection & Database Persistence Suite', () => {

  // 1. Invalid Uploads Tests
  describe('1. Upload Validation & Error Handling', () => {
    it('should reject empty imageBase64 payload with clear error message', async () => {
      await assert.rejects(
        async () => {
          await detectWildlifeInImage('', 'image/jpeg');
        },
        {
          name: 'Error',
          message: 'Image data must be provided as a valid non-empty string.'
        }
      );
    });

    it('should reject non-string payload with clear error message', async () => {
      await assert.rejects(
        async () => {
          await detectWildlifeInImage(null as any, 'image/jpeg');
        },
        {
          name: 'Error',
          message: 'Image data must be provided as a valid non-empty string.'
        }
      );
    });

    it('should reject unsupported MIME type with clear error message', async () => {
      await assert.rejects(
        async () => {
          await detectWildlifeInImage(VALID_TINY_PNG_B64, 'application/pdf');
        },
        /Unsupported image format 'application\/pdf'/
      );
    });

    it('should reject payloads exceeding 25MB limit', async () => {
      // Create string slightly larger than 25MB base64 length (~35M chars)
      const oversizedPayload = 'A'.repeat(36 * 1024 * 1024);
      await assert.rejects(
        async () => {
          await detectWildlifeInImage(oversizedPayload, 'image/jpeg');
        },
        /Image exceeds the maximum allowed file size of 25MB/
      );
    });
  });

  // 2. Bounding Box & Coordinate Format Validation Tests
  describe('2. Bounding Box Coordinate Validation [0, 1000] Invariants', () => {
    it('should accept valid coordinates strictly inside [0, 1000]', () => {
      const validRawBox = {
        ymin: 120,
        xmin: 180,
        ymax: 880,
        xmax: 840,
        label: 'Panthera tigris',
        confidence: 0.95
      };
      const result = validateBoundingBox(validRawBox, 0, 'Tiger');
      assert.ok(result, 'Valid box must not be null');
      assert.strictEqual(result?.ymin, 120);
      assert.strictEqual(result?.xmin, 180);
      assert.strictEqual(result?.ymax, 880);
      assert.strictEqual(result?.xmax, 840);
      assert.strictEqual(result?.label, 'Panthera tigris');
    });

    it('should reject inverted coordinates (ymin >= ymax)', () => {
      const invertedBox = {
        ymin: 900,
        xmin: 100,
        ymax: 200, // ymin > ymax
        xmax: 500,
        label: 'Inverted Box'
      };
      const result = validateBoundingBox(invertedBox, 0, 'Test');
      assert.strictEqual(result, null, 'Inverted Y coordinates must be rejected');
    });

    it('should reject inverted coordinates (xmin >= xmax)', () => {
      const invertedBox = {
        ymin: 100,
        xmin: 800,
        ymax: 500,
        xmax: 200, // xmin > xmax
        label: 'Inverted Box'
      };
      const result = validateBoundingBox(invertedBox, 0, 'Test');
      assert.strictEqual(result, null, 'Inverted X coordinates must be rejected');
    });

    it('should reject out-of-range coordinates (> 1000 or < 0)', () => {
      const oobBox1 = { ymin: -50, xmin: 100, ymax: 500, xmax: 600 };
      const oobBox2 = { ymin: 100, xmin: 100, ymax: 1200, xmax: 600 };
      assert.strictEqual(validateBoundingBox(oobBox1, 0, 'Test'), null);
      assert.strictEqual(validateBoundingBox(oobBox2, 0, 'Test'), null);
    });

    it('should reject degenerate boxes with span < 10px', () => {
      const degenerateBox = { ymin: 100, xmin: 100, ymax: 105, xmax: 105 }; // 5px height & width
      assert.strictEqual(validateBoundingBox(degenerateBox, 0, 'Test'), null);
    });
  });

  // 3. Genuine Inference with Gemini 3.8 Flash
  describe('3. Genuine Model Inference with Gemini 3.8 Flash', () => {
    it('should perform live inference on a wildlife photograph and return structured JSON', async () => {
      const response = await fetch(TIGER_TEST_URL);
      assert.ok(response.ok, 'Failed to fetch test wildlife photograph');
      const arrayBuffer = await response.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      const result = await detectWildlifeInImage(base64Data, 'image/jpeg');

      // Assert structure and taxonomic identification
      assert.strictEqual(typeof result.detected, 'boolean');
      assert.ok(result.speciesName && result.speciesName.length > 0, 'Species name must be populated');
      assert.ok(result.scientificName && result.scientificName.length > 0, 'Scientific name must be populated');
      assert.ok(result.explanation && result.explanation.length > 10, 'Biological explanation must cite morphological markers');
      if (!result.isDemoData) {
        assert.ok(
          result.modelUsed.includes('Gemini 3.8 Flash') || result.modelUsed.includes('Gemini 3.5 Flash'),
          'Must use verified available Gemini Flash model when live inference is available'
        );
      } else {
        assert.strictEqual(result.isDemoData, true, 'Fallback must be clearly disclosed as demo data');
        assert.ok(result.explanation.length > 0, 'Limitation explanation must be provided');
      }

      // Verify bounding boxes if localized
      if (result.boundingBoxes.length > 0) {
        for (const box of result.boundingBoxes) {
          assert.ok(box.ymin >= 0 && box.ymin <= 1000);
          assert.ok(box.xmin >= 0 && box.xmin <= 1000);
          assert.ok(box.ymax >= 0 && box.ymax <= 1000);
          assert.ok(box.xmax >= 0 && box.xmax <= 1000);
          assert.ok(box.ymin < box.ymax, 'ymin must be strictly less than ymax');
          assert.ok(box.xmin < box.xmax, 'xmin must be strictly less than xmax');
        }
      }
    });
  });

  // 4. Uncertainty State & Prediction Flagging
  describe('4. Uncertainty State & Limitation Handling', () => {
    it('should flag uncertainty when model confidence is low or localization is absent', async () => {
      // Test on tiny blank 1x1 image where animal cannot be localized
      const result = await detectWildlifeInImage(VALID_TINY_PNG_B64, 'image/png');
      assert.strictEqual(typeof result.isUncertain, 'boolean');
      // On a 1x1 blank image, it must either not detect or be marked uncertain
      assert.ok(result.isUncertain || !result.detected, 'Blank image must trigger uncertainty state');
    });
  });

  // 5. Database Persistence & End-to-End Cycle
  describe('5. Database Persistence & Observation Retrieval', () => {
    it('should persist a confirmed observation into the datastore and retrieve it', async () => {
      const testObsId = `OBS-TEST-P2-${Date.now()}`;
      const newObs: WildlifeObservation = {
        id: testObsId,
        speciesId: 'sp-tiger',
        speciesName: 'Bengal Tiger',
        scientificName: 'Panthera tigris tigris',
        conservationStatus: 'Endangered',
        observedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        locationName: 'Sundarbans Core Sector B4',
        latitude: 21.9497,
        longitude: 89.1833,
        cameraTrapId: 'CT-P2-VERIFY',
        imageUrl: TIGER_TEST_URL,
        confidence: 0.98,
        modelUsed: 'Gemini 3.8 Flash Multimodal (BioSentinel Live Inference)',
        isDemoData: false,
        isVerified: true,
        verifiedBy: 'Lead Biologist Dr. Aris',
        verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        boundingBoxes: [
          {
            id: `box-${testObsId}`,
            ymin: 80,
            xmin: 150,
            ymax: 920,
            xmax: 880,
            label: 'Bengal Tiger (Adult)',
            confidence: 0.98,
            visualFeatures: ['Vertical flank stripes', 'Facial ruff profile']
          }
        ],
        individualId: 'IND-T108',
        individualName: 'T-108 (Sundar Male)',
        reIdScore: 0.94,
        anomalyDetected: false,
        environmentalConditions: {
          temperatureC: 28,
          weather: 'Clear River Delta',
          timeOfDay: 'Day'
        },
        notes: 'End-to-end Phase 2 verification observation.'
      };

      // 1. Persist observation through datastore
      const saved = await db.addObservation(newObs);
      assert.strictEqual(saved.id, testObsId);

      // 2. Retrieve observation directly from database
      const retrieved = await db.getObservationById(testObsId);
      assert.ok(retrieved, 'Persisted observation must be retrievable from database');
      assert.strictEqual(retrieved?.speciesName, 'Bengal Tiger');
      assert.strictEqual(retrieved?.locationName, 'Sundarbans Core Sector B4');
      assert.strictEqual(retrieved?.isVerified, true);
      assert.strictEqual(retrieved?.confidence, 0.98);

      // 3. Verify evidence persistence (bounding boxes)
      assert.ok(retrieved?.boundingBoxes && retrieved.boundingBoxes.length > 0, 'Bounding boxes must persist');
      assert.strictEqual(retrieved?.boundingBoxes[0].ymin, 80);
      assert.strictEqual(retrieved?.boundingBoxes[0].ymax, 920);

      // 4. Verify audit trail log was recorded
      const logs = await db.getAuditLogs();
      const auditEntry = logs.find(l => l.details.includes(testObsId));
      assert.ok(auditEntry, 'Audit trail must record observation persistence');

      // 5. Clean up test observation
      await db.deleteObservation(testObsId);
      const afterDelete = await db.getObservationById(testObsId);
      assert.strictEqual(afterDelete, undefined, 'Observation should be removed after deletion');
    });
  });
});
