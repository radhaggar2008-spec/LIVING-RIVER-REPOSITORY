import { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Droplets,
  Flame,
  Menu,
  Radiation,
  RotateCcw,
  Scale,
  Thermometer,
  Waves,
  X,
} from 'lucide-react';
import {
  checkAlerts,
  CPCB_RULE_TEXT,
  sensorData as baselineSensorData,
  SensorReading,
  StatusLevel,
} from './data/sensorData';
import { DoVsTempBarChart, TempLineChart } from './components/Charts';
import { RiverMap } from './components/RiverMap';
import { ReportSection } from './components/ReportSection';
import { LearnSection } from './components/LearnSection';

function getStatusBadgeClasses(level: StatusLevel) {
  switch (level) {
    case 'Green':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Yellow':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Red':
      return 'bg-rose-50 text-rose-800 border-rose-200';
  }
}

export default function App() {
  const [isHeatSpike, setIsHeatSpike] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSensorData: SensorReading[] = useMemo(() => {
    if (!isHeatSpike) {
      return baselineSensorData;
    }
    return baselineSensorData.map((reading, index) => {
      if (index === baselineSensorData.length - 1) {
        return {
          ...reading,
          waterTemp: 37.6,
          dissolvedOxygen: 4.7,
          flow: 112,
          radiation: 0.11,
        };
      }
      if (index === baselineSensorData.length - 2) {
        return {
          ...reading,
          waterTemp: 34.8,
          dissolvedOxygen: 5.5,
        };
      }
      return reading;
    });
  }, [isHeatSpike]);

  const currentReading = activeSensorData[activeSensorData.length - 1];
  const alertState = checkAlerts(currentReading.waterTemp);

  const tempStatus: { level: StatusLevel; label: string } =
    currentReading.waterTemp > 35
      ? { level: 'Red', label: 'Red · Critical' }
      : currentReading.waterTemp >= 31
        ? { level: 'Yellow', label: 'Yellow · Elevated' }
        : { level: 'Green', label: 'Green · Normal' };

  const flowStatus: { level: StatusLevel; label: string } =
    currentReading.flow < 95
      ? { level: 'Red', label: 'Red · Low Flow' }
      : currentReading.flow < 115
        ? { level: 'Yellow', label: 'Yellow · Reduced' }
        : { level: 'Green', label: 'Green · Normal' };

  const doStatus: { level: StatusLevel; label: string } =
    currentReading.dissolvedOxygen < 5.0
      ? { level: 'Red', label: 'Red · Hypoxic' }
      : currentReading.dissolvedOxygen < 6.0
        ? { level: 'Yellow', label: 'Yellow · Watch' }
        : { level: 'Green', label: 'Green · Optimal' };

  const radStatus: { level: StatusLevel; label: string } =
    currentReading.radiation > 0.2
      ? { level: 'Red', label: 'Red · Elevated' }
      : currentReading.radiation > 0.1
        ? { level: 'Yellow', label: 'Yellow · Caution' }
        : { level: 'Green', label: 'Green · Safe' };

  const kpiCards = [
    {
      title: 'Water Temp',
      value: `${currentReading.waterTemp.toFixed(1)}°C`,
      detail: isHeatSpike
        ? 'Above 35.0°C CPCB alert trigger'
        : 'Baseline thermal outfall reading',
      status: tempStatus,
      icon: Thermometer,
      iconBg: isHeatSpike
        ? 'bg-rose-100 text-rose-700'
        : 'bg-sky-100 text-sky-700',
    },
    {
      title: 'Flow',
      value: `${currentReading.flow} m3/s`,
      detail: 'Yamuna Faridabad discharge volume',
      status: flowStatus,
      icon: Waves,
      iconBg: 'bg-teal-100 text-teal-700',
    },
    {
      title: 'Dissolved Oxygen',
      value: `${currentReading.dissolvedOxygen.toFixed(1)} mg/L`,
      detail: 'Aquatic respiration threshold >= 5.0',
      status: doStatus,
      icon: Droplets,
      iconBg: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'Radiation',
      value: `${currentReading.radiation.toFixed(2)} µSv/h`,
      detail: 'Ambient background gamma probe',
      status: radStatus,
      icon: Radiation,
      iconBg: 'bg-sky-100 text-sky-700',
    },
  ];

  const navItems = [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Map', href: '#map' },
    { label: 'Alerts', href: '#alerts' },
    { label: 'Report', href: '#report' },
    { label: 'Learn', href: '#learn' },
  ];

  return (
    <div className="min-h-screen river-canvas-bg text-slate-900 flex flex-col">
      {/* Top Navigation Bar — 3-zone contract */}
      <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#dashboard"
            className="text-base sm:text-lg font-extrabold tracking-tight text-sky-950 whitespace-nowrap shrink-0"
          >
            LIVING RIVER WATCH
          </a>

          {/* Zone 2: 5 concise single-line text links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-sky-700 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#report"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
            >
              Report Incident
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-sky-200 bg-white p-2 text-slate-700 hover:bg-sky-50 cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-sky-100 bg-white/95 px-4 py-3 flex flex-wrap gap-3"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-800 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-14">
        {/* RED Alert Banner triggered by checkAlerts() when temp > 35 */}
        {alertState.isAlert && (
          <div
            role="alert"
            className="rounded-2xl bg-rose-600 text-white border border-rose-400 shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <AlertOctagon
                className="h-7 w-7 text-rose-100 shrink-0 mt-0.5 sm:mt-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-base sm:text-lg font-extrabold tracking-tight">
                  {alertState.bannerText}
                </p>
                <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                  {alertState.reason}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsHeatSpike(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Baseline</span>
            </button>
          </div>
        )}

        {/* Section 1: DASHBOARD & ALERTS CONTROL */}
        <section id="dashboard" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                Yamuna River Basin · Faridabad Telemetry Array
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-1.5 text-balance">
                Hydro-Thermal &amp; Ecological Watch
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                Live monitoring of thermal cooling discharge, river flow velocity, dissolved oxygen balance, and ambient radiation against CPCB standards.
              </p>
            </div>

            {/* Alerts Simulation Trigger */}
            <div
              id="alerts"
              className="scroll-mt-24 glass-card-strong rounded-2xl p-4 flex flex-wrap items-center gap-3 shrink-0"
            >
              <div className="pr-2">
                <p className="text-xs font-semibold text-slate-500">
                  Thermal Alert Engine
                </p>
                <p className="text-sm font-mono tabular-nums font-bold text-slate-900">
                  {alertState.isAlert
                    ? `ALERT: ${currentReading.waterTemp.toFixed(1)}°C > 35°C`
                    : `OK: ${currentReading.waterTemp.toFixed(1)}°C <= 35°C`}
                </p>
              </div>

              {!isHeatSpike ? (
                <button
                  type="button"
                  onClick={() => setIsHeatSpike(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-sky-800 hover:to-teal-700 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Flame className="h-4 w-4" aria-hidden="true" />
                  <span>Simulate Heat Spike</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsHeatSpike(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Restore 32.5°C Baseline</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${getStatusBadgeClasses(
                        card.status.level
                      )}`}
                    >
                      {card.status.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {card.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900 mt-1">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      {card.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* CPCB Rule Box */}
          <div className="glass-card rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                <Scale className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">
                  CPCB Thermal Discharge Rule
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                  {CPCB_RULE_TEXT}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-teal-800">
              <Activity className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>checkAlerts() threshold: &gt; 35.0°C</span>
            </div>
          </div>

          {/* 2 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TempLineChart data={activeSensorData} isHeatSpike={isHeatSpike} />
            <DoVsTempBarChart data={activeSensorData} />
          </div>
        </section>

        {/* Section 2: MAP */}
        <RiverMap />

        {/* Section 3: REPORT */}
        <ReportSection />

        {/* Section 4: LEARN */}
        <LearnSection />
      </main>

      <footer className="border-t border-sky-200/80 bg-white/70 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            LIVING RIVER WATCH · Yamuna Faridabad Ecological Observatory
          </span>
          <span>
            Thermal Discharge &amp; Riparian Protection Platform
          </span>
        </div>
      </footer>
    </div>
  );
}
