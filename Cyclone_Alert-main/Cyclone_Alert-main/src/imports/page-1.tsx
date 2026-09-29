import React from 'react';
import mockData from '@/data/mock-cyclone.json';
import { RiskCharts } from '@/components/risk/RiskCharts';

export default function RiskPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Infrastructure Risk Breakdown</h1>
      <RiskCharts data={mockData.infrastructure_risk} />
    </div>
  );
}
