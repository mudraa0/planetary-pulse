'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { FactorEntry } from '@/types/data';

interface FactorBreakdownProps {
  factors: FactorEntry[];
}

export function FactorBreakdown({ factors }: FactorBreakdownProps) {
  const chartData = factors.map((f) => ({
    name: f.name,
    zScore: f.zScore,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.125rem',
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
          }}
        >
          Factor Contribution to Deviation
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}
        >
          * Statistical association rank (absolute z-score), not mechanistic causation
        </span>
      </div>

      <div style={{ width: '100%', height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              type="number"
              stroke="var(--text-muted)"
              fontSize={9}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-hairline)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-secondary)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              width={120}
            />
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
                typeof value === 'number' ? value.toFixed(2) : String(value ?? ''),
                'Z-Score',
              ]}
            />
            <Bar dataKey="zScore" barSize={12}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`factor-${index}`}
                  fill={entry.zScore >= 0 ? 'var(--series-1)' : 'var(--series-3)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
