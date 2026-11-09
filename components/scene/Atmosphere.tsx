'use client';

import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { tokenToColor, observeThemeChanges } from '@/lib/colormap';

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uAtmosphereColor;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Fresnel rim intensity falloff
    float intensity = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.8);
    gl_FragColor = vec4(uAtmosphereColor, intensity * 0.7);
  }
`;

export function Atmosphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    return {
      uAtmosphereColor: { value: tokenToColor('--atmosphere-rim', '#c8c8c8') },
    };
  }, []);

  useEffect(() => {
    const unbind = observeThemeChanges(() => {
      if (materialRef.current) {
        materialRef.current.uniforms['uAtmosphereColor'].value = tokenToColor(
          '--atmosphere-rim',
          '#c8c8c8'
        );
      }
    });
    return unbind;
  }, []);

  return (
    <mesh scale={[1.025, 1.025, 1.025]}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={ATMOSPHERE_VERTEX}
        fragmentShader={ATMOSPHERE_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
