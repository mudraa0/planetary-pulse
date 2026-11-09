'use client';

import { useState, useEffect } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { LAYER_REGISTRY } from '@/lib/layers';
import { bilinearSample } from '@/lib/sampling';
import type { GridField } from '@/types/data';
import type { LayerId } from '@/types/layers';

export function CursorReadout() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const def = LAYER_REGISTRY[activeLayer as LayerId] || LAYER_REGISTRY['temperature'];

  const [hoverState, setHoverState] = useState<{
    lat: number;
    lon: number;
    value: number | null;
  } | null>(null);

  useEffect(() => {
    const onGlobeHover = (e: Event) => {
      const customEvent = e as CustomEvent<{
        lat?: number;
        lon?: number;
        hit: boolean;
      }>;
      const { lat, lon, hit } = customEvent.detail;

      if (!hit || lat === undefined || lon === undefined) {
        setHoverState(null);
        return;
      }

      // Sample CPU-side grid buffer with zero GPU readback
      const field = (window as unknown as { __activeGridField?: GridField }).__activeGridField;
      let sampledVal: number | null = null;

      if (field) {
        const raw = bilinearSample(field.scalar, field.W, field.H, lat, lon);
        sampledVal = Number.isFinite(raw) ? raw : null;
      }

      setHoverState({ lat, lon, value: sampledVal });
    };

    window.addEventListener('globe:hover', onGlobeHover);
    return () => window.removeEventListener('globe:hover', onGlobeHover);
  }, []);

  if (!hoverState) {
    return (
      <div
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.75rem',
          fontSize: '0.6875rem',
          fontFamily: 'monospace',
          color: 'var(--text-muted)',
          userSelect: 'none',
        }}
      >
        PROBE: HOVER OR CLICK GLOBE
      </div>
    );
  }

  const latHem = hoverState.lat >= 0 ? `${hoverState.lat.toFixed(2)}°N` : `${Math.abs(hoverState.lat).toFixed(2)}°S`;
  const lonHem = hoverState.lon >= 0 ? `${hoverState.lon.toFixed(2)}°E` : `${Math.abs(hoverState.lon).toFixed(2)}°W`;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.5rem 0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      <div style={{ color: 'var(--text-secondary)' }}>
        {latHem}, {lonHem}
      </div>
      <div
        style={{
          width: '1px',
          height: '12px',
          backgroundColor: 'var(--border-hairline)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {hoverState.value !== null ? hoverState.value.toFixed(1) : 'NO DATA'}
        </span>
        {hoverState.value !== null && (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {def.unit}
          </span>
        )}
      </div>
    </div>
  );
}
