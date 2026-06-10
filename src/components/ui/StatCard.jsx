import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend = null, // e.g. { value: 12, isPositive: true }
  loading = false,
  className = ''
}) {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 ${className}`}>
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</p>
          {loading ? (
            <div className="h-8 w-28 bg-surface-elevated animate-pulse rounded mt-2" />
          ) : (
            <h4 className="text-2xl font-bold text-text-primary mt-2 tracking-tight">{value}</h4>
          )}
        </div>
        
        {Icon && (
          <div className="p-3 bg-surface-elevated border border-border/80 rounded-xl text-primary-light">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {!loading && trend && (
        <div className="flex items-center mt-4 text-xs">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-md font-medium ${
              trend.isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
            )}
            {trend.value}%
          </span>
          <span className="text-text-muted ml-2">vs last campaign</span>
        </div>
      )}
    </div>
  );
}
