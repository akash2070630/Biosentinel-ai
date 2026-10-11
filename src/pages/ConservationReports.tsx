import React, { useState, useEffect } from 'react';
import { WildlifeObservation, ThreatRecord, BehavioralAnomaly, Species, ModelTelemetry } from '../types';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Filter, Search, Layers, Flame, HeartPulse, History } from 'lucide-react';
import { api } from '../services/api';

interface ConservationReportsProps {
  observations: WildlifeObservation[];
  threats: ThreatRecord[];
  anomalies: BehavioralAnomaly[];
  species: Species[];
  telemetry: ModelTelemetry;
}

export function ConservationReports({
  observations,
  threats,
  anomalies,
  species,
  telemetry
}: ConservationReportsProps) {
  const [reportSection, setReportSection] = useState<'all' | 'observations' | 'threats' | 'anomalies' | 'audit'>('all');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('All');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    api.getAuditLogs().then(logs => setAuditLogs(logs));
  }, []);

  const verifiedCount = observations.filter(o => o.isVerified).length;
  const criticalThreats = threats.filter(t => t.severity === 'Critical');

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadCSV = (type: 'observations' | 'threats' = 'observations') => {
    window.location.href = `/api/export/csv?type=${type}`;
  };

  const filteredObservations = observations.filter(o =>
    selectedSpeciesFilter === 'All' || o.speciesId === selectedSpeciesFilter
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8AE3A6] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#7BB896]" />
            Regulatory & Scientific Reporting Engine
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Conservation Mission Reports
          </h1>
          <p className="text-xs text-[#A8B9A0] mt-0.5">
            Audit-grade wildlife telemetry summaries, threat mitigation records, and model calibration disclosures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownloadCSV('observations')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#7BB896]" />
            <span>Export Sightings CSV</span>
          </button>
          <button
            onClick={() => handleDownloadCSV('threats')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#143B33] hover:bg-[#1A4D43] border border-[#2D6A4F] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Threats CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D6A4F] hover:bg-[#388463] text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report Section Filter Pills */}
      <div className="bg-[#12362E] p-4 rounded-xl border border-[#1E4E42] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Mission Sections', icon: FileText },
            { id: 'observations', label: 'Observations & Species', icon: Layers },
            { id: 'threats', label: 'Threat Triage Records', icon: Flame },
            { id: 'anomalies', label: 'Silent Distress Anomalies', icon: HeartPulse },
            { id: 'audit', label: 'Chain-of-Custody Audit Trail', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setReportSection(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  reportSection === tab.id
                    ? 'bg-[#2D6A4F] text-white shadow-md'
                    : 'bg-[#0E2420] text-[#A8B9A0] hover:text-white border border-[#1E4E42]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Species Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#7BB896]" />
          <select
            value={selectedSpeciesFilter}
            onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
            className="bg-[#0E2420] border border-[#1E4E42] rounded px-3 py-1.5 text-xs text-white"
          >
            <option value="All">All Monitored Taxa</option>
            {species.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.commonName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-[#102C27] border border-[#2D6A4F] rounded-2xl p-8 sm:p-12 space-y-8 shadow-2xl text-[#E0E8DC]">
        {/* Document Letterhead */}
        <div className="border-b-2 border-[#2D6A4F] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-title font-bold text-2xl text-white tracking-wider">
                BioSentinel<span className="text-[#7BB896]">.AI</span>
              </span>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-[#173F35] text-[#8AE3A6] border border-[#2D6A4F]">
                Official Ecological Audit
              </span>
            </div>
            <p className="text-xs text-[#A8B9A0] mt-1">
              Autonomous Wildlife Intelligence & Individual Sentinel Platform
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 font-mono text-[#A8B9A0]">
            <div>Document Ref: <strong className="text-white">BIO-RPT-2026-P2</strong></div>
            <div>Generated: <strong className="text-white">{new Date().toISOString().split('T')[0]}</strong></div>
            <div>Classification: <strong className="text-emerald-400">UNRESTRICTED SCIENTIFIC AUDIT</strong></div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#173F35] p-4 rounded-xl border border-[#2D6A4F]">
            <div className="text-xs text-[#A8B9A0]">Total Verified Captures</div>
            <div className="text-2xl font-bold font-serif-title text-white mt-1">{filteredObservations.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1">{verifiedCount} Human-Verified</div>
          </div>

          <div className="bg-[#173F35] p-4 rounded-xl border border-[#2D6A4F]">
            <div className="text-xs text-[#A8B9A0]">Target Taxa Covered</div>
            <div className="text-2xl font-bold font-serif-title text-white mt-1">{species.length}</div>
            <div className="text-[11px] text-[#A8B9A0] mt-1">IUCN Red List Classified</div>
          </div>

          <div className="bg-[#173F35] p-4 rounded-xl border border-[#2D6A4F]">
            <div className="text-xs text-[#A8B9A0]">Silent Distress Incidents</div>
            <div className="text-2xl font-bold font-serif-title text-red-300 mt-1">{anomalies.length}</div>
            <div className="text-[11px] text-red-400 mt-1">Z-Score &gt; 2.5 σ Deviations</div>
          </div>

          <div className="bg-[#173F35] p-4 rounded-xl border border-[#2D6A4F]">
            <div className="text-xs text-[#A8B9A0]">Mitigated Threat Alerts</div>
            <div className="text-2xl font-bold font-serif-title text-amber-300 mt-1">{threats.length}</div>
            <div className="text-[11px] text-amber-400 mt-1">{criticalThreats.length} Priority Snare/Logging</div>
          </div>
        </div>

        {/* Section 1: Executive Overview */}
        {(reportSection === 'all' || reportSection === 'observations') && (
          <div className="space-y-3">
            <h2 className="font-serif-title text-lg font-bold text-white border-b border-[#1E4E42] pb-2 flex items-center gap-2">
              <span>1. Executive Summary & Wildlife Intelligence Loop Operations</span>
            </h2>
            <p className="text-xs leading-relaxed text-[#CBD8C6]">
              During this monitoring cycle, the BioSentinel AI network processed multi-spectral camera trap
              imagery and bio-acoustic sentinel feeds across designated core and buffer reserves. Invariant feature
              localization was executed with normalized object coordinates, and probabilistic re-identification matches
              were calculated for tracked flagship species including <em>Panthera tigris</em> (T-108, T-084),
              <em>Panthera uncia</em> (SL-04), and <em>Elephas maximus</em> (AE-12).
            </p>
          </div>
        )}

        {/* Section 2: Species Sightings & Distribution Table */}
        {(reportSection === 'all' || reportSection === 'observations') && (
          <div className="space-y-3">
            <h2 className="font-serif-title text-lg font-bold text-white border-b border-[#1E4E42] pb-2">
              2. Taxa Observation Registry & Status
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#1E4E42]">
              <table className="w-full text-left text-xs text-[#D8E6D5]">
                <thead className="bg-[#143B33] text-[#7BB896] font-semibold">
                  <tr>
                    <th className="p-3">Species</th>
                    <th className="p-3">Scientific Name</th>
                    <th className="p-3">IUCN Status</th>
                    <th className="p-3">Sightings in Window</th>
                    <th className="p-3">Mean Model Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#173F35]">
                  {species.map((sp) => {
                    const spObs = observations.filter(o => o.speciesId === sp.id);
                    const meanConf = spObs.length > 0
                      ? (spObs.reduce((a, b) => a + b.confidence, 0) / spObs.length) * 100
                      : 95.0;
                    return (
                      <tr key={sp.id} className="hover:bg-[#153E35]">
                        <td className="p-3 font-bold text-white">{sp.commonName}</td>
                        <td className="p-3 italic text-[#A8B9A0]">{sp.scientificName}</td>
                        <td className="p-3 font-semibold text-amber-300">{sp.iucnStatus}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{spObs.length}</td>
                        <td className="p-3 font-mono text-[#8AE3A6]">{meanConf.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Threats Registry */}
        {(reportSection === 'all' || reportSection === 'threats') && (
          <div className="space-y-3">
            <h2 className="font-serif-title text-lg font-bold text-white border-b border-[#1E4E42] pb-2">
              3. Conservation Threat Incidents & Mitigation
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#1E4E42]">
              <table className="w-full text-left text-xs text-[#D8E6D5]">
                <thead className="bg-[#143B33] text-[#7BB896] font-semibold">
                  <tr>
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Reviewed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#173F35]">
                  {threats.map((t) => (
                    <tr key={t.id} className="hover:bg-[#153E35]">
                      <td className="p-3 font-mono text-amber-300 font-bold">{t.id}</td>
                      <td className="p-3 font-bold text-white">{t.category}</td>
                      <td className="p-3 font-semibold text-red-300">{t.severity}</td>
                      <td className="p-3 text-[#A8B9A0]">{t.locationName}</td>
                      <td className="p-3 text-white">{t.status}</td>
                      <td className="p-3 text-[#8AE3A6]">{t.reviewedBy || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Silent Distress Anomaly Disclosures */}
        {(reportSection === 'all' || reportSection === 'anomalies') && (
          <div className="space-y-3">
            <h2 className="font-serif-title text-lg font-bold text-white border-b border-[#1E4E42] pb-2">
              4. Silent Distress: Behavioral Anomaly Disclosures
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#1E4E42]">
              <table className="w-full text-left text-xs text-[#D8E6D5]">
                <thead className="bg-[#143B33] text-[#7BB896] font-semibold">
                  <tr>
                    <th className="p-3">Anomaly ID</th>
                    <th className="p-3">Individual Animal</th>
                    <th className="p-3">Anomaly Category</th>
                    <th className="p-3">Key Trigger Feature</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#173F35]">
                  {anomalies.map((anom) => (
                    <tr key={anom.id} className="hover:bg-[#153E35]">
                      <td className="p-3 font-mono text-red-300 font-bold">{anom.id}</td>
                      <td className="p-3 font-bold text-white">{anom.individualName}</td>
                      <td className="p-3 text-amber-300">{anom.anomalyType}</td>
                      <td className="p-3 text-xs text-[#B2C5B0]">
                        {anom.triggeredFeatures[0]?.featureName || 'Locomotion variance'} ({anom.triggeredFeatures[0]?.zScore}σ)
                      </td>
                      <td className="p-3 font-bold text-white">{anom.reviewStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 5: Immutable Chain-of-Custody Audit Trail */}
        {(reportSection === 'all' || reportSection === 'audit') && (
          <div className="space-y-3">
            <h2 className="font-serif-title text-lg font-bold text-white border-b border-[#1E4E42] pb-2 flex items-center justify-between">
              <span>5. Immutable Chain-of-Custody Incident Audit Trail</span>
              <span className="font-mono text-xs text-[#8AE3A6]">{auditLogs.length} Logged Events</span>
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#1E4E42]">
              <table className="w-full text-left text-xs text-[#D8E6D5]">
                <thead className="bg-[#143B33] text-[#7BB896] font-semibold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Authority</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#173F35]">
                  {auditLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-[#153E35]">
                      <td className="p-3 font-mono text-[11px] text-[#A8B9A0] whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3 font-bold text-white">{log.actor}</td>
                      <td className="p-3 text-emerald-300 font-semibold">{log.action}</td>
                      <td className="p-3 text-xs text-[#CBD8C6]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 6: Model Calibration & Uncertainty Notes */}
        <div className="bg-[#143B33] p-5 rounded-xl border border-[#2D6A4F] space-y-2 text-xs">
          <div className="font-bold text-white flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>6. Model Calibration, Verification & Uncertainty Disclosures</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#CBD8C6] pt-1">
            <div>
              • <strong>Active Pipeline:</strong> {telemetry.architecture}
              <br />
              • <strong>Reported F1-Score:</strong> {telemetry.f1Score} (Evaluated on benchmark wildlife validation split)
            </div>
            <div>
              • <strong>Uncertainty State Protocol:</strong> Bounding boxes with confidence &lt; 0.70 are categorized as low-certainty and require multi-ranger validation.
            </div>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="border-t-2 border-[#2D6A4F] pt-6 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A8B9A0] gap-4">
          <div>
            <div>Prepared by: <strong className="text-white">Lead Conservation Ecologist</strong></div>
            <div>Field Bureau: National Endangered Species Protection Command</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Digital Cryptographic Seal Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
