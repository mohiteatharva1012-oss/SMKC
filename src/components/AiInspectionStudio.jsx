import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Cpu, 
  MapPin, 
  Layers, 
  FileSearch, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Upload, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Phone, 
  User, 
  Terminal, 
  ExternalLink,
  ChevronRight,
  Scan
} from 'lucide-react';

export default function AiInspectionStudio({ 
  presets, 
  onRunInspection, 
  currentResult, 
  isLoading, 
  setActiveTab, 
  setSelectedHoardingForNotice, 
  t, 
  lang 
}) {
  const [selectedPresetId, setSelectedPresetId] = useState(presets[0]?.id || 'preset-1');
  const [activeStageStep, setActiveStageStep] = useState(7); // Show all if already run, or progress
  const [showBbox, setShowBbox] = useState(true);
  const [showOcrOverlay, setShowOcrOverlay] = useState(true);
  const [showLidarGrid, setShowLidarGrid] = useState(false);
  const [customFile, setCustomFile] = useState(null);
  const [customPreviewUrl, setCustomPreviewUrl] = useState(null);
  const [customWard, setCustomWard] = useState('Prabhag 03 - Vishrambag');
  const [customCity, setCustomCity] = useState('Sangli');
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Default to preset 1 on first load
  useEffect(() => {
    if (!currentResult && presets.length > 0) {
      handleSelectPreset(presets[0].id);
    }
  }, [presets]);

  const handleSelectPreset = async (presetId) => {
    setSelectedPresetId(presetId);
    setCustomPreviewUrl(null);
    setCustomFile(null);
    runSelectedInspection(presetId);
  };

  const runSelectedInspection = async (presetId) => {
    setTerminalLogs([
      `[INIT] Initializing 2026 Mobile Mapping & Deep Vision Smart Scanner...`,
      `[SYS] Hardware: Velodyne VLP-16 LiDAR + 360° Spherical Sensor + RTK-GNSS`,
      `[AI] Models: YOLOv8x-Hoarding-SMKC-v2 & PaddleOCR Multilingual Devanagari`
    ]);

    const result = await onRunInspection({ presetId });
    if (result && result.stages) {
      animateInspectionStages(result);
    }
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      const url = URL.createObjectURL(file);
      setCustomPreviewUrl(url);
      setSelectedPresetId('custom');

      // Trigger custom scan run
      onRunInspection({
        customImage: url,
        customMeta: {
          city: customCity,
          ward: customWard,
          location: `${customCity} Field Inspection Spot`
        }
      }).then(res => {
        if (res) animateInspectionStages(res);
      });
    }
  };

  const animateInspectionStages = (data) => {
    setActiveStageStep(1);
    const stages = [
      `[STAGE 1] Mobile Mapping: GNSS RTK position (${data.lat?.toFixed(4)}°N, ${data.lng?.toFixed(4)}°E) - Speed: ${data.stages.mobileMapping.vehicleSpeed}`,
      `[STAGE 2] CNN Detection: YOLOv8x identified ${data.stages.detection.detectedClass} with ${(data.stages.detection.confidence * 100).toFixed(1)}% confidence`,
      `[STAGE 3] 3D Localization: Projected LiDAR depth -> Est. Dimensions: ${data.stages.localization.dimensionsEst} at ${data.stages.localization.heightFromGround}`,
      `[STAGE 4] Classification: Category -> ${data.stages.classification.type} | Risk Level: ${data.stages.classification.riskLevel}`,
      `[STAGE 5] Multilingual OCR: Extracted text: "${data.stages.ocr.extractedRawText?.slice(0, 50)}..."`,
      `[STAGE 6] SMKC GIS Registry: ${data.stages.compliance.registryMatch} | Violations: ${data.stages.compliance.highCourtViolation}`,
      `[STAGE 7] Administrative Action: Issued ${data.stages.action.noticeType} | Fine: ₹${data.stages.compliance.penaltyProposed?.toLocaleString('en-IN')}`
    ];

    let current = 1;
    const interval = setInterval(() => {
      current++;
      setActiveStageStep(current);
      setTerminalLogs(prev => [...prev, stages[current - 2] || '']);
      if (current >= 7) {
        clearInterval(interval);
      }
    }, 450);
  };

  const data = currentResult;
  const stages = data?.stages;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Architecture Diagram Header */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
              <Scan className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Stack Deep Learning & Spatial Inspection Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.scannerTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-4xl">
              {t.scannerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runSelectedInspection(selectedPresetId === 'custom' ? null : selectedPresetId)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? t.runningScanner : t.runScannerBtn}</span>
            </button>
          </div>
        </div>

        {/* 7-Step Inspection Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-800 text-xs">
          {[
            { step: 1, name: 'Mobile Mapping', icon: Camera, color: 'text-sky-400' },
            { step: 2, name: 'CNN Detection', icon: Cpu, color: 'text-amber-400' },
            { step: 3, name: '3D Localization', icon: Crosshair, color: 'text-emerald-400' },
            { step: 4, name: 'Classification', icon: Layers, color: 'text-purple-400' },
            { step: 5, name: 'Trilingual OCR', icon: FileSearch, color: 'text-pink-400' },
            { step: 6, name: 'GIS Compliance', icon: MapPin, color: 'text-orange-400' },
            { step: 7, name: 'Admin Action', icon: ShieldAlert, color: 'text-rose-400' },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = activeStageStep >= item.step;
            const isCurrent = activeStageStep === item.step;
            return (
              <div 
                key={item.step}
                className={`p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/30'
                    : isCompleted
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">STAGE 0{item.step}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-semibold truncate">
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="truncate">{item.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Selector: Sangli-Miraj-Kupwad Presets + Custom Upload */}
      <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
            {t.selectPreset}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPresetId === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.city} • {p.name[lang] || p.name.en}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Upload Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>{t.uploadCustom}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleCustomUpload}
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Main Viewport & Telemetry Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Interactive Image Canvas & Overlays (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group min-h-[420px] flex items-center justify-center">
            
            {/* Base Street View Image */}
            <img 
              src={customPreviewUrl || data?.image || presets[0]?.image} 
              alt="Street View Mobile Mapping"
              className="w-full h-auto max-h-[500px] object-cover"
            />

            {/* Simulated LiDAR Grid Overlay */}
            {showLidarGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"
              />
            )}

            {/* CNN Bounding Box Overlay */}
            {showBbox && stages?.detection?.bbox && (
              <div 
                className={`absolute border-2 rounded transition-all duration-300 ${
                  stages.compliance?.isPermitted 
                    ? 'border-emerald-400 bg-emerald-500/10' 
                    : 'border-rose-500 bg-rose-500/15 animate-pulse'
                }`}
                style={{
                  left: `${stages.detection.bbox.x}%`,
                  top: `${stages.detection.bbox.y}%`,
                  width: `${stages.detection.bbox.width}%`,
                  height: `${stages.detection.bbox.height}%`
                }}
              >
                {/* Confidence & Classification Pill */}
                <div className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 shadow-lg ${
                  stages.compliance?.isPermitted 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-rose-600 text-white'
                }`}>
                  <span>{stages.detection.detectedClass}</span>
                  <span>•</span>
                  <span>{(stages.detection.confidence * 100).toFixed(1)}%</span>
                </div>

                {/* 3D Dimensions Callout Bottom */}
                <div className="absolute -bottom-6 left-0 bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 flex items-center gap-1 shadow">
                  <Crosshair className="w-3 h-3 text-amber-400" />
                  <span>{stages.localization.dimensionsEst}</span>
                  <span className="text-slate-400">({stages.localization.heightFromGround})</span>
                </div>
              </div>
            )}

            {/* OCR Live Text Overlay Banner */}
            {showOcrOverlay && stages?.ocr?.extractedRawText && (
              <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>{t.detectedTextHeader}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      [Devanagari OCR v2.4]
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Language: {stages.ocr.languagesDetected?.join(', ')}
                  </span>
                </div>
                <p className="text-slate-100 font-medium font-serif leading-relaxed line-clamp-2">
                  "{stages.ocr.extractedRawText}"
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                  {stages.ocr.entities?.advertiser && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-400" />
                      <strong className="text-slate-400">Advertiser:</strong> {stages.ocr.entities.advertiser}
                    </span>
                  )}
                  {stages.ocr.entities?.phoneNumbers?.[0] && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <strong className="text-slate-400">Phone:</strong> {stages.ocr.entities.phoneNumbers[0]}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Canvas Viewport Controls Overlay Top Right */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setShowBbox(!showBbox)}
                className={`p-1.5 rounded transition-colors ${showBbox ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Toggle CNN Bounding Box"
              >
                {showBbox ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowOcrOverlay(!showOcrOverlay)}
                className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${showOcrOverlay ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Toggle OCR Text Overlay"
              >
                OCR
              </button>
              <button
                onClick={() => setShowLidarGrid(!showLidarGrid)}
                className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold ${showLidarGrid ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                title="Toggle LiDAR Point Cloud Mesh"
              >
                LiDAR
              </button>
            </div>

            {/* Geotag Chip Top Left */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{data?.city}</span>
              <span className="text-slate-500">•</span>
              <span>{data?.ward}</span>
            </div>

          </div>

          {/* Real-time Hardware & Model Logs Terminal */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-500 pb-1 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>Mobile Mapping & Smart Vision Telemetry Log</span>
              </div>
              <span className="text-emerald-400">LIVE FEED</span>
            </div>
            <div className="space-y-0.5 max-h-24 overflow-y-auto scrollbar-thin">
              {terminalLogs.map((log, index) => (
                <div key={index} className="leading-tight text-slate-300">
                  <span className="text-amber-500/80 mr-1.5">›</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Deep Stage-by-Stage Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Compliance & Action Summary Card */}
          <div className={`p-5 rounded-2xl border shadow-xl transition-all ${
            stages?.compliance?.isPermitted
              ? 'bg-emerald-950/20 border-emerald-800/80'
              : 'bg-rose-950/25 border-rose-800/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Compliance Verdict
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                stages?.compliance?.isPermitted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}>
                {stages?.compliance?.isPermitted ? t.statusPermitted : t.statusIllegal}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="text-xl font-black text-white">
                {stages?.compliance?.isPermitted ? (
                  <span className="text-emerald-400">SMKC Licensed Display</span>
                ) : (
                  <span className="text-rose-400">Unauthorized Display Detected</span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {stages?.compliance?.highCourtViolation}
              </p>
            </div>

            {/* Fine and Legal Section */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">{t.legalSectionLabel}</span>
                <span className="font-semibold text-slate-200 block truncate">
                  {stages?.compliance?.actSection || 'MMC Act 1949 Sec 244'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">{t.proposedFine}</span>
                <span className="font-extrabold text-amber-400 text-sm block">
                  ₹{stages?.compliance?.penaltyProposed?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>

            {/* Notice & Enforcement Action Trigger */}
            {!stages?.compliance?.isPermitted && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => {
                    const noticeItem = {
                      id: `SMKC-HD-${Math.floor(100 + Math.random() * 900)}`,
                      title: data?.name || { en: 'Detected Banner' },
                      city: data?.city,
                      ward: data?.ward,
                      locationName: data?.location,
                      lat: data?.lat,
                      lng: data?.lng,
                      advertiser: stages?.ocr?.entities?.advertiser || 'Proprietor',
                      contactNumber: stages?.ocr?.entities?.phoneNumbers?.[0] || '+91 98221 44550',
                      dimensions: stages?.localization?.dimensionsEst,
                      ocrText: stages?.ocr?.extractedRawText,
                      fineAmount: stages?.compliance?.penaltyProposed || 15000,
                      imageUrl: customPreviewUrl || data?.image
                    };
                    setSelectedHoardingForNotice(noticeItem);
                    setActiveTab('notice');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t.generateNoticeBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Stage Details Breakdown */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Inspection Telemetry Details
            </h3>

            {/* Stage 1 */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                <span>{t.stage1Name}</span>
                <span className="text-[10px] text-slate-400 font-mono">RTK-GNSS</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {stages?.mobileMapping?.sensor}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>Accuracy: {stages?.mobileMapping?.gnssAccuracy}</span>
                <span>Speed: {stages?.mobileMapping?.vehicleSpeed}</span>
              </div>
            </div>

            {/* Stage 2 & 3 */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                <span>{t.stage2Name} & {t.stage3Name}</span>
                <span className="text-[10px] text-slate-400 font-mono">YOLOv8 + LiDAR</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Model:</span>
                  <span className="font-semibold truncate block">YOLOv8x-Hoarding</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Dimensions:</span>
                  <span className="font-semibold block">{stages?.localization?.dimensionsEst}</span>
                </div>
              </div>
            </div>

            {/* Stage 5 OCR */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                <span>{t.stage5Name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Devanagari OCR</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Advertiser:</span>
                  <span className="font-semibold text-white">{stages?.ocr?.entities?.advertiser || 'Not identified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-emerald-400">{stages?.ocr?.entities?.phoneNumbers?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Municipal QR Tag:</span>
                  <span className={`font-semibold ${stages?.ocr?.entities?.qrCodeFound ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stages?.ocr?.entities?.qrCodeFound ? 'Found & Verified' : 'MISSING (Unregistered)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 6 & 7 Administrative */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-orange-300">
                <span>{t.stage7Name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Enforcement</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Notice Type:</span>
                  <span className="font-semibold text-white">{stages?.action?.noticeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Squad:</span>
                  <span className="font-semibold text-amber-300">{stages?.action?.assignedSquad}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
