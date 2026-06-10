import React from 'react';
import { getInitials, getAvatarColor, formatCurrency, formatDate } from '../../utils/formatters';
import { Eye } from 'lucide-react';
import Badge from '../ui/Badge';

export default function CustomerTable({
  customers = [],
  onViewProfile,
  onAddToSegment,
  loading = false
}) {
  if (loading) {
    return (
      <div className="flex flex-col space-y-4">
        {Array(5).fill(0).map((_, idx) => (
          <div key={idx} className="h-16 bg-surface-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl bg-surface-card text-text-secondary">
        No shoppers match your query parameters. Try widening filters or search criteria.
      </div>
    );
  }

  // Calculate days since relative to now
  const renderDaysSince = (date) => {
    if (!date) return '—';
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}d ago`;
  };

  // Dynamically identify unique custom fields in the current customer list
  const customFieldKeys = Array.from(
    new Set(
      customers.flatMap(c => c.customFields ? Object.keys(c.customFields) : [])
    )
  );

  return (
    <div className="glass-card overflow-hidden bg-surface-card border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/25 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <th className="px-6 py-4">Shopper</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4 text-right">Total Spend</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4 text-center">Last Active</th>
              <th className="px-6 py-4">Attributes</th>
              {customFieldKeys.map((key) => (
                <th key={key} className="px-6 py-4 capitalize">{key}</th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {customers.map((c) => {
              const avatarBg = getAvatarColor(c.name);
              const initials = getInitials(c.name);

              return (
                <tr
                  key={c._id}
                  onClick={() => onViewProfile(c)}
                  className="hover:bg-surface-elevated/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-3.5 flex items-center space-x-3 min-w-[200px]">
                     <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0"
                      style={{ backgroundColor: avatarBg }}
                    >
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-text-primary group-hover:text-primary-light transition-colors truncate">
                        {c.name}
                      </span>
                      <span className="text-xs text-text-muted truncate">
                        {c.email || 'No email registered'}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-text-secondary truncate max-w-[120px]">
                    {c.city || '—'}
                  </td>

                  <td className="px-6 py-3.5 text-right text-text-primary font-semibold">
                    {formatCurrency(c.totalSpend)}
                  </td>

                  <td className="px-6 py-3.5 text-center font-bold text-text-secondary">
                    {c.orderCount}
                  </td>

                  <td className="px-6 py-3.5 text-center text-text-secondary">
                    {renderDaysSince(c.lastOrderDate)}
                  </td>

                  <td className="px-6 py-3.5 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.slice(0, 2).map((tag, tIdx) => (
                        <Badge key={tIdx} variant="purple" className="px-2 py-0.5 text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      {c.tags.length > 2 && (
                        <Badge variant="default" className="px-1.5 py-0.5 text-[9px]">
                          +{c.tags.length - 2}
                        </Badge>
                      )}
                      {c.tags.length === 0 && <span className="text-text-muted text-xs">—</span>}
                    </div>
                  </td>

                  {customFieldKeys.map((key) => (
                    <td key={key} className="px-6 py-3.5 text-text-secondary truncate max-w-[120px]">
                      {c.customFields && c.customFields[key] !== undefined ? String(c.customFields[key]) : '—'}
                    </td>
                  ))}

                  <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewProfile(c)}
                        className="p-1.5 text-text-secondary hover:text-primary-light hover:bg-surface-elevated rounded-lg transition-all"
                        title="View Profile Details"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
