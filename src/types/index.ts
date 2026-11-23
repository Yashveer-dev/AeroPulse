// Types for AeroPulse AI

export type HouseholdPersona = 
  | 'commuter' 
  | 'family' 
  | 'runner' 
  | 'asthma';

export interface PersonaInfo {
  id: HouseholdPersona;
  label: string;
  sublabel: string;
  icon: string;
  vulnerabilityFactor: number; // Multiplier for health risk calculations
  description: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  time: string;
}

export interface WeatherData {
  current: WeatherCurrent;
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
  };
}

export interface AirQualityCurrent {
  time: string;
  us_aqi: number;
  european_aqi: number;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
}

export interface AirQualityHourly {
  time: string[];
  us_aqi: number[];
  pm2_5: number[];
  pm10: number[];
}

export interface AirQualityData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: AirQualityCurrent;
  hourly: AirQualityHourly;
}

export interface CombinedTelemetry {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
  airQuality: AirQualityData;
  updatedAt: string;
}

export interface RoutineSlot {
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  timeRange: string;
  aqiEstimate: number;
  safetyStatus: 'Safe' | 'Moderate' | 'Avoid Outdoor' | 'Hazardous';
  activityAdvice: string;
  maskRecommendation: 'None Required' | 'Surgical Mask' | 'N95 / FFP2 Mask' | 'N99 / Half-Face Respirator';
  isSafeWindow?: boolean;
}

export interface IndoorHack {
  title: string;
  action: string;
  bestTimeWindow: string;
  impactNote: string;
  status: 'recommended' | 'warning' | 'critical';
}

export interface SustainableSwap {
  id: string;
  title: string;
  description: string;
  exposureReductionPercent: number; // e.g. 35%
  co2SavedKg: number; // Daily savings e.g. 4.2 kg
  pm25AvoidedUg: number; // Daily personal microgram avoided e.g. 48.5 ug
  explanation: string;
  defaultActive?: boolean;
}

export interface AIPersonalizedAdvice {
  summary: string;
  keyRiskDriver: string;
  dispersionAssessment: string;
  routine: RoutineSlot[];
  indoorProtocol: {
    ventilationTiming: string;
    roomSealingAdvice: string;
    purificationTip: string;
    actionChecklist: IndoorHack[];
  };
  sustainableSwaps: SustainableSwap[];
  rawGeminiResponse?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: string;
}
