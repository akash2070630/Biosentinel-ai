import { Species, IndividualAnimal, BehavioralAnomaly, ThreatRecord, WildlifeObservation, AcousticRecording, ModelTelemetry } from '../types';

export const INITIAL_SPECIES: Species[] = [
  {
    id: 'sp-tiger',
    commonName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    iucnStatus: 'Endangered',
    populationEstimate: '~3,167 individuals (India Census)',
    trend: 'Increasing',
    threats: ['Poaching for trade', 'Habitat fragmentation', 'Human-wildlife conflict', 'Depletion of prey base'],
    habitat: 'Tropical and subtropical moist broadleaf forests, alluvial grasslands, mangroves',
    rangeCountries: ['India', 'Bangladesh', 'Nepal', 'Bhutan'],
    reIdentificationMethod: 'Asymmetric flank stripe biometrics (StripesPattern Matching)',
    acousticFeatures: 'Infrasonic low-frequency roar (18-20 Hz) and chuffing contact vocalizations',
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'Unsplash Wildlife Registry',
    description: 'The apex predator of the Indian subcontinent. Each individual tiger bears a unique asymmetric pattern of dark vertical stripes on reddish-orange fur, functioning like a biological barcode for computer vision re-identification.',
    vitalStats: {
      averageWeight: '180 - 260 kg',
      lifespan: '14 - 16 years',
      territorySize: '20 - 100 sq km'
    }
  },
  {
    id: 'sp-snow-leopard',
    commonName: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    iucnStatus: 'Vulnerable',
    populationEstimate: '~4,000 - 6,500 globally',
    trend: 'Decreasing',
    threats: ['Retaliatory killing by herders', 'Climate-induced alpine shift', 'Prey poaching'],
    habitat: 'Rugged high-altitude alpine ridges, steep scree slopes, rocky gorges (3,000 - 5,400m)',
    rangeCountries: ['India', 'Nepal', 'Mongolia', 'China', 'Pakistan', 'Kyrgyzstan'],
    reIdentificationMethod: 'Forehead rosette clustering & dorsal tail ring pattern analysis',
    acousticFeatures: 'Mewing, chuffing, purring; unable to roar due to non-elastic vocal fold morphology',
    imageUrl: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'High Altitude Conservation Alliance',
    description: 'The "Ghost of the Mountains", expertly adapted to subzero Himalayan terrain with wide paws that act as natural snowshoes and thick smoky-grey fur covered in dark rosettes.',
    vitalStats: {
      averageWeight: '32 - 55 kg',
      lifespan: '15 - 18 years',
      territorySize: '80 - 200 sq km'
    }
  },
  {
    id: 'sp-elephant',
    commonName: 'Asian Elephant',
    scientificName: 'Elephas maximus',
    iucnStatus: 'Endangered',
    populationEstimate: '~40,000 - 50,000 individuals',
    trend: 'Decreasing',
    threats: ['Linear infrastructure collisions (rail/road)', 'Electrocution', 'Agricultural conflict', 'Ivory poaching'],
    habitat: 'Tropical evergreen forests, semi-evergreen forests, deciduous forests, scrublands',
    rangeCountries: ['India', 'Sri Lanka', 'Thailand', 'Myanmar', 'Indonesia'],
    reIdentificationMethod: 'Ear venation, ear tear/notch profiles, and tusk morphology vectors',
    acousticFeatures: 'Sub-audible infrasound rumbles (14-24 Hz) propagating over 10 km through ground',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'Western Ghats Ecology Project',
    description: 'Keystone megaherbivore essential for forest seed dispersal and canopy dynamics. Highly intelligent matriarchal herds migrate across historical ecological corridors increasingly severed by human development.',
    vitalStats: {
      averageWeight: '2,700 - 4,000 kg',
      lifespan: '60 - 70 years',
      territorySize: '100 - 500 sq km'
    }
  },
  {
    id: 'sp-red-panda',
    commonName: 'Red Panda',
    scientificName: 'Ailurus fulgens',
    iucnStatus: 'Endangered',
    populationEstimate: '< 10,000 mature individuals',
    trend: 'Decreasing',
    threats: ['Bamboo die-off events', 'Canine distemper virus spillover', 'Snare bycatch'],
    habitat: 'Temperate deciduous-coniferous forests with dense bamboo understory (2,200 - 4,800m)',
    rangeCountries: ['India', 'Nepal', 'Bhutan', 'China', 'Myanmar'],
    reIdentificationMethod: 'Facial mask white patch geometry and tail ring chromatic count',
    acousticFeatures: 'Whistle-like tweets, huffs, squeaks, and bark-like alarm vocalizations',
    imageUrl: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'Singalila Forest Observatory',
    description: 'An evolutionary relic in its own monotypic family (Ailuridae). Arboreal and crepuscular, relying on bamboo leaves for 95% of its diet, highly susceptible to canopy disruption.',
    vitalStats: {
      averageWeight: '3.7 - 6.2 kg',
      lifespan: '12 - 14 years',
      territorySize: '2.5 - 5.0 sq km'
    }
  },
  {
    id: 'sp-gharial',
    commonName: 'Gharial',
    scientificName: 'Gavialis gangeticus',
    iucnStatus: 'Critically Endangered',
    populationEstimate: '< 650 breeding adults',
    trend: 'Decreasing',
    threats: ['Sand mining in nesting sandbars', 'Gillnet entanglement', 'River dam flow alteration'],
    habitat: 'Fast-flowing, deep freshwater river bends with undisturbed sandbanks',
    rangeCountries: ['India', 'Nepal'],
    reIdentificationMethod: 'Nuchal scute pattern mapping and adult male ghara (snout bulb) geometry',
    acousticFeatures: 'Underwater jaw-clapping acoustics and resonant snout buzzes',
    imageUrl: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'National Chambal Sanctuary Monitoring',
    description: 'One of the longest extant crocodilians, distinguished by an extraordinarily slender snout specialized exclusively for fish capture and adult males possessing a bulbous nasal protuberance called a ghara.',
    vitalStats: {
      averageWeight: '160 - 250 kg',
      lifespan: '50 - 60 years',
      territorySize: '12 - 30 km riverine stretch'
    }
  },
  {
    id: 'sp-amur-leopard',
    commonName: 'Amur Leopard',
    scientificName: 'Panthera pardus orientalis',
    iucnStatus: 'Critically Endangered',
    populationEstimate: '~120 individuals in wild',
    trend: 'Stable',
    threats: ['Extreme inbreeding depression', 'Winter forest fires', 'Ungulate prey depletion'],
    habitat: 'Temperate mixed broadleaf and coniferous taiga forests with rugged hillocks',
    rangeCountries: ['Russia', 'China'],
    reIdentificationMethod: 'Lateral flank rosette cluster coordinate distance matching',
    acousticFeatures: 'Deep territorial coughing rasps and low growls',
    imageUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
    photographerCredit: 'Far Eastern Leopard Reserve',
    description: 'The rarest big cat in the world. Adapted to harsh Siberian winters with a thick coat extending up to 7cm in winter and long legs for traversing deep snow drifts.',
    vitalStats: {
      averageWeight: '32 - 48 kg',
      lifespan: '10 - 15 years',
      territorySize: '50 - 300 sq km'
    }
  }
];

