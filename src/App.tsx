import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroTelemetry } from './components/HeroTelemetry';
import { PollutantGrid } from './components/PollutantGrid';
import { ForecastChart } from './components/ForecastChart';
import { ActionRoutineDeck } from './components/ActionRoutineDeck';
import { SmogCopilotDrawer } from './components/SmogCopilotDrawer';
import { 
  CombinedTelemetry, 
  GeocodingResult, 
  HouseholdPersona, 
  AIPersonalizedAdvice 
} from './types';
import { 
  DEFAULT_LOCATION, 
  fetchTelemetry, 
  reverseGeocode 
} from './services/telemetryService';
import { 
  generateAIPersonalizedAdvice, 
  getStoredApiKey 
} from './services/geminiService';
import { DEFAULT_PERSONA } from './utils/personas';
import { AlertCircle, RefreshCw, Sparkles, Shield, HeartHandshake } from 'lucide-react';

export function App() {
  const [currentLocation, setCurrentLocation] = useState<GeocodingResult>(DEFAULT_LOCATION);
  const [telemetry, setTelemetry] = useState<CombinedTelemetry | null>(null);
  const [persona, setPersona] = useState<HouseholdPersona>(DEFAULT_PERSONA);
  const [advice, setAdvice] = useState<AIPersonalizedAdvice | null>(null);
  
  // Loading & Error States
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Theme & Gemini state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Copilot trigger
  const [copilotPrompt, setCopilotPrompt] = useState<string | undefined>(undefined);

  // Check API Key on mount
  useEffect(() => {
    setHasApiKey(Boolean(getStoredApiKey()));
  }, []);

  // Request browser geolocation on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const loc = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            setCurrentLocation(loc);
          } catch (err) {
            console.warn('Geolocation fallback to default:', err);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn('Geolocation access denied or failed, using New Delhi default:', error.message);
          setIsLocating(false);
        },
        { timeout: 7000 }
      );
    }
  }, []);

  // Fetch telemetry whenever location changes
  useEffect(() => {
    let isMounted = true;

    async function loadTelemetry() {
      setIsLoadingTelemetry(true);
      setErrorMessage(null);

      try {
        const data = await fetchTelemetry(currentLocation);
        if (isMounted) {
          setTelemetry(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setErrorMessage('Unable to fetch live meteorological telemetry. Please verify your connection or try another city.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTelemetry(false);
        }
      }
    }

    loadTelemetry();

    return () => {
      isMounted = false;
    };
  }, [currentLocation]);

  // Generate AI Personalized Advice whenever telemetry or persona changes
  useEffect(() => {
    if (!telemetry) return;

    let isMounted = true;

    async function loadAdvice() {
      setIsLoadingAdvice(true);
      try {
        const result = await generateAIPersonalizedAdvice(telemetry!, persona);
        if (isMounted) {
          setAdvice(result);
        }
      } catch (err) {
        console.error('Failed to generate advice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingAdvice(false);
        }
      }
    }

    loadAdvice();

    return () => {
      isMounted = false;
    };
  }, [telemetry, persona, hasApiKey]);

  // Handle manual GPS click
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setCurrentLocation(loc);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        alert(`Location detection failed: ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleRefreshAll = async () => {
    if (!currentLocation) return;
    setIsLoadingTelemetry(true);
    try {
      const data = await fetchTelemetry(currentLocation);
      setTelemetry(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0B1120] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors flex flex-col font-sans`}>
      
      {/* Top Navigation & Controls */}
      <Header
        currentCity={currentLocation.name}
        currentCountry={currentLocation.country || ''}
        selectedPersona={persona}
        onSelectPersona={setPersona}
        onSelectLocation={setCurrentLocation}
        onUseCurrentLocation={handleUseCurrentLocation}
        isLocating={isLocating}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isGeminiActive={hasApiKey}
        onApiKeyChange={() => setHasApiKey(Boolean(getStoredApiKey()))}
      />

      {/* Main Container Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Toast / Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleRefreshAll}
              className="px-3 py-1 rounded-lg bg-rose-900 hover:bg-rose-850 font-semibold text-rose-100 shrink-0 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoadingTelemetry && !telemetry ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-3xl bg-slate-800/50" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-800/50" />
              ))}
            </div>
            <div className="h-72 rounded-3xl bg-slate-800/50" />
          </div>
        ) : telemetry ? (
          <>
            {/* 1. Hero Telemetry Card */}
            <HeroTelemetry
              telemetry={telemetry}
              selectedPersona={persona}
              onAskCopilot={(p) => setCopilotPrompt(p)}
            />

            {/* 2. Pollutant Micro-Cards Grid */}
            <PollutantGrid
              currentPollutants={telemetry.airQuality.current}
            />

            {/* 3. 48-Hour Forecast & Best Window Area Chart */}
            <ForecastChart
              hourly={telemetry.airQuality.hourly}
            />

            {/* 4. Action Routine & Sustainable Swaps Deck */}
            <ActionRoutineDeck
              advice={advice}
              isLoading={isLoadingAdvice}
              onRefreshAdvice={() => {
                if (telemetry) {
                  generateAIPersonalizedAdvice(telemetry, persona).then(setAdvice);
                }
              }}
            />
          </>
        ) : null}

      </main>

      {/* Floating Grounded AI Copilot Drawer */}
      {telemetry && (
        <SmogCopilotDrawer
          telemetry={telemetry}
          selectedPersona={persona}
          externalPrompt={copilotPrompt}
          onClearExternalPrompt={() => setCopilotPrompt(undefined)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950/40 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300 font-mono">AeroPulse AI</span>
            <span>— Production-grade urban air telemetry & clinical exposure intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Data: Open-Meteo API</span>
            <span>AI: Gemini 2.5 Flash</span>
            <span>WHO & Berkeley Earth Standards</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
