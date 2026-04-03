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

  useEffect(() => {
    if (transactions.length > 0 && fraudData.length === 0) {
      const initialData = transactions.map(tx => ({
        ...tx,
        riskScore: Math.floor(Math.random() * 20),
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
        let score = Math.floor(Math.random() * 15);
        let reason = '';

        if (Math.abs(tx.amount) > 1000) {
          score += 40;
          reason = 'Unusually high transaction amount detected.';
        }
        if (Math.random() > 0.8) {
          score += 30;
          reason = reason ? reason + ' New location anomaly.' : 'Transaction from an unrecognized location.';
        }
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
        setAiInsights([
          'No immediate threats detected. Your account patterns look healthy.',
          'Recommendation: Use a unique password for your linked bank accounts.',
          'Security Tip: Review your trusted devices list in Settings.',
          'Action: Set up transaction alerts for amounts over $100.',
          'Pro-tip: Periodic manual audits of your statement are a great habit.'
        ]);
      } else {
        const insights = [
          `Detected ${suspicious.length} anomalies in the last 24 hours.`,
          `Unusual high-value transaction of ${formatCurrency(Math.abs(suspicious[0]?.amount || 0))} at ${suspicious[0]?.location}.`,
          `Recommendation: Enable 2FA for all transactions above $500.`,
          `Alert: Rapid sequence of small transactions detected on your account.`,
          `Security Tip: You haven't changed your transaction password in 90 days. Consider an update.`
        ];
        setAiInsights(insights);
      }
      setIsGeneratingInsights(false);
      addToast('AI Insights generated.', 'success');
    }, 1500);
  };

  const suspiciousCount = fraudData.filter(tx => tx.status === 'Suspicious').length;
  const riskLevel = suspiciousCount > 3 ? 'High' : suspiciousCount > 0 ? 'Medium' : 'Low';

  const filteredData = activeFilter === 'all' ? fraudData : fraudData.filter(tx => tx.status === 'Suspicious' || tx.status === 'Reported');

  return (
    <div className="h-full flex flex-col gap-3">
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
            Fraud Detection
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Real-time security monitoring and threat analysis.</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-2.5 bg-action text-white rounded-xl font-bold hover:bg-accent-500 transition-all flex items-center gap-2 shadow-lg shadow-accent-600/20 disabled:opacity-50 text-sm"
        >
          {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isScanning ? 'Analyzing...' : 'Scan'}
        </button>
      </header>

      {/* Overview Dashboard - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        <div className="card-glass p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent-400" />
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Live</span>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Scanned</p>
          <h3 className="text-xl font-bold">{fraudData.length}</h3>
        </div>

        <div className="card-glass p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            {suspiciousCount > 0 && <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Suspicious</p>
          <h3 className={cn("text-xl font-bold", suspiciousCount > 0 ? "text-rose-500" : "text-white")}>{suspiciousCount}</h3>
        </div>

        <div className="card-glass p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Risk Level</p>
          <h3 className={cn(
            "text-xl font-bold",
            riskLevel === 'High' ? "text-rose-500" : riskLevel === 'Medium' ? "text-amber-500" : "text-emerald-500"
          )}>{riskLevel}</h3>
        </div>

        <div className="card-glass p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Last Scan</p>
          <h3 className="text-base font-bold">{lastScanTime || 'Never'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Risk Analysis Table */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="card-glass flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-400" />
                Risk Analysis
              </h3>
              <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
                {(['all', 'suspicious'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      activeFilter === f ? "bg-action text-white shadow" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-nudge-primary z-10">
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <th className="px-4 py-2.5 font-bold">Merchant / Location</th>
                    <th className="px-4 py-2.5 font-bold">Amount</th>
                    <th className="px-4 py-2.5 font-bold">Risk</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
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
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-xs">{tx.name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {tx.location}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-xs">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[40px]">
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
                            "text-[10px] font-bold",
                            tx.riskScore > 70 ? "text-rose-500" : tx.riskScore > 40 ? "text-amber-500" : "text-emerald-500"
                          )}>
                            {tx.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
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
        </div>

        {/* Right Column: Alerts & Controls */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          {/* Alerts Panel */}
          <div className="card-glass p-4 flex-shrink-0">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Active Alerts
            </h3>
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {fraudData.filter(tx => tx.status === 'Suspicious').slice(0, 3).map((tx) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-rose-500">Suspicious Activity</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{tx.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-rose-500">{formatCurrency(Math.abs(tx.amount))}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleMarkSafe(tx.id)}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Mark Safe
                      </button>
                      <button 
                        onClick={() => handleReportFraud(tx.id)}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Report
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {suspiciousCount === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-10" />
                  <p className="text-xs">No active alerts.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card-glass p-4 bg-gradient-to-br from-accent-600/10 to-purple-600/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent-400" />
                AI Insights
              </h3>
              <button 
                onClick={generateAIInsights}
                disabled={isGeneratingInsights}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                {isGeneratingInsights ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="space-y-2">
              {aiInsights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs leading-relaxed"
                >
                  {insight}
                </motion.div>
              ))}
              {aiInsights.length === 0 && !isGeneratingInsights && (
                <button 
                  onClick={generateAIInsights}
                  className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Generate Insights
                </button>
              )}
            </div>
          </div>

          {/* Security Controls */}
          <div className="card-glass p-4 flex-shrink-0">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Security Controls
            </h3>
            <div className="space-y-1.5">
              <button 
                onClick={() => {
                  setIsAccountFrozen(!isAccountFrozen);
                  addToast(isAccountFrozen ? 'Account unfrozen.' : 'Account temporarily frozen.', isAccountFrozen ? 'success' : 'warning');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group text-sm",
                  isAccountFrozen ? "bg-rose-600 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-bold text-xs">{isAccountFrozen ? 'Unfreeze' : 'Freeze Account'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
              <button 
                onClick={() => {
                  setIsCardBlocked(!isCardBlocked);
                  addToast(isCardBlocked ? 'Card unblocked.' : 'Card blocked successfully.', isCardBlocked ? 'success' : 'warning');
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group text-sm",
                  isCardBlocked ? "bg-rose-600 text-white" : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-bold text-xs">{isCardBlocked ? 'Unblock' : 'Block Card'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border text-xs",
                toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" :
                toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" :
                "bg-amber-500/20 border-amber-500/20 text-amber-400"
              )}
            >
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : 
               toast.type === 'error' ? <X className="w-4 h-4" /> : 
               <Info className="w-4 h-4" />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