export const INITIAL_INDIVIDUALS: IndividualAnimal[] = [
  {
    id: 'IND-T108',
    codeName: 'T-108 (Ustad)',
    speciesId: 'sp-tiger',
    speciesName: 'Bengal Tiger',
    sex: 'Male',
    estimatedAgeYears: 9,
    firstSightedDate: '2019-04-12',
    lastSightedDate: '2026-10-09',
    sightingCount: 47,
    primaryTerritory: 'Ranthambore Sector 4 - Kachida Valley',
    patternType: 'Stripe Geometry',
    distinctiveFeatures: ['Right eye double-fork stripe', 'V-shaped dorsal collar stripe', 'Notched left ear tip'],
    fingerprintImageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=400&q=80',
    reIdMatchConfidence: 94.6,
    status: 'Active Monitoring',
    baselineSightingFrequencyWeekly: 2.1,
    baselineDiurnalRatio: 0.65
  },
  {
    id: 'IND-T084',
    codeName: 'T-084 (Arrowhead)',
    speciesId: 'sp-tiger',
    speciesName: 'Bengal Tiger',
    sex: 'Female',
    estimatedAgeYears: 7,
    firstSightedDate: '2020-02-18',
    lastSightedDate: '2026-10-04',
    sightingCount: 38,
    primaryTerritory: 'Rajbagh Lake & Malik Talao Shoreline',
    patternType: 'Stripe Geometry',
    distinctiveFeatures: ['Arrowhead marking above left eyebrow', 'Parallel rib cage triplet stripes'],
    fingerprintImageUrl: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=400&q=80',
    reIdMatchConfidence: 91.2,
    status: 'Active Monitoring',
    baselineSightingFrequencyWeekly: 1.8,
    baselineDiurnalRatio: 0.72
  },
  {
    id: 'IND-SL04',
    codeName: 'SL-04 (Chomolung)',
    speciesId: 'sp-snow-leopard',
    speciesName: 'Snow Leopard',
    sex: 'Male',
    estimatedAgeYears: 6,
    firstSightedDate: '2021-11-03',
    lastSightedDate: '2026-09-28',
    sightingCount: 22,
    primaryTerritory: 'Hemis National Park - Rumbak Valley Ridge',
    patternType: 'Rosette Topology',
    distinctiveFeatures: ['Three fused rosettes on left shoulder', 'Tip tail dark ring triple sequence'],
    fingerprintImageUrl: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=400&q=80',
    reIdMatchConfidence: 89.4,
    status: 'Anomaly Flagged',
    baselineSightingFrequencyWeekly: 0.8,
    baselineDiurnalRatio: 0.35
  },
  {
    id: 'IND-AE12',
    codeName: 'AE-12 (Balarama)',
    speciesId: 'sp-elephant',
    speciesName: 'Asian Elephant',
    sex: 'Male',
    estimatedAgeYears: 32,
    firstSightedDate: '2018-01-14',
    lastSightedDate: '2026-10-10',
    sightingCount: 74,
    primaryTerritory: 'Nagarhole - Kabini River Backwaters',
    patternType: 'Ear Notch',
    distinctiveFeatures: ['Deep triangular tear in right ear pinna', 'Slightly curved left tusk tip', 'Distinctive forehead depigmentation star'],
    fingerprintImageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80',
    reIdMatchConfidence: 96.8,
    status: 'Active Monitoring',
    baselineSightingFrequencyWeekly: 3.4,
    baselineDiurnalRatio: 0.82
  },
  {
    id: 'IND-RP07',
    codeName: 'RP-07 (Ruby)',
    speciesId: 'sp-red-panda',
    speciesName: 'Red Panda',
    sex: 'Female',
    estimatedAgeYears: 4,
    firstSightedDate: '2023-05-19',
    lastSightedDate: '2026-10-06',
    sightingCount: 16,
    primaryTerritory: 'Singalila National Park - Gairibas Canopy',
    patternType: 'Facial Wrinkles',
    distinctiveFeatures: ['Solid white teardrop under right eye', 'Nine alternating tail bands'],
    fingerprintImageUrl: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=400&q=80',
    reIdMatchConfidence: 87.5,
    status: 'Active Monitoring',
    baselineSightingFrequencyWeekly: 1.1,
    baselineDiurnalRatio: 0.55
  }
];

