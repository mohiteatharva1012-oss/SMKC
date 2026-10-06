import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Flame, 
  MapPin,
  ExternalLink
} from 'lucide-react';

export default function HoardingRegistry({ 
  hoardings, 
  onDeleteHoarding, 
  setActiveTab, 
  setSelectedHoardingForNotice, 
  t, 
  lang 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = hoardings.filter(item => {
    const matchesCity = filterCity === 'all' || item.city.toLowerCase() === filterCity.toLowerCase();
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ocrText && item.ocrText.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCity && matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'City', 'Ward', 'Location', 'Status', 'Dimensions', 'Advertiser', 'Contact', 'Fine(INR)', 'Notice_Status'];
    const rows = filtered.map(h => [
      h.id,
      h.city,
      h.ward,
      `"${h.locationName}"`,
      h.status,
      h.dimensions,
      `"${h.advertiser}"`,
      h.contactNumber,
      h.fineAmount,
      `"${h.noticeStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMKC_Hoardings_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'illegal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            {t.statusIllegal}
          </span>
        );
      case 'critical_hazard':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-600/30 text-red-200 border border-red-500 animate-pulse">
            <Flame className="w-3 h-3 text-red-400" />
            {t.statusCriticalHazard}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            {t.statusExpired}
          </span>
        );
      case 'permitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            {t.statusPermitted}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>SMKC Master Advertising Database & Compliance Audit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.registryTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              {t.registrySubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* City Filter */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Cities (सांगली, मिरज, कुपवाड)</option>
            <option value="Sangli">सांगली (Sangli)</option>
            <option value="Miraj">मिरज (Miraj)</option>
            <option value="Kupwad">कुपवाड (Kupwad)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses (सर्व स्थिती)</option>
            <option value="illegal">अनधिकृत (Illegal)</option>
            <option value="critical_hazard">धोकादायक (Critical Hazard)</option>
            <option value="expired">मुदत संपलेले (Expired)</option>
            <option value="permitted">अधिकृत (Permitted)</option>
          </select>

        </div>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">{t.colId}</th>
                <th className="p-4">{t.colLocation}</th>
                <th className="p-4">{t.colAdvertiser}</th>
                <th className="p-4">{t.colSize}</th>
                <th className="p-4">{t.colStatus}</th>
                <th className="p-4 text-right">{t.colFine}</th>
                <th className="p-4 text-center">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* ID & City */}
                  <td className="p-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                    <div>{item.id}</div>
                    <span className="text-[10px] text-slate-500 font-sans">{item.city}</span>
                  </td>

                  {/* Location & Ward */}
                  <td className="p-4">
                    <div className="font-semibold text-white truncate max-w-xs">{item.locationName}</div>
                    <div className="text-[11px] text-slate-500">{item.ward}</div>
                  </td>

                  {/* Advertiser & Contact */}
                  <td className="p-4">
                    <div className="font-semibold text-slate-200">{item.advertiser}</div>
                    <div className="text-[11px] text-emerald-400">{item.contactNumber}</div>
                  </td>

                  {/* Dimensions */}
                  <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                    {item.dimensions}
                    <span className="block text-[10px] text-slate-500">{item.classification}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Fine Amount */}
                  <td className="p-4 text-right font-bold text-amber-400 font-mono">
                    {item.fineAmount > 0 ? `₹${item.fineAmount.toLocaleString('en-IN')}` : '-'}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.status !== 'permitted' && (
                        <button
                          onClick={() => {
                            setSelectedHoardingForNotice(item);
                            setActiveTab('notice');
                          }}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors border border-rose-500/30"
                          title="Generate Legal Notice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteHoarding(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 transition-colors"
                        title="Mark Demolished & Remove Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} of {hoardings.length} total records</span>
          <span className="text-[11px] text-amber-400/80">SMKC Anti-Defacement Squad Database</span>
        </div>
      </div>
    </div>
  );
}
