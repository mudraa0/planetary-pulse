import type { Domain, LayerId } from './layers';

export type Mode = '3d' | '2d';

export interface Probe {
  lat: number;
  lon: number;
}

export interface ExplorerState {
  mode: Mode;
  domain: Domain;
  activeLayer: LayerId;
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
  setMode: (m: Mode) => void;
  setDomain: (d: Domain) => void;
  setLayer: (l: LayerId) => void;
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
}