export const INITIAL_ANOMALIES: BehavioralAnomaly[] = [
  {
    id: 'ANOM-2026-089',
    individualId: 'IND-SL04',
    individualName: 'SL-04 (Chomolung)',
    speciesName: 'Snow Leopard',
    observationId: 'OBS-7735',
    detectionDate: '2026-09-28',
    anomalyScore: 84,
    severity: 'High',
    anomalyType: 'Gait Deviation',
    triggeredFeatures: [
      {
        featureName: 'Right Hind Limb Step Stride Length (px)',
        observedValue: '142 px',
        historicalBaseline: '215 ± 18 px',
        zScore: -3.8
      },
      {
        featureName: 'Locomotion Duty Factor Ratio',
        observedValue: '0.78 (prolonged ground contact)',
        historicalBaseline: '0.61 ± 0.04',
        zScore: 3.6
      },
      {
        featureName: 'Movement Velocity along Steep Scree',
        observedValue: '0.4 m/s',
        historicalBaseline: '1.2 ± 0.2 m/s',
        zScore: -3.4
      }
    ],
    supportingEvidence: 'Consecutive camera trap frames CT-HEMIS-04 show asymmetric loading on right hindquarter, reluctance to bear weight on steep incline. Corroborated across 3 sequence captures over 40 seconds.',
    insufficientBaseline: false,
    scientificDisclaimer: 'Decision support metric only. Does not diagnose injury or disease. Requires ground field ranger binocular verification before medical or physical intervention.',
    reviewedBy: 'Dr. Tenzing Norbu (High Altitude Wildlife Biologist)',
    reviewStatus: 'Investigating'
  },
  {
    id: 'ANOM-2026-092',
    individualId: 'IND-T084',
    individualName: 'T-084 (Arrowhead)',
    speciesName: 'Bengal Tiger',
    observationId: 'OBS-7688',
    detectionDate: '2026-10-04',
    anomalyScore: 68,
    severity: 'Moderate',
    anomalyType: 'Nocturnal Shift',
    triggeredFeatures: [
      {
        featureName: 'Diurnal Activity Index',
        observedValue: '0.18 diurnal',
        historicalBaseline: '0.72 ± 0.11 diurnal',
        zScore: -4.1
      },
      {
        featureName: 'Active Hours Shift',
        observedValue: '02:30 - 05:00 UTC',
        historicalBaseline: '07:00 - 18:30 UTC',
        zScore: 3.2
      }
    ],
    supportingEvidence: 'Abrupt shift to deep-night transit over 12 consecutive days. Often correlated with tourist safari disturbance or heightened territorial pressure from competing tigress in adjacent zone.',
    insufficientBaseline: false,
    scientificDisclaimer: 'Correlated with human activity patterns or territorial dynamics. Not indicative of physiological distress without secondary symptoms.',
    reviewStatus: 'Pending Review'
  },
  {
    id: 'ANOM-2026-101',
    individualId: 'IND-RP07',
    individualName: 'RP-07 (Ruby)',
    speciesName: 'Red Panda',
    observationId: 'OBS-7712',
    detectionDate: '2026-10-06',
    anomalyScore: 42,
    severity: 'Low',
    anomalyType: 'Extreme Sighting Gap',
    triggeredFeatures: [
      {
        featureName: 'Inter-Sighting Interval (Days)',
        observedValue: '28 days',
        historicalBaseline: '6.4 ± 3.1 days',
        zScore: 2.3
      }
    ],
    supportingEvidence: 'Sighting gap in primary canopy quadrant coincided with seasonal bamboo flowering mast and heavy monsoon fog reducing camera trap trigger sensitivity.',
    insufficientBaseline: false,
    scientificDisclaimer: 'Weather and microhabitat factors frequently explain sighting gaps without individual distress.',
    reviewStatus: 'Sensor Artifact / Dismissed'
  }
];

