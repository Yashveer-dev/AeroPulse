import React, { useState } from 'react';
import { AirQualityHourly } from '../types';
import { getAQIBand } from '../utils/aqiCalculations';
import { Sparkles, TrendingDown, Sun, Moon, Info, Calendar } from 'lucide-react';

interface ForecastChartProps {
  hourly: AirQualityHourly;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ hourly }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take 48 hours of forecast
  const times = (hourly.time || []).slice(0, 48);
  const aqis = (hourly.us_aqi || []).slice(0, 48);
  const pm25s = (hourly.pm2_5 || []).slice(0, 48);

  if (aqis.length === 0) return null;

  // Find min and max for scaling SVG
  const maxAqi = Math.max(...aqis, 200);
  const minAqi = Math.min(...aqis, 0);

  // Identify Best Outdoor Window (lowest 3 consecutive hours)
  let bestStartIdx = 0;
  let lowest3HourAvg = 9999;
  for (let i = 0; i < aqis.length - 2; i++) {
    const avg = (aqis[i] + aqis[i + 1] + aqis[i + 2]) / 3;
    if (avg < lowest3HourAvg) {
      lowest3HourAvg = avg;
      bestStartIdx = i;
    }
  }

  // Identify Peak Smog Hour
  let peakIdx = 0;
  let highestAqi = -1;
  aqis.forEach((val, i) => {
    if (val > highestAqi) {
      highestAqi = val;
      peakIdx = i;
    }
  });

  const chartHeight = 160;
  const chartWidth = 900;
  const paddingX = 20;
  const paddingY = 25;

  // Build SVG Points
  const points = aqis.map((val, idx) => {
    const x = paddingX + (idx / (aqis.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minAqi) / (maxAqi - minAqi || 1)) * (chartHeight - paddingY * 2);
    return { x, y, val, time: times[idx], pm25: pm25s[idx], idx };
  });

  const pathD = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  const bestWindowTimeStr = times[bestStartIdx] ? new Date(times[bestStartIdx]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '1:00 PM';
  const peakTimeStr = times[peakIdx] ? new Date(times[peakIdx]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '8:00 AM';

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : points[bestStartIdx];
  const hoveredBand = getAQIBand(hoveredPoint ? hoveredPoint.val : 100);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              48-Hour Smog Forecast & Safe Outdoor Windows
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
              Open-Meteo AI Forecast
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly AQI curve tracking temperature inversions and peak traffic smog spikes.
          </p>
        </div>

        {/* Highlights: Best Window & Peak Smog */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-emerald-400 block font-sans">Best Window (Lowest AQI)</span>
              <span className="font-bold">{bestWindowTimeStr} ({Math.round(lowest3HourAvg)} AQI)</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2 shadow-sm">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <div>
              <span className="text-[10px] text-rose-400 block font-sans">Peak Smog Alert</span>
              <span className="font-bold">{peakTimeStr} ({highestAqi} AQI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-44 sm:h-52 overflow-visible select-none"
        >
          <defs>
            {/* Gradient for Forecast Area */}
            <linearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
          <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#334155" opacity="0.6" />

          {/* Safe Window Highlight Box */}
          {points[bestStartIdx] && points[bestStartIdx + 3] && (
            <rect
              x={points[bestStartIdx].x}
              y={paddingY}
              width={Math.max(30, points[bestStartIdx + 3].x - points[bestStartIdx].x)}
              height={chartHeight - paddingY * 2}
              fill="#10b981"
              fillOpacity="0.12"
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              rx="6"
            />
          )}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#aqiAreaGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="url(#strokeGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Highlight Data Points */}
          {points.map((pt, idx) => {
            const isBest = idx >= bestStartIdx && idx <= bestStartIdx + 2;
            const isPeak = idx === peakIdx;
            const isHovered = hoveredIndex === idx;

            if (!isBest && !isPeak && !isHovered && idx % 4 !== 0) return null;

            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isPeak || isBest ? 4.5 : 3}
                  fill={isPeak ? '#ef4444' : isBest ? '#10b981' : '#cbd5e1'}
                  stroke="#0B1120"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:scale-150"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Inspector Bar */}
        {hoveredPoint && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">
                {new Date(hoveredPoint.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })}:
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${hoveredBand.badgeClass}`}>
                {hoveredPoint.val} AQI ({hoveredBand.label})
              </span>
              <span className="font-mono text-slate-300">
                PM₂.₅: <strong>{hoveredPoint.pm25} µg/m³</strong>
              </span>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              {hoveredIndex === bestStartIdx ? '⭐ Recommended window for outdoor ventilation and transit' : 'Move cursor across points to preview hourly smog index'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
