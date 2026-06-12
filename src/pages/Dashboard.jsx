import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOverview } from '../api/stats.api';
import { getInsights } from '../api/agent.api';
import { useAgent } from '../context/AgentContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { SkeletonStat, SkeletonTable, SkeletonCard } from '../components/ui/Skeleton';
import { getGreeting, formatPercentage, formatDate } from '../utils/formatters';
import {
  Users,
  Send,
  CheckCircle,
  Eye,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { openPanel, sendToAgent } = useAgent();

  // Fetch Stats Overview
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: getOverview,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: false
  });

  const forceRefreshRef = useRef(false);

  // Fetch AI Insights
  const { data: insightsData, isLoading: insightsLoading, refetch: refetchInsights, isRefetching: insightsRefetching } = useQuery({
    queryKey: ['dashboard-insights'],
    queryFn: async () => {
      const result = await getInsights(forceRefreshRef.current);
      forceRefreshRef.current = false; // reset after call
      return result;
    },
    refetchOnWindowFocus: false, // Prevent spamming Gemini on window focus
    staleTime: Infinity // Only fetches on first mount or when manually refetched
  });

  const handleRefreshInsights = () => {
    forceRefreshRef.current = true;
    refetchInsights();
  };

  const handleStartCampaign = (prompt) => {
    openPanel();
    sendToAgent(prompt);
  };

  const overview = statsData?.data || {};
  const recentCampaigns = overview.recentCampaigns || [];
  const insights = (insightsData?.data || []).filter(ins => ins.audienceSize > 0);

  // Prepare chart data from recent campaigns
  const chartData = [...recentCampaigns]
    .reverse()
    .map(c => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + '…' : c.name,
      delivered: c.stats?.delivered || 0,
      opened: c.stats?.opened || 0,
      clicked: c.stats?.clicked || 0
    }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Marketer'}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Here's the performance overview for {localStorage.getItem('xeno_workspace_name') || 'Lumière Brand'} campaigns today.
          </p>
        </div>
        
        <div className="text-xs bg-surface-card border border-border px-4 py-2 rounded-xl text-text-secondary font-medium">
          Date: {formatDate(new Date())}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, idx) => <SkeletonStat key={idx} />)
        ) : (
          <>
            <StatCard
              title="Total Shoppers"
              value={overview.totalCustomers || 0}
              icon={Users}
            />
            <StatCard
              title="Campaigns Executed"
              value={overview.totalCampaigns || 0}
              icon={Send}
            />
            <StatCard
              title="Avg Delivery Rate"
              value={formatPercentage(overview.avgDeliveryRate || 0)}
              icon={CheckCircle}
            />
            <StatCard
              title="Avg Open Rate"
              value={formatPercentage(overview.avgOpenRate || 0)}
              icon={Eye}
            />
          </>
        )}
      </div>

      {/* Middle row: Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary-light" />
              <span>Campaign Funnel Performance</span>
            </h4>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Last 7 Campaigns
            </span>
          </div>

          <div className="h-72 w-full">
            {statsLoading ? (
              <div className="h-full w-full bg-surface-elevated animate-pulse rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary italic">
                No campaign performance data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3E" vertical={false} />
                  <XAxis dataKey="name" stroke="#9090A8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9090A8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1A1A24',
                      border: '1px solid #2E2E3E',
                      borderRadius: '8px',
                      color: '#F0F0F5',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="delivered" name="Delivered" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="opened" name="Opened" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="clicked" name="Clicked" fill="#6C63FF" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6 flex flex-col justify-between h-[360px]">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 flex-shrink-0">
              <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <span>Proactive Campaign Insights</span>
              </h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefreshInsights}
                  disabled={insightsLoading || insightsRefetching}
                  className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface-elevated/50 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
                  title="Refresh Insights"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${(insightsLoading || insightsRefetching) ? 'animate-spin text-primary' : ''}`} />
                </button>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1.5 scrollbar-thin">
              {(insightsLoading || insightsRefetching) ? (
                Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="h-20 bg-surface-elevated animate-pulse rounded-xl" />
                ))
              ) : insights.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2 text-text-muted">
                  <AlertCircle className="h-8 w-8 text-text-muted/40 animate-pulse" />
                  <span className="text-xs italic">No proactive insights available today. Try adding customers.</span>
                </div>
              ) : (
                insights.map((ins, idx) => {
                  const urgencyColors = {
                    high: 'danger',
                    medium: 'warning',
                    low: 'success'
                  };
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-surface-elevated/35 border border-border/50 rounded-xl hover:border-primary/20 transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-text-primary leading-snug group-hover:text-primary-light transition-colors">
                          {ins.title}
                        </span>
                        <Badge variant={urgencyColors[ins.urgency] || 'default'} className="px-1.5 py-0.5 text-[8px] uppercase">
                          {ins.urgency}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-normal">{ins.description}</p>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                        <span className="text-text-muted">Audience: <strong>{ins.audienceSize}</strong></span>
                        <button
                          onClick={() => handleStartCampaign(ins.prebuiltPrompt)}
                          className="text-primary-light hover:text-primary transition-colors flex items-center space-x-0.5 font-bold"
                        >
                          <span>Start Campaign</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Campaigns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">Recent Campaigns</h4>
          <Link to="/campaigns" className="text-xs text-primary-light hover:underline font-semibold">
            All Campaigns
          </Link>
        </div>

        {statsLoading ? (
          <SkeletonTable rows={4} cols={5} />
        ) : recentCampaigns.length === 0 ? (
          <div className="glass-card p-8 text-center text-xs text-text-secondary italic">
            No marketing campaigns have been created yet. Open the AI Agent panel or click the button in Campaigns page to start!
          </div>
        ) : (
          <div className="glass-card overflow-hidden bg-surface-card border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/20 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th className="px-6 py-4">Campaign Name</th>
                    <th className="px-6 py-4">Audience Segment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Audience Size</th>
                    <th className="px-6 py-4 text-right">Delivery Rate</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {recentCampaigns.map((c) => {
                    const statusColors = {
                      draft: 'default',
                      running: 'info',
                      completed: 'success',
                      failed: 'danger'
                    };
                    return (
                      <tr key={c._id} className="hover:bg-surface-elevated/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary">{c.name}</td>
                        <td className="px-6 py-4 text-text-secondary">{c.segmentId?.name || 'Seeded Cohort'}</td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[c.status] || 'default'} showDot={c.status === 'running'}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-text-secondary">
                          {c.stats?.total || c.segmentId?.audienceCount || 0}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-text-primary">
                          {c.stats ? `${c.stats.deliveryRate}%` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/campaigns/${c._id}`}
                            className="text-xs font-semibold text-primary-light hover:text-primary transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
