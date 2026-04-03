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
  Sparkles,
  Check
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
          { asset: 'Fixed Deposit (FD)', returnRate: '7.5%', risk: 'Low', duration: '1-5 Years', allocation: 40, color: '#10b981' },
          { asset: 'Bonds', returnRate: '8.0%', risk: 'Low', duration: '3-10 Years', allocation: 20, color: '#6366f1' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 15, color: '#f59e0b' },
          { asset: 'Liquid Funds', returnRate: '6.5%', risk: 'Very Low', duration: '0-1 Years', allocation: 10, color: '#34d399' },
          { asset: 'Balanced Advantage Funds', returnRate: '10.5%', risk: 'Low-Med', duration: '3-5 Years', allocation: 10, color: '#8b5cf6' },
          { asset: 'REITs', returnRate: '8.5%', risk: 'Medium', duration: '5+ Years', allocation: 5, color: '#0ea5e9' },
        ];
      } else if (risk === 2) {
        recs = [
          { asset: 'SIP (Mutual Funds)', returnRate: '12-15%', risk: 'Medium', duration: '5+ Years', allocation: 30, color: '#6366f1' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 20, color: '#f59e0b' },
          { asset: 'Fixed Deposit (FD)', returnRate: '7.5%', risk: 'Low', duration: '1-3 Years', allocation: 15, color: '#10b981' },
          { asset: 'Stocks (Bluechip)', returnRate: '14-18%', risk: 'Med-High', duration: '5+ Years', allocation: 15, color: '#8b5cf6' },
          { asset: 'REITs', returnRate: '8.5%', risk: 'Medium', duration: '5+ Years', allocation: 10, color: '#0ea5e9' },
          { asset: 'International ETFs', returnRate: '13-16%', risk: 'Medium', duration: '5+ Years', allocation: 10, color: '#f43f5e' },
        ];
      } else {
        recs = [
          { asset: 'Stocks (Growth)', returnRate: '18-25%', risk: 'High', duration: '5-10 Years', allocation: 40, color: '#f43f5e' },
          { asset: 'SIP (Small/Mid Cap)', returnRate: '15-20%', risk: 'High', duration: '7+ Years', allocation: 20, color: '#8b5cf6' },
          { asset: 'Gold ETF', returnRate: '9.0%', risk: 'Low-Med', duration: '3+ Years', allocation: 10, color: '#f59e0b' },
          { asset: 'Crypto/Alts', returnRate: 'High Variance', risk: 'Very High', duration: 'Long Term', allocation: 10, color: '#ec4899' },
          { asset: 'Energy/Commodity ETFs', returnRate: '15%+', risk: 'High', duration: '3-7 Years', allocation: 10, color: '#10b981' },
          { asset: 'IPO Access Fund', returnRate: '25%+', risk: 'Very High', duration: '0-2 Years', allocation: 10, color: '#6366f1' },
        ];
      }
      setRecommendations(recs);
      setIsAnalyzing(false);
      addToast('Investment profile analyzed successfully.', 'success');
      handleOptimize(recs); // Auto trigger optimize
    }, 1200);
  };

  const handleOptimize = (recs: Recommendation[] | null = recommendations) => {
    if (!recs) return;
    setIsOptimizing(true);
    setTimeout(() => {
      const allocData = recs.map((r) => ({
        name: r.asset,
        value: r.allocation,
        color: r.color
      }));
      setAllocation(allocData);
      setIsOptimizing(false);
    }, 800);
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
    }, 1500);
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
          year: `Y${i}`,
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
    }, 1000);
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
        aiMsg = "SIPs offer higher returns (12-15%) but carry market risk. FDs offer fixed returns (~7%) with zero risk. \n\n👉 Suggestion: FDs for short-term (<3 yrs), SIPs for long-term.";
      } else {
        aiMsg = "Based on current market conditions, diversifying across equity (growth) and debt/gold (stability) is best. Keep 6 months' expenses in a liquid asset.";
      }
      setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg }]);
    }, 1000);
  };

  useEffect(() => {
    setBudget(financials.budget.toString());
    setRisk(financials.riskPreference === 'Low Risk' ? 1 : financials.riskPreference === 'Balanced' ? 2 : 3);
    
    // Auto initiate analyze
    if (!recommendations) handleAnalyze();
    if (!marketTrends) handleFetchTrends();
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5 flex items-center gap-2 text-nudge-primary">
            <Briefcase className="w-5 h-5 text-accent-500" />
            Investment Intelligence
          </h1>
          <p className="text-gray-500 text-xs text-left">AI-powered advisor for maximum returns with controlled risk.</p>
        </div>
      </header>

      {/* Top Input Row */}
      <div className="flex gap-3 flex-shrink-0">
        {/* Profile Settings */}
        <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 backdrop-blur-md flex flex-col justify-center">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 text-xs">
                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Budget (Mo)</label>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} onBlur={handleAnalyze} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:border-accent-500" />
              </div>
              <div className="flex-1 text-xs">
                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Risk</label>
                <input type="range" min="1" max="3" step="1" value={risk} onChange={(e) => {setRisk(parseInt(e.target.value)); handleAnalyze();}} className="w-full accent-accent-500 h-1 bg-white/10 rounded-lg appearance-none mt-2" />
                <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                  <span>Low</span><span>Med</span><span>High</span>
                </div>
              </div>
              <div className="flex-1 text-xs">
                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Goal</label>
                <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:border-accent-500 text-white">
                  <option className="bg-[#111]">Short-term (1-3 yrs)</option>
                  <option className="bg-[#111]">Long-term (5+ yrs)</option>
                  <option className="bg-[#111]">Wealth growth</option>
                </select>
              </div>
              <button disabled={isAnalyzing} onClick={handleAnalyze} className="mt-4 px-3 py-1.5 bg-action text-white rounded text-xs font-bold disabled:opacity-50 flex items-center justify-center">
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>
        </div>

        {/* Growth Calculator Mini */}
        <div className="flex-1 bg-gradient-to-br from-accent-600/10 to-purple-600/10 border border-accent-500/10 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-3">
             <div className="flex-1 text-xs">
                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Initial (P)</label>
                <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:border-accent-500" />
             </div>
             <div className="flex-[0.5] text-xs">
                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Years</label>
                <input type="number" value={calcDuration} onChange={e => setCalcDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 focus:border-accent-500" />
             </div>
             <button disabled={isCalculating} onClick={handleCalculate} className="mt-4 px-3 py-1.5 bg-white/10 text-white rounded text-xs font-bold hover:bg-white/20 transition">
                {isCalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Project"}
             </button>
             {calcResult && (
               <div className="flex-[1.5] text-right mt-3">
                 <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Future Value</p>
                 <p className="text-sm font-bold">{formatCurrency(calcResult.futureValue)}</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Left: Recommendations Table & Allocation */}
        <div className="flex-[5.5] flex flex-col gap-3 min-h-0">
          <div className="flex-[1.5] bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col overflow-hidden backdrop-blur-md">
            <div className="p-3 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent-400" /> AI Recommendations</h3>
              {isAnalyzing && <span className="text-[10px] text-gray-500 animate-pulse">Analyzing profile...</span>}
            </div>
            <div className="flex-1 overflow-y-auto w-full">
              <table className="w-full text-left">
                <thead className="bg-[#0a0a0a]/50 text-white/50 text-[9px] uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-3 py-2 font-bold">Asset Class</th>
                    <th className="px-3 py-2 font-bold">Return</th>
                    <th className="px-3 py-2 font-bold">Risk</th>
                    <th className="px-3 py-2 font-bold">Alloc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recommendations?.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rec.color }} />
                          {rec.asset}
                        </div>
                        <div className="text-[9px] text-gray-500 ml-3.5">{rec.duration}</div>
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-emerald-400">{rec.returnRate}</td>
                      <td className="px-3 py-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] border", rec.risk.includes('Low') ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : rec.risk.includes('High') ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                          {rec.risk}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs font-bold">{rec.allocation}%</td>
                    </tr>
                  ))}
                  {!recommendations && (
                    <tr><td colSpan={4} className="px-3 py-8 text-center text-xs text-gray-500 border-b-0">Adjust profile to see recommendations</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Allocation & Trends Row inside Left column */}
          <div className="flex-1 flex gap-3 min-h-0">
             <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col min-h-0 p-3">
                <h3 className="text-xs font-bold flex items-center gap-1.5 mb-2"><PieChartIcon className="w-3.5 h-3.5" /> Ideal Allocation</h3>
                <div className="flex-1 min-h-0 relative">
                  {!allocation ? (
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">No data</div>
                  ) : (
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={allocation} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                           {allocation.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '11px', borderRadius: '8px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                  )}
                </div>
             </div>
             <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col min-h-0 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Market Trends</h3>
                  <button onClick={handleFetchTrends} disabled={isFetchingTrends} className="text-gray-500 hover:text-white">
                    <RefreshCw className={cn("w-3 h-3", isFetchingTrends && "animate-spin")} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {marketTrends ? marketTrends.map((t, idx) => (
                    <div key={idx} className="p-2 border border-white/5 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold">{t.title}</span>
                        {t.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : t.trend === 'down' ? <Activity className="w-3 h-3 text-rose-400" /> : <LineChartIcon className="w-3 h-3 text-gray-400" />}
                      </div>
                      <p className="text-[9px] text-gray-400 leading-tight">{t.desc}</p>
                    </div>
                  )) : (
                    <div className="text-center text-[10px] text-gray-500 py-4">Hit refresh to load trends.</div>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Right: AI Chat & Projection Chart */}
        <div className="flex-[4.5] flex flex-col gap-3 min-h-0">
          
          {/* Projection Visual (if calculated) */}
          {calcResult && (
             <div className="h-32 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex-shrink-0 flex flex-col">
                <h3 className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest text-emerald-400 mb-2">Growth Curve</h3>
                <div className="flex-1 min-h-0 h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={calcResult.chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '10px', borderRadius: '4px' }} cursor={{ stroke: '#ffffff20' }} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          )}

          {/* Chat Container */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col overflow-hidden min-h-0 backdrop-blur-md">
             <div className="p-3 border-b border-white/5 bg-accent-600/5 flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 bg-action rounded text-white flex items-center justify-center">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <h3 className="text-xs font-bold text-white">Investment AI Advisor</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-2text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-action text-white rounded-xl rounded-br-sm p-2.5' : 'bg-white/5 border border-white/10 text-gray-300 rounded-xl rounded-bl-sm p-3'}`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
             </div>
            
             <form onSubmit={handleChat} className="p-2 border-t border-white/5 flex-shrink-0 bg-[#0a0a0a]">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for investment advice..."
                    className="w-full bg-white/5 border border-white/10 rounded py-2 pl-2.5 pr-8 focus:outline-none focus:border-accent-500 text-[11px] text-white"
                  />
                  <button type="submit" className="absolute right-1 top-1 bottom-1 px-1.5 text-accent-400 hover:bg-accent-500/20 rounded flex items-center justify-center transition-all">
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn("pointer-events-auto px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border text-[11px]", toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" : toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" : "bg-accent-500/20 border-accent-500/20 text-accent-400")}>
              {toast.type === 'success' ? <Check className="w-3 h-3" /> : toast.type === 'error' ? <X className="w-3 h-3" /> : <Info className="w-3 h-3" />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
