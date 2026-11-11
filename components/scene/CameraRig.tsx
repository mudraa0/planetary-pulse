'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useExplorerStore } from '@/store/useExplorerStore';
import { latLonToVec3, vec3ToLatLon, slerpVec3, clamp } from '@/lib/geo';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FlyState {
  startDir: THREE.Vector3;
  targetDir: THREE.Vector3;
  startDistance: number;
  targetDistance: number;
  startTime: number;
  durationMs: number;
}

export function CameraRig() {
  const { camera, invalidate } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const reducedMotion = useReducedMotion();

  const probe = useExplorerStore((s) => s.probe);
  const panelOpen = useExplorerStore((s) => s.panelOpen);
  const setProbe = useExplorerStore((s) => s.setProbe);
  const closePanel = useExplorerStore((s) => s.closePanel);

  const flyStateRef = useRef<FlyState | null>(null);
  const lastInteractionTimeRef = useRef<number>(performance.now());
  const zoomDerivedProbeRef = useRef<boolean>(false);
  const zoomDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!probe) return;

    const targetPos = latLonToVec3(probe.lat, probe.lon, 1);
    const targetDir = targetPos.normalize();

    const currentDist = camera.position.length();
    const currentDir = camera.position.clone().normalize();

    // Sensible fly-to distance (2.2) so globe never clips the viewport edges
    flyStateRef.current = {
      startDir: currentDir,
      targetDir,
      startDistance: currentDist,
      targetDistance: Math.max(2.1, Math.min(2.8, currentDist)),
      startTime: performance.now(),
      durationMs: 850,
    };
    invalidate();
  }, [probe, camera, invalidate]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const now = performance.now();
    const currentDist = camera.position.length();

    // Scale rotate/zoom speeds smoothly
    const normDist = clamp((currentDist - 1.25) / (6.0 - 1.25), 0, 1);
    controls.rotateSpeed = 0.3 + 0.7 * normDist;
    controls.zoomSpeed = 0.4 + 0.6 * normDist;

    // Center offset when drill-down panel opens to prevent cropping
    const targetCenterX = panelOpen ? 0.32 : 0.0;
    controls.target.x = THREE.MathUtils.lerp(controls.target.x, targetCenterX, 0.08);

    if (flyStateRef.current) {
      const fly = flyStateRef.current;
      const elapsed = now - fly.startTime;
      const progress = clamp(elapsed / fly.durationMs, 0, 1);

      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const interpolatedDir = slerpVec3(fly.startDir, fly.targetDir, eased);
      const interpolatedDist =
        fly.startDistance + (fly.targetDistance - fly.startDistance) * eased;

      camera.position.copy(interpolatedDir.multiplyScalar(interpolatedDist));
      controls.update();
      invalidate();

      if (progress >= 1) {
        flyStateRef.current = null;
      }
      return;
    }

    if (currentDist < 1.6 && !probe) {
      if (!zoomDebounceTimerRef.current) {
        zoomDebounceTimerRef.current = setTimeout(() => {
          const lookDir = camera.position.clone().normalize();
          const { lat, lon } = vec3ToLatLon(lookDir);
          zoomDerivedProbeRef.current = true;
          setProbe({ lat, lon });
          zoomDebounceTimerRef.current = null;
        }, 400);
      }
    } else if (currentDist > 2.2 && zoomDerivedProbeRef.current) {
      if (zoomDebounceTimerRef.current) {
        clearTimeout(zoomDebounceTimerRef.current);
        zoomDebounceTimerRef.current = null;
      }
      zoomDerivedProbeRef.current = false;
      closePanel();
    }

    const isIdle = now - lastInteractionTimeRef.current > 6000;
    if (isIdle && !reducedMotion && !panelOpen) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.update();
      invalidate();
    } else {
      controls.autoRotate = false;
    }
  });

  const onUserInteraction = () => {
    lastInteractionTimeRef.current = performance.now();
    if (flyStateRef.current) {
      flyStateRef.current = null;
    }
    invalidate();
  };

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={1.3}
      maxDistance={6.0}
      enableDamping
      dampingFactor={0.06}
      onStart={onUserInteraction}
      onChange={onUserInteraction}
    />
  );
}
