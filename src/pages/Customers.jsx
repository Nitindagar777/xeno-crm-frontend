import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, getCustomer, getCustomerMetadata } from '../api/customer.api';
import CustomerTable from '../components/customers/CustomerTable';
import CSVImportModal from '../components/customers/CSVImportModal';
import { SkeletonTable } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate, getAvatarColor, getInitials } from '../utils/formatters';
import { useAgent } from '../context/AgentContext';
import {
  Search,
  Filter,
  Upload,
  X,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';

const getProfileFieldValue = (c, keyName) => {
  if (!c) return '—';
  if (c.customFields && c.customFields[keyName] !== undefined && c.customFields[keyName] !== null && c.customFields[keyName] !== '') {
    return String(c.customFields[keyName]);
  }
  const h = keyName.toLowerCase().trim();
  if (c.customFields) {
    const matchedKey = Object.keys(c.customFields).find(k => k.toLowerCase().trim() === h);
    if (matchedKey) {
      return String(c.customFields[matchedKey]);
    }
  }
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
  if (['total spend', 'totalspend', 'spend', 'amount', 'total_spend', 'totalspendamount', 'price', 'revenue', 'spend amount'].includes(h)) {
    return c.totalSpend !== undefined ? String(c.totalSpend) : '—';
  }
  if (['orders', 'ordercount', 'order count', 'total orders', 'totalorders', 'order_count'].includes(h)) {
    return c.orderCount !== undefined ? String(c.orderCount) : '—';
  }
  if (['last active', 'lastactive', 'last order date', 'lastorderdate', 'last_order_date', 'lastactiveactive'].includes(h)) {
    return c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—';
  }
  return '—';
};

const getProfileNumericValue = (c, keyName, standardValue) => {
  if (!c) return 0;
  const h = keyName.toLowerCase().trim();
  if (c.customFields) {
    const matchedKey = Object.keys(c.customFields).find(k => {
      const kh = k.toLowerCase().trim();
      if (kh === h) return true;
      if (h === 'totalspend' && ['total spend', 'totalspend', 'spend', 'amount', 'total_spend', 'totalspendamount', 'price', 'revenue', 'total spend (₹)', 'total spend (rs)', 'spend amount'].includes(kh)) return true;
      if (h === 'ordercount' && ['orders', 'ordercount', 'order count', 'total orders', 'totalorders', 'order_count'].includes(kh)) return true;
      return false;
    });
    if (matchedKey) {
      const val = parseFloat(c.customFields[matchedKey]);
      if (!isNaN(val)) return val;
    }
  }
  return standardValue || 0;
};

const getProfileDateValue = (c) => {
  if (!c) return null;
  if (c.lastOrderDate) return new Date(c.lastOrderDate);
  if (c.customFields) {
    const dateKey = Object.keys(c.customFields).find(k => {
      const kh = k.toLowerCase().trim();
      return ['last active', 'lastactive', 'last order date', 'lastorderdate', 'last_order_date', 'lastactiveactive', 'join date', 'joindate', 'date'].includes(kh);
    });
    if (dateKey) {
      const parsed = new Date(c.customFields[dateKey]);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
};

export default function Customers() {
  const queryClient = useQueryClient();
  const { openPanel, sendToAgent, sendToAgentWithContext, setAgentContext } = useAgent();

  // Search & Pagination States
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filter states
  const [cityFilter, setCityFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [maxSpend, setMaxSpend] = useState('');
  const [minOrders, setMinOrders] = useState('');
  const [daysSinceLast, setDaysSinceLast] = useState('');
  const [customFilters, setCustomFilters] = useState({});
  
  // Sidebar & Modal UI States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Profile slide-over details state
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset to page 1
    }, 450);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Build query params
  const queryParams = {
    page,
    limit: 20,
    search: debouncedSearch,
    city: cityFilter,
    gender: genderFilter,
    minSpend,
    maxSpend,
    minOrders,
    daysSinceLast,
    ...customFilters
  };

  // Fetch Customers List
  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ['customers', queryParams],
    queryFn: () => getCustomers(queryParams),
    placeholderData: (previousData) => previousData
  });

  // Fetch Customer Metadata (tags, cities, uploadedFields, customFieldKeys)
  const { data: metadataData } = useQuery({
    queryKey: ['customer-metadata'],
    queryFn: getCustomerMetadata
  });

  const uploadedFields = metadataData?.data?.uploadedFields || [];
  const customFieldKeys = metadataData?.data?.customFieldKeys || [];

  // Fetch Customer Profile details when slide-over opens
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['customer-profile', selectedCustomerId],
    queryFn: () => getCustomer(selectedCustomerId),
    enabled: !!selectedCustomerId
  });

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    queryClient.invalidateQueries({ queryKey: ['customer-metadata'] });
  };

  const handleResetFilters = () => {
    setCityFilter('');
    setGenderFilter('');
    setMinSpend('');
    setMaxSpend('');
    setMinOrders('');
    setDaysSinceLast('');
    setSearchTerm('');
    setCustomFilters({});
    setPage(1);
  };

  const startAISegment = (customer) => {
    setSelectedCustomerId(null);
    openPanel();
    
    const targetField = customer.email ? 'email' : (customer.phone ? 'phone' : 'name');
    const targetValue = customer[targetField];
    const rules = {
      logic: 'AND',
      conditions: [{ field: targetField, operator: 'eq', value: targetValue }]
    };
    
    const newContext = {
      intent: `Target customer with ${targetField} ${targetValue}`,
      segmentPlan: rules,
      segmentName: `Target: ${customer.name}`,
      segmentDesc: `Targeting specific customer ${customer.name} (${targetValue})`,
      campaignName: `Campaign for ${customer.name}`,
      messagePlan: null,
      channelPlan: null,
      approvals: { segment: true, message: false, channel: false },
      resolvedAudienceCount: 1,
      campaignCreated: false,
      currentStep: 'PROPOSE_MESSAGE'
    };
    
    setAgentContext(newContext);
    sendToAgentWithContext(`Target customer with ${targetField} ${targetValue}. Propose a message template.`, newContext);
  };

  const customersList = customersData?.data?.customers || [];
  const totalCount = customersData?.data?.total || 0;
  const totalPages = customersData?.data?.totalPages || 1;

  const profile = profileData?.data?.customer || null;
  const orders = profileData?.data?.orders || [];

  return (
    <div className="space-y-6 relative min-h-[80vh] select-none">
      {/* Action header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-card p-4 border border-border rounded-xl">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search shopper name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 py-2 text-xs"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`border border-border/80 ${isFilterOpen ? 'bg-primary/10 border-primary/20 text-primary-light' : ''}`}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            <span>Filters</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            <span>Import Data</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Filters + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        {isFilterOpen && (
          <div className="glass-card p-5 space-y-5 bg-surface-card border-border animate-fade-in lg:col-span-1">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">Filter Settings</h5>
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-primary-light hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4">
              {/* City */}
              {uploadedFields.includes('city') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-muted">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi"
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                    className="input-field py-2 text-xs"
                  />
                </div>
              )}

              {/* Gender */}
              {uploadedFields.includes('gender') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                    className="bg-surface-elevated border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary w-full"
                  >
                    <option value="">All Genders</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              )}

              {/* Spend Range */}
              {uploadedFields.includes('totalSpend') && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-text-muted">Min Spend (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={minSpend}
                      onChange={(e) => { setMinSpend(e.target.value); setPage(1); }}
                      className="input-field py-2 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-text-muted">Max Spend (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 20000"
                      value={maxSpend}
                      onChange={(e) => { setMaxSpend(e.target.value); setPage(1); }}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Min Orders */}
              {uploadedFields.includes('orderCount') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Min Orders</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={minOrders}
                    onChange={(e) => { setMinOrders(e.target.value); setPage(1); }}
                    className="input-field py-2 text-xs"
                  />
                </div>
              )}

              {/* Inactivity Days */}
              {uploadedFields.includes('lastOrderDate') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-muted">Inactivity Days</label>
                  <select
                    value={daysSinceLast}
                    onChange={(e) => { setDaysSinceLast(e.target.value); setPage(1); }}
                    className="bg-surface-elevated border border-border rounded-lg text-xs p-2 text-text-primary focus:outline-none focus:border-primary w-full"
                  >
                    <option value="">All Time</option>
                    <option value="30">Over 30 days ago</option>
                    <option value="60">Over 60 days ago</option>
                    <option value="90">Over 90 days ago</option>
                    <option value="120">Over 120 days ago</option>
                  </select>
                </div>
              )}

              {/* Dynamic Custom Fields Filters */}
              {customFieldKeys.map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-text-muted capitalize">{key}</label>
                  <input
                    type="text"
                    placeholder={`Filter by ${key}`}
                    value={customFilters[key] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomFilters(prev => ({ ...prev, [key]: val }));
                      setPage(1);
                    }}
                    className="input-field py-2 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Table Container */}
        <div className={isFilterOpen ? 'lg:col-span-3 space-y-4' : 'lg:col-span-4 space-y-4'}>
          {isLoading ? (
            <SkeletonTable rows={10} cols={6} />
          ) : (
            <CustomerTable
              customers={customersList}
              onViewProfile={(c) => setSelectedCustomerId(c._id)}
              uploadedFields={uploadedFields}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-secondary">
                Showing page <strong className="text-text-primary">{page}</strong> of {totalPages} ({totalCount} total customer accounts)
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

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
        uploadedFields={uploadedFields}
      />

      {/* Customer Profile Slide-over Drawer */}
      <div
        className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-[400px] bg-surface-card border-l border-border flex flex-col z-40 transition-transform duration-300 shadow-2xl select-text ${
          selectedCustomerId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Profile Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-border bg-surface-elevated/20 flex-shrink-0">
          <span className="text-sm font-semibold text-text-primary">Shopper Profile</span>
          <button
            onClick={() => setSelectedCustomerId(null)}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {profileLoading ? (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-16 w-16 bg-surface-elevated animate-pulse rounded-full" />
              <div className="h-5 w-32 bg-surface-elevated animate-pulse rounded" />
              <div className="h-4.5 w-48 bg-surface-elevated animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-surface-elevated animate-pulse rounded-xl" />
              <div className="h-16 bg-surface-elevated animate-pulse rounded-xl" />
            </div>
            <div className="h-40 bg-surface-elevated animate-pulse rounded-xl" />
          </div>
        ) : profile ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            {/* Header info */}
            <div className="flex flex-col items-center text-center space-y-3 border-b border-border/40 pb-5">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner"
                style={{ backgroundColor: getAvatarColor(profile.name) }}
              >
                {getInitials(profile.name)}
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-base">{profile.name}</h4>
                <p className="text-xs text-text-muted mt-0.5">{profile.email || 'No email registered'}</p>
                <p className="text-xs text-text-muted font-mono">{profile.phone || 'No phone'}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 justify-center pt-2">
                {profile.tags.map((t, idx) => (
                  <Badge key={idx} variant="purple" className="px-2 py-0.5 text-[9px]">
                    {t}
                  </Badge>
                ))}
                {profile.tags.length === 0 && <span className="text-text-muted text-[10px]">No tags attached</span>}
              </div>
            </div>

            {/* Metrics cards grid */}
            {(() => {
              const totalSpend = getProfileNumericValue(profile, 'totalSpend', profile.totalSpend);
              const orderCount = getProfileNumericValue(profile, 'orderCount', profile.orderCount);
              const avgOrderValue = orderCount > 0 ? parseFloat((totalSpend / orderCount).toFixed(2)) : 0;
              
              const lastActiveDate = getProfileDateValue(profile);
              let daysSinceLast = 'Never purchased';
              if (lastActiveDate) {
                const diffTime = Math.abs(new Date() - lastActiveDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysSinceLast = `${diffDays}d ago`;
              }

              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface border border-border/60 rounded-xl flex flex-col justify-between h-20 shadow-inner">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span>Total Spend</span>
                      </span>
                      <span className="text-base font-bold text-text-primary mt-1">{formatCurrency(totalSpend)}</span>
                    </div>

                    <div className="p-3 bg-surface border border-border/60 rounded-xl flex flex-col justify-between h-20 shadow-inner">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center space-x-1">
                        <ShoppingBag className="h-3 w-3 text-info" />
                        <span>Order Count</span>
                      </span>
                      <span className="text-base font-bold text-text-primary mt-1">{orderCount} orders</span>
                    </div>

                    <div className="p-3 bg-surface border border-border/60 rounded-xl flex flex-col justify-between h-20 shadow-inner">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Avg Order Value</span>
                      <span className="text-sm font-bold text-text-primary mt-1">{formatCurrency(avgOrderValue)}</span>
                    </div>

                    <div className="p-3 bg-surface border border-border/60 rounded-xl flex flex-col justify-between h-20 shadow-inner">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-warning" />
                        <span>Last Active</span>
                      </span>
                      <span className="text-xs font-bold text-text-primary mt-1">
                        {daysSinceLast}
                      </span>
                    </div>
                  </div>

                  {/* Profile fields details */}
                  <div className="space-y-3 bg-surface-elevated/30 p-4 border border-border/60 rounded-xl text-xs">
                    {(() => {
                      let fieldsToRender = [];
                      if (uploadedFields && uploadedFields.length > 0) {
                        fieldsToRender = uploadedFields.filter(
                          field => !['name', 'email', 'phone', 'tags', 'totalSpend', 'orderCount', 'avgOrderValue', 'lastOrderDate'].includes(field)
                        );
                      } else {
                        // Fallback: use city, gender, and customFields keys
                        if (profile.city) fieldsToRender.push('city');
                        if (profile.gender && profile.gender !== 'unknown') fieldsToRender.push('gender');
                        if (profile.customFields) {
                          Object.keys(profile.customFields).forEach(key => {
                            if (!fieldsToRender.includes(key)) fieldsToRender.push(key);
                          });
                        }
                      }

                      if (fieldsToRender.length === 0) {
                        return <div className="text-text-muted text-center italic py-2">No profile details available.</div>;
                      }

                      return (
                        <>
                          {fieldsToRender.map((field) => {
                            const val = getProfileFieldValue(profile, field);
                            let label = field;
                            if (field === 'city') label = 'Location';
                            else if (field === 'gender') label = 'Gender';
                            else {
                              label = field.charAt(0).toUpperCase() + field.slice(1);
                            }

                            return (
                              <div key={field} className="flex justify-between border-b border-border/40 pb-2 last:border-b last:pb-2 text-text-secondary">
                                <span>{label}:</span>
                                <strong className="text-text-primary">{val}</strong>
                              </div>
                            );
                          })}
                          
                          <div className="flex justify-between border-b border-border/40 pb-2 text-text-secondary">
                            <span>Registration Date:</span>
                            <strong className="text-text-primary">{formatDate(profile.createdAt)}</strong>
                          </div>
                          <div className="flex justify-between text-text-secondary">
                            <span>Data Ingestion:</span>
                            <strong className="text-text-primary uppercase">{profile.source}</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </>
              );
            })()}

            {/* Order history timeline */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted">Order History Timeline</h5>
              {orders.length === 0 ? (
                <div className="p-4 border border-border bg-surface rounded-xl text-center text-xs text-text-muted italic">
                  No purchases recorded.
                </div>
              ) : (
                <div className="space-y-3.5 relative pl-4 border-l border-border/60">
                  {orders.map((order, idx) => (
                    <div key={order._id} className="relative space-y-1">
                      {/* dot */}
                      <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      
                      <div className="flex justify-between items-center text-xs font-semibold text-text-primary">
                        <span>{order.orderId || `Order #${idx + 1}`}</span>
                        <span>{formatCurrency(order.amount)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] text-text-muted">
                        <span>{formatDate(order.orderedAt)} via {order.channel.toUpperCase()}</span>
                        <span className="italic">{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA action trigger */}
            <div className="pt-3 border-t border-border flex justify-center">
              <Button
                variant="primary"
                onClick={() => startAISegment(profile)}
                className="w-full flex items-center justify-center space-x-1.5 py-3"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Campaign on Segment</span>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
