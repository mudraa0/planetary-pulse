'use client';

import { useState } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { ModeSwitch } from './ModeSwitch';
import { GEOGRAPHIC_ANCHORS } from '@/services/mock/MockDataProvider';
import {
  Globe as GlobeIcon,
  Search,
  Sparkles,
  Play,
  Pause,
  Database,
  Share2,
} from 'lucide-react';

export function TopBar() {
  const timeIso = useExplorerStore((s) => s.timeIso);
  const setTime = useExplorerStore((s) => s.setTime);
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const setProbe = useExplorerStore((s) => s.setProbe);

  const [isPlaying, setIsPlaying] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasVector = activeLayer === 'wind' || activeLayer === 'currents';
  const currentDate = new Date(timeIso);

  const adjustDays = (delta: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setTime(next.toISOString());
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        height: '52px',
        backgroundColor: 'var(--surface-raised)',
        borderBottom: '1px solid var(--border-hairline)',
        zIndex: 25,
        userSelect: 'none',
        gap: '1rem',
      }}
    >
      {/* Brand Identity & Mission */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <GlobeIcon size={16} color="var(--accent-primary)" />
        </div>
        <div>
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              lineHeight: 1.1,
            }}
          >
            Planetary Pulse
          </div>
          <div
            style={{
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
            }}
          >
            NASA Space Apps 2026 Digital Twin
          </div>
        </div>

        {/* Provenance Badge (D20) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
          }}
        >
          <Database size={11} color="var(--accent-primary)" />
          <span>SYNTHETIC REANALYSIS v2.4</span>
        </div>
      </div>

      {/* Center Interactive Timeline Scrubber & Playback */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: isPlaying ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: isPlaying ? 'var(--surface-sunken)' : 'var(--text-primary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        <button
          type="button"
          onClick={() => adjustDays(-1)}
          style={{
            padding: '3px 8px',
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
            padding: '2px 8px',
            minWidth: '105px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {currentDate.toISOString().slice(0, 10)}
        </span>

        <button
          type="button"
          onClick={() => adjustDays(1)}
          style={{
            padding: '3px 8px',
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

      {/* Right Controls: Location Quick Search, Particle Stream & Mode Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {/* Quick Search Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '5px 9px',
              fontSize: '0.6875rem',
              fontFamily: 'monospace',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <Search size={13} />
            <span>LOCATIONS</span>
          </button>

          {searchOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '230px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 40,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Sparkles size={11} color="var(--accent-primary)" />
                <span>FEATURED COORDINATES</span>
              </div>
              {GEOGRAPHIC_ANCHORS.slice(0, 7).map((anchor) => (
                <button
                  key={anchor.name}
                  type="button"
                  onClick={() => {
                    setProbe({ lat: anchor.lat, lon: anchor.lon });
                    setSearchOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    fontSize: '0.6875rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{anchor.name.split(',')[0]}</span>
                  <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                    {anchor.isOcean ? 'OCEAN' : 'LAND'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasVector && (
          <button
            type="button"
            onClick={() => setParticlesOn(!particlesOn)}
            style={{
              padding: '5px 10px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: particlesOn ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: particlesOn ? 'var(--surface-sunken)' : 'transparent',
              border: '1px solid',
              borderColor: particlesOn ? 'var(--accent-primary)' : 'var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            PARTICLES: {particlesOn ? 'ON' : 'OFF'}
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          style={{
            padding: '5px 9px',
            fontSize: '0.6875rem',
            fontFamily: 'monospace',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: copied ? 'var(--state-positive)' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
          title="Copy link with current coordinate state"
        >
          <Share2 size={12} />
          <span>{copied ? 'COPIED!' : 'SHARE'}</span>
        </button>

        <ModeSwitch />
      </div>
    </header>
  );
}
