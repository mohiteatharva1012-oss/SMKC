import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Truck, 
  FileText, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Sparkles, 
  Activity, 
  Eye, 
  ChevronRight,
  Sliders,
  ExternalLink,
  X
} from 'lucide-react';

export default function OfficerPortal({ 
  isOpen = true,
  onClose,
  scannedSubmissions = [], 
  onUpdateScanProgress, 
  setSelectedHoardingForNotice, 
  setActiveTab, 
  t, 
  lang 
}) {
  if (!isOpen) return null;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [officerProfile, setOfficerProfile] = useState(null);
  const [officerId, setOfficerId] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Selected submission for review and work progress update
  const [selectedScanId, setSelectedScanId] = useState(scannedSubmissions[0]?.id || null);
  const [workStage, setWorkStage] = useState('In Progress');
  const [workProgressPercent, setWorkProgressPercent] = useState(65);
  const [progressRemarks, setProgressRemarks] = useState('');
  const [assignedSquad, setAssignedSquad] = useState('Sangli Enforcement Squad 01');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  // Public Citizen Token Quick-Lookup Tracker
  const [trackToken, setTrackToken] = useState('');
  const [trackedResult, setTrackedResult] = useState(null);

  // Available Officer Quick Profiles
  const sampleOfficers = [
    {
      id: 'SMKC-OFF-01',
      name: 'Dr. S. K. Mahajan, IAS',
      role: 'Deputy Commissioner (Enforcement & Sky Signs)',
      jurisdiction: 'SMKC Headquarters - Sangli City',
      password: 'admin'
    },
    {
      id: 'SMKC-OFF-02',
      name: 'P. V. Patil',
      role: 'Chief Enforcement Inspector (Miraj Prabhags)',
      jurisdiction: 'Miraj Ward Office, Station Road',
      password: 'admin'
    },
    {
      id: 'SMKC-OFF-03',
      name: 'K. S. Shinde',
      role: 'Junior Engineer (Civil & Spatial Enforcement)',
      jurisdiction: 'Kupwad MIDC Ward Sub-division',
      password: 'admin'
    }
  ];

  const handleQuickLogin = (officer) => {
    setOfficerProfile(officer);
    setIsLoggedIn(true);
    setLoginError('');
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    const id = officerId.trim().toLowerCase();
    const pass = officerPassword.trim();

    if (!id || !pass) {
      setLoginError(lang === 'mr' ? 'कृपया Admin ID व Password दोन्ही प्रविष्ट करा.' : 'Please enter both Officer ID and Password.');
      return;
    }

    if (
      (id === 'admin@smkc.gov.in' && (pass === 'SMKC@2026' || pass === 'admin')) ||
      (pass === 'SMKC@2026')
    ) {
      setOfficerProfile({
        id: officerId.trim(),
        name: 'Dr. S. K. Mahajan, IAS',
        role: 'Deputy Commissioner (Enforcement & Sky Signs)',
        jurisdiction: 'SMKC Central Headquarters - Sangli'
      });
      setIsLoggedIn(true);
      setLoginError('');
      return;
    }

    const match = sampleOfficers.find(o => o.id.toLowerCase() === id);
    if (match && (pass === match.password || pass === 'SMKC@2026' || pass === 'admin')) {
      setOfficerProfile(match);
      setIsLoggedIn(true);
      setLoginError('');
      return;
    }

    // Fallback if password is admin
    if (pass === 'admin') {
      setOfficerProfile({
        id: officerId.trim(),
        name: officerId.trim(),
        role: 'SMKC Municipal Field Officer',
        jurisdiction: 'Sangli Miraj Kupwad Municipal Corporation'
      });
      setIsLoggedIn(true);
      setLoginError('');
      return;
    }

    setLoginError(
      lang === 'mr'
        ? 'अवैध ओळखपत्र किंवा पासवर्ड! अधिकृत Admin ID: admin@smkc.gov.in व Password: SMKC@2026 वापरा.'
        : 'Invalid credentials! Use Admin ID: admin@smkc.gov.in and Password: SMKC@2026'
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOfficerProfile(null);
    setOfficerId('');
    setOfficerPassword('');
  };

  const currentScan = scannedSubmissions.find(s => s.id === selectedScanId) || scannedSubmissions[0];

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!currentScan) return;

    setIsUpdating(true);
    const updatedData = {
      status: workStage,
      workProgress: Number(workProgressPercent),
      progressRemarks: progressRemarks || currentScan.progressRemarks,
      assignedSquad,
      assignedOfficer: officerProfile?.name || 'SMKC Ward Officer'
    };

    if (onUpdateScanProgress) {
      await onUpdateScanProgress(currentScan.id, updatedData);
    }

    setIsUpdating(false);
    setUpdateSuccessMsg('Work progress successfully updated and recorded in civic database!');
    setTimeout(() => setUpdateSuccessMsg(''), 4000);
  };

  const handleTrackLookup = (e) => {
    e.preventDefault();
    if (!trackToken.trim()) return;
    const match = scannedSubmissions.find(s => s.id.toLowerCase() === trackToken.trim().toLowerCase());
    setTrackedResult(match || 'NOT_FOUND');
  };

  const portalContent = (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100 max-h-[92vh] overflow-y-auto w-full">
      {/* Decorative municipal ribbon background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{lang === 'mr' ? 'अधिकृत मनपा अधिकारी कक्ष' : 'Official Municipal Officer Portal'}</span>
              <span className="bg-[#c62828] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded ml-1">
                ADMIN ONLY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.officerPortalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1">
              {t.officerPortalSubtitle}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all flex-shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Header: Public Tracker & Close Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 max-w-md w-full">
            <form onSubmit={handleTrackLookup} className="flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />
              <input 
                type="text" 
                value={trackToken}
                onChange={(e) => setTrackToken(e.target.value)}
                placeholder="Track token (e.g. SMKC-SCAN-2026-7841)..." 
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-0"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] whitespace-nowrap transition-colors"
              >
                {lang === 'mr' ? 'ट्रॅक करा' : 'Track'}
              </button>
            </form>

            {/* Tracked Result Callout */}
            {trackedResult && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] animate-fadeIn">
                {trackedResult === 'NOT_FOUND' ? (
                  <span className="text-rose-400">Token not found in database. Please check reference ID.</span>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono">{trackedResult.id}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                        {trackedResult.status} ({trackedResult.workProgress || 20}%)
                      </span>
                    </div>
                    <p className="text-slate-300 text-[10px] line-clamp-2">
                      <strong>Progress:</strong> {trackedResult.progressRemarks}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="hidden md:flex w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white items-center justify-center transition-all flex-shrink-0 border border-slate-700"
              title="Close Admin Portal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: OFFICER LOGIN PROMPT (IF NOT LOGGED IN) */}
      {!isLoggedIn ? (
        <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Login Form (6 cols) */}
          <div className="lg:col-span-6 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {lang === 'mr' ? 'अधिकारी लॉगिन क्रेडेंशियल्स' : 'Municipal Officer Authentication'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {lang === 'mr' ? 'नागरिकांच्या स्कॅनवर कारवाई करण्यासाठी लॉगिन करा' : 'Sign in to inspect scans and update work progress'}
                </span>
              </div>
            </div>

            {/* Prominent Official Credentials Box */}
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3.5 text-xs text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <span>🔑</span>
                <span>{lang === 'mr' ? 'अधिकृत लॉगिन तपशील (Official Credentials):' : 'Official Officer Credentials:'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Admin ID:</span>
                  <strong className="text-white">admin@smkc.gov.in</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Password:</span>
                  <strong className="text-white">SMKC@2026</strong>
                </div>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.officerIdLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder="e.g. SMKC-OFF-01 or Ward Officer" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.officerPasswordLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input 
                    type="password" 
                    value={officerPassword}
                    onChange={(e) => setOfficerPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {t.officerLoginBtn}
              </button>
            </form>
          </div>

          {/* Right: Quick Demo Officer Profiles (6 cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'त्वरित १-क्लिक अधिकारी लॉगिन (प्रात्यक्षिक)' : '1-Click Quick Officer Sign-In (Demo Profiles)'}</span>
            </div>
            <p className="text-xs text-slate-400">
              Select any official SMKC profile below to instantly access the field progress and analysis console:
            </p>

            <div className="space-y-2.5 pt-1">
              {sampleOfficers.map((officer) => (
                <div
                  key={officer.id}
                  onClick={() => handleQuickLogin(officer)}
                  className="cursor-pointer bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      {officer.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {officer.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{officer.role}</div>
                      <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">{officer.jurisdiction}</div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-bold text-xs transition-colors whitespace-nowrap">
                    Login ›
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* VIEW B: LOGGED-IN OFFICER COMMAND & WORK PROGRESS CONSOLE */
        <div className="py-6 space-y-6 animate-fadeIn">
          
          {/* Officer Identity & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                {officerProfile?.name?.slice(0, 2) || 'OF'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{officerProfile?.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Session
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {officerProfile?.role} • {officerProfile?.jurisdiction}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-400 font-mono font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                {scannedSubmissions.length} Citizen Scans in Queue
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-semibold text-xs border border-slate-700 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.officerLogoutBtn}</span>
              </button>
            </div>
          </div>

          {/* Main Inspection & Progress Updating Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Citizen Submissions Queue (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Incoming Citizen Photo Scans</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Live Database</span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto scrollbar-thin">
                {scannedSubmissions.map((scan) => {
                  const isSelected = scan.id === selectedScanId;
                  return (
                    <div
                      key={scan.id}
                      onClick={() => {
                        setSelectedScanId(scan.id);
                        setWorkStage(scan.status || 'In Progress');
                        setWorkProgressPercent(scan.workProgress || 50);
                        setProgressRemarks(scan.progressRemarks || '');
                        if (scan.assignedSquad) setAssignedSquad(scan.assignedSquad);
                      }}
                      className={`cursor-pointer p-3 rounded-xl border transition-all text-xs space-y-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300 text-[11px]">
                          {scan.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          scan.workProgress === 100
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {scan.status} ({scan.workProgress || 15}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-slate-700">
                          <img src={scan.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="font-semibold text-white truncate">{scan.citizenName}</div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{scan.location}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Ph: {scan.citizenPhone}
                          </div>
                        </div>
                      </div>

                      {scan.notes && (
                        <p className="text-[11px] text-slate-300 italic line-clamp-1 bg-black/30 p-1.5 rounded">
                          "{scan.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Deep Analysis & Work Progress Update Console (7 cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-5">
              
              {currentScan ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                        Inspecting Submission Token: {currentScan.id}
                      </span>
                      <h3 className="font-bold text-base text-white">
                        {currentScan.location} ({currentScan.city})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const noticeHoarding = {
                            id: currentScan.id,
                            title: { en: currentScan.location, mr: currentScan.location, hi: currentScan.location },
                            locationName: currentScan.location,
                            ward: currentScan.ward,
                            city: currentScan.city,
                            advertiser: currentScan.citizenName || 'Responsible Party',
                            contactNumber: currentScan.citizenPhone || '+91 98221 44550',
                            fineAmount: currentScan.calculatedFine || 15000,
                            imageUrl: currentScan.imageUrl
                          };
                          setSelectedHoardingForNotice(noticeHoarding);
                          setActiveTab('notice');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-semibold text-xs border border-rose-500/40 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Issue Demolition Notice</span>
                      </button>
                    </div>
                  </div>

                  {/* Citizen Details Quick Card */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Reported Citizen:</span>
                      <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentScan.citizenName}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Mobile Contact:</span>
                      <a href={`tel:${currentScan.citizenPhone}`} className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5 hover:underline">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{currentScan.citizenPhone}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block font-semibold">Email Address:</span>
                      <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate">{currentScan.citizenEmail || 'Not Provided (Optional)'}</span>
                      </span>
                    </div>
                  </div>

                  {/* 7-Rules Audit Verdict Accordion Preview */}
                  {currentScan.ruleAnalysis && currentScan.ruleAnalysis.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        7-Rule Municipal Compliance Findings:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {currentScan.ruleAnalysis.map((rule, idx) => (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg border flex items-start gap-2 ${
                              rule.passed 
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
                                : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                            }`}
                          >
                            {rule.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold block truncate">{rule.title}</span>
                              <span className="text-[10px] text-slate-300 block line-clamp-1">{rule.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WORK PROGRESS IMPLEMENTATION CONTROLLER */}
                  <form onSubmit={handleSaveProgress} className="bg-slate-900/90 p-5 rounded-2xl border-2 border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span>Work Progress Implementation Control</span>
                      </h4>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {workProgressPercent}% Complete
                      </span>
                    </div>

                    {updateSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{updateSuccessMsg}</span>
                      </div>
                    )}

                    {/* Progress Percentage Visual Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Work Progress Scale:</span>
                        <span className="font-mono font-bold text-white">{workProgressPercent}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={workProgressPercent}
                        onChange={(e) => setWorkProgressPercent(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>0% Received</span>
                        <span>35% Inspected</span>
                        <span>60% Notice Issued</span>
                        <span>85% In Demolition</span>
                        <span>100% Cleared</span>
                      </div>
                    </div>

                    {/* Stage Selector & Assigned Squad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          {t.progressStageLabel}
                        </label>
                        <select
                          value={workStage}
                          onChange={(e) => {
                            setWorkStage(e.target.value);
                            if (e.target.value === 'Received') setWorkProgressPercent(15);
                            else if (e.target.value === 'Site Inspection Assigned') setWorkProgressPercent(35);
                            else if (e.target.value === 'Notice Issued') setWorkProgressPercent(60);
                            else if (e.target.value === 'In Progress') setWorkProgressPercent(80);
                            else if (e.target.value === 'Resolved & Cleared') setWorkProgressPercent(100);
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Received">Received & Geo-Verified (15%)</option>
                          <option value="Site Inspection Assigned">Site Inspection Squad Dispatched (35%)</option>
                          <option value="Notice Issued">24-Hr Statutory Notice Served (60%)</option>
                          <option value="In Progress">Demolition & Flex Seizure in Progress (80%)</option>
                          <option value="Resolved & Cleared">Work Completed & Site Restored (100%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          {t.assignedSquadLabel}
                        </label>
                        <select
                          value={assignedSquad}
                          onChange={(e) => setAssignedSquad(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Sangli Enforcement Squad 01">Sangli Enforcement Squad 01</option>
                          <option value="Miraj Rapid Response Squad">Miraj Rapid Response Squad</option>
                          <option value="Kupwad Industrial Enforcement">Kupwad Industrial Enforcement</option>
                          <option value="SMKC Central Demolition Taskforce">SMKC Central Demolition Taskforce</option>
                        </select>
                      </div>
                    </div>

                    {/* Official Remarks / Action Notes */}
                    <div className="text-xs">
                      <label className="block text-slate-300 font-semibold mb-1">
                        {t.progressRemarksLabel}
                      </label>
                      <textarea
                        rows={3}
                        value={progressRemarks}
                        onChange={(e) => setProgressRemarks(e.target.value)}
                        placeholder="e.g. Field inspection carried out. Temporary flex removed, iron materials impounded at municipal yard. Offender directed to pay penal fine under MMC Sec 244."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isUpdating ? 'Saving Progress...' : t.updateProgressBtn}</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No citizen scan selected. Please select a scan from the left queue.
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
        <div className="max-w-5xl w-full my-auto animate-in fade-in zoom-in-95 duration-200">
          {portalContent}
        </div>
      </div>
    );
  }

  return (
    <section id="officer-portal-section" className="mt-12">
      {portalContent}
    </section>
  );
}
