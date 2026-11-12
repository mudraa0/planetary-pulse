'use client';

import { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Info,
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
  const [aboutOpen, setAboutOpen] = useState(true);

  const activeDef = LAYER_REGISTRY[activeLayer];

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

      {/* Collapsible About This Layer Card */}
      <div
        style={{
          marginTop: 'auto',
          backgroundColor: 'var(--surface-sunken)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setAboutOpen(!aboutOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 9px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Info size={12} color="var(--accent-primary)" />
            <span>ABOUT LAYER</span>
          </div>
          {aboutOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {aboutOpen && (
          <div
            style={{
              padding: '0 9px 9px 9px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              lineHeight: 1.35,
            }}
          >
            <div style={{ color: 'var(--text-secondary)' }}>{activeDef.description}</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.25rem',
                borderTop: '1px solid var(--border-hairline)',
                fontSize: '0.625rem',
              }}
            >
              <span>SOURCE:</span>
              <span style={{ color: 'var(--text-primary)' }}>{activeDef.source}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