export const INITIAL_THREATS: ThreatRecord[] = [
  {
    id: 'THR-2026-014',
    title: 'Suspicious Metallic Wire Snare Pattern Detected',
    category: 'Illegal Snare / Trap',
    severity: 'Critical',
    status: 'Ranger Investigating',
    detectedAt: '2026-10-10 04:15 UTC',
    locationName: 'Bandipur Border Corridor - Sector 12',
    latitude: 11.6664,
    longitude: 76.6272,
    locationPrecision: 'Exact (Protected)',
    source: 'Camera Trap Vision AI',
    evidenceImageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    aiExplanation: 'Automated object detection model flagged tensile looped cable fixture tethered to root base across known game trail. Bounding confidence 0.89. High risk of carnivore paw entanglement.',
    confidenceScore: 0.89,
    reviewedBy: 'Ranger K. Raman',
    reviewerNotes: 'Immediate patrol dispatched from Gundlupet outpost. Team mobilized with sweep metal detectors.',
    auditHistory: [
      {
        timestamp: '2026-10-10 04:15 UTC',
        actor: 'BioSentinel Vision Node #44',
        action: 'Automated Threat Flag Triggered',
        notes: 'Bounding box #B-04 identified high-contrast metallic tension cable on wildlife trail.'
      },
      {
        timestamp: '2026-10-10 04:32 UTC',
        actor: 'Ranger K. Raman',
        action: 'Status Changed to Ranger Investigating',
        notes: 'Coordinated patrol with forest guard squad.'
      }
    ]
  },
  {
    id: 'THR-2026-015',
    title: 'Unauthorized Chainsaw / Logging Acoustic Profile',
    category: 'Habitat Encroachment',
    severity: 'High',
    status: 'Verified Incident',
    detectedAt: '2026-10-09 23:40 UTC',
    locationName: 'Chambal Sanctuary Buffer Zone - Riverbank KM 42',
    latitude: 26.6841,
    longitude: 78.4312,
    locationPrecision: 'Exact (Protected)',
    source: 'Acoustic Sentinel',
    aiExplanation: 'Acoustic classifier detected sustained two-stroke engine harmonics (120-180 Hz base fundamental with high harmonic distortion) matching motorized logging tools. Duration 14.2 minutes.',
    confidenceScore: 0.93,
    reviewedBy: 'Officer S. Verma',
    reviewerNotes: 'Field team intercepted illegal woodcutters attempting to clear riverbank tamarind grove. 2 saws confiscated.',
    auditHistory: [
      {
        timestamp: '2026-10-09 23:40 UTC',
        actor: 'Acoustic Sentinel Node #CH-09',
        action: 'Harmonic Anomaly Alert',
        notes: 'Sustained two-stroke motor signature at 85 dBA sound pressure estimate.'
      },
      {
        timestamp: '2026-10-10 02:10 UTC',
        actor: 'Officer S. Verma',
        action: 'Verified & Neutralized',
        notes: 'Intervention completed successfully. Woodcutters detained under Wildlife Protection Act.'
      }
    ]
  },
  {
    id: 'THR-2026-016',
    title: 'Off-Road Vehicle Thermal Track in Core Breeding Zone',
    category: 'Unauthorized Vehicle / Vessel',
    severity: 'Moderate',
    status: 'Unverified AI Indicator',
    detectedAt: '2026-10-08 19:20 UTC',
    locationName: 'Kaziranga Western Range - Bagori Corridor',
    latitude: 26.5815,
    longitude: 93.1722,
    locationPrecision: 'Generalized (Fuzzed)',
    source: 'Satellite Disturbance',
    aiExplanation: 'Night infrared sensor registered linear linear heat signature consistent with 4x4 off-highway vehicle traveling through non-motorable wetland embankment.',
    confidenceScore: 0.74,
    auditHistory: [
      {
        timestamp: '2026-10-08 19:20 UTC',
        actor: 'Sentinel-2 Thermal Streamer',
        action: 'Anomaly Ingestion',
        notes: 'Flagged for ranger patrol verification during morning shift.'
      }
    ]
  },
  {
    id: 'THR-2026-017',
    title: 'Repeated Gunshot Acoustic Transients Flagged',
    category: 'Poaching Risk Zone',
    severity: 'Critical',
    status: 'Resolved / Neutralized',
    detectedAt: '2026-10-05 01:14 UTC',
    locationName: 'Hemis National Park - Markha Valley Ridge',
    latitude: 33.9124,
    longitude: 77.4189,
    locationPrecision: 'Exact (Protected)',
    source: 'Acoustic Sentinel',
    aiExplanation: 'Acoustic impulse analysis detected sharp shockwave with N-wave profile characteristic of firearm discharge. However, field patrol determined origin was high-altitude rockfall and glacial crevasse calve echoing.',
    confidenceScore: 0.62,
    reviewedBy: 'Ranger Dorje',
    reviewerNotes: 'Inspected ridge. Confirmed fresh rockfall debris field, no evidence of human ingress or cartridge casings.',
    auditHistory: [
      {
        timestamp: '2026-10-05 01:14 UTC',
        actor: 'Acoustic Sentinel HEMIS-02',
        action: 'Shockwave Transient Alert',
        notes: 'Impulse rise time < 1ms, peak SPL 112 dB.'
      },
      {
        timestamp: '2026-10-05 07:00 UTC',
        actor: 'Ranger Dorje',
        action: 'Resolved as Geologic Rockfall',
        notes: 'Confirmed non-anthropogenic acoustic source.'
      }
    ]
  }
];

