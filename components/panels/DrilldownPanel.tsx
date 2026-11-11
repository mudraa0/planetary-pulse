'use client';

import { useExplorerStore } from '@/store/useExplorerStore';
import { usePointReport } from '@/hooks/usePointReport';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DotPattern } from '@/components/ui/dot-pattern';
import { NumberTicker } from '@/components/ui/number-ticker';
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar';
import { TrendChart } from './TrendChart';
import { AnomalyBars } from './AnomalyBars';
import { FactorBreakdown } from './FactorBreakdown';
import { SourceFootnote } from './SourceFootnote';
import { PanelState } from './PanelState';
import { LAYER_REGISTRY } from '@/lib/layers';
import { X, MapPin } from 'lucide-react';

export function DrilldownPanel() {
  const probe = useExplorerStore((s) => s.probe);
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const timeIso = useExplorerStore((s) => s.timeIso);
  const closePanel = useExplorerStore((s) => s.closePanel);
  const reducedMotion = useReducedMotion();

  const { data: report, isLoading, isError, refetch } = usePointReport(
    probe?.lat ?? null,
    probe?.lon ?? null,
    timeIso
  );

  const activeLayerData = report?.layers.find((l) => l.layerId === activeLayer);
  const activeDef = LAYER_REGISTRY[activeLayer];
  const isOceanLayer = activeDef.mask === 'ocean';

  const latHem = probe ? (probe.lat >= 0 ? `${probe.lat.toFixed(2)}°N` : `${Math.abs(probe.lat).toFixed(2)}°S`) : '';
  const lonHem = probe ? (probe.lon >= 0 ? `${probe.lon.toFixed(2)}°E` : `${Math.abs(probe.lon).toFixed(2)}°W`) : '';

  return (
    <aside
      style={{
        position: 'relative',
        width: '420px',
        maxWidth: '100vw',
        height: '100%',
        backgroundColor: 'var(--surface-raised)',
        borderLeft: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 35,
        overflowY: 'auto',
        transition: reducedMotion ? 'none' : 'transform var(--motion-base), opacity var(--motion-base)',
      }}
    >
      {/* Sticky Header with non-overlapping close button */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '1.125rem 1rem',
          borderBottom: '1px solid var(--border-hairline)',
          backgroundColor: 'var(--surface-sunken)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <DotPattern className="opacity-10" />
        <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2px' }}>
            <MapPin size={13} color="var(--accent-primary)" />
            <h2
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {report?.placeName || 'Target Coordinate'}
            </h2>
          </div>
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
              paddingLeft: '1.25rem',
            }}
          >
            {latHem}, {lonHem}
          </div>
        </div>

        <button
          type="button"
          onClick={closePanel}
          style={{
            position: 'relative',
            zIndex: 2,
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Close Drawer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Area */}
      {isLoading && <PanelState type="loading" />}

      {isError && (
        <PanelState
          type="error"
          message="Failed to retrieve observation matrix for coordinate."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && !activeLayerData && (
        <PanelState
          type="empty"
          message={
            isOceanLayer
              ? 'No marine telemetry recorded for this terrestrial coordinate.'
              : 'Observation unavailable for this cell.'
          }
        />
      )}

      {!isLoading && !isError && activeLayerData && (
        <div
          style={{
            padding: '1.25rem 1rem 2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Headline Stats Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: activeLayer === 'aqi' ? '1fr 90px' : 'repeat(3, 1fr)',
              gap: '0.625rem',
              backgroundColor: 'var(--surface-sunken)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.875rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.625rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {activeDef.label}
              </div>
              <div
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.25rem',
                  marginTop: '0.25rem',
                }}
              >
                <NumberTicker
                  value={activeLayerData.value}
                  decimalPlaces={activeDef.unit === 'AQI' ? 0 : 1}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeDef.unit}
                </span>
              </div>
            </div>

            {activeLayer === 'aqi' ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AnimatedCircularProgressBar
                  max={500}
                  min={0}
                  value={activeLayerData.value}
                  gaugePrimaryColor="var(--accent-air)"
                  gaugeSecondaryColor="var(--surface-raised)"
                  className="size-16 text-xs"
                />
              </div>
            ) : (
              <>
                <div>
                  <div
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Anomaly
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color:
                        activeLayerData.anomaly >= 0
                          ? 'var(--div-pos-2)'
                          : 'var(--div-neg-2)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {activeLayerData.anomaly >= 0 ? '+' : ''}
                    {activeLayerData.anomaly.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Percentile
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {activeLayerData.percentile}%
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Historical Trend Chart */}
          <TrendChart
            trend30Day={activeLayerData.trend30DaySeries}
            climatologyMonthly={activeLayerData.climatologyMonthlySeries}
            unit={activeDef.unit}
          />

          {/* Monthly Signed Anomaly Bars */}
          <AnomalyBars
            monthlyAnomalies={activeLayerData.anomalyMonthlySeries}
            unit={activeDef.unit}
          />

          {/* Factor Breakdown */}
          <FactorBreakdown factors={activeLayerData.factorBreakdown} />

          {/* Footnote & Provenance */}
          <SourceFootnote
            source={report?.source ?? 'mock'}
            fetchedAt={report?.fetchedAt ?? new Date().toISOString()}
            recordLengthYears={activeLayerData.recordLengthYears}
          />
        </div>
      )}
    </aside>
  );
}
