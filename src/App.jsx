import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AiInspectionStudio from './components/AiInspectionStudio';
import GisMap from './components/GisMap';
import HoardingRegistry from './components/HoardingRegistry';
import CitizenPortal from './components/CitizenPortal';
import NoticeGenerator from './components/NoticeGenerator';
import BannerScannerModal from './components/BannerScannerModal';
import OfficerPortal from './components/OfficerPortal';
import { translations } from './translations/i18n';
import { initialHoardings, scannerPresets, citizenComplaints, initialScannedSubmissions } from '../server/data';

export default function App() {
  const [lang, setLang] = useState('mr'); // Marathi as default official corporation language
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [hoardings, setHoardings] = useState(initialHoardings);
  const [presets, setPresets] = useState(scannerPresets);
  const [complaints, setComplaints] = useState(citizenComplaints);
  const [scannedSubmissions, setScannedSubmissions] = useState(initialScannedSubmissions);
  const [stats, setStats] = useState(null);

  const [currentInspectionResult, setCurrentInspectionResult] = useState(null);
  const [isInspectionLoading, setIsInspectionLoading] = useState(false);
  const [selectedHoardingForNotice, setSelectedHoardingForNotice] = useState(null);

  // Top Search Bar & Scanner Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const t = translations[lang] || translations.mr;

  // Fetch initial data from Express backend (with graceful fallback to in-memory datasets & localStorage)
  const refreshData = async () => {
    try {
      const [hRes, pRes, cRes, sRes, scanRes] = await Promise.allSettled([
        fetch('/api/hoardings').then(r => r.json()),
        fetch('/api/presets').then(r => r.json()),
        fetch('/api/complaints').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/scans').then(r => r.json())
      ]);

      if (hRes.status === 'fulfilled' && Array.isArray(hRes.value)) setHoardings(hRes.value);
      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) setPresets(pRes.value);
      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) setComplaints(cRes.value);
      if (sRes.status === 'fulfilled' && sRes.value?.totalHoardings !== undefined) setStats(sRes.value);
      if (scanRes.status === 'fulfilled' && Array.isArray(scanRes.value)) {
        setScannedSubmissions(scanRes.value);
      } else {
        // Check localStorage backup
        const cached = localStorage.getItem('smkc_scans');
        if (cached) {
          try { setScannedSubmissions(JSON.parse(cached)); } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Backend offline or proxying, using local data store', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute fallback stats if not fetched yet
  const computedStats = stats || {
    totalHoardings: hoardings.length,
    illegalCount: hoardings.filter(h => h.status === 'illegal').length,
    criticalHazardCount: hoardings.filter(h => h.status === 'critical_hazard').length,
    expiredCount: hoardings.filter(h => h.status === 'expired').length,
    permittedCount: hoardings.filter(h => h.status === 'permitted').length,
    illegalRatePct: '50.0',
    totalFinesLevied: hoardings.reduce((s, h) => s + (h.fineAmount || 0), 0),
    activeEnforcementSquads: 5,
  };

  // Run AI & Mobile Mapping Smart Inspection
  const handleRunInspection = async (payload) => {
    setIsInspectionLoading(true);
    try {
      const res = await fetch('/api/scanner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentInspectionResult(data);
        setIsInspectionLoading(false);
        return data;
      }
    } catch (err) {
      console.warn('API error, executing client-side simulation', err);
    }

    // Client-side simulation fallback if backend is reloading
    const preset = presets.find(p => p.id === payload.presetId) || presets[0];
    const fallback = {
      success: true,
      source: 'preset',
      presetId: preset.id,
      name: preset.name,
      city: preset.city,
      ward: preset.ward,
      location: preset.location,
      lat: preset.lat,
      lng: preset.lng,
      image: payload.customImage || preset.image,
      stages: preset.stages,
      summary: {
        status: preset.stages.compliance.isPermitted ? 'Permitted' : 'Illegal / Non-compliant',
        confidence: `${(preset.stages.detection.confidence * 100).toFixed(1)}%`,
        penalty: `₹${preset.stages.compliance.penaltyProposed.toLocaleString('en-IN')}`,
        actSection: preset.stages.compliance.actSection
      }
    };
    setCurrentInspectionResult(fallback);
    setIsInspectionLoading(false);
    return fallback;
  };

  // Citizen Complaint submission
  const handleAddComplaint = async (complaintData) => {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      });
      if (res.ok) {
        const item = await res.json();
        setComplaints(prev => [item, ...prev]);
        return item;
      }
    } catch (err) {
      console.warn('Fallback adding complaint locally');
    }

    const fallbackItem = {
      id: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...complaintData,
      status: 'Complaint Logged & Dispatched to Ward Officer',
      filedDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      assignedOfficer: 'Assigned to Ward Junior Engineer'
    };
    setComplaints(prev => [fallbackItem, ...prev]);
    return fallbackItem;
  };

  // Citizen Scanned Photo Submission to Database
  const handleScanSubmitted = (newScan) => {
    setScannedSubmissions(prev => {
      const updated = [newScan, ...prev];
      try {
        localStorage.setItem('smkc_scans', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Municipal Officer Updates Work Progress for Scanned Submission
  const handleUpdateScanProgress = async (id, updatedFields) => {
    try {
      await fetch(`/api/scans/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (e) {
      console.warn('Offline update for scan progress');
    }

    setScannedSubmissions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updatedFields } : s);
      try {
        localStorage.setItem('smkc_scans', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Demolish / Remove hoarding
  const handleDeleteHoarding = async (id) => {
    if (!window.confirm(`Confirm demolition and removal of hoarding ${id} from municipal records?`)) return;
    try {
      await fetch(`/api/hoardings/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Local delete');
    }
    setHoardings(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Trilingual Navbar with Search Bar & Scanner Option */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        t={t}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={computedStats}
            hoardings={hoardings}
            setActiveTab={setActiveTab}
            setSelectedHoardingForNotice={setSelectedHoardingForNotice}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'scanner' && (
          <AiInspectionStudio
            presets={presets}
            onRunInspection={handleRunInspection}
            currentResult={currentInspectionResult}
            isLoading={isInspectionLoading}
            setActiveTab={setActiveTab}
            setSelectedHoardingForNotice={setSelectedHoardingForNotice}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'map' && (
          <GisMap
            hoardings={hoardings}
            setActiveTab={setActiveTab}
            setSelectedHoardingForNotice={setSelectedHoardingForNotice}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'registry' && (
          <HoardingRegistry
            hoardings={hoardings}
            onDeleteHoarding={handleDeleteHoarding}
            setActiveTab={setActiveTab}
            setSelectedHoardingForNotice={setSelectedHoardingForNotice}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenPortal
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            t={t}
            lang={lang}
          />
        )}

        {activeTab === 'notice' && (
          <NoticeGenerator
            hoardings={hoardings}
            selectedHoarding={selectedHoardingForNotice}
            setSelectedHoarding={setSelectedHoardingForNotice}
            t={t}
            lang={lang}
          />
        )}

        {/* OFFICER LOGIN & WORK PROGRESS CONSOLE AT VERY BOTTOM OF WEBSITE */}
        <OfficerPortal
          scannedSubmissions={scannedSubmissions}
          onUpdateScanProgress={handleUpdateScanProgress}
          setSelectedHoardingForNotice={setSelectedHoardingForNotice}
          setActiveTab={setActiveTab}
          t={t}
          lang={lang}
        />

      </main>

      {/* AI BANNER SCANNER MODAL (Triggered from Top Search Bar or Quick Scan) */}
      <BannerScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScanSubmitted={handleScanSubmitted}
        t={t}
        lang={lang}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-slate-200">
              सांगली मिरज आणि कुपवाड शहर महानगरपालिका (SMKC)
            </div>
            <div className="text-[11px] text-slate-400">
              Sky Signs & Advertising Regulation Portal • Powered by 2026 Mobile Mapping & YOLOv8 Deep Vision
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>Maharashtra Municipal Corporation Act 1949 (Sec 244/245)</span>
            <span>•</span>
            <span>Bombay High Court PIL 155/2011</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">Toll-Free Helpline: 1800-233-1234</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
