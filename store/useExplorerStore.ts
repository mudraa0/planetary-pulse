import { create } from 'zustand';
import type { ExplorerState, Mode, Probe } from '@/types/store';
import type { LayerId, Domain } from '@/types/layers';
import { DOMAIN_DEFAULT_LAYER } from '@/lib/layers';

export const useExplorerStore = create<ExplorerState>((set) => ({
  mode: '3d',
  domain: 'atmosphere',
  activeLayer: 'temperature',
  particlesOn: true,
  firesVisible: false,
  historicalMode: false,
  selectedYear: 2026,
  comparisonMode: false,
  compareProbe: null,
  timeIso: '2026-10-01T12:00:00.000Z',
  probe: null,
  panelOpen: false,
  quality: 'high',

  setMode: (m: Mode) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('m', m);
      window.history.replaceState({}, '', url.toString());
    }
    set({ mode: m });
  },

  setDomain: (d: Domain) => {
    const defaultLayer = DOMAIN_DEFAULT_LAYER[d];
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('layer', defaultLayer);
      window.history.replaceState({}, '', url.toString());
    }
    set({ domain: d, activeLayer: defaultLayer });
  },

  setLayer: (l: LayerId) => {
    const isVector = l === 'wind' || l === 'currents';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('layer', l);
      window.history.replaceState({}, '', url.toString());
    }
    set({ activeLayer: l, particlesOn: isVector });
  },

  setProbe: (p: Probe | null) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (p) {
        url.searchParams.set('lat', p.lat.toFixed(4));
        url.searchParams.set('lon', p.lon.toFixed(4));
      } else {
        url.searchParams.delete('lat');
        url.searchParams.delete('lon');
      }
      window.history.replaceState({}, '', url.toString());
    }
    set({ probe: p, panelOpen: p !== null });
  },

  setCompareProbe: (p: Probe | null) => set({ compareProbe: p }),

  setComparisonMode: (enabled: boolean) => set({ comparisonMode: enabled }),

  setHistoricalMode: (enabled: boolean) => set({ historicalMode: enabled }),

  setSelectedYear: (year: number) => set({ selectedYear: year }),

  setFiresVisible: (visible: boolean) => set({ firesVisible: visible }),

  setTime: (iso: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('t', iso);
      window.history.replaceState({}, '', url.toString());
    }
    set({ timeIso: iso });
  },

  closePanel: () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('lat');
      url.searchParams.delete('lon');
      window.history.replaceState({}, '', url.toString());
    }
    set({ panelOpen: false, probe: null });
  },

  setParticlesOn: (on: boolean) => set({ particlesOn: on }),

  setQuality: (q: 'high' | 'low') => set({ quality: q }),
}));
