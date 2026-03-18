import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS = {
  Residential: '#10b981',
  Special: '#a855f7',
  Utilities: '#6366f1',
  Religious: '#3b82f6',
  Municipal: '#ef4444',
  Educational: '#8b5cf6',
  Recreational: '#22c55e',
  Commercial: '#f59e0b',
  Unknown: '#94a3b8',
  Health: '#ec4899'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: '0.8rem',
        fontWeight: 500,
        color: '#1e293b',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[data.name] || '#ccc' }} />
          <span>{data.name}:</span>
          <span style={{ fontWeight: 700 }}>{data.value.toLocaleString()} parcels</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ParcelRowChart({ data }) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const chartHeight = Math.max(200, sortedData.length * 40);

  return (
    <div style={{ width: '100%', height: chartHeight + 20, marginTop: 15 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis 
            type="number" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
            width={85}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
            animationDuration={250}
          />
          <Bar 
            dataKey="value" 
            radius={[0, 6, 6, 0]} 
            barSize={20}
            animationDuration={1000}
            label={{ position: 'right', fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, formatter: (val) => val.toLocaleString() }}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
