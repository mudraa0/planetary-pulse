'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { LAYER_REGISTRY } from '@/lib/layers';
import type { LayerId, Domain } from '@/types/layers';
import { BorderBeam } from '@/components/ui/border-beam';

const DOMAIN_SECTIONS: { domain: Domain; label: string; layers: LayerId[] }[] = [
  {
    domain: 'atmosphere',
    label: 'Atmosphere',
    layers: ['temperature', 'anomaly', 'aqi', 'wind'],
  },
  {
    domain: 'ocean',
    label: 'Ocean',
    layers: ['sst', 'waves', 'currents'],
  },
];

export function LayerRail() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setLayer = useExplorerStore((s) => s.setLayer);
  const setDomain = useExplorerStore((s) => s.setDomain);

  return (
    <aside
      style={{
        width: '210px',
        backgroundColor: 'var(--surface-raised)',
        borderRight: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem',
        gap: '1.25rem',
        zIndex: 10,
        userSelect: 'none',
        overflowY: 'auto',
      }}
    >
      {DOMAIN_SECTIONS.map((section) => (
        <div key={section.domain} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
              paddingLeft: '0.25rem',
            }}
          >
            {section.label}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {section.layers.map((lid) => {
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
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--surface-sunken)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-hairline)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    textAlign: 'left',
                    overflow: 'hidden',
                    transition: 'all var(--motion-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isActive
                          ? `var(${def.accentToken})`
                          : 'var(--border-hairline)',
                      }}
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

                  {isActive && (
                    <BorderBeam
                      size={40}
                      duration={5}
                      borderWidth={1}
                      colorFrom="var(--accent-primary)"
                      colorTo="transparent"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
