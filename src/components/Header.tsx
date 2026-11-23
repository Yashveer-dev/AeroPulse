import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  MapPin, 
  Search, 
  Crosshair, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { GeocodingResult, HouseholdPersona } from '../types';
import { searchCities } from '../services/telemetryService';
import { PERSONAS } from '../utils/personas';
import { getStoredApiKey, setStoredApiKey } from '../services/geminiService';

interface HeaderProps {
  currentCity: string;
  currentCountry: string;
  selectedPersona: HouseholdPersona;
  onSelectPersona: (persona: HouseholdPersona) => void;
  onSelectLocation: (loc: GeocodingResult) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isGeminiActive: boolean;
  onApiKeyChange: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  currentCountry,
  selectedPersona,
  onSelectPersona,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
  isDarkMode,
  onToggleTheme,
  isGeminiActive,
  onApiKeyChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced city search (300ms)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Key Modal State
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const handleOpenKeyModal = () => {
    setTempKey(getStoredApiKey());
    setIsKeyModalOpen(true);
  };

  const handleSaveKey = () => {
    setStoredApiKey(tempKey);
    setIsKeyModalOpen(false);
    onApiKeyChange();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
                <Wind className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                    AeroPulse <span className="text-emerald-400 font-mono text-sm uppercase px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">AI</span>
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                  Urban Air Quality & Smog Exposure Intelligence
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
              <button
                onClick={handleOpenKeyModal}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isGeminiActive 
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400' 
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search Bar & GPS Location Button */}
          <div className="w-full lg:max-w-md flex items-center gap-2" ref={searchRef}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search city (Current: ${currentCity})...`}
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-slate-700/80 focus:border-emerald-500/70 rounded-lg text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute mt-1.5 w-full bg-slate-900 border border-slate-700/90 rounded-lg shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                  {searchResults.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectLocation(loc);
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm hover:bg-slate-800/90 flex items-center justify-between text-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-100">{loc.name}</span>
                        {loc.admin1 && <span className="text-slate-400 text-xs">({loc.admin1})</span>}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                        {loc.country_code || loc.country}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* GPS Location Button */}
            <button
              onClick={onUseCurrentLocation}
              disabled={isLocating}
              title="Detect GPS Location"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/70 text-slate-200 hover:text-emerald-400 flex items-center gap-1.5 text-xs font-medium transition-colors shrink-0 disabled:opacity-50"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>

          {/* Desktop Right Controls (API Key Badge, Theme Toggle) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Gemini Status & Modal Trigger */}
            <button
              onClick={handleOpenKeyModal}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                isGeminiActive 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60' 
                  : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-950/30'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isGeminiActive ? 'Gemini 2.5 Flash' : 'Deterministic Mode'}</span>
              <span className={`w-2 h-2 rounded-full ${isGeminiActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Household Persona Selection Pills */}
        <div className="py-2.5 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Household:
          </span>
          {PERSONAS.map((persona) => {
            const isSelected = persona.id === selectedPersona;
            return (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{persona.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Gemini API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Gemini API Key Setup</h3>
              </div>
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 text-sm rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs text-slate-300">
              <p>
                AeroPulse AI utilizes <strong>Google Gemini 2.5 Flash</strong> to generate hyper-personalized clinical routines, hourly indoor ventilation protocols, and emission swap metrics.
              </p>
              
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>No API key?</strong> No worries! AeroPulse includes an internal deterministic rule-based engine so all features, calculations, and routines run offline without crashing.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Google Gemini API Key (Stored locally in browser):
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTempKey('');
                  setStoredApiKey('');
                  setIsKeyModalOpen(false);
                  onApiKeyChange();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
