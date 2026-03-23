import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Activity, 
  Lock, 
  CreditCard, 
  Headphones,
  Check,
  X,
  Loader2,
  TrendingUp,
  Zap,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Transaction, UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSettings } from '../context/SettingsContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
}

interface FraudTransaction extends Transaction {
  riskScore: number;
  location: string;
  status: 'Safe' | 'Suspicious' | 'Reported';
  reason?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function FraudDetection({ profile, transactions }: Props) {
  const { formatCurrency } = useSettings();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [fraudData, setFraudData] = useState<FraudTransaction[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAccountFrozen, setIsAccountFrozen] = useState(false);
  const [isCardBlocked, setIsCardBlocked] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'suspicious'>('all');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const locations = ['New York, USA', 'London, UK', 'Mumbai, India', 'Tokyo, Japan', 'Paris, France', 'Berlin, Germany', 'Dubai, UAE'];

  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Initialize fraud data from transactions
  useEffect(() => {
    if (transactions.length > 0 && fraudData.length === 0) {
      const initialData = transactions.map(tx => ({
        ...tx,
        riskScore: Math.floor(Math.random() * 20), // Low initial risk
        location: locations[Math.floor(Math.random() * locations.length)],
        status: 'Safe' as const,
      }));
      setFraudData(initialData);
    }
  }, [transactions]);

  const handleScan = () => {
    setIsScanning(true);
    setAiInsights([]);
    
    setTimeout(() => {
      const scannedData = fraudData.map(tx => {
        let score = Math.floor(Math.random() * 15); // Base noise
        let reason = '';

        // Logic 1: Large Amount
        if (Math.abs(tx.amount) > 1000) {
          score += 40;
          reason = 'Unusually high transaction amount detected.';
        }

        // Logic 2: Unusual Location (Simulated)
        if (Math.random() > 0.8) {
          score += 30;
          reason = reason ? reason + ' New location anomaly.' : 'Transaction from an unrecognized location.';
        }

        // Logic 3: Frequency (Simulated)
        if (Math.random() > 0.9) {
          score += 25;
          reason = reason ? reason + ' High frequency burst.' : 'Rapid sequence of transactions detected.';
        }

        return {
          ...tx,
          riskScore: Math.min(score, 100),
          status: (score > 50 ? 'Suspicious' : 'Safe') as 'Safe' | 'Suspicious' | 'Reported',
          reason: score > 50 ? reason : undefined
        };
      });

      setFraudData(scannedData);
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString());
      addToast('Scan complete. Security audit finished.', 'success');
    }, 2500);
  };

