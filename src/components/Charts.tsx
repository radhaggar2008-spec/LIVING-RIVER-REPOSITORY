import { useState } from 'react';
import { SensorReading } from '../data/sensorData';

interface ChartsProps {
  data: SensorReading[];
  isHeatSpike: boolean;
}

export function TempLineChart({ data, isHeatSpike }: ChartsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 250;
  const pad = { top: 24, right: 24, bottom: 38, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const minTemp = 24;
  const maxTemp = 40;

  const getX = (index: number) =>
    pad.left + (index / Math.max(data.length - 1, 1)) * plotW;
  const getY = (temp: number) =>
    pad.top + ((maxTemp - temp) / (maxTemp - minTemp)) * plotH;

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.waterTemp),
    ...d,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M ${points[0].x},${pad.top + plotH} ` +
        points.map((p) => `L ${p.x},${p.y}`).join(' ') +
        ` L ${points[points.length - 1].x},${pad.top + plotH} Z`
      : '';

  const alertY = getY(35);
  const gridTemps = [24, 28, 32, 36, 40];
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Water Temperature Over 24 Hours
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Continuous telemetry across Yamuna Faridabad stations · Alert threshold at 35.0°C
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-sm ${
                isHeatSpike ? 'bg-rose-600' : 'bg-sky-600'
              }`}
            />
            Temp (°C)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-rose-500" />
            35°C Limit
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Line chart of water temperature over 24 hours"
        >
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isHeatSpike ? '#E11D48' : '#0284C7'}
                stopOpacity="0.26"
              />
              <stop
                offset="100%"
                stopColor={isHeatSpike ? '#E11D48' : '#14B8A6'}
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          {gridTemps.map((t) => {
            const y = getY(t);
            return (
              <g key={t}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="#CBD5E1"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                />
                <text
                  x={pad.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px] font-mono tabular-nums"
                >
                  {t}°
                </text>
              </g>
            );
          })}

          {/* 35°C Alert Threshold Reference Line */}
          <line
            x1={pad.left}
            y1={alertY}
            x2={width - pad.right}
            y2={alertY}
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text
            x={width - pad.right}
            y={alertY - 6}
            textAnchor="end"
            className="fill-rose-600 text-[10px] font-mono font-semibold"
          >
            ALERT THRESHOLD 35.0°C
          </text>

          {/* Area under line */}
          <path d={areaPath} fill="url(#tempAreaGrad)" />

          {/* Main temperature curve */}
          <polyline
            fill="none"
            stroke={isHeatSpike ? '#E11D48' : '#0284C7'}
            strokeWidth="2.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polylinePoints}
          />

          {/* Hover vertical guideline */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={pad.top}
              x2={activePoint.x}
              y2={pad.top + plotH}
              stroke="#0D9488"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Data points & X-axis labels */}
          {points.map((p, idx) => {
            const isOverThreshold = p.waterTemp > 35;
            const isHovered = hoveredIdx === idx;
            return (
              <g key={p.id}>
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] font-mono tabular-nums"
                >
                  {p.time}
                </text>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={isOverThreshold ? '#DC2626' : '#0D9488'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
                {/* Larger invisible hit area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(idx === hoveredIdx ? null : idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Readout Bar */}
        <div className="mt-3 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {activePoint ? (
            <>
              <span className="font-medium text-slate-700">
                {activePoint.time} · {activePoint.station}
              </span>
              <span className="font-mono tabular-nums font-semibold text-sky-800">
                Temp: {activePoint.waterTemp.toFixed(1)}°C · DO:{' '}
                {activePoint.dissolvedOxygen.toFixed(1)} mg/L
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-500">
                Hover or tap any point to inspect sensor reading
              </span>
              <span className="font-mono tabular-nums text-slate-700">
                24h Range:{' '}
                {Math.min(...data.map((d) => d.waterTemp)).toFixed(1)}°C –{' '}
                {Math.max(...data.map((d) => d.waterTemp)).toFixed(1)}°C
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DoVsTempBarChart({ data }: { data: SensorReading[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 250;
  const pad = { top: 24, right: 44, bottom: 38, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxTemp = 45;
  const maxDo = 10;

  const groupW = plotW / data.length;
  const barW = Math.min(15, groupW * 0.32);
  const barGap = 4;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const activeReading = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Dissolved Oxygen vs. Water Temperature
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Inverse thermal stress correlation across monitoring intervals
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
            DO (mg/L)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />
            Temp (°C)
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Bar chart comparing dissolved oxygen and water temperature"
        >
          {yTicks.map((ratio) => {
            const y = pad.top + plotH * (1 - ratio);
            const doVal = (ratio * maxDo).toFixed(1);
            const tempVal = Math.round(ratio * maxTemp);
            return (
              <g key={ratio}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="#CBD5E1"
                  strokeOpacity="0.6"
                  strokeWidth="1"
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-teal-700 text-[10px] font-mono tabular-nums"
                >
                  {doVal}
                </text>
                <text
                  x={width - pad.right + 8}
                  y={y + 4}
                  textAnchor="start"
                  className="fill-sky-700 text-[10px] font-mono tabular-nums"
                >
                  {tempVal}°
                </text>
              </g>
            );
          })}

          {data.map((d, i) => {
            const centerX = pad.left + i * groupW + groupW / 2;
            const doHeight = Math.min(1, d.dissolvedOxygen / maxDo) * plotH;
            const tempHeight = Math.min(1, d.waterTemp / maxTemp) * plotH;
            const isHovered = hoveredIdx === i;
            const isHighTemp = d.waterTemp > 35;

            return (
              <g
                key={d.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(i === hoveredIdx ? null : i)}
              >
                {isHovered && (
                  <rect
                    x={pad.left + i * groupW + 2}
                    y={pad.top}
                    width={groupW - 4}
                    height={plotH}
                    rx="6"
                    fill="#E0F2FE"
                    fillOpacity="0.55"
                  />
                )}

                {/* DO Bar */}
                <rect
                  x={centerX - barW - barGap / 2}
                  y={pad.top + plotH - doHeight}
                  width={barW}
                  height={doHeight}
                  rx="3"
                  fill={isHovered ? '#0F766E' : '#14B8A6'}
                  className="transition-colors duration-150"
                />

                {/* Temp Bar */}
                <rect
                  x={centerX + barGap / 2}
                  y={pad.top + plotH - tempHeight}
                  width={barW}
                  height={tempHeight}
                  rx="3"
                  fill={
                    isHighTemp
                      ? '#E11D48'
                      : isHovered
                        ? '#0369A1'
                        : '#0284C7'
                  }
                  className="transition-colors duration-150"
                />

                <text
                  x={centerX}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-slate-500 text-[11px] font-mono tabular-nums"
                >
                  {d.time}
                </text>
              </g>
            );
          })}

          {/* Axis Units */}
          <text
            x={pad.left - 8}
            y={pad.top - 10}
            textAnchor="end"
            className="fill-teal-700 text-[10px] font-mono font-semibold"
          >
            mg/L
          </text>
          <text
            x={width - pad.right + 8}
            y={pad.top - 10}
            textAnchor="start"
            className="fill-sky-700 text-[10px] font-mono font-semibold"
          >
            °C
          </text>
        </svg>

        <div className="mt-3 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {activeReading ? (
            <>
              <span className="font-medium text-slate-700">
                {activeReading.time} · {activeReading.station}
              </span>
              <span className="font-mono tabular-nums font-semibold text-teal-800">
                DO: {activeReading.dissolvedOxygen.toFixed(1)} mg/L · Temp:{' '}
                {activeReading.waterTemp.toFixed(1)}°C
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-500">
                Higher water temperatures reduce oxygen solubility
              </span>
              <span className="font-mono tabular-nums text-slate-700">
                Safe Aquatic DO Floor: 5.0 mg/L
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
