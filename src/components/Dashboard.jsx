import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Flame, 
  MapPin, 
  IndianRupee, 
  Truck, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  Search,
  ExternalLink,
  ArrowUpRight,
  Layers
} from 'lucide-react';

export default function Dashboard({ stats, hoardings, setActiveTab, setSelectedHoardingForNotice, t, lang }) {
  const [selectedCityFilter, setSelectedCityFilter] = useState('all');
  const [mapTileType, setMapTileType] = useState('hybrid'); // Default to Satellite mode

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const filteredHoardings = hoardings.filter(h => {
    if (selectedCityFilter === 'all') return true;
    return h.city.toLowerCase() === selectedCityFilter.toLowerCase();
  });

  // Layer update helper
  const updateTileLayer = (map, tileType) => {
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    let newLayer;
    if (tileType === 'google') {
      newLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps &copy; सांगली मिरज आणि कुपवाड शहर महानगरपालिका',
        maxZoom: 20
      });
    } else {
      newLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Satellite &copy; SMKC GIS',
        maxZoom: 20
      });
    }
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // City centroids for quick jump
  const cityCentroids = {
    all: { center: [16.8524, 74.6050], zoom: 12.5 },
    sangli: { center: [16.8524, 74.5815], zoom: 14 },
    miraj: { center: [16.8272, 74.6469], zoom: 14 },
    kupwad: { center: [16.8778, 74.6111], zoom: 14 }
  };

  const focusCity = (cityKey) => {
    setSelectedCityFilter(cityKey);
    if (!mapInstanceRef.current) return;
    const target = cityCentroids[cityKey] || cityCentroids.all;
    mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 1.2 });
  };

  // Initialize Home Dashboard Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [16.8524, 74.6050],
        zoom: 12.5,
        zoomControl: true,
        scrollWheelZoom: true
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [mapTileType]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const bounds = [];

    // Prominent Tri-City Municipal Zone Labels
    const cityHubs = [
      { name: 'सांगली (Sangli)', sub: 'मनपा मुख्यालय / गणपती पेठ / विश्रामबाग', lat: 16.8544, lng: 74.5815, color: '#f59e0b' },
      { name: 'मिरज (Miraj)', sub: 'रेल्वे जंक्शन / गांधी चौक / मिशन', lat: 16.8272, lng: 74.6469, color: '#38bdf8' },
      { name: 'कुपवाड (Kupwad)', sub: 'एमआयडीसी औद्योगिक वसाहत', lat: 16.8778, lng: 74.6111, color: '#34d399' }
    ];

    cityHubs.forEach(hub => {
      const hubIcon = L.divIcon({
        className: 'custom-hub-badge',
        html: `
          <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid ${hub.color}; border-radius: 9999px; padding: 4px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap; font-size: 11px; font-weight: bold; color: white; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${hub.color}; display: inline-block;"></span>
            <span>${hub.name}</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });
      const hubMarker = L.marker([hub.lat, hub.lng], { icon: hubIcon });
      hubMarker.bindPopup(`<strong>${hub.name}</strong><br/><span style="color:#94a3b8; font-size:11px;">${hub.sub}</span>`);
      markersLayerRef.current.addLayer(hubMarker);
      bounds.push([hub.lat, hub.lng]);
    });

    // Hoarding Pins
    filteredHoardings.forEach(item => {
      if (!item.lat || !item.lng) return;

      const latLng = [item.lat, item.lng];
      bounds.push(latLng);

      let pinColor = '#ef4444'; // Red
      let iconLabel = '!';
      if (item.status === 'permitted') { pinColor = '#10b981'; iconLabel = '✓'; }
      else if (item.status === 'expired') { pinColor = '#f59e0b'; iconLabel = '⏳'; }
      else if (item.status === 'critical_hazard') { pinColor = '#dc2626'; iconLabel = '⚠️'; }

      const customIcon = L.divIcon({
        className: 'custom-hoarding-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${item.status === 'critical_hazard' ? '<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: #dc2626; opacity: 0.65;" class="animate-ping"></span>' : ''}
            <div style="width: 26px; height: 26px; border-radius: 50%; background: ${pinColor}; border: 2.5px solid white; box-shadow: 0 4px 8px -1px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              ${iconLabel}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const titleText = (item.title && (item.title[lang] || item.title.mr || item.title.en)) || 'Hoarding';
      const marker = L.marker(latLng, { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 240px; color: #0f172a; line-height: 1.4;">
          <strong style="color: #dc2626; font-size: 13px; display: block; margin-bottom: 2px;">${item.locationName}</strong>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${titleText} (${item.ward || item.city})</div>
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%; height:85px; object-fit:cover; border-radius:6px; margin-bottom:6px;" alt="Preview" />` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span style="font-weight: bold; text-transform: uppercase; color: ${pinColor}; font-size: 10px;">${item.status}</span>
            <span style="font-weight: bold; color: #b45309;">₹${(item.fineAmount || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      `);
      markersLayerRef.current.addLayer(marker);
    });

    if (bounds.length > 0 && selectedCityFilter === 'all') {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14.5 });
    }
  }, [filteredHoardings, lang, selectedCityFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'illegal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3" />
            {t.statusIllegal}
          </span>
        );
      case 'critical_hazard':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/30 text-red-200 border border-red-500 animate-pulse">
            <Flame className="w-3 h-3 text-red-400" />
            {t.statusCriticalHazard}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            {t.statusExpired}
          </span>
        );
      case 'permitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3 h-3" />
            {t.statusPermitted}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 border border-slate-700/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SMKC AI Mobile Mapping System • Maharashtra Municipal Corporation Act 1949</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.appTitle}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t.dashboardOverview}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{t.navScanner}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-sm transition-all"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{t.navMap}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Total Hoardings */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>{t.statsTotal}</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.totalHoardings || 6}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">100%</span>
            <span>Geo-tagged & Verified</span>
          </div>
        </div>

        {/* Illegal Count */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-rose-900/40 shadow-lg hover:border-rose-700 transition-all bg-gradient-to-br from-slate-900 to-rose-950/20">
          <div className="flex items-center justify-between text-rose-300 text-xs font-medium mb-2">
            <span>{t.statsIllegal}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {stats?.illegalCount || 2}
            <span className="text-xs font-normal text-rose-300/80 ml-2">
              ({stats?.illegalRatePct || '50'}%)
            </span>
          </div>
          <div className="text-[11px] text-rose-300/70 mt-1">
            Section 244 Violations
          </div>
        </div>

        {/* Critical Hazards */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-red-900/50 shadow-lg hover:border-red-600 transition-all bg-gradient-to-br from-slate-900 to-red-950/30">
          <div className="flex items-center justify-between text-red-300 text-xs font-medium mb-2">
            <span>{t.statsHazard}</span>
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
          </div>
          <div className="text-2xl font-black text-red-400">{stats?.criticalHazardCount || 2}</div>
          <div className="text-[11px] text-red-300/80 mt-1">
            Traffic & Electrical Danger
          </div>
        </div>

        {/* Total Fines */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-amber-900/40 shadow-lg hover:border-amber-700 transition-all">
          <div className="flex items-center justify-between text-amber-300 text-xs font-medium mb-2">
            <span>{t.statsFines}</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            ₹{((stats?.totalFinesLevied || 68500) / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Penalties Calculated
          </div>
        </div>

        {/* Active Squads */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>{t.statsSquads}</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.activeEnforcementSquads || 5}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Demolition Vehicles on Field
          </div>
        </div>

        {/* Visual Pollution */}
        <div className="bg-slate-900/80 backdrop-blur rounded-xl p-4 border border-slate-800 shadow-lg hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>{t.statsPollution}</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">74.2<span className="text-xs text-slate-400">/100</span></div>
          <div className="text-[11px] text-rose-400 mt-1 font-semibold">
            High Density Alert
          </div>
        </div>

      </div>

      {/* 5 Municipal Officers & Dignitaries Gallery */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="text-[#c62828]">🏛️</span>
              <span>{lang === 'mr' ? 'पदाधिकारी व प्रशासकीय अधिकारी' : 'Municipal Leadership & Administrative Officers'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'mr' ? 'सांगली मिरज आणि कुपवाड शहर महानगरपालिका अधिकृत नेतृत्व' : 'Official Leadership & Sky Signs Regulation Authority'}
            </p>
          </div>
          <span className="text-[10px] text-amber-400 font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
            SMKC Administration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {[
            { title: 'महापौर', name: 'श्री. धीरज सूर्यवंशी', role: 'प्रथम नागरिक', img: '/assets/dhiraj.png' },
            { title: 'उपमहापौर', name: 'श्री. गजानन मगदूम', role: 'उपमहापौर', img: '/assets/gajanan.png' },
            { title: 'महापालिका आयुक्त', name: 'श्रीम. संजीता मोहपात्रा (भा.प्र.से.)', role: 'प्रशासक व आयुक्त', img: '/assets/sanjita.png' },
            { title: 'अतिरिक्त आयुक्त-१', name: 'श्री. राहुल रोकडे', role: 'प्रशासन', img: '/assets/rahul.png' },
            { title: 'अतिरिक्त आयुक्त-२', name: 'श्री. नीलेश देशमुख', role: 'अतिक्रमण व आकाशचिन्हे', img: '/assets/nilesh.png' }
          ].map((lead, idx) => (
            <div key={idx} className="bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800 shadow-sm text-center p-3 flex flex-col items-center justify-between hover:border-amber-500/40 transition-all group">
              <div className="w-24 h-28 rounded-xl overflow-hidden bg-slate-900 mb-2 border border-slate-700 shadow-inner flex items-center justify-center">
                <img 
                  src={lead.img} 
                  alt={lead.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const filename = lead.img.split('/').pop();
                    const tried = parseInt(e.target.dataset.tried || '0', 10);
                    if (tried === 0) {
                      e.target.dataset.tried = '1';
                      e.target.src = './assets/' + filename;
                    } else if (tried === 1) {
                      e.target.dataset.tried = '2';
                      e.target.src = './public/assets/' + filename;
                    } else {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(lead.name) + '&background=c62828&color=fff&size=200';
                    }
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-amber-400 block">{lead.title}</span>
                <span className="text-xs font-bold text-white block truncate max-w-[140px]">{lead.name}</span>
                <span className="text-[10px] text-slate-400 block">{lead.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Sangli Miraj Kupwad Tri-City Map Section */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>SMKC Tri-City GIS Ward Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t.mapTitle || 'सांगली, मिरज आणि कुपवाड थेट जीआयएस नकाशा'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Live geo-tagged illegal flex, hazardous billboards & authorized sky signs across Sangli, Miraj & Kupwad
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Map Layer Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
              <span className="text-[11px] text-slate-400 px-2">Layer:</span>
              <button
                onClick={() => setMapTileType('hybrid')}
                className={`px-3 py-1 rounded transition-all text-xs flex items-center gap-1 ${
                  mapTileType === 'hybrid'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>🛰️</span>
                <span>Satellite</span>
              </button>
              <button
                onClick={() => setMapTileType('google')}
                className={`px-2.5 py-1 rounded transition-all text-xs ${
                  mapTileType === 'google'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🗺️ Street Map
              </button>
            </div>

            {/* City Quick Jumps */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
              <span className="text-[11px] text-slate-400 px-1.5">City:</span>
              {[
                { id: 'all', label: `सर्व (${hoardings.length})` },
                { id: 'sangli', label: 'सांगली' },
                { id: 'miraj', label: 'मिरज' },
                { id: 'kupwad', label: 'कुपवाड' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => focusCity(f.id)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    selectedCityFilter === f.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Map Container */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-inner h-[500px] w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Legend */}
          <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-1.5 pointer-events-auto">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1">
              GIS Legend
            </span>
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-white" />
                <span className="text-slate-200">Illegal Banner (अनधिकृत)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white animate-pulse" />
                <span className="text-slate-200">Critical Hazard (धोकादायक)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white" />
                <span className="text-slate-200">Expired Permit (मुदत संपलेले)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                <span className="text-slate-200">Permitted (अधिकृत)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Breakdown Cards (Sangli, Miraj, Kupwad) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{t.cityBreakdownTitle}</span>
          <span className="text-xs font-normal text-slate-400">
            (सांगली • मिरज • कुपवाड त्रिशहर क्षेत्र)
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Sangli Card */}
          <div 
            onClick={() => setSelectedCityFilter('sangli')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedCityFilter === 'sangli'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Sangli Ward Hub</span>
                <h3 className="text-xl font-bold text-white mt-0.5">सांगली (Sangli)</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 border border-slate-700">
                4 Wards
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Ganpati Peth / Vishrambag:</span>
                <span className="font-semibold text-rose-400">High Political Flexes</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Civil Hospital Silence Zone:</span>
                <span className="font-semibold text-red-400">Critical Hazard Detected</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '68%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Encroachment Index</span>
                <span className="text-rose-400 font-bold">68% Non-Compliant</span>
              </div>
            </div>
          </div>

          {/* Miraj Card */}
          <div 
            onClick={() => setSelectedCityFilter('miraj')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedCityFilter === 'miraj'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Miraj Junction</span>
                <h3 className="text-xl font-bold text-white mt-0.5">मिरज (Miraj)</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 border border-slate-700">
                3 Wards
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Station Road & Gandhi Chowk:</span>
                <span className="font-semibold text-amber-400">Expired Commercial Permits</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>MSEDCL Electric Poles:</span>
                <span className="font-semibold text-red-400">11kV Hazard Flags</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '55%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Encroachment Index</span>
                <span className="text-amber-400 font-bold">55% Tax Default</span>
              </div>
            </div>
          </div>

          {/* Kupwad Card */}
          <div 
            onClick={() => setSelectedCityFilter('kupwad')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedCityFilter === 'kupwad'
                ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">MIDC Industrial</span>
                <h3 className="text-xl font-bold text-white mt-0.5">कुपवाड (Kupwad)</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 border border-slate-700">
                2 Wards
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>MIDC Heavy Industrial Corridors:</span>
                <span className="font-semibold text-emerald-400">Licensed Corporate Unipoles</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Toll Junction & Link Road:</span>
                <span className="font-semibold text-emerald-400">QR Code Verified</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Encroachment Index</span>
                <span className="text-emerald-400 font-bold">25% (Mostly Compliant)</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Live AI Detection Feed & Enforcement Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t.recentDetections}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {filteredHoardings.length} {lang === 'mr' ? 'नोंदी' : lang === 'hi' ? 'प्रविष्टियां' : 'Records'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Identified via Mobile Mapping 360° cameras & YOLOv8 Computer Vision
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCityFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setSelectedCityFilter('sangli')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCityFilter === 'sangli'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.sangliCity}
            </button>
            <button
              onClick={() => setSelectedCityFilter('miraj')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCityFilter === 'miraj'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.mirajCity}
            </button>
            <button
              onClick={() => setSelectedCityFilter('kupwad')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCityFilter === 'kupwad'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.kupwadCity}
            </button>
          </div>
        </div>

        {/* Hoardings Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHoardings.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col group"
            >
              {/* Image Preview with Bounding Box Overlay Marker */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.title[lang] || item.title.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Status Pin Top Left */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(item.status)}
                </div>

                {/* ID & Ward Top Right */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[11px] font-mono text-amber-300 border border-slate-700">
                  {item.id}
                </div>

                {/* Location overlay bottom */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-1 font-semibold truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{item.locationName}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 flex-shrink-0 ml-1">
                    {item.city}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">
                    {item.title[lang] || item.title.en}
                  </h3>

                  {/* OCR Snippet Box */}
                  {item.ocrText && (
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                      <div className="text-[10px] uppercase tracking-wider text-amber-400/90 font-bold mb-1 flex items-center gap-1">
                        <span>OCR Detected Content</span>
                      </div>
                      <p className="line-clamp-2 italic text-slate-300">
                        "{item.ocrText}"
                      </p>
                    </div>
                  )}

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/40 p-1.5 rounded">
                      <span className="text-[10px] text-slate-400 block">{t.advertiserLabel}</span>
                      <span className="font-semibold text-slate-200 truncate block">{item.advertiser}</span>
                    </div>
                    <div className="bg-slate-800/40 p-1.5 rounded">
                      <span className="text-[10px] text-slate-400 block">{t.dimensionsLabel}</span>
                      <span className="font-semibold text-slate-200 block">{item.dimensions}</span>
                    </div>
                  </div>

                  {/* Violation Clauses */}
                  {item.violationReasons?.length > 0 && (
                    <div className="text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 p-2 rounded">
                      <span className="font-semibold block text-rose-400 mb-0.5">Violations:</span>
                      <p className="line-clamp-1">{item.violationReasons[0]}</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  {item.fineAmount > 0 ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fine Imposed</span>
                      <span className="font-bold text-amber-400 text-sm">
                        ₹{item.fineAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold">Fully Compliant</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'permitted' && (
                      <button
                        onClick={() => {
                          setSelectedHoardingForNotice(item);
                          setActiveTab('notice');
                        }}
                        className="px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{t.generateNoticeBtn}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 transition-colors"
                      title="Inspect in AI Smart Scanner"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{t.viewScannerBtn}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
