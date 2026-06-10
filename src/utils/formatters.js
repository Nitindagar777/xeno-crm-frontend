import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string to readable format: "12 Jan 2025"
 */
export function formatDate(date) {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd MMM yyyy');
}

/**
 * Format a date to relative time: "3 days ago"
 */
export function formatRelativeDate(date) {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/**
 * Format a date with time: "12 Jan 2025, 3:45 PM"
 */
export function formatDateTime(date) {
  if (!date) return '—';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return '—';
  return format(parsed, 'dd MMM yyyy, h:mm a');
}

/**
 * Format a percentage value: "85.2%"
 */
export function formatPercentage(value, decimals = 1) {
  if (value == null || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Get initials from a name: "Nitin Patel" → "NP"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get a consistent color based on name hash
 */
export function getAvatarColor(name) {
  if (!name) return '#6C63FF';
  const colors = [
    '#6C63FF', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#22C55E', '#14B8A6', '#EF4444', '#F97316', '#06B6D4',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format a large number compactly: 1234 → "1.2K"
 */
export function formatCompactNumber(num) {
  if (num == null || isNaN(num)) return '0';
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

// Alias kept for backward compat with pages that import as formatDateRelative
export const formatDateRelative = formatRelativeDate;
