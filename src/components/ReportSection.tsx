import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Camera, Download, MapPin, Search, Send, Trash2, FileText, X } from 'lucide-react';

export type IncidentType =
  | 'Thermal Discharge'
  | 'Radiation Leak'
  | 'Hot Water'
  | 'Fish Death';

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved';

export interface IncidentReport {
  id: string;
  location: string;
  type: IncidentType;
  status?: IncidentStatus;
  description: string;
  photoDataUrl: string | null;
  createdAt: string;
}

const STORAGE_KEY = 'living_river_watch_reports';

const INCIDENT_TYPES: IncidentType[] = [
  'Thermal Discharge',
  'Radiation Leak',
  'Hot Water',
  'Fish Death',
];

const INCIDENT_STATUSES: IncidentStatus[] = [
  'Open',
  'Investigating',
  'Resolved',
];

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 720;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Could not process image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function ReportSection() {
  const [reports, setReports] = useState<IncidentReport[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore malformed localStorage entries
    }
    return [];
  });

  const [location, setLocation] = useState('');
  const [type, setType] = useState<IncidentType>('Thermal Discharge');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | IncidentType>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | IncidentStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      setErrorMsg('Browser storage limit reached. Try removing older reports.');
    }
  }, [reports]);

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPhotoDataUrl(dataUrl);
      setPhotoName(file.name);
    } catch {
      setErrorMsg('Unable to process the selected image file.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!location.trim() || !description.trim()) {
      setErrorMsg('Please enter both a location and an incident description.');
      return;
    }

    const newReport: IncidentReport = {
      id: `RPT-${Date.now().toString(36).toUpperCase()}`,
      location: location.trim(),
      type,
      status: 'Open',
      description: description.trim(),
      photoDataUrl,
      createdAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setReports((prev) => [newReport, ...prev]);
    setLocation('');
    setType('Thermal Discharge');
    setDescription('');
    setPhotoDataUrl(null);
    setPhotoName('');
  };

  const handleDelete = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStatusChange = (id: string, nextStatus: IncidentStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
  };

  const escapeCsvField = (value: string) => {
    const normalized = value.replace(/\r?\n/g, ' ');
    if (/[",\n]/.test(normalized)) {
      return `"${normalized.replace(/"/g, '""')}"`;
    }
    return normalized;
  };

  const handleExportCsv = () => {
    if (reports.length === 0) {
      return;
    }

    const headers = [
      'Report ID',
      'Timestamp',
      'Incident Type',
      'Status',
      'Location',
      'Description',
      'Photo Attached',
    ];

    const rows = reports.map((r) => [
      escapeCsvField(r.id),
      escapeCsvField(r.createdAt),
      escapeCsvField(r.type),
      escapeCsvField(r.status ?? 'Open'),
      escapeCsvField(r.location),
      escapeCsvField(r.description),
      r.photoDataUrl ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `living-river-watch-cpcb-incidents-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredReports = reports.filter((report) => {
    const reportStatus: IncidentStatus = report.status ?? 'Open';
    const matchesType = filterType === 'All' || report.type === filterType;
    const matchesStatus =
      filterStatus === 'All' || reportStatus === filterStatus;
    const matchesQuery =
      normalizedQuery === '' ||
      report.location.toLowerCase().includes(normalizedQuery) ||
      report.description.toLowerCase().includes(normalizedQuery) ||
      report.type.toLowerCase().includes(normalizedQuery) ||
      report.id.toLowerCase().includes(normalizedQuery) ||
      reportStatus.toLowerCase().includes(normalizedQuery);

    return matchesType && matchesStatus && matchesQuery;
  });

  const hasActiveFilters =
    filterType !== 'All' || filterStatus !== 'All' || normalizedQuery !== '';

  const getTypeBadgeStyle = (incidentType: IncidentType) => {
    switch (incidentType) {
      case 'Radiation Leak':
      case 'Fish Death':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Thermal Discharge':
      case 'Hot Water':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getStatusBadgeStyle = (status: IncidentStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Investigating':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <section id="report" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Field Evidence &amp; Escalation
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Report Ecological Incident
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Saved locally in browser storage for immediate field audit
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="report-location"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="h-4 w-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="report-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Yamuna River Bank, Sector 15, Faridabad"
                  className="w-full rounded-xl border border-sky-200 bg-white/90 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="report-type"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Incident Type
              </label>
              <select
                id="report-type"
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full rounded-xl border border-sky-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {INCIDENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-7">
              <label
                htmlFor="report-description"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="report-description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe plume color, water heat, odor, dead fish count, or outfall gate observations..."
                className="w-full rounded-xl border border-sky-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-5">
              <label
                htmlFor="report-photo"
                className="block text-sm font-semibold text-slate-800 mb-1.5"
              >
                Photo Upload
              </label>
              <label
                htmlFor="report-photo"
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-50 px-4 py-4 text-center cursor-pointer transition-colors min-h-[112px]"
              >
                {photoDataUrl ? (
                  <div className="flex items-center gap-3 w-full text-left">
                    <img
                      src={photoDataUrl}
                      alt="Incident preview"
                      className="h-16 w-20 rounded-lg object-cover border border-sky-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {photoName || 'Attached evidence'}
                      </p>
                      <p className="text-xs text-teal-700 mt-0.5">
                        Click to replace photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="h-5 w-5 text-sky-600 mb-1.5" aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-700">
                      Attach field photo (JPG, PNG)
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Optional visual proof
                    </span>
                  </>
                )}
                <input
                  id="report-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
              </label>
              {photoDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoDataUrl(null);
                    setPhotoName('');
                  }}
                  className="mt-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {reports.length} {reports.length === 1 ? 'report' : 'reports'} stored in localStorage
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-sky-800 hover:to-teal-700 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span>Submit Incident Report</span>
            </button>
          </div>
        </form>
      </div>

      {/* Saved Reports List */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900">
            Submitted Reports ({filteredReports.length}
            {filteredReports.length !== reports.length ? ` of ${reports.length}` : ''})
          </h3>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={reports.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-card rounded-2xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="h-4 w-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, description, ID, or type..."
              aria-label="Search reported incidents"
              className="w-full rounded-xl border border-sky-200 bg-white/90 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div
              role="group"
              aria-label="Filter by incident status"
              className="flex items-center gap-1 p-1 rounded-xl bg-white/80 border border-sky-100 overflow-x-auto max-w-full"
            >
              {(['All', ...INCIDENT_STATUSES] as const).map((statusOption) => (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() => setFilterStatus(statusOption)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterStatus === statusOption
                      ? 'bg-teal-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div
              role="group"
              aria-label="Filter by incident type"
              className="flex items-center gap-1 p-1 rounded-xl bg-white/80 border border-sky-100 overflow-x-auto max-w-full"
            >
              {(['All', ...INCIDENT_TYPES] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterType === tab
                      ? 'bg-sky-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <FileText className="h-8 w-8 text-sky-400 mx-auto mb-2.5" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-800">
              {reports.length === 0
                ? 'No incident reports logged yet'
                : 'No incidents match your current search or filters'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {reports.length === 0
                ? 'Submit the form above to record thermal discharges, hot water plumes, or ecological alerts.'
                : 'Try adjusting your search keywords, status filter, or incident type filter.'}
            </p>
            {hasActiveFilters && reports.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All');
                  setFilterType('All');
                }}
                className="mt-3 inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50 transition-colors cursor-pointer"
              >
                Reset Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => {
              const currentStatus: IncidentStatus = report.status ?? 'Open';
              return (
                <article
                  key={report.id}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {report.photoDataUrl && (
                      <div className="h-44 w-full bg-sky-50 border-b border-sky-100 overflow-hidden">
                        <img
                          src={report.photoDataUrl}
                          alt={`${report.type} at ${report.location}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getTypeBadgeStyle(
                            report.type
                          )}`}
                        >
                          {report.type}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          {report.id}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {report.location}
                      </h4>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {report.description}
                      </p>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        <label
                          htmlFor={`status-${report.id}`}
                          className="text-xs font-medium text-slate-500"
                        >
                          Status
                        </label>
                        <select
                          id={`status-${report.id}`}
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              report.id,
                              e.target.value as IncidentStatus
                            )
                          }
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          {INCIDENT_STATUSES.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3 border-t border-sky-100 bg-white/50 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">{report.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(report.id)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                      aria-label={`Delete report ${report.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
