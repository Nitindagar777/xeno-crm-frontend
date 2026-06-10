import React from 'react';
import { Users, Sparkles, RefreshCw, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function SegmentCard({
  segment,
  onUseCampaign,
  onEdit,
  onRefresh,
  onDelete,
  isRefreshing = false
}) {
  const {
    _id,
    name,
    description,
    audienceCount = 0,
    createdBy = 'manual',
    rules = {},
    updatedAt
  } = segment;

  // Format first two conditions into readable text
  const getConditionsSummary = () => {
    if (!rules || !rules.conditions || rules.conditions.length === 0) return 'No rules defined';
    
    const fieldNames = {
      totalSpend: 'Spend',
      orderCount: 'Orders',
      avgOrderValue: 'Avg Order',
      daysSinceLastOrder: 'Days Since Order',
      lastOrderDate: 'Last Order',
      city: 'City',
      gender: 'Gender',
      tags: 'Tags'
    };

    const summaries = rules.conditions.slice(0, 2).map((c) => {
      const fieldName = fieldNames[c.field] || c.field;
      let displayVal = c.value;
      if (Array.isArray(displayVal)) {
        displayVal = displayVal.length > 1 ? `${displayVal[0]} +${displayVal.length - 1}` : displayVal[0];
      }
      return `${fieldName} ${c.operator} ${displayVal}`;
    });

    if (rules.conditions.length > 2) {
      summaries.push(`+${rules.conditions.length - 2} more`);
    }

    return summaries.join(', ');
  };

  const isAI = createdBy === 'ai';

  return (
    <div className="glass-card-hover p-6 flex flex-col justify-between h-56 relative overflow-hidden bg-surface-card border-border">
      {isAI && (
        <div className="absolute top-0 right-0 bg-primary/10 border-b border-l border-primary/20 text-primary-light text-[10px] font-bold py-1.5 px-3 rounded-bl-xl flex items-center space-x-1.5 shadow-sm">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>AI Created</span>
        </div>
      )}

      <div className="space-y-2.5">
        <div>
          <h5 className="font-semibold text-text-primary text-sm truncate pr-16" title={name}>
            {name}
          </h5>
          <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed" title={description}>
            {description || 'No description provided.'}
          </p>
        </div>

        {/* Info pills */}
        <div className="flex items-center space-x-3 text-xs pt-1">
          <div className="inline-flex items-center text-text-secondary bg-surface px-2.5 py-1.5 rounded-lg border border-border/60">
            <Users className="h-3.5 w-3.5 mr-1.5 text-primary-light" />
            <span className="font-bold text-text-primary">{audienceCount}</span>
            <span className="ml-1 text-text-muted">customers</span>
          </div>

          <div className="text-[10px] text-text-muted font-medium bg-surface-elevated/40 border border-border/40 px-2 py-1.5 rounded-lg truncate max-w-[150px]">
            {getConditionsSummary()}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-[10px] text-text-muted">
          Refreshed: {formatDate(updatedAt)}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* Refresh Action */}
          <button
            onClick={() => onRefresh(_id)}
            disabled={isRefreshing}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors disabled:opacity-50"
            title="Refresh audience size"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          {/* Edit Action */}
          <button
            onClick={() => onEdit(segment)}
            className="p-2 text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors"
            title="Edit segment"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          {/* Delete Action */}
          <button
            onClick={() => onDelete(_id)}
            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
            title="Delete segment"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Use in Campaign Action */}
          <button
            onClick={() => onUseCampaign(segment)}
            className="p-2 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
            title="Use in Campaign"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
