// AQI standards and health risk calculations

export interface AQIBand {
  min: number;
  max: number;
  label: string;
  category: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  color: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  gradient: string;
  description: string;
  generalAdvice: string;
}

export const AQI_BANDS: AQIBand[] = [
  {
    min: 0,
    max: 50,
    label: 'Good',
    category: 'good',
    color: '#10B981', // Emerald 500
    textColor: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    generalAdvice: 'Great conditions for outdoor exercise, ventilation, and commuting without restriction.'
  },
  {
    min: 51,
    max: 100,
    label: 'Moderate',
    category: 'moderate',
    color: '#F59E0B', // Amber 500
    textColor: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-500 to-yellow-600',
    description: 'Air quality is acceptable; however, sensitive groups may experience minor symptoms.',
    generalAdvice: 'Unusually sensitive individuals should consider limiting prolonged outdoor exertion.'
  },
  {
    min: 101,
    max: 150,
    label: 'Unhealthy for Sensitive Groups',
    category: 'unhealthy-sensitive',
    color: '#F97316', // Orange 500
    textColor: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    gradient: 'from-orange-500 to-amber-600',
    description: 'Members of sensitive groups may experience health effects. General public less affected.',
    generalAdvice: 'Kids, elderly, and respiratory sufferers should wear N95 outdoors and reduce heavy exercise.'
  },
  {
    min: 151,
    max: 200,
    label: 'Unhealthy',
    category: 'unhealthy',
    color: '#EF4444', // Red 500
    textColor: 'text-red-400',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    gradient: 'from-red-500 to-rose-600',
    description: 'Everyone may begin to experience adverse health effects; sensitive groups more serious.',
    generalAdvice: 'Wear N95/FFP2 masks outdoors, seal indoor spaces, and run HEPA air purifiers continuously.'
  },
  {
    min: 201,
    max: 300,
    label: 'Very Unhealthy',
    category: 'very-unhealthy',
    color: '#A855F7', // Purple 500
    textColor: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Health alert: risk of health effects is increased for everyone in the urban perimeter.',
    generalAdvice: 'Avoid outdoor exercise completely. Keep windows sealed airtight. Run indoor air filtration.'
  },
  {
    min: 301,
    max: 1000,
    label: 'Hazardous',
    category: 'hazardous',
    color: '#881337', // Deep Crimson/Maroon
    textColor: 'text-rose-400',
    bgClass: 'bg-rose-950/40',
    borderClass: 'border-rose-700/50',
    badgeClass: 'bg-rose-900/60 text-rose-200 border-rose-600/50',
    gradient: 'from-rose-900 to-red-950',
    description: 'Health warning of emergency conditions: severe smog event with acute toxic load.',
    generalAdvice: 'Emergency conditions! Strict indoor sheltering. Use N99/FFP3 respirators if forced outdoors.'
  }
];

export function getAQIBand(aqi: number): AQIBand {
  const safeAqi = Math.max(0, Math.round(aqi || 0));
  for (const band of AQI_BANDS) {
    if (safeAqi >= band.min && safeAqi <= band.max) {
      return band;
    }
  }
  return AQI_BANDS[AQI_BANDS.length - 1];
}

/**
 * Cigarette Equivalent formula:
 * Based on Berkeley Earth research: 1 cigarette per day is roughly equivalent to a PM2.5 level of 22 µg/m³.
 */
export function calculateCigaretteEquivalent(pm25: number): number {
  if (!pm25 || pm25 <= 0) return 0;
  return Number((pm25 / 22).toFixed(1));
}

/**
 * WHO Guidelines:
 * PM2.5: 15 µg/m³ (24-hour mean)
 * PM10: 45 µg/m³
 * NO2: 25 µg/m³
 * O3: 100 µg/m³ (8-hour)
 * SO2: 40 µg/m³
 * CO: 4000 µg/m³ (4 mg/m³)
 */
export interface PollutantThreshold {
  key: string;
  name: string;
  formula: string;
  whoLimit: number;
  unit: string;
  description: string;
}

