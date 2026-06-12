import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getWorkspaceSummary,
  getActivities,
  getWorkspaces,
  createWorkspace
} from '../api/workspace.api';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { SkeletonStat } from '../components/ui/Skeleton';
import {
  Send,
  Filter,
  Users,
  MessageSquare,
  Zap,
  RefreshCw,
  UserPlus,
  Upload,
  Briefcase,
  ChevronRight,
  Clock,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';

const ACTIVITY_CONFIG = {
  campaign_created: {
    icon: Send,
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    badgeVariant: 'warning'
  },
  campaign_sent: {
    icon: Zap,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    badgeVariant: 'success'
  },
  campaign_completed: {
    icon: Zap,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    badgeVariant: 'success'
  },
  segment_created: {
    icon: Filter,
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    badgeVariant: 'info'
  },
  segment_updated: {
    icon: RefreshCw,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    badgeVariant: 'purple'
  },
  segment_refreshed: {
    icon: RefreshCw,
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    badgeVariant: 'purple'
  },
  customer_created: {
    icon: UserPlus,
    colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    badgeVariant: 'info'
  },
  customers_imported: {
    icon: Upload,
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    badgeVariant: 'success'
  }
};

export default function Workspace() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activities, setActivities] = useState([]);
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Active workspace state from localStorage
  const [activeWsId, setActiveWsId] = useState(() => {
    const saved = localStorage.getItem('xeno_workspace_id');
    return (saved === 'null' || saved === 'undefined' || !saved) ? null : saved;
  });

  // Fetch workspaces list
  const { data: workspacesData, isLoading: workspacesLoading, refetch: refetchWorkspaces } = useQuery({
    queryKey: ['workspaces-list'],
    queryFn: getWorkspaces,
    refetchOnWindowFocus: false
  });

  const workspaces = workspacesData?.data || [];

  // Auto-select first workspace if none active or if active workspace is not in workspaces list
  useEffect(() => {
    if (workspaces.length > 0) {
      const exists = workspaces.some(ws => ws._id === activeWsId);
      if (!exists) {
        handleSwitchWorkspace(workspaces[0]._id, workspaces[0].name);
      }
    } else {
      setActiveWsId(null);
      localStorage.removeItem('xeno_workspace_id');
      localStorage.removeItem('xeno_workspace_name');
    }
  }, [workspaces, activeWsId]);

  // Reset page and timeline when active workspace changes
  useEffect(() => {
    setPage(1);
    setActivities([]);
  }, [activeWsId]);

  // Fetch Workspace stats overview
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['workspace-summary', activeWsId],
    queryFn: getWorkspaceSummary,
    enabled: !!activeWsId,
    refetchInterval: 30000,
    refetchOnWindowFocus: false
  });

  // Fetch paginated activities
  const { data: activitiesData, isLoading: activitiesLoading, isFetching: activitiesFetching } = useQuery({
    queryKey: ['workspace-activities', activeWsId, page],
    queryFn: () => getActivities(page),
    enabled: !!activeWsId,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  // Create Workspace Mutation
  const createWsMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(`Workspace "${res.data.name}" created!`);
        setNewWsName('');
        setIsCreating(false);
        queryClient.invalidateQueries({ queryKey: ['workspaces-list'] });
        handleSwitchWorkspace(res.data._id, res.data.name);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to create workspace');
    }
  });

  // Accumulate activities
  useEffect(() => {
    if (activitiesData?.success && activitiesData?.data) {
      setActivities(prev => {
        const existingIds = new Set(prev.map(a => a._id));
        const newItems = activitiesData.data.filter(a => !existingIds.has(a._id));
        return [...prev, ...newItems];
      });
    }
  }, [activitiesData]);

  const handleSwitchWorkspace = (id, name) => {
    localStorage.setItem('xeno_workspace_id', id);
    localStorage.setItem('xeno_workspace_name', name);
    setActiveWsId(id);
    toast.success(`Switched to "${name}"`);
    // Invalidate everything to trigger full reload
    queryClient.invalidateQueries();
  };

  const handleCreateWorkspaceSubmit = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    createWsMutation.mutate({ name: newWsName.trim(), description: 'Custom workspace' });
  };

  const summary = summaryData?.data || {};
  const counts = summary.counts || { campaigns: 0, segments: 0, customers: 0, messages: 0 };
  const recentCampaigns = summary.recentCampaigns || [];
  const recentSegments = summary.recentSegments || [];
  const recentCustomers = summary.recentCustomers || [];

  const pagination = activitiesData?.pagination || { page: 1, pages: 1, total: 0 };
  const hasMore = page < pagination.pages;

  const handleLoadMore = () => {
    if (hasMore && !activitiesFetching) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-primary pb-10">
      {/* Title Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary-light/5 to-transparent border border-border/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary font-display flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary-light" />
            <span>Workspace Switcher</span>
          </h2>
          <p className="text-xs text-text-secondary">
            Select a workspace below. Data in the Dashboard, Customers, Segments, and Campaigns will adapt to your active workspace.
          </p>
        </div>
      </div>

      {/* Workspace Selection Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          <span>Your Workspaces ({workspaces.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspacesLoading ? (
            Array(3).fill(0).map((_, idx) => (
              <div key={idx} className="glass-card p-6 h-[140px] bg-surface-card animate-pulse rounded-xl" />
            ))
          ) : (
            <>
              {workspaces.map((ws) => {
                const isActive = ws._id === activeWsId;
                return (
                  <motion.div
                    key={ws._id}
                    whileHover={{ scale: 1.02 }}
                    className={`glass-card p-6 cursor-pointer flex flex-col justify-between h-[140px] transition-all relative overflow-hidden ${
                      isActive
                        ? 'border-primary shadow-lg shadow-primary/10 bg-primary/5'
                        : 'border-border/80 hover:border-primary/40'
                    }`}
                    onClick={() => handleSwitchWorkspace(ws._id, ws.name)}
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-text-primary text-sm tracking-tight truncate">
                        {ws.name}
                      </h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2">
                        {ws.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] text-text-muted font-mono truncate">
                        ID: {ws._id.slice(-6)}
                      </span>
                      {isActive ? (
                        <Badge variant="success" className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider">
                          Active Space
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-primary-light hover:underline font-bold">
                          Switch Space
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Create Workspace Card */}
              <div className="glass-card p-6 border-dashed border-2 border-border/80 hover:border-primary/40 transition-colors flex flex-col justify-center h-[140px]">
                {isCreating ? (
                  <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Workspace Name"
                      value={newWsName}
                      onChange={(e) => setNewWsName(e.target.value)}
                      className="w-full bg-surface-elevated border border-border text-xs rounded-lg p-2 text-text-primary outline-none focus:border-primary"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-2 py-1 text-[10px] bg-surface-elevated border border-border hover:border-border-hover rounded text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createWsMutation.isPending || !newWsName.trim()}
                        className="px-2.5 py-1 text-[10px] bg-primary hover:bg-primary-dark rounded text-white font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-text-secondary hover:text-primary transition-colors font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Create Workspace</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {activeWsId && (
        <>
          {/* Active Workspace Stats Row */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Workspace Summary: {localStorage.getItem('xeno_workspace_name')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryLoading ? (
                Array(4).fill(0).map((_, idx) => <SkeletonStat key={idx} />)
              ) : (
                <>
                  <StatCard
                    title="Total Campaigns"
                    value={counts.campaigns}
                    icon={Send}
                  />
                  <StatCard
                    title="Total Segments"
                    value={counts.segments}
                    icon={Filter}
                  />
                  <StatCard
                    title="Total Customers"
                    value={counts.customers}
                    icon={Users}
                  />
                  <StatCard
                    title="Total Messages"
                    value={counts.messages}
                    icon={MessageSquare}
                  />
                </>
              )}
            </div>
          </div>

          {/* Recent Work Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Campaigns */}
            <div className="glass-card p-6 flex flex-col justify-between h-[450px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                    <Send className="h-4 w-4 text-amber-400" />
                    <span>Recent Campaigns</span>
                  </h4>
                  <Link to="/campaigns" className="text-[10px] text-primary-light hover:underline font-bold uppercase tracking-wider">
                    All
                  </Link>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1.5 scrollbar-thin">
                  {summaryLoading ? (
                    Array(4).fill(0).map((_, idx) => <div key={idx} className="h-14 bg-surface-elevated animate-pulse rounded-xl" />)
                  ) : recentCampaigns.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-6 text-center">No campaigns yet.</p>
                  ) : (
                    recentCampaigns.map((c) => {
                      const statusColors = {
                        draft: 'default',
                        running: 'info',
                        completed: 'success',
                        failed: 'danger'
                      };
                      return (
                        <Link
                          key={c._id}
                          to={`/campaigns/${c._id}`}
                          className="flex items-center justify-between p-3 bg-surface-elevated/35 border border-border/50 rounded-xl hover:border-primary/20 hover:bg-surface-elevated/50 transition-all group"
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <p className="text-xs font-semibold text-text-primary truncate group-hover:text-primary-light transition-colors">
                              {c.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                              <span className="uppercase">{c.channel}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <Badge variant={statusColors[c.status] || 'default'} className="px-1.5 py-0.5 text-[9px] uppercase font-bold">
                            {c.status}
                          </Badge>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Recent Segments */}
            <div className="glass-card p-6 flex flex-col justify-between h-[450px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-blue-400" />
                    <span>Recent Segments</span>
                  </h4>
                  <Link to="/segments" className="text-[10px] text-primary-light hover:underline font-bold uppercase tracking-wider">
                    All
                  </Link>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1.5 scrollbar-thin">
                  {summaryLoading ? (
                    Array(4).fill(0).map((_, idx) => <div key={idx} className="h-14 bg-surface-elevated animate-pulse rounded-xl" />)
                  ) : recentSegments.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-6 text-center">No segments yet.</p>
                  ) : (
                    recentSegments.map((s) => (
                      <Link
                        key={s._id}
                        to="/segments"
                        className="flex items-center justify-between p-3 bg-surface-elevated/35 border border-border/50 rounded-xl hover:border-primary/20 hover:bg-surface-elevated/50 transition-all group"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <p className="text-xs font-semibold text-text-primary truncate group-hover:text-primary-light transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="info" className="px-1.5 py-0.5 text-[9px] font-bold">
                          {s.audienceCount} users
                        </Badge>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Customers */}
            <div className="glass-card p-6 flex flex-col justify-between h-[450px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-text-primary flex items-center space-x-2">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span>Recent Shoppers</span>
                  </h4>
                  <Link to="/customers" className="text-[10px] text-primary-light hover:underline font-bold uppercase tracking-wider">
                    All
                  </Link>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1.5 scrollbar-thin">
                  {summaryLoading ? (
                    Array(4).fill(0).map((_, idx) => <div key={idx} className="h-14 bg-surface-elevated animate-pulse rounded-xl" />)
                  ) : recentCustomers.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-6 text-center">No shoppers yet.</p>
                  ) : (
                    recentCustomers.map((c) => (
                      <Link
                        key={c._id}
                        to="/customers"
                        className="flex items-center justify-between p-3 bg-surface-elevated/35 border border-border/50 rounded-xl hover:border-primary/20 hover:bg-surface-elevated/50 transition-all group"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <p className="text-xs font-semibold text-text-primary truncate group-hover:text-primary-light transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[10px] text-text-secondary truncate">{c.email || 'No Email'}</p>
                        </div>
                        <Badge variant="default" className="px-1.5 py-0.5 text-[9px] uppercase font-bold">
                          {c.source || 'manual'}
                        </Badge>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="glass-card p-6 space-y-6">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-text-primary flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary-light" />
                <span>Workspace Timeline</span>
              </h4>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Workspace activities ({pagination.total || 0})
              </span>
            </div>

            {activities.length === 0 && activitiesLoading ? (
              <div className="space-y-4 py-4">
                {Array(3).fill(0).map((_, idx) => (
                  <div key={idx} className="h-16 bg-surface-elevated animate-pulse rounded-xl" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-text-secondary italic text-xs">
                No timeline records for this workspace. Start executing campaigns or adding customers.
              </div>
            ) : (
              <div className="relative border-l border-border/60 ml-4 pl-6 space-y-6">
                <AnimatePresence initial={false}>
                  {activities.map((act, index) => {
                    const conf = ACTIVITY_CONFIG[act.type] || {
                      icon: Briefcase,
                      colorClass: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
                      badgeVariant: 'default'
                    };
                    const Icon = conf.icon;
                    
                    let linkPath = null;
                    if (act.resourceType === 'campaign') {
                      linkPath = `/campaigns/${act.resourceId}`;
                    } else if (act.resourceType === 'segment') {
                      linkPath = `/segments`;
                    } else if (act.resourceType === 'customer') {
                      linkPath = `/customers`;
                    }

                    return (
                      <motion.div
                        key={act._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                        className="relative group"
                      >
                        <div className={`absolute -left-[37px] top-0.5 p-1.5 rounded-full border border-border bg-surface-card ${conf.colorClass} group-hover:scale-110 transition-transform`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 bg-surface-elevated/20 hover:bg-surface-elevated/45 p-4 rounded-xl border border-border/50 hover:border-primary/15 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs font-semibold text-text-primary">{act.title}</h5>
                              <Badge variant={conf.badgeVariant} className="px-1 py-0 text-[8px] uppercase tracking-wider">
                                {act.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            {act.description && (
                              <p className="text-xs text-text-secondary leading-relaxed">{act.description}</p>
                            )}
                            <span className="text-[10px] text-text-muted flex items-center gap-1 mt-1 font-medium">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</span>
                            </span>
                          </div>
                          
                          {linkPath && (
                            <Link
                              to={linkPath}
                              className="self-start md:self-center text-primary-light hover:text-primary hover:underline text-[11px] font-bold flex items-center gap-1 flex-shrink-0 group/link"
                            >
                              <span>View Details</span>
                              <ChevronRight className="h-3.5 w-3.5 transform group-hover/link:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {hasMore && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={activitiesFetching}
                      className="px-5 py-2 text-xs font-semibold text-text-primary bg-surface-elevated hover:bg-surface-elevated/85 border border-border hover:border-border-hover transition-colors rounded-xl disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {activitiesFetching ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load More Activities</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
