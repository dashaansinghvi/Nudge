import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Activity, 
  DollarSign, 
  Target, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  RefreshCw, 
  Calculator,
  LineChart as LineChartIcon,
  CheckCircle2,
  Info,
  X,
  Loader2,
  Briefcase,
  Zap,
  BarChart3,
  Bell,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface Recommendation {
  asset: string;
  returnRate: string;
  risk: string;
  duration: string;
  allocation: number;
  color: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function InvestmentIntel({ profile }: Props) {
  const { formatCurrency, financials, updateSettings } = useSettings();
  
  // State for Profile Setup
  const [income, setIncome] = useState<string>('100000');
  const [budget, setBudget] = useState<string>(financials.budget.toString());
  const [risk, setRisk] = useState<number>(financials.riskPreference === 'Low Risk' ? 1 : financials.riskPreference === 'Balanced' ? 2 : 3);
  const [goal, setGoal] = useState<string>('Wealth growth');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [allocation, setAllocation] = useState<any[] | null>(null);
  
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [marketTrends, setMarketTrends] = useState<any[] | null>(null);
  
  const [calcAmount, setCalcAmount] = useState<string>('100000');
  const [calcDuration, setCalcDuration] = useState<string>('5');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "I'm your Nudge Investment Advisor. Ask me anything about where to invest, risk vs return, or market trends." }
  ]);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      let recs: Recommendation[] = [];
      if (risk === 1) {
        recs = [
          { asset: 'Fixed Deposit (FD)', returnRate: '7.5%', risk: 'Low', duration: '1-5 Years', allocation: 50, color: '#10b981' },
          { asset: 'Bonds', returnRate: '8.0%', risk: 'Low', duration: '3-10 Years', allocation: 30, color: '#6366f1' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 20, color: '#f59e0b' },
        ];
      } else if (risk === 2) {
        recs = [
          { asset: 'SIP (Mutual Funds)', returnRate: '12-15%', risk: 'Medium', duration: '5+ Years', allocation: 40, color: '#6366f1' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 30, color: '#f59e0b' },
          { asset: 'Fixed Deposit (FD)', returnRate: '7.5%', risk: 'Low', duration: '1-3 Years', allocation: 20, color: '#10b981' },
          { asset: 'Stocks (Bluechip)', returnRate: '14-18%', risk: 'Med-High', duration: '5+ Years', allocation: 10, color: '#8b5cf6' },
        ];
      } else {
        recs = [
          { asset: 'Stocks (Growth)', returnRate: '18-25%', risk: 'High', duration: '5-10 Years', allocation: 50, color: '#f43f5e' },
          { asset: 'SIP (Small/Mid Cap)', returnRate: '15-20%', risk: 'High', duration: '7+ Years', allocation: 30, color: '#8b5cf6' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 10, color: '#f59e0b' },
          { asset: 'Crypto/Alts', returnRate: 'High Variance', risk: 'Very High', duration: 'Long Term', allocation: 10, color: '#ec4899' },
        ];
      }
      setRecommendations(recs);
      setIsAnalyzing(false);
      addToast('Investment profile analyzed successfully.', 'success');
    }, 2000);
  };

  const handleOptimize = () => {
    if (!recommendations) {
      addToast('Please analyze your profile first.', 'warning');
      return;
    }
    setIsOptimizing(true);
    setTimeout(() => {
      const allocData = recommendations.map((r, i) => ({
        name: r.asset,
        value: r.allocation,
        color: r.color
      }));
      setAllocation(allocData);
      setIsOptimizing(false);
      addToast('Portfolio allocation optimized.', 'success');
    }, 1500);
  };

  const handleFetchTrends = () => {
    setIsFetchingTrends(true);
    setTimeout(() => {
      setMarketTrends([
        { title: 'Gold Prices Rising', desc: 'Gold has seen a 4% surge this month due to global market shifts.', trend: 'up' },
        { title: 'SIP Returns Stable', desc: 'Large-cap mutual funds are maintaining a steady 12% annualized return.', trend: 'neutral' },
        { title: 'Tech Stocks Volatile', desc: 'Short-term dip in tech sector, presenting a potential buying opportunity.', trend: 'down' }
      ]);
      setIsFetchingTrends(false);
      addToast('Market trends updated.', 'success');
    }, 2000);
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const p = parseFloat(calcAmount);
      const t = parseFloat(calcDuration);
      const r = 0.12; // Assume 12% return for illustration
      const futureValue = p * Math.pow(1 + r, t);
      
      const chartData = [];
      for (let i = 0; i <= t; i++) {
        chartData.push({
          year: `Year ${i}`,
          invested: p,
          value: p * Math.pow(1 + r, i)
        });
      }
      
      setCalcResult({
        futureValue,
        chartData
      });
      setIsCalculating(false);
      addToast('Growth projection calculated.', 'success');
    }, 1500);
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setTimeout(() => {
      let aiMsg = "";
      const lower = userMsg.toLowerCase();
      if (lower.includes('50000') || lower.includes('50,000')) {
        aiMsg = `For ${formatCurrency(50000)}, I recommend a diversified approach:\n• ${formatCurrency(25000)} in an Index Fund SIP (steady growth)\n• ${formatCurrency(15000)} in Gold ETF (hedge against inflation)\n• ${formatCurrency(10000)} in an FD (liquidity and safety)`;
      } else if (lower.includes('sip') && lower.includes('fd')) {
        aiMsg = "SIPs (Mutual Funds) generally offer higher returns (12-15%) over the long term but carry market risk. FDs offer guaranteed, fixed returns (around 7%) with zero market risk. \n\n👉 Suggestion: Use FDs for short-term goals (< 3 years) and SIPs for long-term wealth creation.";
      } else {
        aiMsg = "Based on current market conditions, diversifying across equity (for growth) and debt/gold (for stability) is the best strategy. Ensure you maintain an emergency fund of 6 months' expenses in a liquid asset like an FD.";
      }
      setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg }]);
    }, 1000);
  };

  useEffect(() => {
    setBudget(financials.budget.toString());
    setRisk(financials.riskPreference === 'Low Risk' ? 1 : financials.riskPreference === 'Balanced' ? 2 : 3);
  }, [financials]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-indigo-500" />
            Investment Intelligence
          </h1>
          <p className="text-gray-500">AI-powered advisor for maximum returns with controlled risk.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Tools */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Setup */}
          <div className="bg-nudge-card border border-nudge rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-nudge-primary">
              <Target className="w-5 h-5 text-indigo-400" />
              Investment Profile Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-nudge-secondary uppercase tracking-widest mb-2">Monthly Income</label>
                <input 
                  type="number" 
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-nudge-primary font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-nudge-secondary uppercase tracking-widest mb-2">Investment Budget</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-nudge-primary font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Risk Appetite: {risk === 1 ? 'Low' : risk === 2 ? 'Medium' : 'High'}
                </label>
                <input 
                  type="range" 
                  min="1" max="3" step="1"
                  value={risk}
                  onChange={(e) => setRisk(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-3"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Investment Goal</label>
                <select 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-bold appearance-none"
                >
                  <option>Short-term (1-3 yrs)</option>
                  <option>Long-term (5+ yrs)</option>
                  <option>Wealth growth</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              Analyze Investments
            </button>
          </div>

          {/* AI Recommendations */}
          <AnimatePresence>
            {recommendations && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md"
              >
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Best Investments for You
                </h3>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${rec.color}20` }}>
                          <BarChart3 className="w-6 h-6" style={{ color: rec.color }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{rec.asset}</h4>
                          <p className="text-xs text-gray-400">Duration: {rec.duration}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expected Return</p>
                          <p className="font-bold text-emerald-400">{rec.returnRate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Risk Level</p>
                          <p className={cn("font-bold", rec.risk.includes('High') ? 'text-rose-400' : rec.risk.includes('Low') ? 'text-emerald-400' : 'text-amber-400')}>
                            {rec.risk}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Allocation</p>
                          <p className="font-bold text-indigo-400">{rec.allocation}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Future Growth Calculator */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              Future Growth Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Investment Amount</label>
                <input 
                  type="number" 
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Duration (Years)</label>
                <input 
                  type="number" 
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-all text-white font-bold"
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold hover:bg-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LineChartIcon className="w-4 h-4" />}
                  Calculate Growth
                </button>
              </div>
            </div>

            <AnimatePresence>
              {calcResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <p className="text-sm text-nudge-secondary mb-1">Projected Value in {calcDuration} Years</p>
                    <h4 className="text-3xl font-bold text-emerald-400">{formatCurrency(calcResult.futureValue)}</h4>
                    <p className="text-xs text-emerald-500/70 mt-2">Assuming 12% annualized return</p>
                  </div>
                  
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calcResult.chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="year" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                          formatter={(v: number) => formatCurrency(v)}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Investment Comparison */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
                Investment Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5 bg-white/5">
                    <th className="px-8 py-4 font-bold">Asset Class</th>
                    <th className="px-8 py-4 font-bold">Avg. Returns</th>
                    <th className="px-8 py-4 font-bold">Risk</th>
                    <th className="px-8 py-4 font-bold">Liquidity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 font-bold">Fixed Deposit (FD)</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">6.5% - 7.5%</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">Very Low</td>
                    <td className="px-8 py-5">High (with penalty)</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 font-bold">SIP (Mutual Funds)</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">12% - 15%</td>
                    <td className="px-8 py-5 text-amber-400 font-bold">Medium</td>
                    <td className="px-8 py-5">High</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 font-bold">Gold ETF</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">8% - 10%</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">Low</td>
                    <td className="px-8 py-5">Very High</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5 font-bold">Direct Stocks</td>
                    <td className="px-8 py-5 text-emerald-400 font-bold">15% - 25%+</td>
                    <td className="px-8 py-5 text-rose-400 font-bold">High</td>
                    <td className="px-8 py-5">Very High</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Allocation, Market, Chat */}
        <div className="space-y-8">
          
          {/* Smart Allocation Engine */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-400" />
                Smart Allocation
              </h3>
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing || !recommendations}
                className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="min-h-[250px] flex flex-col items-center justify-center">
              {allocation ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <div className="h-[200px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocation}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {allocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                          formatter={(value: number) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {allocation.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-300">{item.name}</span>
                        </div>
                        <span className="font-bold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-500">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Analyze your profile to generate an optimal allocation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Market Intelligence System */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Market Intelligence
              </h3>
              <button 
                onClick={handleFetchTrends}
                disabled={isFetchingTrends}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {isFetchingTrends ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="space-y-4 min-h-[150px]">
              {isFetchingTrends ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                  <p className="text-xs font-bold text-gray-400">Scanning global markets...</p>
                </div>
              ) : marketTrends ? (
                <AnimatePresence>
                  {marketTrends.map((trend, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {trend.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : 
                         trend.trend === 'down' ? <TrendingUp className="w-4 h-4 text-rose-400 transform rotate-180" /> :
                         <Activity className="w-4 h-4 text-amber-400" />}
                        <span className="font-bold text-sm">{trend.title}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{trend.desc}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <button 
                  onClick={handleFetchTrends}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Fetch Market Trends
                </button>
              )}
            </div>
          </div>

          {/* Investment Alerts */}
          <div className="bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Smart Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-400">Good time to invest in Gold</p>
                  <p className="text-xs text-amber-500/70 mt-1">Prices have dipped 2% this week, offering a strong entry point.</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">FD Rates Increased</p>
                  <p className="text-xs text-emerald-500/70 mt-1">Top banks are now offering up to 7.8% on 3-year deposits.</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Investment Chat */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 bg-indigo-600/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Nudge Advisor</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Always Active</p>
              </div>
            </div>
            <div className="h-[300px] overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChat} className="p-6 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about investments..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-8 right-8 z-[200] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[240px] backdrop-blur-xl border",
                toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" :
                toast.type === 'warning' ? "bg-amber-500/20 border-amber-500/20 text-amber-400" :
                toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" :
                "bg-indigo-500/20 border-indigo-500/20 text-indigo-400"
              )}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               toast.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
               toast.type === 'error' ? <X className="w-5 h-5" /> : 
               <Info className="w-5 h-5" />}
              <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
