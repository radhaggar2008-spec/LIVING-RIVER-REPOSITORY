import { useState } from 'react';
import { MapPin, AlertTriangle, ShieldAlert, Leaf } from 'lucide-react';
import { mapZonePins, MapZonePin } from '../data/sensorData';

export function RiverMap() {
  const [selectedPin, setSelectedPin] = useState<MapZonePin>(mapZonePins[0]);

  const getPinClasses = (pin: MapZonePin, isSelected: boolean) => {
    const base =
      'pointer-events-auto group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-lg transition-transform duration-150 whitespace-nowrap cursor-pointer border ';
    const scale = isSelected ? 'scale-105 ring-2 ring-offset-2 ' : 'hover:scale-105 ';

    if (pin.label.includes('ALERT')) {
      return (
        base +
        scale +
        'bg-rose-600 text-white border-rose-200 ring-rose-500'
      );
    }
    if (pin.label.includes('NO-GO ZONE')) {
      return (
        base +
        scale +
        'bg-slate-900 text-white border-amber-300 ring-amber-500'
      );
    }
    return (
      base +
      scale +
      'bg-teal-700 text-white border-teal-200 ring-teal-500'
    );
  };

  const renderPinIcon = (pin: MapZonePin) => {
    if (pin.label.includes('ALERT')) {
      return <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
    if (pin.label.includes('NO-GO ZONE')) {
      return <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />;
    }
    return <Leaf className="h-3.5 w-3.5 shrink-0 text-teal-200" aria-hidden="true" />;
  };

  return (
    <section id="map" className="scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Geospatial Reach Monitor
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Yamuna River Corridor — Faridabad
          </h2>
        </div>
        <p className="text-sm text-slate-600 font-mono tabular-nums">
          28.4089° N · 77.3500° E · 3 Active Zone Markers
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Embedded OpenStreetMap iframe + 3 Absolute Positioned Pins */}
          <div className="lg:col-span-8 relative h-[360px] sm:h-[440px] rounded-xl overflow-hidden border border-sky-200 bg-sky-50">
            <iframe
              title="Yamuna River Faridabad Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.3100%2C28.3750%2C77.3980%2C28.4450&layer=mapnik"
              className="w-full h-full border-0"
              loading="lazy"
            />

            {/* Overlay layer for the 3 absolute-positioned dummy pins */}
            <div className="absolute inset-0 pointer-events-none">
              {mapZonePins.map((pin) => {
                const isSelected = selectedPin.id === pin.id;
                return (
                  <div
                    key={pin.id}
                    style={{ top: pin.topPercent, left: pin.leftPercent }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPin(pin)}
                      className={getPinClasses(pin, isSelected)}
                    >
                      {renderPinIcon(pin)}
                      <span>{pin.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone Inspector Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Selected Zone Telemetry</span>
                <span className="font-mono tabular-nums">
                  {selectedPin.coordinates}
                </span>
              </div>

              <div className="rounded-xl bg-white/80 border border-sky-100 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPin.label}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedPin.status === 'Red'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedPin.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-sky-900">
                  {selectedPin.zoneName}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedPin.description}
                </p>
                <p className="pt-2 border-t border-slate-100 text-xs font-mono tabular-nums text-teal-800">
                  {selectedPin.reading}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Quick Zone Switch
              </p>
              <div className="flex flex-col gap-2">
                {mapZonePins.map((pin) => {
                  const active = selectedPin.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      onClick={() => setSelectedPin(pin)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors border cursor-pointer ${
                        active
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white/75 text-slate-700 border-sky-100 hover:bg-sky-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{pin.label}</span>
                      </span>
                      <span
                        className={`font-mono text-[11px] shrink-0 ${
                          active ? 'text-sky-100' : 'text-slate-400'
                        }`}
                      >
                        {pin.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
