import { GeocodingResult, CombinedTelemetry, WeatherData, AirQualityData } from '../types';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Fallback coordinates (New Delhi)
export const DEFAULT_LOCATION: GeocodingResult = {
  id: 1273294,
  name: 'New Delhi',
  latitude: 28.6139,
  longitude: 77.2090,
  country: 'India',
  country_code: 'IN',
  admin1: 'Delhi'
};

/**
 * Search cities by query string
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed with HTTP ${response.status}`);
    }
    const data = await response.json();
    return (data.results || []) as GeocodingResult[];
  } catch (error) {
    console.error('Error in searchCities:', error);
    return [];
  }
}

/**
 * Fetch air quality telemetry from Open-Meteo Air Quality API
 */
export async function fetchAirQuality(latitude: number, longitude: number): Promise<AirQualityData> {
  const url = `${AIR_QUALITY_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=us_aqi,pm2_5,pm10&timezone=auto&forecast_days=2`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Air Quality API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data as AirQualityData;
}

/**
 * Fetch weather context (temperature, humidity, wind speed) from Open-Meteo Weather API
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const url = `${WEATHER_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data as WeatherData;
}

/**
 * Fetch combined air quality & weather telemetry for a given location
 */
export async function fetchTelemetry(
  location: GeocodingResult
): Promise<CombinedTelemetry> {
  const [airQuality, weather] = await Promise.all([
    fetchAirQuality(location.latitude, location.longitude),
    fetchWeather(location.latitude, location.longitude)
  ]);

  return {
    city: location.name,
    country: location.country || location.country_code || '',
    latitude: location.latitude,
    longitude: location.longitude,
    weather,
    airQuality,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Reverse geocode approximate coordinates using BigDataCloud free client-side or open-meteo
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
      return {
        id: Math.floor(lat * 1000 + lon),
        name: city,
        latitude: lat,
        longitude: lon,
        country: data.countryName || '',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || ''
      };
    }
  } catch (e) {
    console.warn('Reverse geocode failed, using coordinates fallback:', e);
  }

  return {
    id: Math.floor(lat * 1000 + lon),
    name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    latitude: lat,
    longitude: lon,
    country: '',
    country_code: ''
  };
}
