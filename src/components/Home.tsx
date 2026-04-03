import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  MessageSquare, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction } from '../types';
import { getFinancialInsights } from '../services/aiService';
import { useSettings } from '../context/SettingsContext';

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
}

const Home = React.memo(function Home({ profile, transactions, onNavigate }: Props) {
  const { formatCurrency } = useSettings();
  const [insights, setInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInsights = useCallback(async () => {
    const data = await getFinancialInsights(transactions, profile);
    setInsights(data);
  }, [transactions, profile]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchInsights();
    setIsRefreshing(false);
  };

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Compact Hero Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            {timeOfDay}, <span className="text-accent-500">{profile.name.split(' ')[0]}</span>.
          </motion.h1>
          <p className="text-nudge-secondary-text text-sm mt-0.5">Your financial ecosystem is breathing. Ready for today's nudges?</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 px-4 py-2.5 bg-action text-white rounded-xl hover:bg-accent-500 transition-all shadow-xl shadow-accent-600/20 font-bold text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Talk to AI
          </button>
          <button 
            onClick={handleRefresh}
            className="p-2.5 bg-nudge-inverse/10 border border-nudge-border rounded-xl hover:bg-nudge-inverse/10 transition-all text-nudge-secondary-text"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Left Column: Quick Insights & Nudges */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          
          {/* Core Metrics Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
            {[
              { label: 'Spending Limit', value: formatCurrency(profile.monthly_spending), icon: ArrowDownRight, color: 'text-rose-400', bgColor: 'bg-rose-500/8', desc: 'Daily: ' + formatCurrency(profile.monthly_spending / 30) },
              { label: 'Available Cash', value: formatCurrency(profile.balance), icon: Wallet, color: 'text-emerald-400', bgColor: 'bg-emerald-500/8', desc: 'Across linked accounts' },
              { label: 'Investment Gain', value: '+4.2%', icon: ArrowUpRight, color: 'text-accent-400', bgColor: 'bg-accent-500/8', desc: 'Beating market by 1.1%' }
            ].map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="card-glass p-3.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`metric-icon ${m.color} ${m.bgColor}`}>
                    <m.icon className="w-4 h-4" />
                  </div>
                  <p className="text-nudge-secondary-text text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
                </div>
                <h3 className="text-xl font-bold mb-0.5">{m.value}</h3>
                <p className="text-[10px] text-nudge-secondary-text font-medium">{m.desc}</p>
              </motion.div>
            ))}
          </section>

          {/* Daily Nudges Feed */}
          <section className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h2 className="text-sm font-bold flex items-center gap-2 text-nudge-primary-text">
                <Zap className="w-3.5 h-3.5 text-accent-400" />
                Strategic Nudges
              </h2>
              <span className="text-[10px] text-nudge-secondary-text uppercase tracking-widest font-bold">Updated Just Now</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
              <AnimatePresence mode="popLayout">
                {insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                      onClick={() => {
                        const text = insight.toLowerCase();
                        if (text.includes('sip') || text.includes('move') || text.includes('invest')) onNavigate('invest');
                        else if (text.includes('subscription') || text.includes('bill') || text.includes('cancel')) onNavigate('bills');
                        else if (text.includes('credit') || text.includes('score')) onNavigate('credit');
                        else onNavigate('dashboard');
                      }}
                      className="group card-glass p-4 cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start gap-3">
                        <div className="metric-icon shrink-0 bg-accent-500/8">
                          <Zap className="w-3.5 h-3.5 text-accent-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-nudge-primary-text font-medium leading-snug text-xs mb-2">{insight}</p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-accent-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300">
                            Execute Strategy <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 card-glass animate-pulse" />
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Column: Profile Hub */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          
          {/* Vitality Hub Card */}
          <div className="card-glass-lg p-5 relative overflow-hidden flex-shrink-0">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{background: 'radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)', filter: 'blur(40px)'}} />
            
            <div className="relative flex items-center gap-5">
              <div className="w-20 h-20 relative flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40" cy="40" r="35"
                    stroke="currentColor"
                    strokeWidth="5"
                    fill="transparent"
                    className="text-nudge-primary-text/[0.04]"
                  />
                  <motion.circle
                    cx="40" cy="40" r="35"
                    stroke="url(#vitalityGrad)"
                    strokeWidth="5"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={220}
                    initial={{ strokeDashoffset: 220 }}
                    animate={{ strokeDashoffset: 220 - (220 * profile.vitality_score) / 100 }}
                    transition={{ duration: 2, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  />
                  <defs>
                    <linearGradient id="vitalityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a8fff" />
                      <stop offset="100%" stopColor="#00e5b0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{profile.vitality_score}</span>
                  <span className="text-[7px] uppercase font-bold tracking-widest text-nudge-secondary-text">Score</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1">Financial Vitality</h3>
                <p className="text-xs text-nudge-secondary-text mb-3 leading-snug">
                  Score rose by 4 pts this week. You're becoming more resilient.
                </p>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 text-nudge-secondary-text hover:text-nudge-primary-text"
                >
                  View Analytics <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="flex flex-col gap-1.5 flex-1 min-h-0">
            <h3 className="text-[10px] font-bold text-nudge-primary-text/25 uppercase tracking-widest px-1 mb-1">Quick Actions</h3>
            {[
              { action: () => onNavigate('expense-ai'), icon: Plus, label: 'Add New Expense', iconColor: 'text-accent-400', iconBg: 'bg-accent-500/8' },
              { action: () => onNavigate('bills'), icon: TrendingUp, label: 'Optimize Monthly Bills', iconColor: 'text-purple-400', iconBg: 'bg-purple-500/8' },
              { action: () => onNavigate('credit'), icon: ShieldCheck, label: 'Check Credit Intel', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/8' },
            ].map((item, i) => (
              <motion.button 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                onClick={item.action}
                className="w-full p-2.5 card-glass flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`metric-icon ${item.iconColor} ${item.iconBg}`}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-xs text-nudge-primary-text group-hover:text-nudge-primary-text/90 transition-colors">{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-nudge-primary-text/15 group-hover:text-accent-400 transition-colors" />
              </motion.button>
            ))}
          </section>
        </div>

      </div>
    </div>
  );
});

export default Home;
