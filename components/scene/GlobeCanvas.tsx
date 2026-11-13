'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { Globe } from './Globe';
import { Atmosphere } from './Atmosphere';
import { Starfield } from './Starfield';
import { LayerManager } from './LayerManager';
import { ParticleField } from './ParticleField';
import { ProbeMarker } from './ProbeMarker';
import { PointerPicker } from './PointerPicker';
import { CameraRig } from './CameraRig';
import { Coastlines } from './Coastlines';
import { Graticule } from './Graticule';
import { Clouds } from './Clouds';
import { FireHotspotsLayer } from './FireHotspotsLayer';
import { SatelliteLayer } from './SatelliteLayer';
import { OrbitalTrail } from './OrbitalTrail';
import { DebugOverlay } from '@/components/debug/DebugOverlay';
import { GlobeControls } from '@/components/hud/GlobeControls';
import { SatelliteInfoPanel } from '@/components/panels/SatelliteInfoPanel';
import { SatelliteSearch } from '@/components/hud/SatelliteSearch';
import { useExplorerStore } from '@/store/useExplorerStore';
import { tokenToColor, observeThemeChanges } from '@/lib/colormap';

function DebugWrapper() {
  const searchParams = useSearchParams();
  if (searchParams.get('debug') === '1') {
    return <DebugOverlay />;
  }
  return null;
}

export function GlobeCanvas() {
  const setMode = useExplorerStore((s) => s.setMode);
  const firesVisible = useExplorerStore((s) => s.firesVisible);
  const satelliteMode = useExplorerStore((s) => s.satelliteMode);
  const autoRotate = useExplorerStore((s) => s.autoRotate);
  const selectedSatellite = useExplorerStore((s) => s.selectedSatellite);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) setWebglSupported(false);
      } catch {
        setWebglSupported(false);
      }
    };
    checkWebGL();
  }, []);

  if (!webglSupported) {
    setMode('2d');
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          backgroundColor: 'var(--surface-base)',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}
      >
        WebGL context unavailable. Switched automatically to 2D Map view.
      </div>
    );
  }

  const spaceColor = tokenToColor('--space-bg', '#030303');

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={null}>
        <DebugWrapper />
      </Suspense>
      <GlobeControls />
      {/* Satellite UI overlays */}
      {satelliteMode && (
        <Suspense fallback={null}>
          <SatelliteSearch />
        </Suspense>
      )}
      {selectedSatellite && (
        <Suspense fallback={null}>
          <SatelliteInfoPanel />
        </Suspense>
      )}
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 3.2] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        frameloop={satelliteMode || autoRotate ? 'always' : 'demand'}
        onCreated={({ gl }) => {
          gl.setClearColor(spaceColor);
          observeThemeChanges(() => {
            const nextSpaceColor = tokenToColor('--space-bg', '#030303');
            gl.setClearColor(nextSpaceColor);
          });
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 3, 5]} intensity={1.1} />
          <Starfield />
          <Globe />
          <Clouds />
          <Coastlines />
          <Graticule />
          <Atmosphere />
          <FireHotspotsLayer visible={firesVisible} />
          <LayerManager />
          <ParticleField />
          <ProbeMarker />
          <PointerPicker />
          <SatelliteLayer />
          <OrbitalTrail />
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
