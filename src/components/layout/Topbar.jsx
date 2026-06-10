import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAgent } from '../../context/AgentContext';
import { Sparkles, MessageSquareDot } from 'lucide-react';

export default function Topbar() {
  const { togglePanel, isOpen } = useAgent();
  const location = useLocation();
  const params = useParams();

  // Dynamic route-to-title resolver
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/segments')) return 'Target Audiences';
    if (path.startsWith('/campaigns/')) return 'Campaign Analytics';
    if (path.startsWith('/campaigns')) return 'Marketing Campaigns';
    return 'XenoCRM';
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-surface/85 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-20">
      {/* Title */}
      <h1 className="text-lg font-bold text-text-primary tracking-tight">
        {getPageTitle()}
      </h1>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Glow Sparkle AI Panel Trigger Button */}
        <button
          onClick={togglePanel}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 active:scale-[0.98] ${
            isOpen
              ? 'bg-primary text-white shadow-lg shadow-primary/25 border border-primary-light/10'
              : 'bg-primary/15 text-primary-light hover:bg-primary hover:text-white border border-primary/20 hover:shadow-lg hover:shadow-primary/10'
          }`}
          style={{
            boxShadow: !isOpen ? '0 0 15px rgba(108,99,255,0.15)' : undefined
          }}
        >
          <Sparkles className={`h-4 w-4 ${!isOpen ? 'animate-pulse' : ''}`} />
          <span>Ask AI Agent</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
        </button>
      </div>
    </header>
  );
}
