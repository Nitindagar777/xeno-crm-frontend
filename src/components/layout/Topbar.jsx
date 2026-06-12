import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAgent } from '../../context/AgentContext';
import { getWorkspaces } from '../../api/workspace.api';
import { Sparkles, Layers } from 'lucide-react';

export default function Topbar() {
  const queryClient = useQueryClient();
  const { togglePanel, isOpen } = useAgent();
  const location = useLocation();
  const params = useParams();

  const activeWsId = localStorage.getItem('xeno_workspace_id');

  // Fetch workspaces list sharing cache
  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces-list'],
    queryFn: getWorkspaces,
    refetchOnWindowFocus: false
  });

  const workspaces = workspacesData?.data || [];

  const handleWorkspaceChange = (e) => {
    const selectedId = e.target.value;
    const selected = workspaces.find(w => w._id === selectedId);
    if (selected) {
      localStorage.setItem('xeno_workspace_id', selected._id);
      localStorage.setItem('xeno_workspace_name', selected.name);
      queryClient.invalidateQueries();
      window.location.reload(); // Force reload to cleanly reset API headers and context
    }
  };

  // Dynamic route-to-title resolver
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/workspace')) return 'Your Workspace';
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/customers')) return 'Customer Directory';
    if (path.startsWith('/segments')) return 'Target Audiences';
    if (path.startsWith('/campaigns/')) return 'Campaign Analytics';
    if (path.startsWith('/campaigns')) return 'Marketing Campaigns';
    if (path.startsWith('/history')) return 'Message History';
    return 'XenoCRM';
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-surface/85 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-20">
      {/* Title & Workspace Selector */}
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold text-text-primary tracking-tight">
          {getPageTitle()}
        </h1>
        
        {activeWsId && workspaces.length > 0 && (
          <div className="flex items-center space-x-1.5 border-l border-border/80 pl-4">
            <Layers className="h-3.5 w-3.5 text-text-secondary" />
            <select
              value={activeWsId}
              onChange={handleWorkspaceChange}
              className="bg-surface-elevated/40 hover:bg-surface-elevated border border-border rounded-lg text-xs py-1 px-2 text-text-primary outline-none focus:border-primary font-semibold select-none cursor-pointer max-w-[160px] truncate"
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

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
