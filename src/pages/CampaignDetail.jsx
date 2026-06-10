import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCampaign, getCampaignStats, getCampaignLogs, getCampaignAnalysis } from '../api/campaign.api';
import usePolling from '../hooks/usePolling';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, formatDate, formatDateRelative, formatDateTime, formatPercentage } from '../utils/formatters';
import {
  ArrowLeft,
  Users,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CampaignDetail() {
  const { id } = useParams();
  const [logPage, setLogPage] = useState(1);
  const [logStatus, setLogStatus] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // 1. Fetch Campaign Info
  const { data: campaignRes, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-info', id],
    queryFn: () => getCampaign(id),
    refetchInterval: campaignRes => campaignRes?.state?.data?.data?.campaign?.status === 'running' ? 3000 : false,
    refetchIntervalInBackground: true
  });

  const campaign = campaignRes?.data?.campaign || {};
  const isRunning = campaign.status === 'running';
  const [wasRunning, setWasRunning] = useState(false);

  // 2. Poll Campaign Stats (Every 3 seconds if campaign is running)
  const { data: statsRes, refetch: refetchStats } = usePolling({
    queryKey: ['campaign-stats', id],
    queryFn: () => getCampaignStats(id),
    interval: 3000,
    enabled: isRunning
  });

  // 3. Poll Campaign Logs (Every 5 seconds if running)
  const { data: logsRes, refetch: refetchLogs } = useQuery({
    queryKey: ['campaign-logs', id, logPage, logStatus],
    queryFn: () => getCampaignLogs(id, { page: logPage, limit: 15, status: logStatus }),
    refetchInterval: isRunning ? 5000 : false,
    enabled: true
  });

  const { data: analysisRes, isLoading: analysisLoading } = useQuery({
    queryKey: ['campaign-analysis', id],
    queryFn: () => getCampaignAnalysis(id),
    enabled: campaign.status === 'completed',
    staleTime: Infinity
  });

  const campaignStatsData = statsRes?.data || campaignRes?.data?.stats || {};
  const logs = logsRes?.data?.logs || [];
  const logTotal = logsRes?.data?.total || 0;
  const logTotalPages = logsRes?.data?.totalPages || 1;

  // Request browser notification permissions on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Monitor campaign completion
  useEffect(() => {
    if (campaign.status === 'running') {
      setWasRunning(true);
    } else if (campaign.status === 'completed' && wasRunning) {
      setWasRunning(false);
      
      // Trigger browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Campaign Completed! 🎉', {
            body: `Campaign "${campaign.name}" has finished sending to all ${campaignStatsData?.total || 0} customers.`,
            tag: `campaign-complete-${id}`
          });
        } catch (err) {
          console.error('Failed to trigger browser notification:', err);
        }
      }
      
      toast.success('Campaign completed successfully!', { duration: 5000 });
    }
  }, [campaign.status, wasRunning, campaign.name, campaignStatsData?.total, id]);

  // Refetch data manually or toast when campaign completes
  useEffect(() => {
    if (isRunning) {
      setLastRefreshed(new Date());
    }
  }, [statsRes, logsRes]);

  // Render variables mock mapping
  const renderMessageSample = (template) => {
    if (!template) return '';
    return template
      .replace(/{{name}}/g, 'Ananya Patel')
      .replace(/{{firstName}}/g, 'Ananya')
      .replace(/{{city}}/g, 'Bangalore')
      .replace(/{{totalSpend}}/g, '₹24,500')
      .replace(/{{orderCount}}/g, '12')
      .replace(/{{avgOrderValue}}/g, '₹2,042')
      .replace(/{{lastOrderDate}}/g, '12 May 2026');
  };

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate delivery progress
  const progressPercent = campaignStatsData.total > 0
    ? Math.round(((campaignStatsData.delivered + campaignStatsData.failed) / campaignStatsData.total) * 100)
    : 0;

  // AI Review summary calculation
  const getAIAnalysisText = () => {
    if (campaign.status === 'draft') return 'Campaign is currently in draft. Send campaign to see AI analysis reviews.';
    if (isRunning) return 'Campaign is currently sending. AI post-campaign review will compile upon completion.';
    
    // completed or failed review
    const deliverRate = campaignStatsData.deliveryRate || 0;
    const openRate = campaignStatsData.openRate || 0;
    const clickRate = campaignStatsData.clickRate || 0;

    let analysis = `Your campaign reached a **${deliverRate}%** delivery rate across ${campaignStatsData.total} target shoppers. `;
    
    if (deliverRate > 80) {
      analysis += `This is **above your average of 78%**, demonstrating excellent queue processing. `;
    } else {
      analysis += `This falls slightly below your average of 78%, likely due to simulated carrier throttling. `;
    }

    if (campaign.channel === 'whatsapp' || campaign.channel === 'email') {
      analysis += `Open rate was solid at **${openRate}%** with **${clickRate}%** click-through. `;
      if (clickRate > 25) {
        analysis += `Engagement was strongest for VIP cohorts, indicating the personalization tags had high relevance.`;
      } else {
        analysis += `Recommend testing discount coupons in subject line next time to boost click rates.`;
      }
    } else {
      analysis += `SMS delivery completed within minutes. Recommend following up with WhatsApp channels for customers who remained unresponsive.`;
    }

    return analysis;
  };

  const getStatusBadge = (statusVal) => {
    const statusColors = {
      queued: 'default',
      sent: 'info',
      delivered: 'success',
      failed: 'danger',
      opened: 'purple',
      read: 'purple',
      clicked: 'warning'
    };
    return <Badge variant={statusColors[statusVal] || 'default'}>{statusVal}</Badge>;
  };

  const getChannelBadge = (chan) => {
    const channelColors = {
      whatsapp: 'success',
      sms: 'info',
      email: 'purple',
      rcs: 'warning'
    };
    return <Badge variant={channelColors[chan?.toLowerCase()] || 'default'}>{chan}</Badge>;
  };

  return (
    <div className="space-y-6 select-none animate-fade-in">
      {/* Back navigation header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/campaigns"
            className="p-2 border border-border bg-surface-card rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">{campaign.name}</h2>
            <div className="flex items-center space-x-2 text-xs text-text-secondary mt-1">
              <span className="capitalize">Channel: <strong>{campaign.channel}</strong></span>
              <span>•</span>
              <span>Created: {formatDateTime(campaign.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isRunning && (
            <div className="flex items-center space-x-2 text-xs text-text-secondary bg-surface-elevated/45 border border-border px-3.5 py-1.5 rounded-xl font-medium">
              <Clock className="h-4 w-4 text-primary animate-spin" />
              <span>Polling Live Stats (Last: {lastRefreshed.toLocaleTimeString()})</span>
            </div>
          )}
          <Badge variant={campaign.status === 'running' ? 'info' : campaign.status === 'completed' ? 'success' : 'default'} showDot={isRunning}>
            {campaign.status}
          </Badge>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-card p-5 flex items-center space-x-4 bg-surface-card">
          <div className="p-3 bg-surface border border-border rounded-xl text-primary"><Users className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Total Audience</span>
            <h4 className="text-lg font-bold text-text-primary mt-0.5">{campaignStatsData.total || 0}</h4>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center space-x-4 bg-surface-card">
          <div className="p-3 bg-surface border border-border rounded-xl text-info"><Send className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Sent</span>
            <h4 className="text-lg font-bold text-text-primary mt-0.5">{campaignStatsData.sent || 0}</h4>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center space-x-4 bg-surface-card">
          <div className="p-3 bg-surface border border-border rounded-xl text-success"><CheckCircle className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Delivered</span>
            <h4 className="text-lg font-bold text-text-primary mt-0.5">{campaignStatsData.delivered || 0}</h4>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center space-x-4 bg-surface-card">
          <div className="p-3 bg-surface border border-border rounded-xl text-danger"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Failed</span>
            <h4 className="text-lg font-bold text-text-primary mt-0.5">{campaignStatsData.failed || 0}</h4>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center space-x-4 bg-surface-card">
          <div className="p-3 bg-surface border border-border rounded-xl text-cyan-500"><ShoppingCart className="h-5 w-5" /></div>
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Converted</span>
            <h4 className="text-lg font-bold text-text-primary mt-0.5">{campaignStatsData.converted || 0}</h4>
          </div>
        </div>
      </div>

      {/* Campaign Sending Progress Bar */}
      {isRunning && (
        <div className="glass-card p-5 space-y-2.5 bg-surface-card border-border">
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-secondary font-medium">Orchestration Sending Progress</span>
            <span className="text-primary-light font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {/* Main split: Template details & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Template & previews */}
        <div className="glass-card p-6 space-y-4 bg-surface-card border-border">
          <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <FileText className="h-4.5 w-4.5 text-primary-light" />
            <span>Message Template Settings</span>
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">Template Body</span>
              <div className="bg-surface p-3 border border-border rounded-lg text-xs font-mono text-text-secondary whitespace-pre-wrap">
                {campaign.messageTemplate}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted">Sample Preview (Target: Ananya)</span>
              <div className="bg-primary/5 p-3 border border-primary/10 rounded-lg text-xs text-text-primary italic whitespace-pre-wrap">
                "{renderMessageSample(campaign.messageTemplate)}"
              </div>
            </div>
          </div>
        </div>

        {/* Funnel chart representation */}
        <div className="glass-card p-6 space-y-4 bg-surface-card border-border">
          <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
            <Eye className="h-4.5 w-4.5 text-primary-light" />
            <span>Delivery Conversion Funnel</span>
          </h4>

          {/* Simple HTML Funnel Blocks */}
          <div className="space-y-2.5 pt-2 text-xs">
            {[
              { label: 'Total Targeted', count: campaignStatsData.total || 0, percent: 100, color: 'bg-surface-elevated text-text-primary' },
              { label: 'Successfully Sent', count: campaignStatsData.sent || 0, percent: campaignStatsData.total > 0 ? Math.round((campaignStatsData.sent / campaignStatsData.total) * 100) : 0, color: 'bg-info/10 border-l-4 border-info text-text-secondary' },
              { label: 'Delivered', count: campaignStatsData.delivered || 0, percent: campaignStatsData.total > 0 ? Math.round((campaignStatsData.delivered / campaignStatsData.total) * 100) : 0, color: 'bg-emerald-500/10 border-l-4 border-emerald-500 text-text-secondary' },
              { label: 'Opened / Read', count: campaignStatsData.opened || 0, percent: campaignStatsData.total > 0 ? Math.round((campaignStatsData.opened / campaignStatsData.total) * 100) : 0, color: 'bg-blue-500/10 border-l-4 border-blue-500 text-text-secondary' },
              { label: 'Clicked Link', count: campaignStatsData.clicked || 0, percent: campaignStatsData.total > 0 ? Math.round((campaignStatsData.clicked / campaignStatsData.total) * 100) : 0, color: 'bg-purple-500/10 border-l-4 border-purple-500 text-text-secondary' },
              { label: 'Converted', count: campaignStatsData.converted || 0, percent: campaignStatsData.total > 0 ? Math.round((campaignStatsData.converted / campaignStatsData.total) * 100) : 0, color: 'bg-cyan-500/10 border-l-4 border-cyan-500 text-text-secondary' }
            ].map((fun, idx) => (
              <div key={idx} className={`p-3 rounded-lg flex items-center justify-between border border-border/35 ${fun.color}`}>
                <span className="font-medium">{fun.label}</span>
                <div className="flex items-center space-x-3 font-semibold">
                  <span>{fun.count}</span>
                  <span className="text-[10px] text-text-muted">({fun.percent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook Callback Logs table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">Communication Audit Logs</h4>
          
          {/* Status filter tabs */}
          <div className="flex space-x-1 border border-border bg-surface p-0.5 rounded-lg text-[10px] font-semibold text-text-secondary">
            {[
              { value: '', label: 'All' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'failed', label: 'Failed' },
              { value: 'opened', label: 'Opened' },
              { value: 'clicked', label: 'Clicked' },
              { value: 'converted', label: 'Converted' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setLogStatus(tab.value); setLogPage(1); }}
                className={`px-2.5 py-1 rounded ${
                  logStatus === tab.value ? 'bg-primary text-white' : 'hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="glass-card p-6 text-center text-xs text-text-muted italic bg-surface-card border-border">
            No audit records matches current filter status.
          </div>
        ) : (
          <div className="glass-card overflow-hidden bg-surface-card border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/25 text-text-secondary font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Medium</th>
                  <th className="px-6 py-3.5">Delivery Status</th>
                  <th className="px-6 py-3.5">Failure Reason</th>
                  <th className="px-6 py-3.5">Rendered Message</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-text-secondary">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-elevated/10 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-text-primary">{log.customerId?.name || 'Seeded Shopper'}</td>
                    <td className="px-6 py-3.5">{getChannelBadge(log.channel)}</td>
                    <td className="px-6 py-3.5">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-3.5 text-danger text-[10px] max-w-[150px] truncate" title={log.failureReason}>
                      {log.failureReason || '—'}
                    </td>
                    <td className="px-6 py-3.5 max-w-[300px] truncate" title={log.personalizedMessage}>
                      {log.personalizedMessage}
                    </td>
                    <td className="px-6 py-3.5 text-text-muted font-mono">{formatDateTime(log.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Logs Pagination controls */}
            {logTotalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-surface-elevated/15">
                <span className="text-[10px] text-text-muted">
                  Showing logs page {logPage} of {logTotalPages} ({logTotal} logs)
                </span>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setLogPage(p => Math.max(1, p - 1))}
                    disabled={logPage === 1}
                    className="p-1.5 border border-border bg-surface rounded text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                    disabled={logPage === logTotalPages}
                    className="p-1.5 border border-border bg-surface rounded text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Post-Campaign Review Analysis */}
      {campaign.status !== 'draft' && (
        <div className="glass-card p-6 bg-surface-card border-border/80 relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-primary-light">
            <Sparkles className="h-4.5 w-4.5" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Post-Campaign Analysis Review</span>
          </div>
          
          <div className="text-xs text-text-secondary leading-relaxed space-y-2">
            {analysisLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-surface-elevated rounded w-full" />
                <div className="h-3 bg-surface-elevated rounded w-5/6" />
                <div className="h-3 bg-surface-elevated rounded w-4/6" />
              </div>
            ) : (analysisRes?.data?.analysis || getAIAnalysisText()).split('\n').map((para, pIdx) => {
              const boldRegex = /\*\*(.*?)\*\*/g;
              const parts = [];
              let lastIndex = 0;
              let match;
              while ((match = boldRegex.exec(para)) !== null) {
                parts.push(para.substring(lastIndex, match.index));
                parts.push(<strong key={match.index} className="font-bold text-text-primary">{match[1]}</strong>);
                lastIndex = boldRegex.lastIndex;
              }
              parts.push(para.substring(lastIndex));
              return <p key={pIdx}>{parts.length > 0 ? parts : para}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
