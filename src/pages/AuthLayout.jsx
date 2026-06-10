import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, Filter, Send, Home } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="h-screen w-screen flex text-text-primary bg-surface select-none overflow-hidden">
      {/* Left panel - Branding (Maintained throughout transition without unmounting or shaking) */}
      <div className="hidden lg:flex lg:w-[45%] h-full animated-gradient border-r border-border/45 flex-col justify-between p-12 relative overflow-hidden select-none">
        {/* Dark overlay to ensure content is perfectly visible over the dark + light wave mix */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-grid-pulse opacity-[0.03]" />
        
        <div className="relative z-10 flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary backdrop-blur-md border border-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            XENO<span className="text-primary">CRM</span>
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold text-primary leading-tight tracking-tight max-w-sm">
            AI-Powered Campaign Intelligence for D2C Brands
          </h2>
          
          <div className="space-y-4 max-w-sm">
            <div className="flex items-start space-x-4">
              <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5 text-primary border border-primary/10">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-zinc-100">AI Campaign Agent</h5>
                <p className="text-xs text-zinc-400 mt-0.5">Let our conversational agent model, build, and orchestrate campaigns.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5 text-primary border border-primary/10">
                <Filter className="h-4.5 w-4.5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-zinc-100">Smart Segment Builder</h5>
                <p className="text-xs text-zinc-400 mt-0.5">Slice customer logs dynamically with complex logic selectors.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5 text-primary border border-primary/10">
                <Send className="h-4.5 w-4.5" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-zinc-100">Real-time Deliverability</h5>
                <p className="text-xs text-zinc-400 mt-0.5">Track message callbacks instantly to optimize rates.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © 2026 XenoCRM. Built for Lumière Brand.
        </div>
      </div>

      {/* Right panel - Form container */}
      <div className="w-full lg:w-[55%] h-full flex items-center justify-center p-8 bg-surface relative overflow-y-auto">
        <Link 
          to="/" 
          className="absolute top-6 right-6 z-20 flex items-center space-x-2 text-xs text-text-secondary hover:text-primary bg-surface-elevated hover:bg-surface-elevated/80 border border-border px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>

        <div className="w-full max-w-md relative min-h-[550px] flex flex-col justify-center py-8">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
