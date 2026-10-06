import React, { useState, useEffect } from 'react';
import { Scan, Camera } from 'lucide-react';
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
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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

      </main>

      {/* AI BANNER SCANNER MODAL (Triggered from Top Search Bar or Quick Scan) */}
      <BannerScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onScanSubmitted={handleScanSubmitted}
        onOpenAdminPortal={() => setIsAdminModalOpen(true)}
        t={t}
        lang={lang}
      />

      {/* SECURE ADMIN / OFFICER PORTAL MODAL (Triggered only via Footer "Admin Portal" anchor tag) */}
      <OfficerPortal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        scannedSubmissions={scannedSubmissions}
        onUpdateScanProgress={handleUpdateScanProgress}
        setSelectedHoardingForNotice={setSelectedHoardingForNotice}
        setActiveTab={setActiveTab}
        t={t}
        lang={lang}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-8 px-4 no-print">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="font-bold text-slate-200 text-sm">
                सांगली मिरज आणि कुपवाड शहर महानगरपालिका (SMKC)
              </div>
              <div className="text-[11px] text-slate-400">
                Sky Signs & Advertising Regulation Portal • Powered by 2026 Mobile Mapping & YOLOv8 Deep Vision
              </div>
            </div>

            {/* Official Social Media Links */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">अधिकृत संपर्क:</span>
              <a
                href="https://x.com/SmkcMission?s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black border border-slate-700 text-white flex items-center justify-center transition-all hover:scale-110"
                title="SMKC Twitter / X (@SmkcMission)"
              >
                <span className="font-bold text-xs">𝕏</span>
              </a>
              <a
                href="https://www.facebook.com/people/Smkc-Sangli/100011116629758/?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-110"
                title="SMKC Facebook (Smkc-Sangli)"
              >
                <span className="font-bold text-xs">f</span>
              </a>
              <a
                href="https://www.instagram.com/smkc_mission_updates?igsh=dWFiNHFtYWE1M21x"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center transition-all hover:scale-110"
                title="SMKC Instagram (@smkc_mission_updates)"
              >
                <span className="text-xs">📸</span>
              </a>
              <a
                href="https://www.youtube.com/@smkcnewssangli6016"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF0000] hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110"
                title="SMKC YouTube Channel (@smkcnewssangli6016)"
              >
                <span className="font-bold text-xs">▶</span>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=917066040357&text=Namaskar%20SMKC%20Helpline"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[11px] shadow transition-all hover:scale-105"
                title="मनपा व्हॉट्सॲप हेल्पलाईन (7066040357)"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.58L5.06 16.27C4.24 14.97 3.8 13.46 3.8 11.92C3.8 7.37 7.5 3.67 12.05 3.67C16.6 3.67 20.3 7.37 20.3 11.92C20.29 16.46 16.6 20.15 12.05 20.15M16.57 14.39C16.32 14.26 15.1 13.66 14.87 13.58C14.65 13.5 14.48 13.46 14.32 13.71C14.15 13.96 13.67 14.52 13.52 14.69C13.37 14.86 13.22 14.88 12.97 14.76C12.72 14.63 11.92 14.37 10.97 13.52C10.23 12.86 9.73 12.05 9.58 11.8C9.43 11.55 9.56 11.41 9.69 11.29C9.8 11.18 9.94 11 10.06 10.86C10.19 10.72 10.23 10.62 10.31 10.45C10.39 10.28 10.35 10.14 10.29 10.01C10.23 9.89 9.74 8.68 9.53 8.19C9.33 7.71 9.13 7.77 8.97 7.76C8.82 7.76 8.65 7.75 8.48 7.75C8.32 7.75 8.05 7.81 7.82 8.06C7.6 8.3 6.97 8.89 6.97 10.09C6.97 11.29 7.84 12.45 7.97 12.61C8.09 12.78 9.7 15.26 12.16 16.32C12.75 16.57 13.2 16.72 13.56 16.83C14.15 17.02 14.68 16.99 15.11 16.93C15.58 16.86 16.57 16.33 16.78 15.75C16.98 15.17 16.98 14.67 16.92 14.57C16.86 14.47 16.7 14.41 16.45 14.29L16.57 14.39Z"/>
                </svg>
                <span>7066040357</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <span>Maharashtra Municipal Corporation Act 1949 (Sec 244/245)</span>
              <span>•</span>
              <span>Bombay High Court PIL 155/2011</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">Toll-Free Helpline: 1800-233-1234</span>
            </div>

            <div>
              <a
                href="#admin-portal"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAdminModalOpen(true);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer transition-colors"
                title="केवळ अधिकृत प्रशासकीय अधिकाऱ्यांसाठी (Admin Portal Only)"
              >
                Admin Portal
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTONS: WHATSAPP (GREEN) & SCROLL TO TOP */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 no-print">
        {/* Real WhatsApp Floating Button */}
        <a
          href="https://api.whatsapp.com/send?phone=917066040357&text=Namaskar%20SMKC%20Helpline"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-emerald-400/40 group relative cursor-pointer"
          title="मनपा अधिकृत व्हॉट्सॲप हेल्पलाईन (7066040357)"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-300 rounded-full animate-ping" />
          <svg className="w-8 h-8 fill-white transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.15C10.57 20.15 9.12 19.75 7.85 19L7.55 18.82L4.43 19.64L5.26 16.58L5.06 16.27C4.24 14.97 3.8 13.46 3.8 11.92C3.8 7.37 7.5 3.67 12.05 3.67C16.6 3.67 20.3 7.37 20.3 11.92C20.29 16.46 16.6 20.15 12.05 20.15M16.57 14.39C16.32 14.26 15.1 13.66 14.87 13.58C14.65 13.5 14.48 13.46 14.32 13.71C14.15 13.96 13.67 14.52 13.52 14.69C13.37 14.86 13.22 14.88 12.97 14.76C12.72 14.63 11.92 14.37 10.97 13.52C10.23 12.86 9.73 12.05 9.58 11.8C9.43 11.55 9.56 11.41 9.69 11.29C9.8 11.18 9.94 11 10.06 10.86C10.19 10.72 10.23 10.62 10.31 10.45C10.39 10.28 10.35 10.14 10.29 10.01C10.23 9.89 9.74 8.68 9.53 8.19C9.33 7.71 9.13 7.77 8.97 7.76C8.82 7.76 8.65 7.75 8.48 7.75C8.32 7.75 8.05 7.81 7.82 8.06C7.6 8.3 6.97 8.89 6.97 10.09C6.97 11.29 7.84 12.45 7.97 12.61C8.09 12.78 9.7 15.26 12.16 16.32C12.75 16.57 13.2 16.72 13.56 16.83C14.15 17.02 14.68 16.99 15.11 16.93C15.58 16.86 16.57 16.33 16.78 15.75C16.98 15.17 16.98 14.67 16.92 14.57C16.86 14.47 16.7 14.41 16.45 14.29L16.57 14.39Z"/>
          </svg>
        </a>

        {/* Scroll To Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-black text-base cursor-pointer"
          title="वर जा (Scroll To Top)"
        >
          ↑
        </button>
      </div>

      {/* FLOATING SCANNER BUTTON AT BOTTOM */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print pointer-events-auto">
        <button
          onClick={() => setIsScannerModalOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-5 py-2.5 rounded-full shadow-2xl border-2 border-white/60 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 ring-4 ring-orange-500/25 cursor-pointer"
          title="Scan"
        >
          <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
            <Scan className="w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-wider uppercase text-slate-950 pr-1">
            SCAN
          </span>
        </button>
      </div>

    </div>
  );
}
