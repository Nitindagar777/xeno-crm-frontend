import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  Send,
  Target,
  BarChart2,
  Database,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Brain,
  Cpu,
  ChevronDown,
  Rocket,
  Activity,
  Lock,
  MousePointerClick,
  Mail,
  MessageSquare
} from 'lucide-react';

/* ─── Premium Modern Hover Card Component ─────────────────────── */
function TiltCard({ children, className = '', bgStyle = {} }) {
  return (
    <motion.div
      className={`relative rounded-2xl border transition-all duration-300 ${className}`}
      style={bgStyle}
      whileHover={{
        y: -6,
        scale: 1.015,
        borderColor: 'rgba(229, 193, 88, 0.45)',
        boxShadow: '0 20px 40px -15px rgba(229, 193, 88, 0.12), 0 0 0 1px rgba(229, 193, 88, 0.08)'
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <div className="h-full w-full p-8 flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

/* ─── Animated Counter ──────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp = null;
    const end = parseInt(target);
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return <span ref={ref} className="font-display tracking-tight text-white">{count}{suffix}</span>;
}

/* ─── 3D Wireframe Perspective Grid (Clean Amber-Gold) ──────── */
function PerspectiveGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.12]" style={{ perspective: '800px' }}>
      <div
        className="absolute left-0 right-0 bottom-0 h-[65%]"
        style={{
          transform: 'rotateX(75deg)',
          transformOrigin: 'bottom center',
          backgroundImage: `
            linear-gradient(rgba(229,193,88,0.06) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(229,193,88,0.06) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 95%)'
        }}
      />
    </div>
  );
}

/* ─── Smooth Lag-Free CountUp Component ──────────────────────── */
function CountUp({ target, duration = 0.8, decimals = 0, prefix = '', suffix = '' }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = parseFloat(target);
    if (isNaN(endValue)) {
      setValue(target);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const current = progress * endValue;
      setValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setValue(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration]);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return <span>{prefix}{formatted}{suffix}</span>;
}

/* ─── Fast Typewriter Animation Component ────────────────────── */
function Typewriter({ text, delay = 8 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } }
};

/* ─── Floating 3D Dashboard Mockup ──────────────────────────── */
function FloatingDashboard() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const tabs = ['telemetry', 'ai', 'segmenter', 'channels'];
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const idx = tabs.indexOf(prev);
        return tabs[(idx + 1) % tabs.length];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const getBadges = () => {
    switch (activeTab) {
      case 'telemetry':
        return {
          left: (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-zinc-300 font-bold tracking-wider">Gateways: 4/4 Active</span>
            </div>
          ),
          right: (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Live Streaming</span>
            </div>
          )
        };
      case 'ai':
        return {
          left: (
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">AI Copilot Online</span>
            </div>
          ),
          right: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Variant Compiled</span>
            </div>
          )
        };
      case 'segmenter':
        return {
          left: (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Rules Validated</span>
            </div>
          ),
          right: (
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Target: VIP Delhi</span>
            </div>
          )
        };
      case 'channels':
        return {
          left: (
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Channels: 100% OK</span>
            </div>
          ),
          right: (
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-wider">Live Callbacks</span>
            </div>
          )
        };
      default:
        return { left: null, right: null };
    }
  };

  const badges = getBadges();

  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto"
      style={{ perspective: '1600px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative"
        animate={{ rotateX: [1, -0.5, 1], rotateY: [-1.5, 0.5, -1.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Soft Gold backlight glow */}
        <div className="absolute inset-x-8 -inset-y-4 bg-primary/5 rounded-3xl blur-3xl -z-10" />

        {/* Floating Badges with Cross-Fading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`left-${activeTab}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute -left-12 top-1/4 hidden lg:block bg-zinc-955/90 border border-zinc-800 p-3 rounded-xl shadow-xl backdrop-blur-sm z-20 hover:scale-105 transition-transform cursor-default"
          >
            {badges.left}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`right-${activeTab}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute -right-16 bottom-1/4 hidden lg:block bg-zinc-955/90 border border-zinc-800 p-3 rounded-xl shadow-xl backdrop-blur-sm z-20 hover:scale-105 transition-transform cursor-default"
          >
            {badges.right}
          </motion.div>
        </AnimatePresence>

        {/* Dashboard Frame */}
        <div className="relative rounded-2xl border border-zinc-800 bg-[#0A0A0C] p-5 md:p-6 shadow-2xl">
          {/* Top Window controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/80" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#121214] border border-zinc-800">
                <Lock className="w-2.5 h-2.5 text-primary/80" />
                <span className="text-[9px] text-zinc-400 font-mono tracking-wider">app.xenocrm.io/{activeTab}</span>
              </div>
            </div>

            {/* Clickable Feature Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'telemetry', label: 'Telemetry', icon: <Activity className="w-3 h-3" /> },
                { id: 'ai', label: 'AI Copywriter', icon: <Brain className="w-3 h-3" /> },
                { id: 'segmenter', label: 'Segment Builder', icon: <Target className="w-3 h-3" /> },
                { id: 'channels', label: 'Deliverability', icon: <Send className="w-3 h-3" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Display - Fixed Height to prevent page layout jumps */}
          <div className="h-[480px] md:h-[325px] flex flex-col justify-between overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="h-full flex flex-col justify-between"
              >
                {activeTab === 'telemetry' && (
                  <div className="space-y-4 h-full flex flex-col justify-between">
                    {/* Metric Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Conversion Velocity', value: '18.4', decimals: 1, suffix: '%', change: '+4.2%', icon: <Activity className="w-3.5 h-3.5 text-primary" /> },
                        { label: 'Active Audiences', value: '4.8', decimals: 1, suffix: 'M', change: '+18.9%', icon: <Users className="w-3.5 h-3.5 text-primary" /> },
                        { label: 'API Health Status', value: '99.99', decimals: 2, suffix: '%', change: 'Optimal', icon: <Cpu className="w-3.5 h-3.5 text-[#10B981]" /> }
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-zinc-855 bg-[#0E0E11] p-4 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850">{stat.icon}</span>
                            <span className="text-[9px] font-mono text-primary font-bold tracking-wider">{stat.change}</span>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-white tracking-tight font-display">
                              <CountUp target={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5 tracking-wide font-medium">{stat.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Graph */}
                    <div className="rounded-xl bg-[#0E0E11] border border-zinc-855 p-4 flex flex-col justify-between flex-grow mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Throughput telemetry</span>
                        <span className="text-[8px] font-mono text-zinc-500">Direct messaging streams</span>
                      </div>
                      <div className="flex items-end gap-2.5 h-24 pt-2">
                        {[45, 60, 38, 85, 55, 95, 75, 90, 65, 80, 50, 95].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <motion.div
                              className="w-full rounded bg-primary/20 border-t border-primary/50"
                              initial={{ height: 0 }}
                              animate={{ height: `${val}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.04, ease: 'easeOut' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
                    {/* AI Prompt Input Bar */}
                    <div className="md:col-span-3 space-y-3 flex flex-col justify-between">
                      <div className="rounded-xl bg-[#0E0E11] border border-zinc-850 p-4 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">AI Prompt Terminal</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-xs text-zinc-300 bg-zinc-950 border border-zinc-850 rounded-lg p-3 font-mono min-h-[64px] flex items-start">
                          <span className="text-primary mr-1">&gt;</span> 
                          <Typewriter text="Draft a WhatsApp campaign targeting high-value users in Delhi who haven't ordered in 30 days. Make it offer a 15% discount." delay={6} />
                        </div>
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.1, duration: 0.3 }}
                          className="text-xs text-[#10B981] bg-emerald-955/10 border border-emerald-900/20 rounded-lg p-3 font-mono flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                          <div>
                            <span className="font-bold">Campaign Compiled:</span> Generated 1 personalized variant with dynamic discount link insertion.
                          </div>
                        </motion.div>
                      </div>

                      {/* AI Copy analysis */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Tone', value: 'Exclusive' },
                          { label: 'CTR Forecast', value: '+14.2%', highlight: true },
                          { label: 'Readability', value: 'Grade 6' }
                        ].map((stat, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.4 + i * 0.08, duration: 0.2 }}
                            className="rounded-lg bg-[#0E0E11] border border-zinc-855 p-2.5 text-center"
                          >
                            <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold">{stat.label}</div>
                            <div className={`text-xs font-bold mt-1 ${stat.highlight ? 'text-primary' : 'text-white'}`}>{stat.value}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Simulated Phone WhatsApp Message Preview */}
                    <div className="md:col-span-2 rounded-xl bg-[#0E0E11] border border-zinc-850 p-4 flex flex-col justify-between h-full">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-850 pb-1.5">
                        WhatsApp Preview
                      </div>
                      <div className="bg-[#0b141a] border border-zinc-800 rounded-xl p-3 space-y-2 flex-grow flex flex-col justify-center min-h-[160px]">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7, duration: 0.3 }}
                          className="bg-[#202c33] text-zinc-100 rounded-lg p-2.5 text-[11px] leading-relaxed shadow max-w-[85%] self-start relative border border-zinc-700/30"
                        >
                          <div className="font-bold text-primary text-[10px] mb-1">XenoCRM Agent</div>
                          <Typewriter text="Hey Nitin! 🌟 We noticed you haven't visited us this month. As a VIP partner, here is a special 15% off coupon for your next checkout:" delay={5} />
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.1, duration: 0.2 }}
                            className="bg-black/30 border border-zinc-800 rounded px-2 py-1 mt-1.5 text-[9px] font-mono text-primary select-all"
                          >
                            DELHIVIP15
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'segmenter' && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full">
                    {/* Segment Rules Matrix */}
                    <div className="md:col-span-3 rounded-xl bg-[#0E0E11] border border-zinc-850 p-4 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rules Configuration</span>
                        <span className="text-[8px] bg-primary/10 border border-primary/20 text-primary font-mono px-2 py-0.5 rounded uppercase font-bold">SQL Builder</span>
                      </div>
                      <motion.div 
                        variants={listVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-2.5 flex-grow"
                      >
                        {[
                          { type: 'FILTER', label: 'City', comparison: 'EQUALS', val: '"Delhi"' },
                          { type: 'AND', label: 'Lifetime Spend', comparison: '>', val: '$150.00', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                          { type: 'AND', label: 'Days Since Last Order', comparison: '>=', val: '30', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
                        ].map((rule, i) => (
                          <motion.div 
                            key={i}
                            variants={itemVariants}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-850"
                          >
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${rule.color || 'bg-primary/10 text-primary border-primary/20'}`}>{rule.type}</span>
                            <span className="text-xs text-zinc-300 font-medium">{rule.label}</span>
                            <span className="text-xs text-zinc-500 font-mono">{rule.comparison}</span>
                            <span className="text-xs text-primary font-bold">{rule.val}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Target Audience Count Metric Card */}
                    <div className="md:col-span-2 rounded-xl bg-[#0E0E11] border border-zinc-850 p-4 flex flex-col justify-between text-center h-full">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-850 pb-1.5">
                        Query Output Size
                      </div>
                      <div className="my-auto py-4">
                        <div className="text-4xl font-display font-extrabold text-primary">
                          <CountUp target={24482} duration={0.8} />
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium mt-1">Customers Matched</div>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        Query time: 14ms (Indexed Cluster)
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'channels' && (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                      {[
                        { channel: 'WhatsApp API', rate: '99.2%', color: 'bg-emerald-500', vol: '1.2M sent', status: 'Operational' },
                        { channel: 'RCS Messaging', rate: '98.5%', color: 'bg-primary', vol: '450k sent', status: 'Operational' },
                        { channel: 'Transactional Email', rate: '99.9%', color: 'bg-blue-500', vol: '4.8M sent', status: 'Optimal' },
                        { channel: 'High-Speed SMS', rate: '97.8%', color: 'bg-yellow-500', vol: '800k sent', status: 'Operational' }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.2 }}
                          className="rounded-xl bg-[#0E0E11] border border-zinc-855 p-3.5 flex flex-col justify-between h-[135px]"
                        >
                          <div>
                            <div className="text-[8px] uppercase tracking-wider font-bold text-zinc-500">{item.channel}</div>
                            <div className="text-lg font-bold text-white tracking-tight mt-1">{item.rate}</div>
                            <div className="text-[9px] text-zinc-400 font-mono mt-0.5">{item.vol}</div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: item.rate }}
                                transition={{ duration: 1.2, delay: idx * 0.08 }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500">
                              <span>DELIVERABILITY</span>
                              <span className="text-emerald-400 font-semibold">{item.status}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Feature Showcase Marquee ───────────────────────────────── */
function FeatureMarquee() {
  const features = [
    'AI Campaign Copywriter',
    'Conversational AI Agent',
    'Smart Audience Segmentation',
    'Multi-Channel Delivery Pipeline',
    'Real-Time Telemetry & Tracking',
    'High-Volume CSV Importer',
    'Customer Profile Logs',
    'Automated Campaign Scheduling',
    'Encrypted API Integrations',
    'Conversion Flow Analytics'
  ];

  return (
    <div className="relative overflow-hidden py-6 border-y border-zinc-800 bg-[#050507]">
      {/* Ambient gradient edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <div className="animate-marquee select-none cursor-default">
        {[...features, ...features].map((feature, i) => (
          <div key={i} className="flex items-center shrink-0 mr-16">
            <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary/50 mr-3" />
            <span className="text-sm font-display font-extrabold text-zinc-100 tracking-wider uppercase">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Bento Box Layout configurations - simplified and highly visible
  const bentoCards = [
    {
      no: "01",
      icon: <Sparkles className="h-5 w-5" />,
      title: "AI Campaign Agent",
      description: "Converse directly with Gemini intelligence to model segments, draft copy, and schedule delivery workflows instantly.",
      badge: "Gemini 2.5 Pro",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-2',
      customElement: (
        <div className="mt-4 p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl font-mono text-[10px] text-zinc-300">
          <span className="text-primary">&gt;</span> Prompt: "Draft a segment for users who purchased twice this week."
        </div>
      )
    },
    {
      no: "02",
      icon: <Target className="h-5 w-5" />,
      title: "Smart Segment Builder",
      description: "Build laser-focused segments with nested AND/OR matrix rules.",
      badge: "Real-time Queries",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-1',
      customElement: (
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="text-[9px] bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800 text-primary">City == Delhi</span>
          <span className="text-[9px] bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">Spend &gt; 10k</span>
        </div>
      )
    },
    {
      no: "03",
      icon: <Send className="h-5 w-5" />,
      title: "Multi-Channel Delivery",
      description: "Reach customers exactly where they respond: WhatsApp, RCS, high-throughput SMS, and transactional Email.",
      badge: "Unified APIs",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-1',
      customElement: (
        <div className="mt-4 flex items-center gap-3 text-zinc-300">
          <MessageSquare className="w-4 h-4 text-primary" />
          <Mail className="w-4 h-4" />
          <span className="text-[9px] font-mono opacity-80">Ready Gateways</span>
        </div>
      )
    },
    {
      no: "04",
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Real-Time Telemetry & Analytics",
      description: "Monitor delivery status, absolute open rates, and direct conversions on beautiful, minimal telemetry boards.",
      badge: "Live Webhooks",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-2',
      customElement: (
        <div className="mt-4 flex items-end gap-1.5 h-8 justify-between">
          {[20, 40, 25, 60, 35, 75, 45, 90, 60].map((v, i) => (
            <div key={i} className="flex-1 bg-zinc-900/50 h-full rounded flex items-end">
              <div className="w-full bg-primary/45 rounded-sm" style={{ height: `${v}%` }} />
            </div>
          ))}
        </div>
      )
    },
    {
      no: "05",
      icon: <Database className="h-5 w-5" />,
      title: "High-Volume CSV Importer",
      description: "Ingest customer databases and order logs. Auto-resolve duplicates and compute attributes in flight.",
      badge: "Data Lake",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-1',
      customElement: (
        <div className="mt-4 p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center">
          <span className="text-[10px] text-primary font-mono font-semibold">Drop CSV database</span>
        </div>
      )
    },
    {
      no: "06",
      icon: <Shield className="h-5 w-5" />,
      title: "Enterprise Architecture",
      description: "Built for developers with robust rate-limiters, encrypted keys, and replica clusters.",
      badge: "TLS Encrypted",
      cardStyle: {
        background: '#0D0D10',
        borderColor: '#27272A'
      },
      accentColor: 'text-primary',
      badgeStyle: 'text-primary border-primary/20 bg-primary/5',
      gridSpan: 'md:col-span-1',
      customElement: (
        <div className="mt-4 flex items-center gap-2 text-zinc-300">
          <Lock className="w-4 h-4 text-[#10B981]" />
          <span className="text-[9px] font-mono">TLS 1.3 | AES-256</span>
        </div>
      )
    }
  ];

  const steps = [
    {
      no: "01",
      title: "Ingest Customer Records",
      description: "Upload customer directories or transaction logs via manual tables or bulk CSV uploads.",
      icon: <Database className="w-5 h-5 text-primary" />
    },
    {
      no: "02",
      title: "Define Smart Segments",
      description: "Create rule-based segments using filters like order counts, absolute spend, city, or tags.",
      icon: <Target className="w-5 h-5 text-primary" />
    },
    {
      no: "03",
      title: "Orchestrate with AI Agent",
      description: "Command the AI Agent to draft templates, personalize copy, and deliver across optimal channels.",
      icon: <Rocket className="w-5 h-5 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden selection:bg-primary/30 selection:text-white font-sans antialiased">
      
      {/* ─── Ambient Glow Effects ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[3%] left-[50%] -translate-x-1/2 w-[500px] h-[250px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-850">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-primary/40 transition-colors">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="text-sm font-display font-extrabold tracking-[0.2em] text-white">
              XENO<span className="text-primary font-medium">CRM</span>
            </span>
          </Link>

          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-xs tracking-wider uppercase px-5 py-2.5 flex items-center gap-1.5">
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs text-zinc-300 hover:text-white font-semibold tracking-wider uppercase transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs tracking-wider uppercase px-5 py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="relative pt-20 pb-12 overflow-hidden" ref={heroRef}>
        <PerspectiveGrid />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10">
          <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
            
            

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight text-white leading-[1.05] max-w-4xl mx-auto">
              Automated Retention for{' '}
              <span className="text-primary font-extrabold block sm:inline italic">D2C Brands.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-zinc-200 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
              Connect your transactional databases directly. Use natural language commands to deploy precision-segmented WhatsApp, RCS, and Email workflows in minutes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase shadow-xl">
                  <span>Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase shadow-xl">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700">
                    <MousePointerClick className="w-4 h-4 text-zinc-400" />
                    Interactive Demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <div className="max-w-4xl mx-auto px-6 mt-16 relative z-10">
          <FloatingDashboard />
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center mt-12">
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">System Overview</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 animate-bounce" />
        </div>
      </section>

      {/* ─── Metric Telemetry ───────────────────────────────── */}
      <section className="relative border-y border-zinc-800 bg-[#050507]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 98, suffix: '%', label: 'Average Delivery Rate', metric: 'Real-time telemetry' },
            { value: 10, suffix: 'x', label: 'Campaign Velocity', metric: 'Operational acceleration' },
            { value: 100, suffix: '%', label: 'Dynamic Copywriting', metric: 'LLM generated' },
            { value: 0, suffix: '', label: 'Code Requirements', metric: 'Pure intent architecture' }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1.5 md:border-r last:border-0 border-zinc-800 px-4">
              <div className="text-3xl md:text-5xl font-display font-extrabold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[10px] text-primary uppercase font-bold tracking-wider pt-1">{stat.label}</div>
              <div className="text-[9px] text-zinc-400 font-mono font-medium">{stat.metric}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bento Capabilities Grid ────────────────────────── */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Architecture</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">
            Designed for <span className="text-primary italic">High Scale.</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-200 leading-relaxed max-w-lg mx-auto font-medium">
            An asynchronous, high-throughput suite containing all features needed to optimize customer retention.
          </p>
        </div>

        {/* Custom Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bentoCards.map((feat, idx) => (
            <TiltCard
              key={idx}
              className={`min-h-[300px] ${feat.gridSpan}`}
              bgStyle={feat.cardStyle}
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-primary w-fit">
                    {feat.icon}
                  </div>
                  <span className={`text-[9px] font-mono border rounded px-2.5 py-0.5 uppercase tracking-wider ${feat.badgeStyle}`}>
                    {feat.badge}
                  </span>
                </div>
                
                <h4 className="text-lg font-display font-bold text-white tracking-tight pt-1">{feat.title}</h4>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">{feat.description}</p>
              </div>

              {/* Card Footer / Custom Element */}
              <div>
                {feat.customElement}
                <div className="h-[1px] bg-zinc-800 w-full mt-5" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ─── Workflow Step-by-Step ──────────────────────────── */}
      <section className="relative border-t border-zinc-800 bg-[#050507] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Lifecycle</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white">
              Minimalist <span className="text-primary italic">Workflow.</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed max-w-lg mx-auto font-medium">
              A logical flow designed to ingest databases, build criteria, and dispatch notifications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-zinc-800 bg-[#0D0D10] p-8 overflow-hidden flex flex-col justify-between h-72"
              >
                <div className="absolute top-4 right-6 text-7xl font-display font-black text-white/[0.03] select-none">
                  {step.no}
                </div>
                
                <div className="space-y-4">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-primary w-fit">
                    {step.icon}
                  </div>
                  <h4 className="text-lg font-display font-bold text-white tracking-tight">{step.title}</h4>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">{step.description}</p>
                </div>

                <div className="inline-flex items-center gap-1">
                  <span className="text-[9px] font-mono text-primary uppercase tracking-widest font-bold">Phase {step.no}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Showcase Marquee ────────────────────────── */}
      <FeatureMarquee />

      {/* ─── Final CTA ──────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.01] to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex p-3 rounded-full bg-zinc-900 border border-zinc-800 text-primary">
            <Rocket className="w-5 h-5" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Scale retention without <span className="text-primary italic block sm:inline">overhead.</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-200 max-w-md mx-auto leading-relaxed font-sans font-medium">
            Ingest customer databases, configure segments via prompt-like parameters, and direct the AI agent.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest uppercase w-full sm:w-auto shadow-2xl">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3.5 text-xs font-bold tracking-widest uppercase w-full sm:w-auto shadow-2xl">
                  Create a Free Account
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5 text-xs font-bold tracking-widest uppercase w-full sm:w-auto bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700">
                  Interactive Demo
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-850 bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-display font-extrabold tracking-widest text-white">
              XENO<span className="text-primary font-medium">CRM</span>
            </span>
            <span className="text-[10px] text-zinc-400 ml-3">© 2026 XenoCRM. Built for modern brands.</span>
          </div>
          <div className="flex gap-6">
            <span className="text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-[10px] text-text-muted hover:text-white transition-colors cursor-pointer font-sans">|</span>
            <span className="text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="text-[10px] text-text-muted hover:text-white transition-colors cursor-pointer font-sans">|</span>
            <span className="text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
