'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
  data: Array<{ name: string; distance_km: number }>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export const RiskCharts: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--border))] p-4 rounded-lg h-72">
        <h3 className="text-sm font-semibold mb-4 text-[hsl(var(--muted))]">Distance to Infrastructure (km)</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
            <Bar dataKey="distance_km" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--border))] p-4 rounded-lg h-72">
        <h3 className="text-sm font-semibold mb-4 text-[hsl(var(--muted))]">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie data={data} dataKey="distance_km" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
