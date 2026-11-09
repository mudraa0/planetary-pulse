'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExplorerStore } from '@/store/useExplorerStore';
import { TopBar } from '@/components/hud/TopBar';
import { LayerRail } from '@/components/hud/LayerRail';
import { Legend } from '@/components/hud/Legend';
import { CursorReadout } from '@/components/hud/CursorReadout';
import { DrilldownPanel } from '@/components/panels/DrilldownPanel';

// Dynamic client-side only imports for 3D NASA Eyes Globe and 2D Leaflet
const NasaEyesGlobe = dynamic(
  () => import('@/components/scene/NasaEyesGlobe').then((m) => m.NasaEyesGlobe),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '650px',
          backgroundColor: 'var(--space-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontFamily: 'monospace',
        }}
      >
        INITIALIZING NASA EYES ON EARTH...
      </div>
    ),
  }
);

const FlatMap = dynamic(
  () => import('@/components/map2d/FlatMap').then((m) => m.FlatMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--space-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontFamily: 'monospace',
        }}
      >
        LOADING EQUIRECTANGULAR PROJECTION...
      </div>
    ),
  }
);

export function Explorer() {
  const [queryClient] = useState(() => new QueryClient());
  const mode = useExplorerStore((s) => s.mode);
  const panelOpen = useExplorerStore((s) => s.panelOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100dvh',
          backgroundColor: 'var(--surface-base)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Control Bar */}
        <TopBar />

        {/* Workspace Canvas & Rails */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left Layer Rail */}
          <LayerRail />

          {/* Central Viewport */}
          <main
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor: 'var(--space-bg)',
              overflow: 'hidden',
            }}
          >
            {mode === '3d' ? <NasaEyesGlobe /> : <FlatMap />}

            {/* Bottom-left Data Legend */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                zIndex: 10,
              }}
            >
              <Legend />
            </div>

            {/* Bottom-right Cursor Coordinate & Value Readout */}
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                zIndex: 10,
              }}
            >
              <CursorReadout />
            </div>
          </main>

          {/* Right Drill-down Dashboard */}
          {panelOpen && <DrilldownPanel />}
        </div>
      </div>
    </QueryClientProvider>
  );
}
