import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
  Zap,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction } from '../types';
import { getFinancialInsights } from '../services/aiService';
import { useSettings } from '../context/SettingsContext';
import { MonthlyReport } from './MonthlyReport';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#a855f7', '#34d399', '#fb7185', '#f59e0b'];

const DashboardView = React.memo(function DashboardView({ profile, transactions }: Props) {
  const { formatCurrency } = useSettings();
  const [insights, setInsights] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchInsights = useCallback(async () => {
    const data = await getFinancialInsights(transactions, profile);
    setInsights(data);
  }, [transactions, profile]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);

    try {
      // Wait for charts to render
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Nudge_Wealth_Report_${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`);
      
      // Save to history (simulated)
      const history = JSON.parse(localStorage.getItem('nudge_report_history') || '[]');
      history.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });
      localStorage.setItem('nudge_report_history', JSON.stringify(history));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const spendingTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = transactions.filter(tx => 
        new Date(tx.timestamp).toISOString().split('T')[0] === date && tx.amount < 0
      );
      return {
        date: date.split('-').slice(1).join('/'),
        amount: Math.abs(dayTxs.reduce((acc, tx) => acc + tx.amount, 0))
      };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(tx => tx.amount < 0).forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const metrics = useMemo(() => [
    { label: 'Total Balance', value: formatCurrency(profile.balance), icon: Wallet, color: 'text-indigo-400' },
    { label: 'Monthly Spending', value: formatCurrency(profile.monthly_spending), icon: ArrowDownRight, color: 'text-rose-400' },
    { label: 'Total Savings', value: formatCurrency(profile.savings), icon: ArrowUpRight, color: 'text-emerald-400' },
    { label: 'Fraud Alerts', value: transactions.filter(t => t.is_flagged).length, icon: ShieldAlert, color: 'text-amber-400' },
  ], [profile.balance, profile.monthly_spending, profile.savings, transactions, formatCurrency]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInsights();
    setIsRefreshing(false);
  }, [fetchInsights]);

  return (
    <div className="space-y-8 relative">
      {/* Hidden Report Template */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <MonthlyReport 
          ref={reportRef} 
          profile={profile} 
          transactions={transactions} 
          formatCurrency={formatCurrency} 
          insights={insights} 
        />
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Welcome to Nudge, {profile.name}</h1>
          <p className="text-gray-500">Nudge Insight: Your financial vitality is looking strong today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 font-medium"
          >
            {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isGeneratingPDF ? 'Generating...' : 'Monthly Report'}
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </header>

      {/* Top Section: Vitality & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vitality Score */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-nudge-secondary opacity-10"
              />
              <motion.circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={553}
                initial={{ strokeDashoffset: 553 }}
                animate={{ strokeDashoffset: 553 - (553 * profile.vitality_score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-indigo-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-nudge-primary">{profile.vitality_score}</span>
              <span className="text-nudge-secondary text-sm uppercase tracking-widest font-medium">Vitality</span>
            </div>
          </div>
          <p className="mt-6 text-center text-gray-400 text-sm">
            Your score is in the top 15% of users with similar goals.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/10 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${m.color}`}>
                <m.icon className="w-6 h-6" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{m.label}</p>
              <h3 className="text-2xl font-bold">{m.value}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Spending Trend
            </h3>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#0a0a0c' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              Expense Breakdown
            </h3>
            <span className="text-xs text-gray-500 uppercase tracking-widest">By Category</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-gray-400'
                  }`}>
                    {tx.amount > 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{tx.name}</h4>
                    <p className="text-sm text-gray-500">{tx.category} • {new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-nudge-primary'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                  {tx.is_flagged && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold">Flagged</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xl font-bold">Nudge Insights</h3>
          </div>
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed"
              >
                {insight}
              </motion.div>
            ))}
            {insights.length === 0 && (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-2xl" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-8 right-8 z-[200] space-y-3 pointer-events-none">
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[240px] backdrop-blur-xl border bg-emerald-500/20 border-emerald-500/20 text-emerald-400"
            >
              <Download className="w-5 h-5" />
              <span className="font-bold text-sm">Report downloaded successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default DashboardView;
