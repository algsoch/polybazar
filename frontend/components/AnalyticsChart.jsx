'use client';

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 shadow-dropdown rounded-lg border border-neutral-border">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-small" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0B6DF4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0B6DF4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0B6DF4"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Revenue"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="orders" fill="#0B6DF4" radius={[4, 4, 0, 0]} name="Orders" />
        <Bar dataKey="completed" fill="#00BFA6" radius={[4, 4, 0, 0]} name="Completed" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PriceHistoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} domain={['auto', 'auto']} tickFormatter={(value) => `₹${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#0B6DF4"
          strokeWidth={2}
          dot={{ fill: '#0B6DF4', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Price (₹/kg)"
        />
        <Line
          type="monotone"
          dataKey="average"
          stroke="#00BFA6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="Market Avg"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis type="number" stroke="#6B7280" fontSize={12} />
        <YAxis type="category" dataKey="category" stroke="#6B7280" fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#0B6DF4" radius={[0, 4, 4, 0]} name="Products" />
      </BarChart>
    </ResponsiveContainer>
  );
}
