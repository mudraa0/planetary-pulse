import { create } from 'zustand';
import type { ExplorerState, Mode, Probe } from '@/types/store';
import type { LayerId, Domain } from '@/types/layers';
import { DOMAIN_DEFAULT_LAYER } from '@/lib/layers';

/** Reads initial URL parameters safely in browser environments. */
function getInitialFromUrl(): {
  mode: Mode;
  activeLayer: LayerId;
  probe: Probe | null;
  timeIso: string;
} {
  if (typeof window === 'undefined') {
    return {
      mode: '3d',
      activeLayer: 'temperature',
      probe: null,
      timeIso: new Date().toISOString(),
    };
  }

  const params = new URLSearchParams(window.location.search);
  const m = (params.get('m') as Mode) || '3d';
  const layer = (params.get('layer') as LayerId) || 'temperature';
  const latStr = params.get('lat');
  const lonStr = params.get('lon');
  const t = params.get('t') || new Date().toISOString();

  let probe: Probe | null = null;
  if (latStr !== null && lonStr !== null) {
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      probe = { lat, lon };
    }
  }

  return {
    mode: m === '2d' ? '2d' : '3d',
    activeLayer: layer,
    probe,
    timeIso: t,
  };
}

/** Updates browser URL query parameters without reloading. */
function syncUrlParams(state: Partial<ExplorerState>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  if (state.mode) url.searchParams.set('m', state.mode);
  if (state.activeLayer) url.searchParams.set('layer', state.activeLayer);
  if (state.timeIso) url.searchParams.set('t', state.timeIso);

  if (state.probe !== undefined) {
    if (state.probe) {
      url.searchParams.set('lat', state.probe.lat.toFixed(4));
      url.searchParams.set('lon', state.probe.lon.toFixed(4));
    } else {
      url.searchParams.delete('lat');
      url.searchParams.delete('lon');
    }
  }

  window.history.replaceState({}, '', url.toString());
}

const initial = getInitialFromUrl();
const initialDomain: Domain =
  initial.activeLayer === 'sst' ||
  initial.activeLayer === 'waves' ||
  initial.activeLayer === 'currents'
    ? 'ocean'
    : 'atmosphere';

export const useExplorerStore = create<ExplorerState>((set) => ({
  mode: initial.mode,
  domain: initialDomain,
  activeLayer: initial.activeLayer,
  particlesOn: false,
  timeIso: initial.timeIso,
  probe: initial.probe,
  panelOpen: initial.probe !== null,
  quality: 'high',

  setMode: (m: Mode) => {
    syncUrlParams({ mode: m });
    set({ mode: m });
  },

  setDomain: (d: Domain) => {
    const defaultLayer = DOMAIN_DEFAULT_LAYER[d];
    syncUrlParams({ activeLayer: defaultLayer });
    set({ domain: d, activeLayer: defaultLayer });
  },

  setLayer: (l: LayerId) => {
    syncUrlParams({ activeLayer: l });
    set({ activeLayer: l });
  },

  setProbe: (p: Probe | null) => {
    syncUrlParams({ probe: p });
    set({ probe: p, panelOpen: p !== null });
  },

  setTime: (iso: string) => {
    syncUrlParams({ timeIso: iso });
    set({ timeIso: iso });
  },

  closePanel: () => {
    syncUrlParams({ probe: null });
    set({ panelOpen: false, probe: null });
  },

  setParticlesOn: (on: boolean) => set({ particlesOn: on }),

  setQuality: (q: 'high' | 'low') => set({ quality: q }),
}));
