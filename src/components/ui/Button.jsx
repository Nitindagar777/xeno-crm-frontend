import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  id,
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg hover:shadow-primary/20 disabled:hover:shadow-none',
    secondary: 'bg-surface-elevated hover:bg-surface-card text-text-primary border border-border',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <button
      id={id}
      type={type}
      className={`${baseStyle} ${selectedVariant} ${selectedSize} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {!loading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
}
