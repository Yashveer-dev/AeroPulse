# AeroPulse AI — Urban Air Quality & Exposure Intelligence Assistant

> **GenAI-powered environmental pulmonology and atmospheric intelligence assistant** engineered to help families, commuters, and high-risk individuals navigate severe winter smog episodes through real-time telemetry, personalized low-emission routines, indoor ventilation protocols, and quantified sustainable swaps.

![AeroPulse AI Architecture](https://img.shields.io/badge/AeroPulse-v1.0.0-emerald)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal)
![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_2.5_Flash-AI-purple)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Live_Telemetry-orange)

---

## 🌟 Key Innovations & Core Features

### 1. Live Zero-Auth Telemetry Ingestion (Open-Meteo)
- **Zero Hardcoding**: Ingests live concentrations for $PM_{2.5}$, $PM_{10}$, $NO_2$, $O_3$, $SO_2$, and $CO$ directly from the Open-Meteo Air Quality API.
- **Microclimate & Atmospheric Ventilation**: Pairs chemical telemetry with live wind velocity ($10\text{m}$), relative humidity, and temperature to calculate atmospheric boundary layer inversion and clearing rates.
- **Geocoding & GPS Detection**: Browser `navigator.geolocation` with reverse-geocoding, debounced autocomplete search (300ms), and fallback to New Delhi (`28.6139, 77.2090`).

### 2. Clinical Health & Exposure Metrics
- **Dynamic EPA AQI Gauge**: Color-coded across official EPA AQI bands (Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous).
- **Inhaled Toxic Load (Cigarette Equivalent)**: Implements the Berkeley Earth clinical formula ($PM_{2.5} / 22$) to communicate daily inhaled lung toxicity in intuitive cigarette equivalents.
- **Primary Pollutant Driver**: Identifies whether fine particulate matter ($PM_{2.5}$), coarse dust ($PM_{10}$), or vehicular emissions ($NO_2$) is the predominant driver relative to WHO annual limits.
- **WHO Safe-Limit Micro-Cards**: 6 interactive pollutant cards comparing live concentrations against World Health Organization safety baselines.

### 3. Gemini 2.5 Flash GenAI Personalization & Deterministic Offline Engine
- **Multi-Persona Tailoring**: Select from 4 household profiles:
  - 💼 *Daily Commuter* (roadway emissions & transit smog peaks)
  - 👨‍👩‍👧 *Family with Kids/Elderly* (vulnerable lung health & clean zones)
  - 🏃 *Outdoor Athlete & Runner* (5-10x minute ventilation cardio intake)
  - 🫁 *Asthma & Respiratory Sensitive* (hyper-reactive airway bronchospasm protection)
- **Structured JSON Synthesis**: Utilizes `@google/genai` with `gemini-2.5-flash` and `responseMimeType: "application/json"`.
- **Built-in In-App Key Manager**: Users and judges can paste their Gemini API key directly into the UI header or via `.env`.
- **Guaranteed Zero-Crash Deterministic Fallback**: If an API key is missing or quota is exhausted, AeroPulse switches seamlessly to its internal scientific calculation engine.

### 4. 48-Hour Smog Forecast & Safe Outdoor Window Chart
- Interactive area chart charting forecasted 48-hour smog curves.
- Automatic algorithmic detection of the **Best Outdoor Window** (lowest 3-hour moving average) and peak morning/evening thermal inversion spikes.

### 5. AI Action & Routine Deck
- **Tab 1: Tailored Daily Routine**: Morning, Afternoon, Evening, and Overnight slots with mask grade recommendations (N95/FFP2 vs N99).
- **Tab 2: Indoor Air Hacks**: Science-backed guidance on exact ventilation windows, room sealing, and DIY Corsi-Rosenthal / HEPA placement.
- **Tab 3: Sustainable Swaps & Impact Simulator**: Interactive switches that dynamically recalculate personal lung exposure reduction (%), micrograms of $PM_{2.5}$ inhaled avoided, and community $CO_2$ savings (kg).

### 6. Interactive Grounded AI Smog Copilot Drawer
- Ask custom questions grounded in the current city's real-time pollutant levels and wind dispersion context, featuring one-click starter chips.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Dark Slate `#0B1120`, Glassmorphism, Emerald/Amber/Crimson Status Accents)
- **Icons:** Lucide React
- **Typography:** `Inter` & `JetBrains Mono`
- **APIs:**
  - Open-Meteo Air Quality API (`https://air-quality-api.open-meteo.com/v1/air-quality`)
  - Open-Meteo Weather Forecast API (`https://api.open-meteo.com/v1/forecast`)
  - Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`)
  - BigDataCloud Reverse Geocoding Client API
- **AI SDK:** `@google/genai` (Gemini 2.5 Flash)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20 LTS)
- npm or pnpm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/aeropulse-ai.git
cd aeropulse-ai

# 2. Install dependencies
npm install

# 3. Configure Gemini API Key (Optional — in-app modal also available)
cp .env.example .env
# Open .env and add: VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 4. Start Development Server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📸 Dashboard Highlights

1. **Top Bar**: Instant city search with 300ms debounce, GPS detection, household persona pills, and API Key status badge.
2. **Hero Telemetry**: EPA gauge with Berkeley Earth cigarette index and atmospheric dispersion metrics.
3. **Pollutant Grid**: Real-time micro-cards with WHO progress meters.
4. **Smog Forecast**: 48-hour area chart with safe window visual highlights.
5. **Impact Simulator**: Cumulative exposure reduction and $CO_2$ savings calculation engine.
6. **Smog Copilot**: Real-time grounded generative AI chat drawer.

---

## 📄 License
MIT License. Built for hackathons, urban health researchers, and communities facing severe winter air quality crises.
