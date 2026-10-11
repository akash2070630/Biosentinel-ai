import React, { useState, useEffect } from 'react';
import {
  Species,
  IndividualAnimal,
  BehavioralAnomaly,
  ThreatRecord,
  WildlifeObservation,
  AcousticRecording,
  ModelTelemetry,
  UserProfile
} from './types';
import { api } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { DemoBanner } from './components/common/DemoBanner';
import { ObservationModal } from './components/common/ObservationModal';

// Pages
import { ConservationHome } from './pages/ConservationHome';
import { IntelligenceDashboard } from './pages/IntelligenceDashboard';
import { SpeciesAtlas } from './pages/SpeciesAtlas';
import { DetectionStudio } from './pages/DetectionStudio';
import { IndividualAnimalLab } from './pages/IndividualAnimalLab';
import { SilentDistressMonitor } from './pages/SilentDistressMonitor';
import { ThreatIntelligenceCenter } from './pages/ThreatIntelligenceCenter';
import { HabitatWatchMap } from './pages/HabitatWatchMap';
import { AcousticLab } from './pages/AcousticLab';
import { ObservationExplorer } from './pages/ObservationExplorer';
import { ConservationReports } from './pages/ConservationReports';
import { AdminSettings } from './pages/AdminSettings';

import {
  INITIAL_SPECIES,
  INITIAL_INDIVIDUALS,
  INITIAL_ANOMALIES,
  INITIAL_THREATS,
  INITIAL_OBSERVATIONS,
  INITIAL_ACOUSTIC,
  INITIAL_MODEL_TELEMETRY
} from './data/seedData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Application Data State
  const [species, setSpecies] = useState<Species[]>(INITIAL_SPECIES);
  const [individuals, setIndividuals] = useState<IndividualAnimal[]>(INITIAL_INDIVIDUALS);
  const [observations, setObservations] = useState<WildlifeObservation[]>(INITIAL_OBSERVATIONS);
  const [threats, setThreats] = useState<ThreatRecord[]>(INITIAL_THREATS);
  const [anomalies, setAnomalies] = useState<BehavioralAnomaly[]>(INITIAL_ANOMALIES);
  const [acoustic, setAcoustic] = useState<AcousticRecording[]>(INITIAL_ACOUSTIC);
  const [telemetry, setTelemetry] = useState<ModelTelemetry>(INITIAL_MODEL_TELEMETRY);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(false);

  // User Profile & Privacy State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Dr. Evelyn Reed',
    email: 'e.reed@biosentinel.conservation.org',
    role: 'Lead Ecologist',
    badgeNumber: 'BIO-SENTINEL-904',
    canViewUnmaskedCoordinates: false,
    canVerifyIncidents: true,
  });

  // Modal State
  const [activeModalObs, setActiveModalObs] = useState<WildlifeObservation | null>(null);

  // Initial load from backend API
  useEffect(() => {
    async function loadData() {
      try {
        const health = await api.getHealth();
        setGeminiConnected(health.geminiConfigured);
        if (health.telemetry) setTelemetry(health.telemetry);

        const [sp, ind, obs, th, anom, ac] = await Promise.all([
          api.getSpecies(),
          api.getIndividuals(),
          api.getObservations(),
          api.getThreats(),
          api.getAnomalies(),
          api.getAcoustic()
        ]);

        if (sp?.length) setSpecies(sp);
        if (ind?.length) setIndividuals(ind);
        if (obs?.length) setObservations(obs);
        if (th?.length) setThreats(th);
        if (anom?.length) setAnomalies(anom);
        if (ac?.length) setAcoustic(ac);
      } catch (err) {
        console.warn('API sync warning, using resilient fallback data');
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleObservationSaved = (newObs: WildlifeObservation) => {
    setObservations(prev => [newObs, ...prev]);
  };

  const handleVerifyObservation = (obsId: string) => {
    setObservations(prev =>
      prev.map(o => (o.id === obsId ? { ...o, isVerified: true, verifiedBy: currentUser.name } : o))
    );
    if (activeModalObs && activeModalObs.id === obsId) {
      setActiveModalObs(prev => (prev ? { ...prev, isVerified: true, verifiedBy: currentUser.name } : null));
    }
  };

  const handleUpdateThreat = (updatedThreat: ThreatRecord) => {
    setThreats(prev => prev.map(t => (t.id === updatedThreat.id ? updatedThreat : t)));
  };

  const handleUpdateAnomalyStatus = (
    anomalyId: string,
    newStatus: BehavioralAnomaly['reviewStatus']
  ) => {
    setAnomalies(prev =>
      prev.map(a =>
        a.id === anomalyId ? { ...a, reviewStatus: newStatus, reviewedBy: currentUser.name } : a
      )
    );
  };

  const handleAddAcoustic = (newRec: AcousticRecording) => {
    setAcoustic(prev => [newRec, ...prev]);
  };

  const activeThreatsCount = threats.filter(
    t => t.status === 'Unverified AI Indicator' || t.status === 'Ranger Investigating'
  ).length;

  const activeAnomaliesCount = anomalies.filter(
    a => a.reviewStatus !== 'Sensor Artifact / Dismissed'
  ).length;

  return (
    <div className="min-h-screen bg-[#102C27] text-[#F7F6F0] flex flex-col font-sans selection:bg-[#2D6A4F] selection:text-white">
      {/* Top Demo & Integrity Banner */}
      <DemoBanner
        isDemo={!geminiConnected}
        geminiConfigured={geminiConnected}
        modelName={telemetry.modelName}
      />

      {/* Main Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        threatCount={activeThreatsCount}
        anomalyCount={activeAnomaliesCount}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
      />

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentPage === 'home' && (
          <ConservationHome
            onNavigate={(page) => setCurrentPage(page)}
            species={species}
            observations={observations}
            threats={threats}
            anomalies={anomalies}
            onSelectObservation={(obs) => setActiveModalObs(obs)}
          />
        )}

        {currentPage === 'dashboard' && (
          <IntelligenceDashboard
            species={species}
            observations={observations}
            threats={threats}
            anomalies={anomalies}
            telemetry={telemetry}
            onNavigate={(page) => setCurrentPage(page)}
            onSelectObservation={(obs) => setActiveModalObs(obs)}
            onVerifyObservation={handleVerifyObservation}
            unmaskedCoordinates={currentUser.canViewUnmaskedCoordinates}
          />
        )}

        {currentPage === 'detect' && (
          <DetectionStudio
            speciesList={species}
            onObservationSaved={handleObservationSaved}
            onNavigateToExplorer={() => setCurrentPage('observations')}
            onNavigateToHabitat={() => setCurrentPage('habitat')}
            onNavigateToAudit={() => setCurrentPage('settings')}
          />
        )}

        {currentPage === 'species' && (
          <SpeciesAtlas
            species={species}
            onNavigateToObservations={() => {
              setCurrentPage('observations');
            }}
          />
        )}

        {currentPage === 'individuals' && (
          <IndividualAnimalLab
            individuals={individuals}
            observations={observations}
            onSelectObservation={(obs) => setActiveModalObs(obs)}
          />
        )}

        {currentPage === 'silent-distress' && (
          <SilentDistressMonitor
            anomalies={anomalies}
            onUpdateAnomalyStatus={handleUpdateAnomalyStatus}
          />
        )}

        {currentPage === 'threats' && (
          <ThreatIntelligenceCenter
            threats={threats}
            onUpdateThreat={handleUpdateThreat}
            unmaskedCoordinates={currentUser.canViewUnmaskedCoordinates}
          />
        )}

        {currentPage === 'habitat' && (
          <HabitatWatchMap
            observations={observations}
            threats={threats}
            species={species}
            unmaskedCoordinates={currentUser.canViewUnmaskedCoordinates}
            onToggleCoordinateMask={() =>
              setCurrentUser({
                ...currentUser,
                canViewUnmaskedCoordinates: !currentUser.canViewUnmaskedCoordinates
              })
            }
            onVerifyObservation={handleVerifyObservation}
          />
        )}

        {currentPage === 'acoustic' && (
          <AcousticLab
            recordings={acoustic}
            onAddRecording={handleAddAcoustic}
          />
        )}

        {currentPage === 'observations' && (
          <ObservationExplorer
            observations={observations}
            species={species}
            onSelectObservation={(obs) => setActiveModalObs(obs)}
            onVerifyObservation={handleVerifyObservation}
            unmaskedCoordinates={currentUser.canViewUnmaskedCoordinates}
            onNavigateToReports={() => setCurrentPage('reports')}
          />
        )}

        {currentPage === 'reports' && (
          <ConservationReports
            observations={observations}
            threats={threats}
            anomalies={anomalies}
            species={species}
            telemetry={telemetry}
          />
        )}

        {currentPage === 'settings' && (
          <AdminSettings
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
            telemetry={telemetry}
            geminiConnected={geminiConnected}
          />
        )}
      </main>

      {/* Global Observation Modal */}
      <ObservationModal
        observation={activeModalObs}
        onClose={() => setActiveModalObs(null)}
        onVerify={handleVerifyObservation}
        unmaskedCoordinates={currentUser.canViewUnmaskedCoordinates}
      />

      {/* Footer */}
      <footer className="bg-[#0B1E1A] border-t border-[#183E34] py-8 text-xs text-[#7E9685]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-serif-title font-bold text-white text-sm">BioSentinel AI</span>
            <span className="text-[#A8B9A0] ml-2">
              Autonomous Endangered Species Intelligence & Individual Monitoring System
            </span>
            <div className="text-[11px] text-[#5D7A68] mt-1">
              Photographs accredited to Wikimedia Commons & Wildlife Registry. Strictly non-invasive decision support.
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setCurrentPage('reports')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Mission Audit Reports
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentPage('settings')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Anti-Poach Security Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentPage('species')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              IUCN Taxa Atlas
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