export const INITIAL_OBSERVATIONS: WildlifeObservation[] = [
  {
    id: 'OBS-7740',
    speciesId: 'sp-tiger',
    speciesName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    conservationStatus: 'Endangered',
    observedAt: '2026-10-10 17:42:00',
    locationName: 'Ranthambore National Park - Zone 3 Lake Sector',
    latitude: 26.0173,
    longitude: 76.5026,
    cameraTrapId: 'CT-RAN-08',
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.984,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    verifiedBy: 'Senior Biologist M. Sharma',
    verifiedAt: '2026-10-10 18:05:00',
    boundingBoxes: [
      {
        id: 'box-01',
        ymin: 120,
        xmin: 180,
        ymax: 880,
        xmax: 840,
        label: 'Bengal Tiger (Adult Male)',
        scientificName: 'Panthera tigris tigris',
        confidence: 0.984,
        individualId: 'IND-T108',
        individualName: 'T-108 (Ustad)',
        reIdConfidence: 0.946,
        visualFeatures: ['Clear flank stripe geometry match', 'Left ear notch aligned', 'Full musculature and healthy gait']
      }
    ],
    individualId: 'IND-T108',
    individualName: 'T-108 (Ustad)',
    reIdScore: 0.946,
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 28,
      weather: 'Clear dusk',
      timeOfDay: 'Dusk'
    },
    notes: 'Individual in prime body condition traversing customary patrol route along lake bund.'
  },
  {
    id: 'OBS-7735',
    speciesId: 'sp-snow-leopard',
    speciesName: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    conservationStatus: 'Vulnerable',
    observedAt: '2026-10-09 06:14:22',
    locationName: 'Hemis National Park - Rumbak Ridge (4,300m)',
    latitude: 34.0289,
    longitude: 77.3456,
    cameraTrapId: 'CT-HEMIS-04',
    imageUrl: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.962,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    verifiedBy: 'Dr. Tenzing Norbu',
    verifiedAt: '2026-10-09 09:12:00',
    boundingBoxes: [
      {
        id: 'box-02',
        ymin: 150,
        xmin: 110,
        ymax: 850,
        xmax: 890,
        label: 'Snow Leopard',
        scientificName: 'Panthera uncia',
        confidence: 0.962,
        individualId: 'IND-SL04',
        individualName: 'SL-04 (Chomolung)',
        reIdConfidence: 0.894,
        distressAnomalyFlag: true,
        visualFeatures: ['Left shoulder fused rosette match', 'Abnormal right hindquarter posture']
      }
    ],
    individualId: 'IND-SL04',
    individualName: 'SL-04 (Chomolung)',
    reIdScore: 0.894,
    anomalyDetected: true,
    environmentalConditions: {
      temperatureC: -4,
      weather: 'Subzero alpine frost',
      timeOfDay: 'Dawn'
    },
    notes: 'Automated Silent Distress alert dispatched due to gait asymmetry and delayed stride.'
  },
  {
    id: 'OBS-7729',
    speciesId: 'sp-elephant',
    speciesName: 'Asian Elephant',
    scientificName: 'Elephas maximus',
    conservationStatus: 'Endangered',
    observedAt: '2026-10-08 15:30:11',
    locationName: 'Nagarhole National Park - Kabini Riverside',
    latitude: 11.9862,
    longitude: 76.2711,
    cameraTrapId: 'CT-NAG-19',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.991,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    verifiedBy: 'Ranger K. Raman',
    verifiedAt: '2026-10-08 16:00:00',
    boundingBoxes: [
      {
        id: 'box-03',
        ymin: 80,
        xmin: 140,
        ymax: 920,
        xmax: 880,
        label: 'Asian Elephant (Tusker)',
        scientificName: 'Elephas maximus',
        confidence: 0.991,
        individualId: 'IND-AE12',
        individualName: 'AE-12 (Balarama)',
        reIdConfidence: 0.968,
        visualFeatures: ['Right ear notch profile match', 'Intact prominent ivory tusks']
      }
    ],
    individualId: 'IND-AE12',
    individualName: 'AE-12 (Balarama)',
    reIdScore: 0.968,
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 31,
      weather: 'Humid afternoon',
      timeOfDay: 'Day'
    },
    notes: 'Healthy bull foraging on reed beds near riverbank. Normal movement vector.'
  },
  {
    id: 'OBS-7718',
    speciesId: 'sp-red-panda',
    speciesName: 'Red Panda',
    scientificName: 'Ailurus fulgens',
    conservationStatus: 'Endangered',
    observedAt: '2026-10-07 11:22:45',
    locationName: 'Singalila National Park - Gairibas Ridge (2,600m)',
    latitude: 27.0542,
    longitude: 88.0289,
    cameraTrapId: 'CT-SING-02',
    imageUrl: 'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.975,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    boundingBoxes: [
      {
        id: 'box-04',
        ymin: 120,
        xmin: 220,
        ymax: 860,
        xmax: 800,
        label: 'Red Panda',
        scientificName: 'Ailurus fulgens',
        confidence: 0.975,
        individualId: 'IND-RP07',
        individualName: 'RP-07 (Ruby)',
        reIdConfidence: 0.875,
        visualFeatures: ['White tear patch symmetry', 'Ringed tail counter match']
      }
    ],
    individualId: 'IND-RP07',
    individualName: 'RP-07 (Ruby)',
    reIdScore: 0.875,
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 14,
      weather: 'Mild temperate mist',
      timeOfDay: 'Day'
    },
    notes: 'Feeding in upper canopy of rhododendron branch. Healthy ring tail coat.'
  },
  {
    id: 'OBS-7709',
    speciesId: 'sp-gharial',
    speciesName: 'Gharial',
    scientificName: 'Gavialis gangeticus',
    conservationStatus: 'Critically Endangered',
    observedAt: '2026-10-06 14:05:30',
    locationName: 'National Chambal Sanctuary - Palighat Sandbar',
    latitude: 25.8821,
    longitude: 76.5412,
    cameraTrapId: 'CT-CHAM-06',
    imageUrl: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.958,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    boundingBoxes: [
      {
        id: 'box-05',
        ymin: 240,
        xmin: 160,
        ymax: 790,
        xmax: 890,
        label: 'Gharial (Adult Female)',
        scientificName: 'Gavialis gangeticus',
        confidence: 0.958,
        visualFeatures: ['Slender rostrum shape', 'Nuchal scute layout verified']
      }
    ],
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 33,
      weather: 'Sunny riparian',
      timeOfDay: 'Day'
    },
    notes: 'Basking on protected sandbank. No fishing nets or human disturbance in line of sight.'
  },
  {
    id: 'OBS-7695',
    speciesId: 'sp-amur-leopard',
    speciesName: 'Amur Leopard',
    scientificName: 'Panthera pardus orientalis',
    conservationStatus: 'Critically Endangered',
    observedAt: '2026-10-05 21:10:04',
    locationName: 'Land of the Leopard National Park - Kedrovaya Pad',
    latitude: 43.1023,
    longitude: 131.5123,
    cameraTrapId: 'CT-AMUR-11',
    imageUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?auto=format&fit=crop&w=1200&q=80',
    confidence: 0.988,
    modelUsed: 'BioSentinel-Vision (Gemini 3.8 Flash Multimodal)',
    isDemoData: false,
    isVerified: true,
    boundingBoxes: [
      {
        id: 'box-06',
        ymin: 110,
        xmin: 140,
        ymax: 880,
        xmax: 890,
        label: 'Amur Leopard',
        scientificName: 'Panthera pardus orientalis',
        confidence: 0.988,
        visualFeatures: ['Broad rosette spacing', 'Thick winter coat density', 'Flank pattern recorded']
      }
    ],
    anomalyDetected: false,
    environmentalConditions: {
      temperatureC: 2,
      weather: 'Taiga autumn night',
      timeOfDay: 'Night'
    },
    notes: 'Nocturnal boundary scent-marking on cedar trunk. Prime physical condition.'
  }
];

