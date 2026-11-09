'use client';

import { useMemo } from 'react';
import { createSeededRng } from '@/lib/noise';

export function Starfield() {
  const { positions, colors } = useMemo(() => {
    const starCount = 2000;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const rng = createSeededRng(1984);

    for (let i = 0; i < starCount; i++) {
      // Uniform distribution on deep space shell (radius 40-70)
      const u = rng();
      const v = rng();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 40 + rng() * 30;

      const sinPhi = Math.sin(phi);
      pos[i * 3 + 0] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * sinPhi * Math.sin(theta);

      // Subtle monochromatic stars
      const brightness = 0.5 + rng() * 0.5;
      col[i * 3 + 0] = brightness;
      col[i * 3 + 1] = brightness;
      col[i * 3 + 2] = brightness;
    }

    return { positions: pos, colors: col };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}
