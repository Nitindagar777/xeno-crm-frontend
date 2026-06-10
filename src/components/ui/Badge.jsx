import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  showDot = false,
  className = '',
  ...props
}) {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const variants = {
    default: 'bg-surface-elevated text-text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    purple: 'bg-primary/10 text-primary-light'
  };

  const dots = {
    default: 'bg-text-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    purple: 'bg-primary-light'
  };

  const selectedVariant = variants[variant] || variants.default;
  const selectedDotColor = dots[variant] || dots.default;

  return (
    <span className={`${baseStyle} ${selectedVariant} ${className}`} {...props}>
      {showDot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${selectedDotColor}`} />
      )}
      {children}
    </span>
  );
}
