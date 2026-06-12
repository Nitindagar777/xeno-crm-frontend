import React from 'react';
import { getInitials, getAvatarColor, formatCurrency, formatDate } from '../../utils/formatters';
import { Eye } from 'lucide-react';
import Badge from '../ui/Badge';

const getCustomFieldValue = (c, keyName) => {
  if (c.customFields && c.customFields[keyName] !== undefined && c.customFields[keyName] !== null && c.customFields[keyName] !== '') {
    return String(c.customFields[keyName]);
  }
  
  const h = keyName.toLowerCase().trim();
  if (['name', 'full name', 'fullname', 'shopper name', 'shoppername', 'first name', 'firstname', 'customer name', 'customername'].includes(h)) {
    return c.name || '—';
  }
  if (['email', 'email address', 'emailaddress', 'mail'].includes(h)) {
    return c.email || '—';
  }
  if (['phone', 'phone number', 'phonenumber', 'mobile', 'mobile number', 'mobilenumber', 'contact', 'contact number'].includes(h)) {
    return c.phone || '—';
  }
  if (['city', 'location', 'town', 'address'].includes(h)) {
    return c.city || '—';
  }
  if (['gender', 'sex'].includes(h)) {
    return c.gender || '—';
  }
  if (['total spend', 'totalspend', 'spend', 'amount', 'total_spend', 'totalspendamount', 'price', 'revenue', 'total spend (₹)', 'total spend (rs)', 'spend amount'].includes(h)) {
    return c.totalSpend !== undefined ? formatCurrency(c.totalSpend) : '—';
  }
  if (['orders', 'ordercount', 'order count', 'total orders', 'totalorders', 'order_count'].includes(h)) {
    return c.orderCount !== undefined ? String(c.orderCount) : '—';
  }
  if (['last active', 'lastactive', 'last order date', 'lastorderdate', 'last_order_date', 'lastactiveactive', 'join date', 'joindate', 'date'].includes(h)) {
    return c.lastOrderDate ? formatDate(c.lastOrderDate) : '—';
  }
  
  return '—';
};

export default function CustomerTable({
  customers = [],
  onViewProfile,
  onAddToSegment,
  loading = false,
  uploadedFields = []
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
  };  // Always include shopper column, then dynamically add others if present in uploadedFields
  const columnsToRender = [];
  
  // Shopper (Name & Email) is always first
  columnsToRender.push({ id: 'shopper', label: 'Shopper' });
  
  if (uploadedFields.includes('city')) {
    columnsToRender.push({ id: 'city', label: 'City' });
  }
  if (uploadedFields.includes('totalSpend')) {
    columnsToRender.push({ id: 'totalSpend', label: 'Total Spend', align: 'right' });
  }
  if (uploadedFields.includes('orderCount')) {
    columnsToRender.push({ id: 'orderCount', label: 'Orders', align: 'center' });
  }
  if (uploadedFields.includes('lastOrderDate')) {
    columnsToRender.push({ id: 'lastOrderDate', label: 'Last Active', align: 'center' });
  }
  if (uploadedFields.includes('tags')) {
    columnsToRender.push({ id: 'tags', label: 'Attributes' });
  }
  
  // Custom fields keys are fields that are in uploadedFields but not in the standard list
  const standardSchemaFields = ['name', 'email', 'phone', 'city', 'gender', 'tags', 'totalSpend', 'orderCount', 'lastOrderDate', 'avgOrderValue'];
  const customFieldKeys = uploadedFields.filter(f => !standardSchemaFields.includes(f));
  customFieldKeys.forEach(key => {
    columnsToRender.push({ id: `custom_${key}`, label: key, isCustom: true, keyName: key });
  });

  return (
    <div className="glass-card overflow-hidden bg-surface-card border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/25 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {columnsToRender.map((col) => (
                <th
                  key={col.id}
                  className={`px-6 py-4 capitalize ${
                    col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : '')
                  }`}
                >
                  {col.label}
                </th>
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
                  {columnsToRender.map((col) => {
                    if (col.id === 'shopper') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 flex items-center space-x-3 min-w-[200px]">
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
                            {uploadedFields.includes('email') && (
                              <span className="text-xs text-text-muted truncate">
                                {c.email || 'No email registered'}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    }
                    if (col.id === 'city') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-text-secondary truncate max-w-[120px]">
                          {c.city || '—'}
                        </td>
                      );
                    }
                    if (col.id === 'totalSpend') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-right text-text-primary font-semibold">
                          {formatCurrency(c.totalSpend)}
                        </td>
                      );
                    }
                    if (col.id === 'orderCount') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-center font-bold text-text-secondary">
                          {c.orderCount}
                        </td>
                      );
                    }
                    if (col.id === 'lastOrderDate') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-center text-text-secondary">
                          {renderDaysSince(c.lastOrderDate)}
                        </td>
                      );
                    }
                    if (col.id === 'tags') {
                      return (
                        <td key={col.id} className="px-6 py-3.5 max-w-[200px]">
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
                      );
                    }
                    if (col.isCustom) {
                      return (
                        <td key={col.id} className="px-6 py-3.5 text-text-secondary truncate max-w-[120px]">
                          {getCustomFieldValue(c, col.keyName)}
                        </td>
                      );
                    }
                    return null;
                  })}

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
