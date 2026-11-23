import { HouseholdPersona, PersonaInfo } from '../types';

export const PERSONAS: PersonaInfo[] = [
  {
    id: 'commuter',
    label: 'Daily Commuter',
    sublabel: 'Metro, bus, car, bike',
    icon: 'Briefcase',
    vulnerabilityFactor: 1.1,
    description: 'Exposed to roadway emissions, diesel exhaust plumes, and transit corridor smog peaks.'
  },
  {
    id: 'family',
    label: 'Family with Kids/Elderly',
    sublabel: 'Vulnerable lungs & school runs',
    icon: 'Users',
    vulnerabilityFactor: 1.6,
    description: 'Higher respiratory sensitivity; requires conservative outdoor exertion thresholds and clean indoor safety zones.'
  },
  {
    id: 'runner',
    label: 'Outdoor Athlete & Runner',
    sublabel: 'High-ventilation exercise',
    icon: 'Activity',
    vulnerabilityFactor: 1.8,
    description: 'Minute respiratory intake increases 5-10x during cardio; extreme danger during high PM2.5 spikes.'
  },
  {
    id: 'asthma',
    label: 'Asthma & Respiratory Sensitive',
    sublabel: 'COPD, allergy, cardiac',
    icon: 'HeartPulse',
    vulnerabilityFactor: 2.2,
    description: 'Ultra-sensitive airways prone to bronchospasms, mucosal inflammation, and sudden asthma attacks.'
  }
];

export const DEFAULT_PERSONA: HouseholdPersona = 'commuter';
