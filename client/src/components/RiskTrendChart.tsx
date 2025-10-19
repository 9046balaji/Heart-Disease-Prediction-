import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RiskDataPoint {
  date: string;
  riskScore: number;
  bloodPressure: number;
  cholesterol: number;
}

interface RiskTrendChartProps {
  data: RiskDataPoint[];
}

export default function RiskTrendChart({ data }: RiskTrendChartProps) {
  // Format data for the chart
  const chartData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'riskScore') return [`${value}%`, 'Risk Score'];
              if (name === 'bloodPressure') return [value, 'Blood Pressure'];
              if (name === 'cholesterol') return [value, 'Cholesterol'];
              return [value, name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="riskScore" 
            name="Risk Score" 
            stroke="#ef4444" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="bloodPressure" 
            name="Blood Pressure" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          <Line 
            type="monotone" 
            dataKey="cholesterol" 
            name="Cholesterol" 
            stroke="#10b981" 
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}