export const POLLUTANT_SPECS: Record<string, PollutantThreshold> = {
  pm2_5: {
    key: 'pm2_5',
    name: 'Fine Particulate Matter',
    formula: 'PM₂.₅',
    whoLimit: 15,
    unit: 'µg/m³',
    description: 'Microscopic particles that penetrate deep into lung alveoli and enter the bloodstream.'
  },
  pm10: {
    key: 'pm10',
    name: 'Coarse Particulate Matter',
    formula: 'PM₁₀',
    whoLimit: 45,
    unit: 'µg/m³',
    description: 'Inhalable dust, pollen, and debris irritating nasal passages and upper respiratory tract.'
  },
  nitrogen_dioxide: {
    key: 'nitrogen_dioxide',
    name: 'Nitrogen Dioxide',
    formula: 'NO₂',
    whoLimit: 25,
    unit: 'µg/m³',
    description: 'Combustion byproduct from vehicles and thermal plants; triggers bronchospasms.'
  },
  ozone: {
    key: 'ozone',
    name: 'Ground-Level Ozone',
    formula: 'O₃',
    whoLimit: 100,
    unit: 'µg/m³',
    description: 'Photochemical smog oxidant formed by sunlight reacting with hydrocarbons and NOx.'
  },
  sulphur_dioxide: {
    key: 'sulphur_dioxide',
    name: 'Sulphur Dioxide',
    formula: 'SO₂',
    whoLimit: 40,
    unit: 'µg/m³',
    description: 'Pungent industrial and coal emission gas contributing to acid haze and asthma.'
  },
  carbon_monoxide: {
    key: 'carbon_monoxide',
    name: 'Carbon Monoxide',
    formula: 'CO',
    whoLimit: 4000,
    unit: 'µg/m³',
    description: 'Invisible odorless exhaust gas reducing blood oxygen-carrying capacity.'
  }
};

/**
 * Determine primary pollutant driver:
 * Compares relative ratio against WHO limit
 */
export function getPrimaryDriver(pollutants: { pm2_5: number; pm10: number; nitrogen_dioxide: number }): {
  key: string;
  name: string;
  ratio: number;
} {
  const pm25Ratio = (pollutants.pm2_5 || 0) / 15;
  const pm10Ratio = (pollutants.pm10 || 0) / 45;
  const no2Ratio = (pollutants.nitrogen_dioxide || 0) / 25;

  if (pm25Ratio >= pm10Ratio && pm25Ratio >= no2Ratio) {
    return { key: 'pm2_5', name: 'PM₂.₅ (Fine Particles)', ratio: Number(pm25Ratio.toFixed(1)) };
  } else if (pm10Ratio >= no2Ratio) {
    return { key: 'pm10', name: 'PM₁₀ (Coarse Dust)', ratio: Number(pm10Ratio.toFixed(1)) };
  } else {
    return { key: 'nitrogen_dioxide', name: 'NO₂ (Traffic Gas)', ratio: Number(no2Ratio.toFixed(1)) };
  }
}

/**
 * Determine atmospheric dispersion condition based on wind speed (km/h) and humidity
 */
export function assessDispersion(windSpeedKmH: number, humidity: number): {
  status: 'Stagnant Inversion' | 'Poor Dispersion' | 'Moderate Ventilation' | 'Strong Clearing';
  badgeClass: string;
  explanation: string;
} {
  if (windSpeedKmH < 4 && humidity > 75) {
    return {
      status: 'Stagnant Inversion',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
      explanation: 'Thermal inversion trapping heavy smog near surface with high humidity forming dense winter smog.'
    };
  } else if (windSpeedKmH < 8) {
    return {
      status: 'Poor Dispersion',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      explanation: 'Low surface wind velocity unable to disperse vehicular and biomass emissions.'
    };
  } else if (windSpeedKmH < 18) {
    return {
      status: 'Moderate Ventilation',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
      explanation: 'Gentle breeze providing progressive dilution of urban microclimate particulates.'
    };
  } else {
    return {
      status: 'Strong Clearing',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      explanation: 'Vigorous airflow actively flushing urban atmospheric boundary layer.'
    };
  }
}
