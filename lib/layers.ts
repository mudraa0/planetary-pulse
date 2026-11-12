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
  description: string;
  source: string;
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
    description: 'Near-surface 2-meter air temperature calibrated against global reanalysis grids.',
    source: 'ERA5 Reanalysis / GFS Blend',
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
    description: 'Departure from 1991–2020 climatological baseline normal for the target period.',
    source: 'NASA GISTEMP / ERA5 Climatology',
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
    description: 'Composite atmospheric air quality index driven by PM2.5 and aerosol optical depth.',
    source: 'Copernicus CAMS & Ground Stations',
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
    description: '10-meter atmospheric wind velocity field with particle vector streamlines.',
    source: 'NOAA GFS / ECMWF Vector',
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
    description: 'Sub-skin sea surface thermal measurements masked strictly to oceanic water basins.',
    source: 'NOAA OISST v2.1 High-Res',
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
    description: 'Significant wave height reflecting combined wind waves and ocean swell systems.',
    source: 'WAVEWATCH III Marine Model',
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
    description: 'Upper-layer oceanic circulation velocity field with geostrophic kinetic streamlines.',
    source: 'HYCOM / OSCAR Altimetry',
  },
};

export const DOMAIN_DEFAULT_LAYER: Record<Domain, LayerId> = {
  atmosphere: 'temperature',
  ocean: 'sst',
};

export function getLayerDef(id: LayerId): LayerDef {
  return LAYER_REGISTRY[id];
}
