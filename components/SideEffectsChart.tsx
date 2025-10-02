import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SideEffectChartItem } from '../types';

interface SideEffectsChartProps {
  data: SideEffectChartItem[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
        <p className="font-bold">{data.name}</p>
        <p className="text-gray-600">Frequency: {data.frequencyDescription}</p>
        <p className="text-gray-600">Est. Occurrence: {data.frequencyPercent}%</p>
      </div>
    );
  }

  return null;
};

export const SideEffectsChart: React.FC<SideEffectsChartProps> = ({ data }) => {
  // Recharts horizontal bar chart needs `layout="vertical"`
  // YAxis is the category axis, XAxis is the value axis
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="%" domain={[0, 'dataMax + 5']} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100} 
            tick={{ fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(238, 242, 255, 0.6)'}} />
          <Bar dataKey="frequencyPercent" fill="#4f46e5" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};