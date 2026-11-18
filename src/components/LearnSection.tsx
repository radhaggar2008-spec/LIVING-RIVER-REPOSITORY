import { ShieldCheck } from 'lucide-react';
import { controlArchitectureSteps, noGoZonesList } from '../data/sensorData';

export function LearnSection() {
  return (
    <section id="learn" className="scroll-mt-24 space-y-10">
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Hydro-Thermal Governance
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Control Architecture
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Five-stage operational defense from outfall intake to regulatory assurance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {controlArchitectureSteps.map((step) => (
            <div
              key={step.number}
              className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-teal-300 transition-colors"
            >
              <div>
                <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-sky-100">
                  <span className="text-2xl font-bold font-mono tabular-nums text-sky-700">
                    {step.number}
                  </span>
                  <span className="text-xs font-medium text-teal-700">
                    Stage {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-3">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-slate-700 mt-1.5 leading-snug">
                  {step.summary}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 leading-relaxed">
                {step.protocol}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* No-Go Zones List */}
      <div className="glass-card rounded-2xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
            <h3 className="text-xl font-bold text-slate-900">
              No-Go Zones &amp; Ecological Exclusion Perimeters
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            Protected Yamuna Basin Buffers
          </span>
        </div>

        <div className="divide-y divide-sky-100 mt-2">
          {noGoZonesList.map((zone) => (
            <div
              key={zone.name}
              className="py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start"
            >
              <div className="md:col-span-4">
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {zone.name}
                </h4>
                <p className="text-xs font-semibold text-rose-700 mt-0.5">
                  {zone.classification}
                </p>
              </div>
              <p className="md:col-span-6 text-sm text-slate-600 leading-relaxed">
                {zone.rule}
              </p>
              <div className="md:col-span-2 md:text-right">
                <span className="text-xs font-mono tabular-nums font-medium text-sky-800">
                  {zone.buffer}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
