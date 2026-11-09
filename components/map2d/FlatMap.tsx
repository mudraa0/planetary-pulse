'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, ImageOverlay, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useExplorerStore } from '@/store/useExplorerStore';
import { useGridField } from '@/hooks/useGridField';
import { LAYER_REGISTRY } from '@/lib/layers';
import { getComputedToken } from '@/lib/colormap';
import type { LayerId } from '@/types/layers';

/** Component handling map click events to set probe. */
function MapClickHandler() {
  const setProbe = useExplorerStore((s) => s.setProbe);

  useMapEvents({
    click(e) {
      let { lat, lng } = e.latlng;
      while (lng < -180) lng += 360;
      while (lng > 180) lng -= 360;
      lat = Math.max(-90, Math.min(90, lat));
      setProbe({ lat, lon: lng });
    },
  });

  return null;
}

/** Parses hex color to [r, g, b]. */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 128,
    parseInt(clean.slice(2, 4), 16) || 128,
    parseInt(clean.slice(4, 6), 16) || 128,
  ];
}

export function FlatMap() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const timeIso = useExplorerStore((s) => s.timeIso);

  const { data: gridField } = useGridField(activeLayer, timeIso);
  const [overlayUrl, setOverlayUrl] = useState<string | null>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!gridField) return;

    const { W, H, scalar, mask } = gridField;
    const def = LAYER_REGISTRY[activeLayer as LayerId] || LAYER_REGISTRY['temperature'];
    const [min, max] = def.range;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const canvas = offscreenCanvasRef.current;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(W, H);
    const pixels = imgData.data;

    // Resolve color stops from tokens
    const stops = def.rampTokens.map((t) => hexToRgb(getComputedToken(t, '#888888')));
    const numStops = stops.length;

    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const idx = j * W + i;
        const pIdx = idx * 4;

        if (mask[idx] === 0 || !Number.isFinite(scalar[idx])) {
          pixels[pIdx + 3] = 0; // Transparent
          continue;
        }

        const val = scalar[idx];
        const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));

        const pos = norm * (numStops - 1);
        const sIdx = Math.min(Math.floor(pos), numStops - 2);
        const frac = pos - sIdx;

        const c1 = stops[sIdx];
        const c2 = stops[sIdx + 1];

        pixels[pIdx + 0] = Math.round(c1[0] + (c2[0] - c1[0]) * frac);
        pixels[pIdx + 1] = Math.round(c1[1] + (c2[1] - c1[1]) * frac);
        pixels[pIdx + 2] = Math.round(c1[2] + (c2[2] - c1[2]) * frac);
        pixels[pIdx + 3] = 200; // 0.8 opacity
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setOverlayUrl(canvas.toDataURL());
  }, [gridField, activeLayer]);

  const bounds: L.LatLngBoundsExpression = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--space-bg)',
      }}
    >
      <MapContainer
        crs={L.CRS.EPSG4326}
        center={[0, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={7}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--space-bg)',
        }}
      >
        <MapClickHandler />
        {overlayUrl && <ImageOverlay url={overlayUrl} bounds={bounds} />}
      </MapContainer>
    </div>
  );
}
