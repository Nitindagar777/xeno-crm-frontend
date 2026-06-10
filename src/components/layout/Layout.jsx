import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AgentPanel from '../agent/AgentPanel';
import Confetti from '../ui/Confetti';
import { useAgent } from '../../context/AgentContext';

export default function Layout() {
  const { showConfetti } = useAgent();

  return (
    <div className="min-h-screen bg-surface flex text-text-primary">
      {/* Confetti Celebration */}
      {showConfetti && <Confetti />}

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <Topbar />

        {/* Page Content Panel */}
        <main className="flex-1 pt-16 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* AI Conversational Assistant Panel */}
      <AgentPanel />
    </div>
  );
}
