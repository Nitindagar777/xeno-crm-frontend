import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMessageHistory } from '../api/history.api';
import { getCampaigns } from '../api/campaign.api';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { formatDate } from '../utils/formatters';
import {
  History,
  MessageSquare,
  Filter,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';

const CHANNELS = ['all', 'whatsapp', 'sms', 'email', 'rcs'];
const STATUSES = ['all', 'queued', 'sent', 'delivered', 'failed', 'opened', 'clicked'];

export default function MessageHistory() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  // Fetch campaigns for the dropdown filter
  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns-list-simple'],
    queryFn: () => getCampaigns(),
    refetchOnWindowFocus: false
  });

  const campaignsList = campaignsData?.data || [];

  // Build query params
  const params = {
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    channel: channelFilter !== 'all' ? channelFilter : undefined,
    campaignId: campaignFilter !== 'all' ? campaignFilter : undefined
  };

  // Fetch Message History
  const { data: historyData, isLoading, isFetching } = useQuery({
    queryKey: ['message-history', params],
    queryFn: () => getMessageHistory(params),
    keepPreviousData: true,
    refetchOnWindowFocus: false
  });

  const logs = historyData?.data || [];
  const pagination = historyData?.pagination || { page: 1, pages: 1, total: 0 };
  const totalPages = pagination.pages;
  const totalCount = pagination.total;

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, channelFilter, campaignFilter]);

  const channelColors = {
    whatsapp: 'success',
    sms: 'info',
    email: 'purple',
    rcs: 'warning'
  };

  const statusColors = {
    queued: 'default',
    sent: 'warning',
    delivered: 'success',
    failed: 'danger',
    opened: 'info',
    read: 'info',
    clicked: 'purple'
  };

  return (
    <div className="space-y-6 animate-fade-in text-text-primary pb-10">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary-light/5 to-transparent border border-border/60 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
            <History className="h-6 w-6 text-primary-light" />
            <span>Message Delivery History</span>
          </h2>
          <p className="text-xs text-text-secondary">
            Monitor delivery logs, status callbacks, and recipient opens/clicks in real-time across your channels.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-surface-card p-4 border border-border rounded-xl">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full lg:w-auto scrollbar-none pb-2 lg:pb-0">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0 ${
                statusFilter === status
                  ? 'bg-primary text-text-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-elevated/85'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end">
          {/* Campaign Selector */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Send className="h-3.5 w-3.5" />
              <span>Campaign:</span>
            </span>
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="bg-surface-elevated border border-border rounded-lg text-xs py-1.5 px-3 text-text-primary focus:outline-none focus:border-primary font-semibold select-none cursor-pointer w-full sm:w-auto sm:min-w-[150px] sm:max-w-[200px] truncate"
            >
              <option value="all">All Campaigns</option>
              {campaignsList.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Selector */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Filter className="h-3.5 w-3.5" />
              <span>Channel:</span>
            </span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-surface-elevated border border-border rounded-lg text-xs py-1.5 px-3 text-text-primary focus:outline-none focus:border-primary font-semibold select-none cursor-pointer w-full sm:w-auto sm:min-w-[120px]"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch} className="capitalize">
                  {ch === 'all' ? 'All Channels' : ch.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="space-y-4">
        {isLoading && !isFetching ? (
          <SkeletonTable rows={10} cols={6} />
        ) : logs.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center space-y-3">
            <MessageSquare className="h-10 w-10 text-text-muted/40 animate-pulse" />
            <p className="text-xs text-text-secondary italic">
              No delivery logs match your filter settings.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden bg-surface-card border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/20 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Shopper</th>
                    <th className="px-6 py-4">Channel</th>
                    <th className="px-6 py-4">Personalized Message</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-surface-elevated/15 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-text-secondary whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-primary max-w-[150px] truncate">
                        {log.campaignId ? (
                          <Link to={`/campaigns/${log.campaignId._id}`} className="hover:text-primary-light hover:underline transition-colors">
                            {log.campaignId.name}
                          </Link>
                        ) : (
                          <span className="text-text-muted italic">Deleted Campaign</span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[150px] truncate">
                        {log.customerId ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{log.customerId.name}</span>
                            <span className="text-[10px] text-text-muted">{log.customerId.email || 'No Email'}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted italic">Deleted Shopper</span>
                        )}
                      </td>
                      <td className="px-6 py-4 uppercase">
                        <Badge variant={channelColors[log.channel] || 'default'} className="px-1.5 py-0.5 text-[9px] font-bold">
                          {log.channel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary max-w-[300px] truncate" title={log.personalizedMessage}>
                        {log.personalizedMessage || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <Badge variant={statusColors[log.status] || 'default'} showDot={log.status === 'queued'} className="px-2 py-0.5 text-[9px] uppercase font-bold">
                            {log.status}
                          </Badge>
                          {log.failureReason && (
                            <span className="text-[9px] text-danger mt-1 max-w-[120px] truncate font-medium" title={log.failureReason}>
                              {log.failureReason}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-text-secondary">
              Showing page <strong className="text-text-primary">{page}</strong> of {totalPages} ({totalCount} total logged messages)
            </span>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border bg-surface-card rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-border bg-surface-card rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
