import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { UploadCloud, FileText, Users, TrendingUp, AlertTriangle, Clock, ChevronUp, ChevronDown } from 'lucide-react';

// --- Type Definitions ---
type Customer = {
  id: number;
  name: string;
  age: number;
  gender: string;
  churn_prob: number;
  tenure: number;
  citytier: number;
  satisfactionscore: number;
  complain: number;
};

type Stats = {
  at_risk: number;
  likely_to_stay: number;
  avg_tenure_churned: number;
  avg_tenure_retained: number;
  churn_rate_by_city: { [key: string]: number };
  complaint_impact: {
    with_complaint: number;
    without_complaint: number;
  };
};

type Segments = {
  "High-Value At-Risk": number;
  "New & Unhappy": number;
  "Loyal Champions": number;
  "New & Promising": number;
  "Other": number;
};

type DashboardProps = {
  stats: Stats;
  customers: Customer[];
  segments: Segments;
};

type SortKeys = keyof Customer;

// --- Helper Components ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, unit = '' }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-start">
        <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}{unit}</p>
        </div>
    </div>
);

// --- Dashboard Component ---
export default function ChurnDashboard({ stats, customers, segments }: DashboardProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: string } | null>({ key: 'churn_prob', direction: 'descending' });
  const [activeSegment, setActiveSegment] = useState<string>('All');

  const getCustomerSegment = (customer: Customer): keyof Segments | 'Other' => {
    const { tenure, churn_prob } = customer;
    if (tenure > 12 && churn_prob > 0.6) return "High-Value At-Risk";
    if (tenure <= 3 && churn_prob > 0.6) return "New & Unhappy";
    if (tenure > 12 && churn_prob <= 0.3) return "Loyal Champions";
    if (tenure <= 3 && churn_prob <= 0.3) return "New & Promising";
    return "Other";
  };

  const filteredCustomers = useMemo(() => {
    if (activeSegment === 'All') {
      return customers;
    }
    return customers.filter(c => getCustomerSegment(c) === activeSegment);
  }, [customers, activeSegment]);

  const sortedCustomers = useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredCustomers, sortConfig]);

  const requestSort = (key: SortKeys) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKeys) => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronUp className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const segmentsData = Object.entries(segments).map(([name, value]) => ({ name, value }));
  const cityChurnData = Object.entries(stats.churn_rate_by_city).map(([tier, rate]) => ({
    name: `Tier ${tier}`,
    "Churn Rate": parseFloat(rate.toFixed(1)),
  }));
  const SEGMENT_COLORS: { [key: string]: string } = {
    "High-Value At-Risk": "#EF4444",
    "New & Unhappy": "#F97316",
    "Loyal Champions": "#22C55E",
    "New & Promising": "#3B82F6",
    "Other": "#6B7280",
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Churn Intelligence</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="At Risk" value={stats.at_risk} icon={<AlertTriangle />} unit=" customers" />
        <StatCard title="Avg. Churned Tenure" value={stats.avg_tenure_churned} icon={<Clock />} unit=" months" />
        <StatCard title="Likely to Stay" value={stats.likely_to_stay} icon={<Users />} unit=" customers" />
        <StatCard title="Avg. Retained Tenure" value={stats.avg_tenure_retained} icon={<TrendingUp />} unit=" months" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Customer Segments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentsData} onClick={(data) => setActiveSegment(data?.activeLabel || 'All')}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
              <Bar dataKey="value" name="Customers">
                {segmentsData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={SEGMENT_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Churn Rate by City Tier</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityChurnData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="Churn Rate" fill="#8B5CF6" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Customer Details: <span className="text-indigo-600">{activeSegment}</span></h2>
            {activeSegment !== 'All' && (
                <button onClick={() => setActiveSegment('All')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Show All Customers</button>
            )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {([
                  { key: 'name', label: 'Name' },
                  { key: 'churn_prob', label: 'Churn Prob.' },
                  { key: 'tenure', label: 'Tenure' },
                  { key: 'satisfactionscore', label: 'Satisfaction' },
                  { key: 'citytier', label: 'City Tier' },
                ] as { key: SortKeys, label: string }[]).map(({ key, label }) => (
                  <th key={key} className="px-4 py-3 border-b-2 border-gray-200 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => requestSort(key)}>
                    <div className="flex items-center">{label} {getSortIcon(key)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap">{c.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-bold ${c.churn_prob > 0.7 ? 'text-red-600' : c.churn_prob > 0.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {(c.churn_prob * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.tenure} months</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.satisfactionscore} / 5</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.citytier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}