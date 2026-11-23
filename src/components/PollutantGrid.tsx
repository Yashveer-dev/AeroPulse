import React from 'react';
import { AirQualityCurrent } from '../types';
import { POLLUTANT_SPECS } from '../utils/aqiCalculations';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface PollutantGridProps {
  currentPollutants: AirQualityCurrent;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ currentPollutants }) => {
  const pollutantKeys = [
    'pm2_5',
    'pm10',
    'nitrogen_dioxide',
    'ozone',
    'sulphur_dioxide',
    'carbon_monoxide'
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Live Pollutant Breakdown</span>
            <span className="text-[11px] font-mono normal-case text-slate-400 font-normal">
              (Concentrations in µg/m³)
            </span>
          </h3>
        </div>
        <div className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span> Under WHO Limit
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 ml-2"></span> Exceeds Limit
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {pollutantKeys.map((key) => {
          const spec = POLLUTANT_SPECS[key];
          const rawValue = (currentPollutants as unknown as Record<string, number>)[key];
          const value = typeof rawValue === 'number' ? Math.round(rawValue * 10) / 10 : 0;
          const ratio = spec.whoLimit > 0 ? value / spec.whoLimit : 0;
          const isExceeded = ratio > 1;
          const progressPercent = Math.min(100, Math.round(ratio * 50)); // 100% WHO limit is at 50% width

          return (
            <div
              key={key}
              className={`p-3.5 rounded-2xl bg-slate-900/80 border transition-all hover:bg-slate-850 flex flex-col justify-between ${
                isExceeded
                  ? 'border-slate-800 hover:border-rose-500/50'
                  : 'border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold font-mono text-white tracking-wide">
                    {spec.formula}
                  </span>
                  {isExceeded ? (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                      {(ratio).toFixed(1)}x WHO
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      Normal
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5" title={spec.name}>
                  {spec.name}
                </div>
              </div>

              <div className="my-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-slate-100">
                    {value}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {spec.unit}
                  </span>
                </div>
                
                {/* Progress bar relative to WHO Limit */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      isExceeded 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>WHO Limit:</span>
                <span className="font-mono font-medium text-slate-300">
                  {spec.whoLimit} {spec.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
