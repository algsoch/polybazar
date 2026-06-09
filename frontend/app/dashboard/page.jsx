'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCartIcon, 
  CubeIcon, 
  CurrencyRupeeIcon, 
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import AnalyticsChart from '@/components/AnalyticsChart';

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');

  // Mock data
  const stats = [
    {
      label: 'Total Sales',
      value: '₹24,580',
      change: '+12.5%',
      positive: true,
      icon: ShoppingCartIcon,
      color: 'primary',
    },
    {
      label: 'Active Listings',
      value: '18',
      change: '+3',
      positive: true,
      icon: CubeIcon,
      color: 'accent',
    },
    {
      label: 'Revenue',
      value: '₹8,240',
      change: '+8.2%',
      positive: true,
      icon: CurrencyRupeeIcon,
      color: 'success',
    },
    {
      label: 'Performance',
      value: '94%',
      change: '+2.1%',
      positive: true,
      icon: ArrowTrendingUpIcon,
      color: 'warning',
    },
  ];

  const recentOrders = [
    {
      id: 'ORD-2024-001',
      product: 'HDPE Granules - Virgin',
      buyer: 'TechPlast Industries',
      amount: '₹4,500',
      status: 'completed',
      date: 'Apr 8, 2024',
    },
    {
      id: 'ORD-2024-002',
      product: 'PP Recycled Pellets',
      buyer: 'GreenPack Solutions',
      amount: '₹3,200',
      status: 'pending',
      date: 'Apr 7, 2024',
    },
    {
      id: 'ORD-2024-003',
      product: 'PET Flakes - Clear',
      buyer: 'Polymer Tech Ltd',
      amount: '₹2,800',
      status: 'completed',
      date: 'Apr 6, 2024',
    },
    {
      id: 'ORD-2024-004',
      product: 'LDPE Film Grade',
      buyer: 'Eco Recyclers',
      amount: '₹1,950',
      status: 'processing',
      date: 'Apr 5, 2024',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-neutral-bg text-neutral-text border-neutral-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-gray-900 mb-2">Dashboard</h1>
          <p className="text-body text-neutral-muted">Welcome back! Here's your business at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const colorClass = stat.color === 'primary' ? 'text-primary bg-primary/10' :
                             stat.color === 'accent' ? 'text-accent bg-accent/10' :
                             stat.color === 'success' ? 'text-success bg-success/10' :
                             'text-warning bg-warning/10';
            
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-border hover:shadow-card-hover hover:border-neutral-text/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-button ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-small font-semibold text-success">
                    <ArrowUpRightIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-neutral-muted text-small mb-1">{stat.label}</p>
                <p className="text-h3 text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts and Orders Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Analytics Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 border border-neutral-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 text-gray-900">Sales Performance</h2>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-button text-small font-medium transition-all ${
                      period === p
                        ? 'bg-primary text-white'
                        : 'bg-neutral-bg text-neutral-text hover:bg-neutral-border'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <AnalyticsChart />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-border">
            <h2 className="text-h3 text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/sell"
                className="flex items-center gap-3 p-4 rounded-button bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 transition-all group"
              >
                <CubeIcon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-small font-semibold">List New Product</p>
                </div>
                <ArrowUpRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="/messages"
                className="flex items-center gap-3 p-4 rounded-button bg-accent/5 border border-accent/20 text-accent hover:bg-accent/10 transition-all group"
              >
                <DocumentIcon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-small font-semibold">View Messages</p>
                </div>
                <ArrowUpRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 p-4 rounded-button bg-success/5 border border-success/20 text-success hover:bg-success/10 transition-all group"
              >
                <ChartBarIcon className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-small font-semibold">Update Profile</p>
                </div>
                <ArrowUpRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-border overflow-hidden">
          <div className="p-6 border-b border-neutral-border">
            <div className="flex items-center justify-between">
              <h2 className="text-h3 text-gray-900">Recent Orders</h2>
              <Link href="#" className="text-primary hover:text-primary-600 font-medium text-small transition-colors">
                View All
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-bg border-b border-neutral-border">
                <tr>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Order ID</th>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Product</th>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Buyer</th>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Amount</th>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Status</th>
                  <th className="px-6 py-4 text-left text-small font-semibold text-neutral-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-bg/50 transition-colors">
                    <td className="px-6 py-4 text-small font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-small text-neutral-text">{order.product}</td>
                    <td className="px-6 py-4 text-small text-neutral-text">{order.buyer}</td>
                    <td className="px-6 py-4 text-small font-semibold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-small font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-small text-neutral-muted">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