export const INITIAL_ACOUSTIC: AcousticRecording[] = [
  {
    id: 'AC-2026-041',
    title: 'Bengal Tiger Territorial Low Roar',
    timestamp: '2026-10-10 18:32 UTC',
    sensorNodeId: 'AUDIO-SENTINEL-04',
    locationName: 'Ranthambore - Kachida Gorge',
    durationSeconds: 12.4,
    soundCategory: 'Apex Carnivore Vocalization',
    speciesCandidate: 'Panthera tigris (Bengal Tiger)',
    confidence: 0.942,
    frequencyRangeHz: '18 Hz - 450 Hz (Infrasound Component Present)',
    isThreatIndicator: false,
    explanation: 'Low-frequency resonant vocalization matching dominant male territorial broadcast. Infrasonic energy below 20Hz verified with seismic geophone node.',
    waveformSnippet: [0.1, 0.15, 0.4, 0.85, 0.95, 0.72, 0.35, 0.12, 0.08, 0.45, 0.9, 0.78, 0.2, 0.05]
  },
  {
    id: 'AC-2026-039',
    title: 'Motorized Chainsaw High-Frequency Harmonic',
    timestamp: '2026-10-09 23:38 UTC',
    sensorNodeId: 'AUDIO-SENTINEL-12',
    locationName: 'Chambal Buffer Zone - KM 42',
    durationSeconds: 24.0,
    soundCategory: 'Anthropogenic Disturbance',
    speciesCandidate: 'Non-Biological (Two-Stroke Internal Combustion)',
    confidence: 0.931,
    frequencyRangeHz: '120 Hz fundamental + 2400 Hz blade pitch harmonics',
    isThreatIndicator: true,
    explanation: 'Sustained two-stroke engine signature with variable load torque matching handheld logging chainsaw. Triggered auto-alert THR-2026-015.',
    waveformSnippet: [0.6, 0.65, 0.62, 0.68, 0.71, 0.69, 0.64, 0.67, 0.72, 0.7, 0.66, 0.68, 0.65]
  },
  {
    id: 'AC-2026-035',
    title: 'Asian Elephant Infrasonic Contact Rumble',
    timestamp: '2026-10-08 04:12 UTC',
    sensorNodeId: 'AUDIO-SENTINEL-08',
    locationName: 'Nagarhole - Kabini Corridor',
    durationSeconds: 18.2,
    soundCategory: 'Elephant Herd Coordination',
    speciesCandidate: 'Elephas maximus (Asian Elephant)',
    confidence: 0.965,
    frequencyRangeHz: '14 Hz - 32 Hz',
    isThreatIndicator: false,
    explanation: 'Sub-audible rumbling pulse between matriarch and sub-adult male, indicating safe river crossing coordination across 3.4 km radius.',
    waveformSnippet: [0.2, 0.4, 0.7, 0.88, 0.92, 0.85, 0.6, 0.3, 0.15, 0.1, 0.2, 0.35, 0.1]
  },
  {
    id: 'AC-2026-029',
    title: 'High-Altitude Scree Rockfall Impulse (Non-Poaching)',
    timestamp: '2026-10-05 01:14 UTC',
    sensorNodeId: 'AUDIO-SENTINEL-02',
    locationName: 'Hemis - Markha Ridge',
    durationSeconds: 8.5,
    soundCategory: 'Geological Acoustic Transient',
    speciesCandidate: 'Geological (Rockfall)',
    confidence: 0.885,
    frequencyRangeHz: '40 Hz - 8000 Hz broadband decay',
    isThreatIndicator: false,
    explanation: 'Initially flagged as potential firearm shockwave; Fourier decomposition confirmed gradual rolling reverberation consistent with scree collapse rather than firearm muzzle blast.',
    waveformSnippet: [0.05, 0.98, 0.75, 0.55, 0.42, 0.35, 0.28, 0.21, 0.15, 0.1, 0.08, 0.04]
  }
];

export const INITIAL_MODEL_TELEMETRY: ModelTelemetry = {
  modelName: 'BioSentinel Vision-BioCore v4.2 (Gemini 3.8 Flash)',
  modelVersion: '2026.10-R3',
  architecture: 'Gemini 3.8 Flash Multimodal Vision Transformer + ReID Biometric Head',
  device: 'GCP Cloud Run AI Studio Inference Engine',
  meanInferenceLatencyMs: 385,
  speciesClassesCount: 142,
  f1Score: 0.958,
  lastTrainedDate: '2026-10-01',
  status: 'Online'
};
