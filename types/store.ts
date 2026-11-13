// Satellite state additions for Zustand store

import type { TLERecord, SatelliteCategory } from './satellites';

export type Mode = '3d' | '2d';

export interface Probe {
  lat: number;
  lon: number;
}

export interface ExplorerState {
  mode: Mode;
  domain: import('./layers').Domain;
  activeLayer: import('./layers').LayerId;
  particlesOn: boolean;
  firesVisible: boolean;
  historicalMode: boolean;
  selectedYear: number;
  comparisonMode: boolean;
  compareProbe: Probe | null;
  timeIso: string;
  probe: Probe | null;
  panelOpen: boolean;
  quality: 'high' | 'low';

  // Earth rotation
  autoRotate: boolean;
  rotationSpeed: number;

  // Satellite tracking
  satelliteMode: boolean;
  selectedSatellite: TLERecord | null;
  satelliteCategory: SatelliteCategory | 'all';
  satelliteTrailsVisible: boolean;
  followSatellite: boolean;

  setMode: (m: Mode) => void;
  setDomain: (d: import('./layers').Domain) => void;
  setLayer: (l: import('./layers').LayerId) => void;
  setProbe: (p: Probe | null) => void;
  setCompareProbe: (p: Probe | null) => void;
  setComparisonMode: (enabled: boolean) => void;
  setHistoricalMode: (enabled: boolean) => void;
  setSelectedYear: (year: number) => void;
  setFiresVisible: (visible: boolean) => void;
  setTime: (iso: string) => void;
  closePanel: () => void;
  setParticlesOn: (on: boolean) => void;
  setQuality: (q: 'high' | 'low') => void;
  setAutoRotate: (enabled: boolean) => void;
  setRotationSpeed: (speed: number) => void;

  // Satellite setters
  setSatelliteMode: (enabled: boolean) => void;
  setSelectedSatellite: (sat: TLERecord | null) => void;
  setSatelliteCategory: (cat: SatelliteCategory | 'all') => void;
  setSatelliteTrailsVisible: (visible: boolean) => void;
  setFollowSatellite: (follow: boolean) => void;
}
