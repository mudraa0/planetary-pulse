'use client';

import { useState } from 'react';
import { Plus, Minus, RotateCcw, Play, Pause, Sparkles, Flame, History, GitCompare } from 'lucide-react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function GlobeControls() {
  const particlesOn = useExplorerStore((s) => s.particlesOn);
  const setParticlesOn = useExplorerStore((s) => s.setParticlesOn);
  const firesVisible = useExplorerStore((s) => s.firesVisible);
  const setFiresVisible = useExplorerStore((s) => s.setFiresVisible);
  const historicalMode = useExplorerStore((s) => s.historicalMode);
  const setHistoricalMode = useExplorerStore((s) => s.setHistoricalMode);
  const comparisonMode = useExplorerStore((s) => s.comparisonMode);
  const setComparisonMode = useExplorerStore((s) => s.setComparisonMode);
  const [autoRotate, setAutoRotate] = useState(false);

  const handleZoomIn = () => {
    window.dispatchEvent(new CustomEvent('globe:zoomIn'));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent('globe:zoomOut'));
  };

  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('globe:reset'));
  };

  const handleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    window.dispatchEvent(new CustomEvent('globe:autoRotate', { detail: { enabled: next } }));
  };

  const buttonStyle = {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--surface-raised)',
    border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--motion-fast)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
      }}
    >
      <button
        type="button"
        onClick={handleZoomIn}
        style={buttonStyle}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>

      <button
        type="button"
        onClick={handleZoomOut}
        style={buttonStyle}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>

      <button
        type="button"
        onClick={handleReset}
        style={buttonStyle}
        title="Reset Camera (R)"
        aria-label="Reset Camera"
      >
        <RotateCcw size={15} />
      </button>

      <button
        type="button"
        onClick={handleAutoRotate}
        style={{
          ...buttonStyle,
          color: autoRotate ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderColor: autoRotate ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Auto-Rotate Globe"
        aria-label="Auto-Rotate Globe"
      >
        {autoRotate ? <Pause size={15} /> : <Play size={15} />}
      </button>

      <button
        type="button"
        onClick={() => setParticlesOn(!particlesOn)}
        style={{
          ...buttonStyle,
          color: particlesOn ? 'var(--accent-primary)' : 'var(--text-muted)',
          borderColor: particlesOn ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Toggle Streamlines (P)"
        aria-label="Toggle Streamlines"
      >
        <Sparkles size={15} />
      </button>

      {/* NASA FIRMS Active Wildfires Layer Toggle */}
      <button
        type="button"
        onClick={() => setFiresVisible(!firesVisible)}
        style={{
          ...buttonStyle,
          color: firesVisible ? '#ef4444' : 'var(--text-muted)',
          borderColor: firesVisible ? '#ef4444' : 'var(--border-hairline)',
        }}
        title="NASA FIRMS Active Fire Hotspots"
        aria-label="NASA FIRMS Active Fire Hotspots"
      >
        <Flame size={15} />
      </button>

      {/* Earth Through Time Historical Mode Toggle */}
      <button
        type="button"
        onClick={() => setHistoricalMode(!historicalMode)}
        style={{
          ...buttonStyle,
          color: historicalMode ? 'var(--accent-primary)' : 'var(--text-muted)',
          borderColor: historicalMode ? 'var(--accent-primary)' : 'var(--border-hairline)',
        }}
        title="Earth Through Time (1880 - Present)"
        aria-label="Earth Through Time"
      >
        <History size={15} />
      </button>

      {/* Location Comparison Mode Toggle */}
      <button
        type="button"
        onClick={() => setComparisonMode(!comparisonMode)}
        style={{
          ...buttonStyle,
          color: comparisonMode ? 'var(--accent-ocean)' : 'var(--text-muted)',
          borderColor: comparisonMode ? 'var(--accent-ocean)' : 'var(--border-hairline)',
        }}
        title="Compare Environmental Locations"
        aria-label="Compare Environmental Locations"
      >
        <GitCompare size={15} />
      </button>
    </div>
  );
}
