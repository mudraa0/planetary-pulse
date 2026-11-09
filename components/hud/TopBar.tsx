'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { ModeSwitch } from './ModeSwitch';

export function TopBar() {
  const timeIso = useExplorerStore((s) => s.timeIso);
  const setTime = useExplorerStore((s) => s.setTime);
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const activeLayer = useExplorerStore((s) => s.activeLayer);

  const hasVector = activeLayer === 'wind' || activeLayer === 'currents';

  // Quick 7-day relative timeline scrubber
  const currentDate = new Date(timeIso);

  const adjustDays = (delta: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setTime(next.toISOString());
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        height: '48px',
        backgroundColor: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border-hairline)',
        zIndex: 20,
        userSelect: 'none',
      }}
    >
      {/* Brand title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '50%',
          }}
        />
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
          }}
        >
          Planetary Pulse
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}
        >
          NASA Space Apps 2026 Digital Twin
        </span>
      </div>

      {/* Center time scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => adjustDays(-1)}
          style={{
            padding: '2px 8px',
            fontSize: '0.75rem',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Previous day"
        >
          ◀
        </button>
        <span
          style={{
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--text-primary)',
            padding: '0 6px',
            minWidth: '100px',
            textAlign: 'center',
          }}
        >
          {currentDate.toISOString().slice(0, 10)}
        </span>
        <button
          type="button"
          onClick={() => adjustDays(1)}
          style={{
            padding: '2px 8px',
            fontSize: '0.75rem',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
          title="Next day"
        >
          ▶
        </button>
      </div>

      {/* Right controls: Particle Toggle & 2D/3D ModeSwitch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {hasVector && (
          <button
            type="button"
            onClick={() => setParticlesOn(!particlesOn)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: particlesOn ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: particlesOn ? 'var(--surface-sunken)' : 'transparent',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Particles: {particlesOn ? 'ON' : 'OFF'}
          </button>
        )}
        <ModeSwitch />
      </div>
    </header>
  );
}
