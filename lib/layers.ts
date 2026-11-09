import type { LayerId, Domain } from '@/types/layers';

export interface LayerDef {
  id: LayerId;
  domain: Domain;
  label: string;
  unit: string;
  range: [number, number];
  ramp: 'sequential' | 'diverging';
  rampTokens: string[];
  mask: 'none' | 'ocean';
  vector: boolean;
  accentToken: string;
}

export const LAYER_REGISTRY: Record<LayerId, LayerDef> = {
  temperature: {
    id: 'temperature',
    domain: 'atmosphere',
    label: 'Temperature',
    unit: '°C',
    range: [-60, 50],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'none',
    vector: false,
    accentToken: '--accent-temp',
  },
  anomaly: {
    id: 'anomaly',
    domain: 'atmosphere',
    label: 'Temp Anomaly',
    unit: '°C',
    range: [-5, 5],
    ramp: 'diverging',
    rampTokens: ['--div-neg-2', '--div-neg-1', '--div-zero', '--div-pos-1', '--div-pos-2'],
    mask: 'none',
    vector: false,
    accentToken: '--accent-temp',
  },
  aqi: {
    id: 'aqi',
    domain: 'atmosphere',
    label: 'Air Quality (AQI)',
    unit: 'AQI',
    range: [0, 500],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'none',
    vector: false,
    accentToken: '--accent-air',
  },
  wind: {
    id: 'wind',
    domain: 'atmosphere',
    label: 'Wind Speed',
    unit: 'm/s',
    range: [0, 30],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'none',
    vector: true,
    accentToken: '--accent-air',
  },
  sst: {
    id: 'sst',
    domain: 'ocean',
    label: 'Sea Surface Temp',
    unit: '°C',
    range: [-2, 35],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'ocean',
    vector: false,
    accentToken: '--accent-ocean',
  },
  waves: {
    id: 'waves',
    domain: 'ocean',
    label: 'Wave Height',
    unit: 'm',
    range: [0, 15],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'ocean',
    vector: false,
    accentToken: '--accent-ocean',
  },
  currents: {
    id: 'currents',
    domain: 'ocean',
    label: 'Ocean Currents',
    unit: 'm/s',
    range: [0, 2],
    ramp: 'sequential',
    rampTokens: ['--ramp-1', '--ramp-2', '--ramp-3', '--ramp-4', '--ramp-5'],
    mask: 'ocean',
    vector: true,
    accentToken: '--accent-ocean',
  },
};

export const DOMAIN_DEFAULT_LAYER: Record<Domain, LayerId> = {
  atmosphere: 'temperature',
  ocean: 'sst',
};

export function getLayerDef(id: LayerId): LayerDef {
  return LAYER_REGISTRY[id];
}
