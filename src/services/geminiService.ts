import { GoogleGenAI } from '@google/genai';
import { CombinedTelemetry, HouseholdPersona, AIPersonalizedAdvice, RoutineSlot, IndoorHack, SustainableSwap } from '../types';
import { getAQIBand, calculateCigaretteEquivalent, getPrimaryDriver, assessDispersion } from '../utils/aqiCalculations';
import { PERSONAS } from '../utils/personas';

const GEMINI_API_KEY_STORAGE = 'aeropulse_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_API_KEY_STORAGE) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }
}

/**
 * Deterministic rule-based engine:
 * Runs when no API key is provided, rate limited, or network offline.
 * Guarantees that AeroPulse NEVER crashes.
 */
export function generateDeterministicAdvice(
  telemetry: CombinedTelemetry,
  persona: HouseholdPersona
): AIPersonalizedAdvice {
  const currentAQI = telemetry.airQuality.current.us_aqi || 120;
  const pm25 = telemetry.airQuality.current.pm2_5 || 45;
  const pm10 = telemetry.airQuality.current.pm10 || 90;
  const no2 = telemetry.airQuality.current.nitrogen_dioxide || 35;
  const windSpeed = telemetry.weather.current.wind_speed_10m || 5;
  const humidity = telemetry.weather.current.relative_humidity_2m || 60;

  const band = getAQIBand(currentAQI);
  const cigarettes = calculateCigaretteEquivalent(pm25);
  const driver = getPrimaryDriver({ pm2_5: pm25, pm10, nitrogen_dioxide: no2 });
  const dispersion = assessDispersion(windSpeed, humidity);
  const personaInfo = PERSONAS.find(p => p.id === persona) || PERSONAS[0];

  // Inspect hourly forecast to identify the best (lowest AQI) and worst windows
  const hourlyTimes = telemetry.airQuality.hourly.time.slice(0, 24);
  const hourlyAqis = telemetry.airQuality.hourly.us_aqi.slice(0, 24);

  let bestHourIndex = 0;
  let minAqi = 9999;
  hourlyAqis.forEach((val, idx) => {
    if (val !== null && val < minAqi) {
      minAqi = val;
      bestHourIndex = idx;
    }
  });

  const bestTimeStr = hourlyTimes[bestHourIndex] 
    ? new Date(hourlyTimes[bestHourIndex]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '1:00 PM – 3:00 PM';

  // Determine routine slots
  const morningAQI = Math.round(hourlyAqis[8] || currentAQI * 1.15);
  const afternoonAQI = Math.round(hourlyAqis[14] || currentAQI * 0.75);
  const eveningAQI = Math.round(hourlyAqis[19] || currentAQI * 1.25);
  const nightAQI = Math.round(hourlyAqis[23] || currentAQI * 1.05);

  const getSlotMask = (aqi: number) => {
    if (aqi <= 50) return 'None Required' as const;
    if (aqi <= 100) return 'Surgical Mask' as const;
    if (aqi <= 250) return 'N95 / FFP2 Mask' as const;
    return 'N99 / Half-Face Respirator' as const;
  };

  const getSlotStatus = (aqi: number) => {
    if (aqi <= 50) return 'Safe' as const;
    if (aqi <= 100) return 'Moderate' as const;
    if (aqi <= 200) return 'Avoid Outdoor' as const;
    return 'Hazardous' as const;
  };

  const routine: RoutineSlot[] = [
    {
      period: 'Morning',
      timeRange: '06:00 AM – 10:00 AM',
      aqiEstimate: morningAQI,
      safetyStatus: getSlotStatus(morningAQI),
      activityAdvice: persona === 'runner'
        ? 'Avoid outdoor cardio during morning inversion. Switch to indoor treadmill or gym with HEPA filtration.'
        : persona === 'family'
        ? 'Equip children with fitted mini-N95 masks on school bus routes; request indoor recess during morning smog peak.'
        : 'Commute with vehicle recirculate (AC recirculation) on. Keep windows rolled up completely.',
      maskRecommendation: getSlotMask(morningAQI)
    },
    {
      period: 'Afternoon',
      timeRange: '12:00 PM – 04:00 PM',
      aqiEstimate: afternoonAQI,
      safetyStatus: getSlotStatus(afternoonAQI),
      activityAdvice: `Optimal solar boundary layer heating lifts surface smog. Best window (${bestTimeStr}) for essential outdoor transit.`,
      maskRecommendation: getSlotMask(afternoonAQI),
      isSafeWindow: true
    },
    {
      period: 'Evening',
      timeRange: '05:00 PM – 09:00 PM',
      aqiEstimate: eveningAQI,
      safetyStatus: getSlotStatus(eveningAQI),
      activityAdvice: 'Severe evening rush hour spike and nocturnal boundary collapse. Minimize all exposure.',
      maskRecommendation: getSlotMask(eveningAQI)
    },
    {
      period: 'Night',
      timeRange: '10:00 PM – 05:00 AM',
      aqiEstimate: nightAQI,
      safetyStatus: getSlotStatus(nightAQI),
      activityAdvice: 'Seal bedroom doors and windows. Run HEPA air purifier on medium-high speed sleep mode.',
      maskRecommendation: 'None Required'
    }
  ];

  const indoorChecklist: IndoorHack[] = [
    {
      title: 'Aeration & Window Ventilation Timing',
      action: afternoonAQI < currentAQI
        ? `Open cross-ventilation windows strictly between ${bestTimeStr} for 20 minutes only, when dispersion is highest.`
        : 'Keep all exterior windows and balcony doors sealed tight throughout the day.',
      bestTimeWindow: bestTimeStr,
      impactNote: 'Prevents carbon dioxide buildup while cutting toxic PM2.5 infiltration by up to 72%.',
      status: afternoonAQI > 200 ? 'warning' : 'recommended'
    },
    {
      title: 'HEPA Purifier & Wet Mopping Protocol',
      action: 'Run H13 True HEPA purifiers in occupied living rooms. Wet-mop floors instead of dry sweeping.',
      bestTimeWindow: 'Continuous (Focus 8 PM - 8 AM)',
      impactNote: 'Dry sweeping resuspends deposited fine toxic dust; wet mopping locks 94% of surface PM10.',
      status: 'recommended'
    },
    {
      title: 'Exhaust & Cooking Emission Control',
      action: 'Always operate high-suction range hood before igniting gas burners. Keep kitchen door shut.',
      bestTimeWindow: 'During Meal Prep',
      impactNote: 'Unvented gas stoves spike indoor NO2 and ultrafine particles up to 400 µg/m³ within 15 minutes.',
      status: 'warning'
    },
    {
      title: 'DIY Corsi-Rosenthal Box / Emergency Filtration',
      action: 'If purifier filters are depleted, tape MERV 13 furnace filters across a box fan perimeter.',
      bestTimeWindow: 'Emergency Smog Episodes',
      impactNote: 'Achieves 85% of commercial Clean Air Delivery Rate (CADR) at a fraction of the cost.',
      status: 'recommended'
    }
  ];

  // Dynamic sustainable swaps calculation based on local PM2.5 intensity
  const baseExposureReduction = Math.min(85, Math.round(30 + (pm25 / 10)));
  const dailyCommutePmSaved = Math.round(pm25 * 0.75 * 1.5); // microgram avoided
  const swaps: SustainableSwap[] = [
    {
      id: 'metro_transit',
      title: 'Metro / Rapid Rail over Solo Vehicle Commute',
      description: 'Switch from personal car/cab with open-window exposure to underground filtered metro.',
      exposureReductionPercent: 42,
      co2SavedKg: 3.8,
      pm25AvoidedUg: dailyCommutePmSaved,
      explanation: 'Underground rail stations and enclosed filtered carriages reduce particulate respiration compared to sitting in gridlock traffic exhaust.',
      defaultActive: true
    },
    {
      id: 'induction_cooking',
      title: 'Induction Cooktop vs. Gas/LPG Combustion',
      description: 'Zero combustion inside living quarters during winter smog months.',
      exposureReductionPercent: 28,
      co2SavedKg: 1.2,
      pm25AvoidedUg: 18.4,
      explanation: 'Eliminates household indoor NO₂ and carbon monoxide formation right at the breathing zone.',
      defaultActive: false
    },
    {
      id: 'plant_hepa_synergy',
      title: 'Cross-Ventilation + Snake Plant / Areca Micro-Forest',
      description: 'Strategic indoor bio-filtration combined with timed ventilation windows.',
      exposureReductionPercent: 19,
      co2SavedKg: 0.4,
      pm25AvoidedUg: 9.8,
      explanation: 'Reduces VOCs and stabilizes indoor oxygenation during periods when windows must stay sealed.',
      defaultActive: true
    }
  ];

  return {
    summary: `${telemetry.city} is currently reporting an AQI of ${currentAQI} (${band.label}), primarily driven by ${driver.name}. Inhaling ambient air today delivers toxic lung exposure equivalent to smoking approximately ${cigarettes} cigarettes/day. For a ${personaInfo.label}, active mitigation is required.`,
    keyRiskDriver: driver.name,
    dispersionAssessment: `${dispersion.status}: ${dispersion.explanation}`,
    routine,
    indoorProtocol: {
      ventilationTiming: `Safe window: ${bestTimeStr}`,
      roomSealingAdvice: currentAQI > 150
        ? 'High external particulate load: seal windows, door sills with foam weatherstripping, and switch AC to recirculation.'
        : 'Moderate ambient load: short cross-ventilation bursts permitted during peak afternoon sunshine.',
      purificationTip: 'Place purifier away from walls in the central breathing zone, not tucked in corners.',
      actionChecklist: indoorChecklist
    },
    sustainableSwaps: swaps,
    rawGeminiResponse: false
  };
}

/**
 * Generate AI Personalized Advice via Gemini 2.5 Flash SDK
 */
export async function generateAIPersonalizedAdvice(
  telemetry: CombinedTelemetry,
  persona: HouseholdPersona
): Promise<AIPersonalizedAdvice> {
  const apiKey = getStoredApiKey();

  // If no API key provided, fall back immediately to deterministic engine
  if (!apiKey) {
    return generateDeterministicAdvice(telemetry, persona);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const currentAQI = telemetry.airQuality.current.us_aqi;
    const pm25 = telemetry.airQuality.current.pm2_5;
    const pm10 = telemetry.airQuality.current.pm10;
    const no2 = telemetry.airQuality.current.nitrogen_dioxide;
    const windSpeed = telemetry.weather.current.wind_speed_10m;
    const humidity = telemetry.weather.current.relative_humidity_2m;
    const personaInfo = PERSONAS.find(p => p.id === persona) || PERSONAS[0];

    // Hourly samples for context
    const hourlyPreview = telemetry.airQuality.hourly.time.slice(0, 16).map((t, idx) => ({
      time: new Date(t).toLocaleTimeString([], { hour: 'numeric' }),
      aqi: telemetry.airQuality.hourly.us_aqi[idx]
    }));

    const prompt = `You are AeroPulse AI, an expert environmental pulmonologist and urban atmospheric scientist.
Analyze the following live telemetry for ${telemetry.city}, ${telemetry.country}:
- Live US AQI: ${currentAQI}
- PM2.5: ${pm25} µg/m³
- PM10: ${pm10} µg/m³
- NO2: ${no2} µg/m³
- Wind Speed: ${windSpeed} km/h
- Humidity: ${humidity}%
- Forecasted Hourly AQI curve (next 16 hours): ${JSON.stringify(hourlyPreview)}
- Target Household Profile: ${personaInfo.label} (${personaInfo.description})

Provide your response strictly in the following JSON structure without markdown formatting or code blocks:
{
  "summary": "2-3 concise, high-impact clinical sentences assessing exposure, cigarette equivalent, and immediate lifestyle directive.",
  "keyRiskDriver": "e.g. PM2.5 (Fine Combustion Particles)",
  "dispersionAssessment": "Scientific atmospheric dispersion evaluation explaining how wind speed and thermal inversion affect smog today.",
  "routine": [
    {
      "period": "Morning",
      "timeRange": "06:00 AM – 10:00 AM",
      "aqiEstimate": 180,
      "safetyStatus": "Avoid Outdoor",
      "activityAdvice": "Specific actionable guidance tailored to ${personaInfo.label}",
      "maskRecommendation": "N95 / FFP2 Mask",
      "isSafeWindow": false
    },
    {
      "period": "Afternoon",
      "timeRange": "12:00 PM – 04:00 PM",
      "aqiEstimate": 95,
      "safetyStatus": "Moderate",
      "activityAdvice": "Guidance for midday solar ventilation window",
      "maskRecommendation": "Surgical Mask",
      "isSafeWindow": true
    },
    {
      "period": "Evening",
      "timeRange": "05:00 PM – 09:00 PM",
      "aqiEstimate": 220,
      "safetyStatus": "Hazardous",
      "activityAdvice": "Guidance for evening peak rush hour",
      "maskRecommendation": "N95 / FFP2 Mask",
      "isSafeWindow": false
    },
    {
      "period": "Night",
      "timeRange": "10:00 PM – 05:00 AM",
      "aqiEstimate": 140,
      "safetyStatus": "Avoid Outdoor",
      "activityAdvice": "Indoor overnight sealing and HEPA filtration setup",
      "maskRecommendation": "None Required",
      "isSafeWindow": false
    }
  ],
  "indoorProtocol": {
    "ventilationTiming": "Exact recommended clock window to open windows or keep strictly sealed",
    "roomSealingAdvice": "Specific door/window sealing and AC recirculation guidance",
    "purificationTip": "HEPA or DIY filtration placement tip",
    "actionChecklist": [
      {
        "title": "Window & Natural Ventilation",
        "action": "Concrete action step",
        "bestTimeWindow": "e.g. 1:00 PM - 2:00 PM",
        "impactNote": "Quantified reduction note",
        "status": "recommended"
      },
      {
        "title": "Filtration & Dust Supression",
        "action": "Concrete action step",
        "bestTimeWindow": "Continuous",
        "impactNote": "Quantified reduction note",
        "status": "recommended"
      },
      {
        "title": "Combustion & Cooking Protocols",
        "action": "Concrete action step",
        "bestTimeWindow": "Meal times",
        "impactNote": "Quantified reduction note",
        "status": "warning"
      }
    ]
  },
  "sustainableSwaps": [
    {
      "id": "swap_transit",
      "title": "Low-Exposure Transit Choice",
      "description": "Specific swap description",
      "exposureReductionPercent": 40,
      "co2SavedKg": 3.5,
      "pm25AvoidedUg": 38.0,
      "explanation": "Why this swap protects user and planet"
    },
    {
      "id": "swap_cooking",
      "title": "Clean Energy Substitution",
      "description": "Specific swap description",
      "exposureReductionPercent": 25,
      "co2SavedKg": 1.2,
      "pm25AvoidedUg": 16.5,
      "explanation": "Why this swap protects user and planet"
    },
    {
      "id": "swap_indoor",
      "title": "Bio-filtration & Micro-climate Hack",
      "description": "Specific swap description",
      "exposureReductionPercent": 18,
      "co2SavedKg": 0.5,
      "pm25AvoidedUg": 8.0,
      "explanation": "Why this swap protects user and planet"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text) as AIPersonalizedAdvice;
    parsed.rawGeminiResponse = true;
    return parsed;
  } catch (error) {
    console.warn('Gemini AI generation failed, using deterministic fallback engine:', error);
    return generateDeterministicAdvice(telemetry, persona);
  }
}

/**
 * Ask AeroPulse interactive Smog Copilot question
 */
export async function askSmogCopilot(
  question: string,
  telemetry: CombinedTelemetry,
  persona: HouseholdPersona
): Promise<string> {
  const apiKey = getStoredApiKey();
  const currentAQI = telemetry.airQuality.current.us_aqi;
  const pm25 = telemetry.airQuality.current.pm2_5;
  const wind = telemetry.weather.current.wind_speed_10m;
  const personaInfo = PERSONAS.find(p => p.id === persona) || PERSONAS[0];

  if (!apiKey) {
    // Smart deterministic chatbot response
    const q = question.toLowerCase();
    if (q.includes('jog') || q.includes('run') || q.includes('exercise') || q.includes('walk')) {
      if (currentAQI > 150) {
        return `⚠️ Outdoor exertion is strongly discouraged in ${telemetry.city} right now (AQI ${currentAQI}, PM2.5 ${pm25} µg/m³). Inhaling high air volume under heavy physical effort deposits toxic microparticulates deep into alveolar beds. For a ${personaInfo.label}, exercise indoors in a sealed room with a HEPA purifier running. If you must go outside, do so during the midday window (12 PM – 3 PM) with an N95 mask.`;
      } else {
        return `✅ Air quality in ${telemetry.city} is currently moderate (AQI ${currentAQI}). Moderate outdoor walking is acceptable, but intense cardio should be scheduled during the midday trough when solar heating disperses ground-level smog.`;
      }
    } else if (q.includes('seal') || q.includes('bedroom') || q.includes('window') || q.includes('night')) {
      return `🛡️ Indoor Sealing Protocol for tonight in ${telemetry.city}:
1. Close all balcony doors and windows before sunset (around 5:30 PM) as thermal inversion traps nighttime emissions.
2. Roll a damp towel along the bottom gap of bedroom doors.
3. Keep AC or ventilation unit on internal "Recirculation Mode" (do not draw fresh outdoor air).
4. Run your HEPA purifier continuously on low/sleep mode 3-4 feet away from the bed.`;
    } else if (q.includes('commute') || q.includes('route') || q.includes('car') || q.includes('metro')) {
      return `🚇 Low-Exposure Commute Strategy:
- Opt for underground metro or AC buses over open two-wheelers or auto-rickshaws. This cuts direct particulate inhalation by up to 50%.
- If driving a car, keep windows rolled up and activate AC Recirculation immediately upon entering congested traffic corridors.
- Always wear a snugly-fitted N95/FFP2 mask during street-level pedestrian crossings and transfer hubs.`;
    } else if (q.includes('mask') || q.includes('n95') || q.includes('filter')) {
      return `😷 Mask Guidance for ${telemetry.city} (AQI ${currentAQI}):
Cloth and standard surgical masks filter less than 20% of sub-micron PM2.5. We recommend a certified N95 or FFP2 respirator with an adjustable nose clip. Ensure an airtight seal with no facial hair gaps to achieve true 95%+ particle interception.`;
    } else {
      return `Based on live telemetry for ${telemetry.city} (AQI ${currentAQI}, PM2.5 ${pm25} µg/m³, Wind ${wind} km/h) and your profile as a ${personaInfo.label}:
Keep outdoor transit limited, wear an N95 mask in street traffic, and schedule natural ventilation during the afternoon low-smog window.`;
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are AeroPulse AI Smog Copilot, a helpful real-time environmental health advisor.
Context for ${telemetry.city}, ${telemetry.country}:
- US AQI: ${currentAQI}
- PM2.5: ${pm25} µg/m³
- PM10: ${telemetry.airQuality.current.pm10} µg/m³
- Wind Speed: ${wind} km/h
- User Persona: ${personaInfo.label} (${personaInfo.description})

User Question: "${question}"

Provide a concise, direct, and science-grounded response (2-4 paragraphs or crisp bullet points). Give specific actionable hours, mask types, or indoor steps based on their current telemetry.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || 'Unable to generate response. Please try again.';
  } catch (error) {
    console.error('Gemini chat error:', error);
    return `Note: AI service encountered a temporary error. Based on current AQI (${currentAQI}) in ${telemetry.city}, wear an N95 mask outside and keep indoor spaces filtered.`;
  }
}
