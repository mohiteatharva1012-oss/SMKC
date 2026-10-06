import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Phone, 
  User, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Upload,
  Sparkles
} from 'lucide-react';

export default function CitizenPortal({ complaints, onAddComplaint, t, lang }) {
  const [formData, setFormData] = useState({
    citizenName: '',
    citizenPhone: '',
    city: 'Sangli',
    ward: 'Prabhag 03 - Vishrambag',
    location: '',
    description: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [submittedToken, setSubmittedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.citizenName || !formData.citizenPhone || !formData.location) {
      alert('Please fill all mandatory fields: Name, Phone, and Exact Location');
      return;
    }

    setIsSubmitting(true);
    const newComplaint = {
      ...formData,
      imageUrl: previewImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    };

    const res = await onAddComplaint(newComplaint);
    setIsSubmitting(false);

    if (res && res.id) {
      setSubmittedToken(res.id);
      // Reset form
      setFormData({
        citizenName: '',
        citizenPhone: '',
        city: 'Sangli',
        ward: 'Prabhag 03 - Vishrambag',
        location: '',
        description: '',
      });
      setPreviewImage(null);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>SMKC Jan-Samwad Civic Vigilance Cell</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.citizenTitle}
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
          {t.citizenSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Reporting Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Report Unauthorized Banner / Flex</span>
            </h2>
            <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Bombay HC PIL 155/2011 Action
            </span>
          </div>

          {submittedToken && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.citizenSuccessMsg}</span>
                <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded text-white border border-emerald-400">
                  {submittedToken}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                An automated SMS alert has been dispatched to the Ward Junior Engineer. The demolition squad will inspect the spot within 24 hours.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.citizenFormName} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.citizenName}
                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.citizenFormPhone} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.citizenPhone}
                    onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
                    placeholder="+91 98220 12345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.citizenFormCity}
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Sangli">सांगली (Sangli)</option>
                  <option value="Miraj">मिरज (Miraj)</option>
                  <option value="Kupwad">कुपवाड (Kupwad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t.citizenFormWard}
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Prabhag 01 - Ganpati Peth">Prabhag 01 - Ganpati Peth</option>
                  <option value="Prabhag 02 - Civil Hospital">Prabhag 02 - Civil Hospital Road</option>
                  <option value="Prabhag 03 - Vishrambag">Prabhag 03 - Vishrambag</option>
                  <option value="Prabhag 04 - Rajwada">Prabhag 04 - Rajwada</option>
                  <option value="Prabhag 07 - Station Road Miraj">Prabhag 07 - Station Road Miraj</option>
                  <option value="Prabhag 08 - Gandhi Chowk Miraj">Prabhag 08 - Gandhi Chowk Miraj</option>
                  <option value="Prabhag 11 - Kupwad MIDC">Prabhag 11 - Kupwad MIDC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.citizenFormLocation} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Near Ganpati Temple Chowk, opposite State Bank"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.citizenFormDesc}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mention if it blocks traffic signal, hangs from electric wire, or obstructs pedestrian footpath..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.citizenFormPhoto}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-950/60 cursor-pointer transition-all">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span className="text-slate-400">{previewImage ? 'Change Image' : 'Select Photo from Phone / PC'}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {previewImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Grievance...' : t.citizenSubmitBtn}</span>
            </button>
          </form>
        </div>

        {/* Right: Live Complaints Tracker Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-base text-white">
                {t.existingComplaints}
              </h2>
              <span className="text-[11px] text-slate-400">
                Transparent civic action logs
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-slate-800 px-2 py-1 rounded">
              {complaints.length} Total
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token, location or description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
            {filteredComplaints.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-[11px]">
                    {c.id}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock className="w-2.5 h-2.5" />
                    {c.status}
                  </span>
                </div>

                <p className="text-slate-200 font-medium">
                  {c.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{c.location} ({c.city})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{c.filedDate?.slice(0, 10)}</span>
                </div>

                {c.assignedOfficer && (
                  <div className="text-[10px] text-sky-400 bg-sky-950/30 px-2 py-1 rounded">
                    Officer: {c.assignedOfficer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
