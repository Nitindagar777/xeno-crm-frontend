import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Smartphone, Send, AlertTriangle, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Badge from '../ui/Badge';
import CampaignStatsBar from './CampaignStatsBar';

export default function CampaignCard({ campaign }) {
  const {
    _id,
    name,
    status = 'draft',
    channel = 'whatsapp',
    segmentId = {},
    createdBy = 'manual',
    createdAt,
    stats = null
  } = campaign;

  // Channel icon resolver
  const getChannelIcon = () => {
    switch (channel.toLowerCase()) {
      case 'whatsapp':
        return <MessageSquare className="h-4.5 w-4.5 text-success" />;
      case 'email':
        return <Mail className="h-4.5 w-4.5 text-primary-light" />;
      case 'sms':
        return <Smartphone className="h-4.5 w-4.5 text-info" />;
      case 'rcs':
        return <Send className="h-4.5 w-4.5 text-warning" />;
      default:
        return <Send className="h-4.5 w-4.5 text-text-secondary" />;
    }
  };

  // Status badge style resolver
  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Badge variant="default">Draft</Badge>;
      case 'running':
        return (
          <Badge variant="info" showDot className="animate-pulse-slow">
            Running
          </Badge>
        );
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const isAI = createdBy === 'ai';

  return (
    <div className="glass-card-hover p-6 flex flex-col justify-between h-64 bg-surface-card border-border">
      {/* Top Section */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-surface rounded-xl border border-border/80 flex items-center justify-center">
              {getChannelIcon()}
            </div>
            <div>
              <h5 className="font-semibold text-text-primary text-sm truncate max-w-[180px]" title={name}>
                {name}
              </h5>
              <span className="text-[10px] text-text-muted">
                Created {formatDate(createdAt)}
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Segment Info */}
        <div className="text-xs flex items-center justify-between text-text-secondary">
          <span className="truncate max-w-[150px] font-medium text-text-secondary">
            Audience: {segmentId?.name || 'Seeded Cohort'}
          </span>
          <span className="text-text-muted bg-surface px-2 py-0.5 rounded border border-border/60 text-[10px] font-bold">
            {segmentId?.audienceCount || stats?.total || 0} shoppers
          </span>
        </div>
      </div>

      {/* Progress Analytics stats */}
      <div className="space-y-3 pt-3 border-t border-border/40">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-text-muted tracking-wider">
          <span>Delivery Lifecycle Funnel</span>
          {stats && (
            <span className="text-primary-light">
              Delivered: {stats.deliveryRate}%
            </span>
          )}
        </div>
        
        {stats ? (
          <CampaignStatsBar stats={stats} />
        ) : (
          <div className="h-4 bg-surface-elevated/40 rounded border border-border/40 text-[10px] text-text-muted flex items-center justify-center italic">
            Campaign statistics not initialized yet
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="flex items-center justify-between pt-4.5">
        <div className="flex items-center space-x-1.5">
          {isAI && (
            <Badge variant="purple" className="text-[9px] font-semibold flex items-center space-x-1">
              <Sparkles className="h-2.5 w-2.5" />
              <span>AI Agent</span>
            </Badge>
          )}
        </div>

        <Link
          to={`/campaigns/${_id}`}
          className="text-xs font-semibold text-primary-light hover:text-primary transition-colors hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
