import React from 'react';
import { Filter, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

// Helper to convert rule operator to text
const getOperatorText = (op, val) => {
  switch (op) {
    case 'gt': return `greater than ${val}`;
    case 'lt': return `less than ${val}`;
    case 'gte': return `greater than or equal to ${val}`;
    case 'lte': return `less than or equal to ${val}`;
    case 'eq': return `equal to ${val}`;
    case 'neq': return `not equal to ${val}`;
    case 'in': return `in [${Array.isArray(val) ? val.join(', ') : val}]`;
    case 'nin': return `not in [${Array.isArray(val) ? val.join(', ') : val}]`;
    case 'contains': return `containing tag "${val}"`;
    default: return `${op} ${val}`;
  }
};

// Helper to convert field name to readable text
const getFieldText = (field) => {
  switch (field) {
    case 'totalSpend': return 'Total Spend';
    case 'orderCount': return 'Order Count';
    case 'avgOrderValue': return 'Average Order Value';
    case 'daysSinceLastOrder': return 'Days Since Last Order';
    case 'lastOrderDate': return 'Last Order Date';
    case 'firstOrderDate': return 'First Order Date';
    case 'city': return 'City';
    case 'gender': return 'Gender';
    case 'tags': return 'Tags';
    default: return field;
  }
};

// Render rule condition into a readable sentence
const renderRuleSentence = (cond) => {
  let displayVal = cond.value;
  if (cond.field === 'totalSpend' || cond.field === 'avgOrderValue') {
    displayVal = formatCurrency(cond.value);
  }
  return (
    <div className="flex items-center space-x-2 text-xs text-text-secondary bg-surface/50 px-3 py-2 border border-border/40 rounded-lg">
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <span>
        <strong className="text-text-primary">{getFieldText(cond.field)}</strong> is {getOperatorText(cond.operator, displayVal)}
      </span>
    </div>
  );
};

export default function AgentStepCard({ type, data, count, name, description }) {
  if (type === 'segment_proposal' && data) {
    const { logic = 'AND', conditions = [] } = data;
    return (
      <div className="glass-card p-4 space-y-3 mt-2 border-primary/20 bg-surface-card shadow-lg">
        <div className="flex items-center space-x-2 text-primary-light">
          <Filter className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Proposed Segment Rules</span>
        </div>

        {name && (
          <div className="border-b border-border/40 pb-2 space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Segment Name</span>
            <div className="text-xs font-bold text-text-primary">{name}</div>
            {description && (
              <div className="text-[11px] text-text-secondary leading-normal">{description}</div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <div className="text-xs text-text-muted">
            Logic: <span className="text-text-secondary font-semibold">{logic}</span>
          </div>
          <div className="space-y-1.5">
            {conditions.map((cond, idx) => (
              <React.Fragment key={idx}>{renderRuleSentence(cond)}</React.Fragment>
            ))}
          </div>
        </div>

        {count !== undefined && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
            <span className="text-text-muted">Audience Match Size:</span>
            <span className="bg-primary/20 text-primary-light px-2 py-0.5 rounded-full font-bold">
              {count} customers
            </span>
          </div>
        )}
      </div>
    );
  }

  if (type === 'message_proposal' && data) {
    // Render message preview with fake customer
    const sampleCustomer = {
      name: 'Priya Sharma',
      city: 'Mumbai',
      totalSpend: 15450,
      orderCount: 6,
      avgOrderValue: 2575,
      lastOrderDate: new Date()
    };

    const renderMessagePreview = (template) => {
      if (!template) return '';
      return template
        .replace(/{{name}}/g, sampleCustomer.name)
        .replace(/{{firstName}}/g, 'Priya')
        .replace(/{{city}}/g, sampleCustomer.city)
        .replace(/{{totalSpend}}/g, formatCurrency(sampleCustomer.totalSpend))
        .replace(/{{orderCount}}/g, sampleCustomer.orderCount)
        .replace(/{{avgOrderValue}}/g, formatCurrency(sampleCustomer.avgOrderValue))
        .replace(/{{lastOrderDate}}/g, '09 Jun 2026');
    };

    return (
      <div className="glass-card p-4 space-y-3 mt-2 border-primary/20 bg-surface-card shadow-lg">
        <div className="flex items-center space-x-2 text-primary-light">
          <MessageSquare className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Proposed Message Template</span>
        </div>

        <div className="space-y-3">
          <div className="bg-surface p-3 border border-border/80 rounded-lg text-xs font-mono text-text-secondary whitespace-pre-wrap">
            {data}
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
              Preview (Mock Customer: Priya)
            </div>
            <div className="bg-primary/5 p-3 border border-primary/10 rounded-lg text-xs text-text-primary italic whitespace-pre-wrap">
              "{renderMessagePreview(data)}"
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'channel_proposal' && data) {
    const channelColors = {
      whatsapp: 'border-success/20 bg-success/5 text-success',
      sms: 'border-info/20 bg-info/5 text-info',
      email: 'border-purple/20 bg-primary/5 text-primary-light',
      rcs: 'border-warning/20 bg-warning/5 text-warning'
    };

    const channelName = data.toUpperCase();
    const style = channelColors[data.toLowerCase()] || 'border-border bg-surface text-text-secondary';

    return (
      <div className="glass-card p-4 space-y-3 mt-2 border-primary/20 bg-surface-card shadow-lg">
        <div className="flex items-center space-x-2 text-primary-light">
          <Send className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Recommended Delivery Channel</span>
        </div>
        <div className={`flex items-center justify-between p-3.5 border rounded-xl font-bold text-sm ${style}`}>
          <span>{channelName}</span>
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>
    );
  }

  if (type === 'campaign_proposal' && data) {
    const { segmentRules, messageTemplate, channel, resolvedAudienceCount } = data;
    const { logic = 'AND', conditions = [] } = segmentRules || {};

    const channelColors = {
      whatsapp: 'border-success/20 bg-success/5 text-success',
      sms: 'border-info/20 bg-info/5 text-info',
      email: 'border-purple/20 bg-primary/5 text-primary-light',
      rcs: 'border-warning/20 bg-warning/5 text-warning'
    };
    const style = channelColors[channel?.toLowerCase()] || 'border-border bg-surface text-text-secondary';

    // Render message preview with fake customer
    const sampleCustomer = {
      name: 'Priya Sharma',
      city: 'Mumbai',
      totalSpend: 15450,
      orderCount: 6,
      avgOrderValue: 2575,
      lastOrderDate: new Date()
    };

    const renderMessagePreview = (template) => {
      if (!template) return '';
      return template
        .replace(/{{name}}/g, sampleCustomer.name)
        .replace(/{{firstName}}/g, 'Priya')
        .replace(/{{city}}/g, sampleCustomer.city)
        .replace(/{{totalSpend}}/g, formatCurrency(sampleCustomer.totalSpend))
        .replace(/{{orderCount}}/g, sampleCustomer.orderCount)
        .replace(/{{avgOrderValue}}/g, formatCurrency(sampleCustomer.avgOrderValue))
        .replace(/{{lastOrderDate}}/g, '09 Jun 2026');
    };

    return (
      <div className="glass-card p-4 space-y-4 mt-2 border-primary/20 bg-surface-card shadow-lg">
        {/* Header */}
        <div className="flex items-center space-x-2 text-primary-light border-b border-border/40 pb-2">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">AI Campaign Proposal Summary</span>
        </div>

        {name && (
          <div className="border-b border-border/40 pb-2.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Campaign Name</span>
            <div className="text-xs font-bold text-text-primary">{name}</div>
          </div>
        )}

        {/* Segment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-text-primary">
            <span>Target Segment ({logic})</span>
            {resolvedAudienceCount !== undefined && (
              <span className="text-[10px] bg-primary/20 text-primary-light px-2 py-0.5 rounded-full font-bold">
                {resolvedAudienceCount} matches
              </span>
            )}
          </div>
          <div className="space-y-1">
            {conditions.map((cond, idx) => (
              <React.Fragment key={idx}>{renderRuleSentence(cond)}</React.Fragment>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-text-primary block">Message Template Preview</span>
          <div className="bg-primary/5 p-3 border border-primary/10 rounded-lg text-xs text-text-primary italic whitespace-pre-wrap">
            "{renderMessagePreview(messageTemplate)}"
          </div>
        </div>

        {/* Channel */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-text-primary block">Delivery Channel</span>
          <div className={`flex items-center justify-between p-2.5 border rounded-xl font-bold text-xs ${style}`}>
            <span>{channel?.toUpperCase()}</span>
            <Send className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
