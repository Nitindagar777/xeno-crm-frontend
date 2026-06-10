import React from 'react';

export default function Spinner({ size = 'md', className = '', color = 'text-primary' }) {
  const sizes = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const selectedSize = sizes[size] || sizes.md;

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-current ${color} ${selectedSize} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
