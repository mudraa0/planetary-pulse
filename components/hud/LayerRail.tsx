'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId, Domain } from '@/types/layers';
import {
  Thermometer,
  Flame,
  Wind,
  Waves,
  Compass,
  Activity,
  Layers,
} from 'lucide-react';

const DOMAIN_SECTIONS: {
  domain: Domain;
  label: string;
  icon: typeof Layers;
  layers: { id: LayerId; icon: typeof Thermometer }[];
}[] = [
  {
    domain: 'atmosphere',
    label: 'Atmosphere',
    icon: Wind,
    layers: [
      { id: 'temperature', icon: Thermometer },
      { id: 'anomaly', icon: Flame },
      { id: 'aqi', icon: Activity },
      { id: 'wind', icon: Wind },
    ],
  },
  {
    domain: 'ocean',
    label: 'Ocean & Marine',
    icon: Waves,
    layers: [
      { id: 'sst', icon: Thermometer },
      { id: 'waves', icon: Waves },
      { id: 'currents', icon: Compass },
    ],
  },
];

export function LayerRail() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setLayer = useExplorerStore((s) => s.setLayer);
  const setDomain = useExplorerStore((s) => s.setDomain);

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--surface-raised)',
        borderRight: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0.75rem',
        gap: '1.5rem',
        zIndex: 10,
        userSelect: 'none',
        overflowY: 'auto',
      }}
    >
      {DOMAIN_SECTIONS.map((section) => {
        const SectionIcon = section.icon;

        return (
          <div key={section.domain} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                paddingLeft: '0.25rem',
              }}
            >
              <SectionIcon size={14} color="var(--text-muted)" />
              <span>{section.label}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {section.layers.map(({ id: lid, icon: LayerIcon }) => {
                const def = LAYER_REGISTRY[lid];
                const isActive = activeLayer === lid;

                return (
                  <button
                    key={lid}
                    type="button"
                    onClick={() => {
                      setDomain(def.domain);
                      setLayer(lid);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'var(--surface-sunken)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left',
                      transition: 'all var(--motion-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <LayerIcon
                        size={15}
                        color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'}
                      />
                      <span>{def.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {def.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
