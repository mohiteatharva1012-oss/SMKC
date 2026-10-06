import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Flame, 
  FileText, 
  Sparkles, 
  ExternalLink,
  X
} from 'lucide-react';

export default function GisMap({ hoardings, setActiveTab, setSelectedHoardingForNotice, t, lang }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedHoarding, setSelectedHoarding] = useState(null);
  const [mapTileType, setMapTileType] = useState('hybrid'); // Default to Satellite mode
  const tileLayerRef = useRef(null);

  // Filter hoardings
  const filteredHoardings = hoardings.filter(h => {
    const matchesCity = selectedCity === 'all' || h.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || h.status === selectedStatus;
    return matchesCity && matchesStatus;
  });

  const updateTileLayer = (map, tileType) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    let newLayer;
    if (tileType === 'google') {
      newLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps &copy; Sangli Miraj Kupwad Municipal Corporation',
        maxZoom: 20,
      });
    } else {
      newLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Satellite &copy; SMKC GIS',
        maxZoom: 20,
      });
    }
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Sangli Miraj Kupwad tri-city region
      const map = L.map(mapContainerRef.current, {
        center: [16.8524, 74.6050],
        zoom: 13,
        zoomControl: true,
      });

      updateTileLayer(map, mapTileType);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 300);
    } else {
      updateTileLayer(mapInstanceRef.current, mapTileType);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [mapTileType]);

  // Update Markers when filters or data change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = [];

    filteredHoardings.forEach(item => {
      if (!item.lat || !item.lng) return;

      const latLng = [item.lat, item.lng];
      bounds.push(latLng);

      // Custom marker colors
      let markerBg = '#ef4444'; // Red for illegal
      let pulseAnim = '';
      if (item.status === 'permitted') markerBg = '#10b981'; // Green
      else if (item.status === 'expired') markerBg = '#f59e0b'; // Amber
      else if (item.status === 'critical_hazard') {
        markerBg = '#dc2626';
        pulseAnim = 'animate-ping';
      }

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            ${item.status === 'critical_hazard' ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: ${markerBg}; opacity: 0.75;" class="${pulseAnim}"></span>` : ''}
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${markerBg}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
              ${item.status === 'permitted' ? '✓' : '!'}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      marker.on('click', () => {
        setSelectedHoarding(item);
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
          <strong style="display: block; font-size: 13px; margin-bottom: 2px;">${item.title[lang] || item.title.en}</strong>
          <span style="color: #64748b; font-size: 11px;">${item.locationName} (${item.ward})</span>
          <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: ${markerBg}; text-transform: uppercase; font-size: 10px;">${item.status}</span>
            <span style="font-weight: 600;">₹${item.fineAmount > 0 ? item.fineAmount.toLocaleString('en-IN') : '0'}</span>
          </div>
        </div>
      `);

      markersLayerRef.current.addLayer(marker);
    });

    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [filteredHoardings, lang]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Filter Controls */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>SMKC Geo-Spatial Ward Intelligence System</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {t.mapTitle}
            </h1>
            <p className="text-slate-300 text-xs mt-0.5">
              {t.mapSubtitle}
            </p>
          </div>

          <div className="text-xs text-slate-300 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
            <span>{t.totalOnMap}</span>
            <span className="font-extrabold text-amber-400 text-sm">
              {filteredHoardings.length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800 text-xs">
          
          {/* Map Layer Switcher */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Layer:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setMapTileType('hybrid')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  mapTileType === 'hybrid'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => setMapTileType('google')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  mapTileType === 'google'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🗺️ Street Map
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">{t.filterStatus}</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[
                { id: 'all', label: t.filterAll },
                { id: 'illegal', label: t.statusIllegal },
                { id: 'critical_hazard', label: t.statusCriticalHazard },
                { id: 'expired', label: t.statusExpired },
                { id: 'permitted', label: t.statusPermitted }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedStatus === s.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Map + Detail Side Sheet */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 min-h-[580px]">
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="w-full h-[580px] z-10" />

        {/* Legend Overlay Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-2 pointer-events-auto">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block">
            GIS Map Legend
          </span>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-white" />
              <span className="text-slate-200">{t.statusIllegal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-white animate-pulse" />
              <span className="text-slate-200">{t.statusCriticalHazard}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
              <span className="text-slate-200">{t.statusExpired}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
              <span className="text-slate-200">{t.statusPermitted}</span>
            </div>
          </div>
        </div>

        {/* Selected Hoarding Inspection Drawer */}
        {selectedHoarding && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 max-h-[530px] overflow-y-auto bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-4 text-xs space-y-3 pointer-events-auto scrollbar-thin">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                  {selectedHoarding.id} • {selectedHoarding.city}
                </span>
                <h3 className="font-bold text-sm text-white mt-0.5 leading-snug">
                  {selectedHoarding.title[lang] || selectedHoarding.title.en}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHoarding(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="relative h-32 rounded-xl overflow-hidden bg-slate-950">
              <img 
                src={selectedHoarding.imageUrl} 
                alt="Hoarding"
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono">
                {selectedHoarding.dimensions}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{selectedHoarding.locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ward:</span>
                <span className="font-semibold">{selectedHoarding.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advertiser:</span>
                <span className="font-semibold">{selectedHoarding.advertiser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-emerald-400">{selectedHoarding.contactNumber}</span>
              </div>
              {selectedHoarding.fineAmount > 0 && (
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-500">Proposed Fine:</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    ₹{selectedHoarding.fineAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Violations */}
            {selectedHoarding.violationReasons?.length > 0 && (
              <div className="bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl space-y-1 text-rose-300">
                <span className="font-bold text-[10px] uppercase tracking-wider block text-rose-400">
                  Violations
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {selectedHoarding.violationReasons.map((v, idx) => (
                    <li key={idx} className="leading-tight">{v}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Drawer Actions */}
            <div className="pt-2 flex items-center gap-2">
              {selectedHoarding.status !== 'permitted' && (
                <button
                  onClick={() => {
                    setSelectedHoardingForNotice(selectedHoarding);
                    setActiveTab('notice');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.generateNoticeBtn}</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('scanner')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all text-xs"
                title="Inspect in AI Smart Scanner"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
