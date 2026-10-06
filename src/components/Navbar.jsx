import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Scan, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Search, 
  Camera, 
  Upload,
  Clock
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang, 
  t, 
  onOpenScannerModal,
  searchQuery,
  setSearchQuery
}) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getFormattedDateTime = (d, l) => {
    try {
      const locale = l === 'mr' ? 'mr-IN' : l === 'hi' ? 'hi-IN' : 'en-IN';
      const date = d.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const time = d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      return { date, time };
    } catch (e) {
      return {
        date: d.toDateString(),
        time: d.toLocaleTimeString()
      };
    }
  };

  const { date: formattedLiveDate, time: formattedLiveTime } = getFormattedDateTime(currentDateTime, lang);

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: Building2 },
    { id: 'scanner', label: t.navScanner, icon: Scan, badge: 'AI 2026' },
    { id: 'map', label: t.navMap, icon: MapPin },
    { id: 'registry', label: t.navRegistry, icon: Layers },
    { id: 'citizen', label: t.navCitizen, icon: AlertTriangle },
    { id: 'notice', label: t.navNotice, icon: FileText },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery?.trim()) {
      setActiveTab('registry');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Civic Status Ribbon with Live Clock */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-xs px-4 py-1 flex items-center justify-between text-amber-50 font-medium">
        {/* Real-Time Live Clock (Top Left Corner - Translation Safe & Overflow Proof) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div 
            translate="no" 
            className="notranslate flex items-center gap-1.5 bg-black/35 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-amber-300/40 font-mono text-[11px] text-white shadow-inner select-none whitespace-nowrap"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0" title="Live Clock" />
            <Clock className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="font-semibold text-amber-100">{formattedLiveDate}</span>
            <span className="text-amber-200/50">|</span>
            <span className="font-bold text-amber-200 tracking-wider">{formattedLiveTime}</span>
          </div>
          <span className="hidden xl:inline text-[11px] text-amber-100/90 font-medium whitespace-nowrap">
            {t.portalTag} • {t.appTitle}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {/* Official Social Media & WhatsApp Shortcuts */}
          <div className="hidden lg:flex items-center gap-2.5 pr-3 border-r border-amber-300/30">
            <a href="https://x.com/SmkcMission?s=09" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110 font-bold" title="SMKC Twitter / X">𝕏</a>
            <a href="https://www.facebook.com/people/Smkc-Sangli/100011116629758/?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110 font-bold" title="SMKC Facebook">f</a>
            <a href="https://www.instagram.com/smkc_mission_updates?igsh=dWFiNHFtYWE1M21x" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110" title="SMKC Instagram">📸</a>
            <a href="https://www.youtube.com/@smkcnewssangli6016" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-transform hover:scale-110 font-bold text-red-200" title="SMKC YouTube">▶</a>
            <a href="https://api.whatsapp.com/send?phone=917066040357&text=Namaskar%20SMKC%20Helpline" target="_blank" rel="noopener noreferrer" className="hover:text-white font-bold flex items-center gap-1 text-emerald-100 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-400/30 transition-transform hover:scale-105" title="मनपा व्हॉट्सॲप हेल्पलाईन (7066040357)">
              <span>💬</span>
              <span>7066040357</span>
            </a>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            {t.systemStatus}
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
            <MapPin className="w-3 h-3 text-amber-200" />
            {t.rtkGnss}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Civic Branding */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-300/40 bg-white flex-shrink-0">
              <img src="/smkc_logo.png" alt="SMKC Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1 leading-tight">
                <span>SMKC</span>
                <span className="text-amber-400 font-extrabold">Drishti-Banner</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wider ml-0.5">
                  2026
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[170px] sm:max-w-xs leading-none mt-0.5">
                {t.appTitle}
              </div>
            </div>
          </div>

          {/* TOP SEARCH BAR WITH SCANNER OPTION (MOBILE CAMERA / DESKTOP UPLOAD TRIGGER) */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full flex items-center bg-slate-950/90 border border-slate-700 hover:border-amber-500/60 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/40 rounded-xl transition-all shadow-inner">
                <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholderTop}
                  className="w-full bg-transparent py-2 pl-2.5 pr-28 text-xs text-white placeholder-slate-500 focus:outline-none"
                />

                {/* Embedded Scanner Trigger Button inside Search Bar */}
                <button
                  type="button"
                  onClick={onOpenScannerModal}
                  title={t.scanPhotoTooltip}
                  className="absolute right-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-[11px] shadow-sm transition-all active:scale-95 group"
                >
                  <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>{t.scanPhotoBtn}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Mobile Scanner Trigger, Language Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Mobile-visible Scanner Trigger Button */}
            <button
              onClick={onOpenScannerModal}
              title={t.scanPhotoTooltip}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs shadow"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.scanPhotoBtn}</span>
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1" />
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setLang('mr')}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    lang === 'mr'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="मराठी"
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang('hi')}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    lang === 'hi'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="हिंदी"
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    lang === 'en'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Quick Scan Action Button */}
            <button
              onClick={onOpenScannerModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-orange-600/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{t.quickScan}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Horizontal */}
      <div className="xl:hidden flex items-center overflow-x-auto px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 gap-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
