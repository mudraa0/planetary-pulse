'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface AnomalyBarsProps {
  monthlyAnomalies: number[];
  unit: string;
}

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function AnomalyBars({ monthlyAnomalies, unit }: AnomalyBarsProps) {
  const data = monthlyAnomalies.map((val, idx) => ({
    month: MONTH_LABELS[idx],
    anomaly: val,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
        }}
      >
        Monthly Standardized Anomalies
      </div>

      <div style={{ width: '100%', height: '110px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="month"
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-hairline)' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-hairline)' }}
            />
            <ReferenceLine y={0} stroke="var(--border-hairline)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}
              formatter={(value) => [
                `${typeof value === 'number' && value > 0 ? '+' : ''}${
                  typeof value === 'number' ? value.toFixed(2) : String(value ?? '')
                } ${unit}`,
                'Anomaly',
              ]}
            />
            <Bar dataKey="anomaly">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.anomaly >= 0 ? 'var(--div-pos-2)' : 'var(--div-neg-2)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