  const handleMarkSafe = (id: string) => {
    setFraudData(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Safe', riskScore: 5 } : tx));
    addToast('Transaction marked as safe.', 'success');
  };

  const handleReportFraud = (id: string) => {
    setFraudData(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'Reported', riskScore: 100 } : tx));
    addToast('Fraud reported. Security team notified.', 'error');
  };

  const generateAIInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => {
      const suspicious = fraudData.filter(tx => tx.status === 'Suspicious');
      if (suspicious.length === 0) {
        setAiInsights(['No immediate threats detected. Your account patterns look healthy.']);
      } else {
        const insights = [
          `Detected ${suspicious.length} anomalies in the last 24 hours.`,
          `Unusual high-value transaction of ${formatCurrency(Math.abs(suspicious[0]?.amount || 0))} at ${suspicious[0]?.location}.`,
          `Recommendation: Enable 2FA for all transactions above $500.`
        ];
        setAiInsights(insights);
      }
      setIsGeneratingInsights(false);
      addToast('AI Insights generated.', 'success');
    }, 1500);
  };

  const suspiciousCount = fraudData.filter(tx => tx.status === 'Suspicious').length;
  const riskLevel = suspiciousCount > 3 ? 'High' : suspiciousCount > 0 ? 'Medium' : 'Low';

  const riskTrendData = useMemo(() => {
    return fraudData.slice(0, 10).reverse().map((tx, i) => ({
      time: `T-${10-i}`,
      score: tx.riskScore
    }));
  }, [fraudData]);

  const filteredData = activeFilter === 'all' ? fraudData : fraudData.filter(tx => tx.status === 'Suspicious' || tx.status === 'Reported');

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
            Fraud Detection
          </h1>
          <p className="text-gray-500">Real-time security monitoring and threat analysis.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isScanning ? 'Analyzing...' : 'Scan Transactions'}
          </button>
        </div>
      </header>

      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live</span>
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Scanned</p>
          <h3 className="text-3xl font-bold">{fraudData.length}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            {suspiciousCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Suspicious</p>
          <h3 className={cn("text-3xl font-bold", suspiciousCount > 0 ? "text-rose-500" : "text-white")}>
            {suspiciousCount}
          </h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Risk Level</p>
          <h3 className={cn(
            "text-3xl font-bold",
            riskLevel === 'High' ? "text-rose-500" : riskLevel === 'Medium' ? "text-amber-500" : "text-emerald-500"
          )}>
            {riskLevel}
          </h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Last Scan</p>
          <h3 className="text-xl font-bold">{lastScanTime || 'Never'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Analysis Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Risk Analysis Table
              </h3>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {(['all', 'suspicious'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeFilter === f ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-4 font-bold">Merchant / Location</th>
                    <th className="px-8 py-4 font-bold">Amount</th>
                    <th className="px-8 py-4 font-bold">Risk Score</th>
                    <th className="px-8 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.map((tx) => (
                    <tr 
                      key={tx.id} 
                      className={cn(
                        "hover:bg-white/5 transition-all group",
                        tx.status === 'Suspicious' ? "bg-rose-500/5" : ""
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="font-bold">{tx.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {tx.location}
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${tx.riskScore}%` }}
                              className={cn(
                                "h-full rounded-full",
                                tx.riskScore > 70 ? "bg-rose-500" : tx.riskScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-bold",
                            tx.riskScore > 70 ? "text-rose-500" : tx.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {tx.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                          tx.status === 'Suspicious' ? "bg-rose-500/20 text-rose-500" : 
                          tx.status === 'Reported' ? "bg-rose-600 text-white" :
                          "bg-emerald-500/20 text-emerald-500"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Trend Visualization */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Risk Trend Visualization
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & AI Insights */}
        <div className="space-y-8">
          {/* Alerts Panel */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Active Alerts
            </h3>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {fraudData.filter(tx => tx.status === 'Suspicious').map((tx) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-rose-500">Suspicious Activity</h4>
                        <p className="text-xs text-gray-400 mt-1">{tx.reason}</p>
                      </div>
                      <span className="text-xs font-bold text-rose-500">{formatCurrency(Math.abs(tx.amount))}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMarkSafe(tx.id)}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all"
                      >
                        Mark Safe
                      </button>
                      <button 
                        onClick={() => handleReportFraud(tx.id)}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold transition-all"
                      >
                        Report Fraud
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {suspiciousCount === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm">No active security alerts.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Fraud Insights */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                AI Fraud Insights
              </h3>
              <button 
                onClick={generateAIInsights}
                disabled={isGeneratingInsights}
                className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4">
              {aiInsights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed"
                >
                  {insight}
                </motion.div>
              ))}
              {aiInsights.length === 0 && !isGeneratingInsights && (
                <button 
                  onClick={generateAIInsights}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Generate Security Insights
                </button>
              )}
            </div>
          </div>

          {/* User Action Panel */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" />
              Security Controls
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setIsAccountFrozen(!isAccountFrozen);
                  addToast(isAccountFrozen ? 'Account unfrozen.' : 'Account temporarily frozen.', isAccountFrozen ? 'success' : 'warning');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                  isAccountFrozen ? "bg-rose-600 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-bold">{isAccountFrozen ? 'Unfreeze Account' : 'Freeze Account'}</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
              <button 
                onClick={() => {
                  setIsCardBlocked(!isCardBlocked);
                  addToast(isCardBlocked ? 'Card unblocked.' : 'Card blocked successfully.', isCardBlocked ? 'success' : 'warning');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                  isCardBlocked ? "bg-rose-600 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-bold">{isCardBlocked ? 'Unblock Card' : 'Block Card'}</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold">Contact Support</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>
            </div>
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
                toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" :
                "bg-amber-500/20 border-amber-500/20 text-amber-400"
              )}
            >
              {toast.type === 'success' ? <Check className="w-5 h-5" /> : 
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
