'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
  trend30Day: number[];
  climatologyMonthly: number[];
  unit: string;
}

export function TrendChart({ trend30Day, climatologyMonthly, unit }: TrendChartProps) {
  const [viewMode, setViewMode] = useState<'30d' | 'monthly'>('30d');

  const chartData =
    viewMode === '30d'
      ? trend30Day.map((val, idx) => ({
          name: `D-${30 - idx}`,
          value: val,
        }))
      : climatologyMonthly.map((val, idx) => ({
          name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx],
          value: val,
        }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          {viewMode === '30d' ? '30-Day Historical Trend' : '5-Year Monthly Baseline'}
        </span>
        <button
          type="button"
          onClick={() => setViewMode(viewMode === '30d' ? 'monthly' : '30d')}
          style={{
            fontSize: '0.625rem',
            padding: '2px 6px',
            backgroundColor: 'var(--surface-sunken)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          Toggle {viewMode === '30d' ? 'Monthly Means' : 'Daily Series'}
        </button>
      </div>

      <div style={{ width: '100%', height: '140px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--series-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--series-1)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
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
              domain={['auto', 'auto']}
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
                `${typeof value === 'number' ? value.toFixed(1) : String(value ?? '')} ${unit}`,
                'Value',
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--series-1)"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
