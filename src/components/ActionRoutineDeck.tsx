import React, { useState } from 'react';
import { 
  Calendar, 
  Home, 
  Leaf, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Wind
} from 'lucide-react';
import { AIPersonalizedAdvice, SustainableSwap, RoutineSlot, IndoorHack } from '../types';

interface ActionRoutineDeckProps {
  advice: AIPersonalizedAdvice | null;
  isLoading: boolean;
  onRefreshAdvice: () => void;
}

export const ActionRoutineDeck: React.FC<ActionRoutineDeckProps> = ({
  advice,
  isLoading,
  onRefreshAdvice
}) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'indoor' | 'simulator'>('routine');

  // Interactive state for Sustainable Swaps Simulator
  const [swapsState, setSwapsState] = useState<Record<string, boolean>>({
    metro_transit: true,
    induction_cooking: true,
    plant_hepa_synergy: false
  });

  const toggleSwap = (id: string) => {
    setSwapsState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading || !advice) {
    return (
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 text-center animate-pulse space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
        <h4 className="text-base font-bold text-white">Synthesizing Clinical AI Recommendations...</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Gemini 2.5 is correlating live hourly AQI drops, boundary layer dispersion, and persona vulnerability thresholds.
        </p>
      </div>
    );
  }

  // Calculate Cumulative Impact Metrics in Simulator
  const activeSwapsList = (advice.sustainableSwaps || []).filter(s => swapsState[s.id] ?? s.defaultActive);
  const totalExposureReduction = Math.min(88, activeSwapsList.reduce((acc, curr) => acc + curr.exposureReductionPercent, 0));
  const totalCo2Saved = Number(activeSwapsList.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1));
  const totalPmAvoided = Number(activeSwapsList.reduce((acc, curr) => acc + curr.pm25AvoidedUg, 0).toFixed(1));

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
      
      {/* AI Summary Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> GenAI Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {advice.rawGeminiResponse ? 'Gemini 2.5 Flash Verified' : 'Deterministic Engine Active'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {advice.summary}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 px-4 sm:px-6 bg-slate-950/50 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('routine')}
          className={`py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'routine'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tailored Daily Routine</span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {advice.routine.length} Slots
          </span>
        </button>

        <button
          onClick={() => setActiveTab('indoor')}
          className={`py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'indoor'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Indoor Air Hacks & Ventilation</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'simulator'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Sustainable Swaps & Impact Simulator</span>
          <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            Interactive
          </span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="p-5 sm:p-6">
        
        {/* TAB 1: TAILORED DAILY ROUTINE */}
        {activeTab === 'routine' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Time-matched slots calculated against hourly smog dip curves:</span>
              <span className="hidden sm:inline italic">Green highlights lowest atmospheric exposure</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {advice.routine.map((slot, index) => {
                const isSafe = slot.isSafeWindow || slot.safetyStatus === 'Safe' || slot.safetyStatus === 'Moderate';
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                      slot.isSafeWindow
                        ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : slot.safetyStatus === 'Hazardous'
                        ? 'bg-rose-950/20 border-rose-800/40'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    {slot.isSafeWindow && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                        Best Window
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                          {slot.period}
                        </span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          slot.safetyStatus === 'Safe' || slot.safetyStatus === 'Moderate'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : slot.safetyStatus === 'Avoid Outdoor'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {slot.safetyStatus}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white flex items-center gap-1.5 mb-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {slot.timeRange}
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 mb-3">
                        Est. AQI: <strong className="text-slate-200">{slot.aqiEstimate}</strong>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        {slot.activityAdvice}
                      </p>
                    </div>

                    {/* Mask Recommendation Pill */}
                    <div className="pt-3 border-t border-slate-800/80 text-[11px] flex items-center justify-between">
                      <span className="text-slate-400">Mask Grade:</span>
                      <span className={`font-mono font-bold ${
                        slot.maskRecommendation.includes('N95') || slot.maskRecommendation.includes('N99')
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}>
                        {slot.maskRecommendation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INDOOR AIR HACKS */}
        {activeTab === 'indoor' && (
          <div className="space-y-6">
            {/* Protocol Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 block mb-1">
                  Ventilation Schedule
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {advice.indoorProtocol.ventilationTiming}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400 block mb-1">
                  Airtight Sealing Directive
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {advice.indoorProtocol.roomSealingAdvice}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400 block mb-1">
                  HEPA / DIY Placement Hack
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {advice.indoorProtocol.purificationTip}
                </p>
              </div>
            </div>

            {/* Action Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Actionable Indoor Air Quality Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {(advice.indoorProtocol.actionChecklist || []).map((hack, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex items-start gap-3.5"
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      hack.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {hack.status === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white tracking-wide">{hack.title}</h5>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {hack.bestTimeWindow}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {hack.action}
                      </p>
                      <div className="text-[11px] text-emerald-400/90 font-medium pt-1">
                        💡 {hack.impactNote}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUSTAINABLE SWAPS & IMPACT SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top Scoreboard: Cumulative Impact Metrics */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-0.5">
                    Live Impact Calculator
                  </span>
                  <h4 className="text-base font-extrabold text-white">
                    Quantified Personal & Urban Health Savings
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Toggle individual eco-swaps below to dynamically re-calculate your reduced lung deposition.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-around sm:justify-end">
                  {/* Metric 1: Exposure Reduction */}
                  <div className="text-center px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Lung Exposure</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      -{totalExposureReduction}%
                    </span>
                  </div>

                  {/* Metric 2: PM2.5 Inhalation Avoided */}
                  <div className="text-center px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">PM₂.₅ Inhaled</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">
                      -{totalPmAvoided} <span className="text-xs font-normal">µg</span>
                    </span>
                  </div>

                  {/* Metric 3: CO2 Community Savings */}
                  <div className="text-center px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">CO₂ Prevented</span>
                    <span className="text-2xl font-black font-mono text-amber-400">
                      -{totalCo2Saved} <span className="text-xs font-normal">kg</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Toggle Cards */}
            <div className="space-y-3">
              {(advice.sustainableSwaps || []).map((swap) => {
                const isActive = swapsState[swap.id] ?? swap.defaultActive ?? false;

                return (
                  <div
                    key={swap.id}
                    onClick={() => toggleSwap(swap.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-850 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Checkbox circle */}
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-800'
                      }`}>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white">{swap.title}</h5>
                          {isActive && (
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              Active in Simulation
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">{swap.description}</p>
                        <p className="text-[11px] text-slate-400 italic pt-0.5">{swap.explanation}</p>
                      </div>
                    </div>

                    {/* Quantified Gains Pill */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-xs">
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <strong>-{swap.exposureReductionPercent}%</strong> Exposure
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        <strong>-{swap.co2SavedKg} kg</strong> CO₂
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
