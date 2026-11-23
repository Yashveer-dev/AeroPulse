import React from 'react';
import { 
  Cigarette, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldAlert, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { CombinedTelemetry, HouseholdPersona } from '../types';
import { getAQIBand, calculateCigaretteEquivalent, getPrimaryDriver, assessDispersion } from '../utils/aqiCalculations';
import { PERSONAS } from '../utils/personas';

interface HeroTelemetryProps {
  telemetry: CombinedTelemetry;
  selectedPersona: HouseholdPersona;
  onAskCopilot: (prompt: string) => void;
}

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({
  telemetry,
  selectedPersona,
  onAskCopilot
}) => {
  const currentAQI = telemetry.airQuality.current.us_aqi;
  const pm25 = telemetry.airQuality.current.pm2_5;
  const pm10 = telemetry.airQuality.current.pm10;
  const no2 = telemetry.airQuality.current.nitrogen_dioxide;
  const windSpeed = telemetry.weather.current.wind_speed_10m;
  const humidity = telemetry.weather.current.relative_humidity_2m;
  const temp = Math.round(telemetry.weather.current.temperature_2m);

  const band = getAQIBand(currentAQI);
  const cigarettes = calculateCigaretteEquivalent(pm25);
  const driver = getPrimaryDriver({ pm2_5: pm25, pm10, nitrogen_dioxide: no2 });
  const dispersion = assessDispersion(windSpeed, humidity);
  const personaInfo = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0];

  // Calculate AQI meter arc percentage (capped at 500 max)
  const aqiPercentage = Math.min(100, Math.max(0, (currentAQI / 500) * 100));

  // Circular gauge parameters
  const strokeDashoffset = 440 - (440 * (currentAQI / 500) * 0.75);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-8 transition-all">
      {/* Background ambient radial glow matching AQI level */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: band.color }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: band.color }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Dynamic AQI Gauge & Core Numbers */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full lg:w-auto">
          {/* Radial Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="currentColor"
                strokeWidth="14"
                className="text-slate-800/80 fill-transparent"
                strokeDasharray="440"
                strokeDashoffset="110"
                strokeLinecap="round"
              />
              {/* Dynamic Value Arc */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke={band.color}
                strokeWidth="14"
                className="fill-transparent transition-all duration-1000 ease-out"
                strokeDasharray="440"
                strokeDashoffset={Math.max(110, 440 - ((440 - 110) * Math.min(1, currentAQI / 400)))}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered AQI Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                US AQI
              </span>
              <span 
                className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono transition-colors"
                style={{ color: band.color }}
              >
                {currentAQI}
              </span>
              <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded-full mt-1 border border-slate-700/50 bg-slate-800/60">
                EPA Band
              </span>
            </div>
          </div>

          {/* Status, Severity & Persona Health Risk Multiplier */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${band.badgeClass}`}>
                {band.label}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
                <Clock className="w-3 h-3 text-slate-400" />
                Live Telemetry
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {telemetry.city}
              <span className="text-slate-400 font-medium text-base ml-2">
                ({telemetry.country})
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              {band.description}
            </p>

            {/* Persona Callout Pill */}
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <div className="text-[11px] text-slate-400 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
                <span className="font-semibold text-emerald-400">{personaInfo.label} Risk Factor:</span>
                <span className="font-mono text-white font-bold">{personaInfo.vulnerabilityFactor}x Baseline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Bento Metrics Grid (Cigarette Equiv, Driver, Dispersion, Microclimate) */}
        <div className="grid grid-cols-2 gap-3.5 w-full lg:w-96 shrink-0">
          
          {/* 1. Cigarette Equivalent Metric */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-rose-500/40 transition-colors group relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider">Toxic Inhaled Load</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Cigarette className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-rose-400">{cigarettes}</span>
              <span className="text-xs font-semibold text-slate-400">cigs / day</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
              Based on Berkeley Earth formula (PM₂.₅ / 22)
            </p>
          </div>

          {/* 2. Primary Pollutant Driver */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-emerald-500/40 transition-colors group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider">Primary Driver</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-100 font-mono truncate">
              {driver.name}
            </div>
            <p className="text-[10px] text-amber-400 font-medium mt-1">
              {driver.ratio}x over WHO annual safe limit
            </p>
          </div>

          {/* 3. Atmospheric Dispersion Status */}
          <div className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 hover:border-blue-500/40 transition-colors group col-span-2">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Atmospheric Ventilation</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${dispersion.badgeClass}`}>
                {dispersion.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                <span>{windSpeed} km/h wind</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>{humidity}% humidity</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>{temp}°C ambient</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Action Suggestion Strip */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">
            Immediate Clinical Protocol: <span className="text-white font-semibold">{band.generalAdvice}</span>
          </span>
        </div>
        <button
          onClick={() => onAskCopilot(`How do I protect my health right now with AQI at ${currentAQI}?`)}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 transition-colors"
        >
          Ask Copilot for custom hacks <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
