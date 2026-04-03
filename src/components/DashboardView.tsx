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
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
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
    { label: 'Total Balance', value: formatCurrency(profile.balance), icon: Wallet, color: 'text-accent-400', bgColor: 'bg-accent-500/8' },
    { label: 'Monthly Spending', value: formatCurrency(profile.monthly_spending), icon: ArrowDownRight, color: 'text-rose-400', bgColor: 'bg-rose-500/8' },
    { label: 'Total Savings', value: formatCurrency(profile.savings), icon: ArrowUpRight, color: 'text-emerald-400', bgColor: 'bg-emerald-500/8' },
    { label: 'Fraud Alerts', value: transactions.filter(t => t.is_flagged).length, icon: ShieldAlert, color: 'text-amber-400', bgColor: 'bg-amber-500/8' },
  ], [profile.balance, profile.monthly_spending, profile.savings, transactions, formatCurrency]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInsights();
    setIsRefreshing(false);
  }, [fetchInsights]);

  return (
    <div className="h-full flex flex-col gap-4 relative">
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

      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Analytics Dashboard</h1>
          <p className="text-white/30 text-xs">Your financial vitality is looking strong today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-3 py-2 bg-action text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-accent-600/15 font-medium text-xs"
          >
            {isGeneratingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {isGeneratingPDF ? 'Generating...' : 'Monthly Report'}
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-all text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Top Section: Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        {metrics.map((m, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="card-glass p-3.5"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`metric-icon ${m.color} ${m.bgColor}`}>
                <m.icon className="w-4 h-4" />
              </div>
              <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{m.label}</p>
            </div>
            <h3 className="text-xl font-bold">{m.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="card-glass-lg p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-accent-400" />
              Spending Trend
            </h3>
            <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">Last 7 Days</span>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#6366f1' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="url(#lineGrad)" 
                  strokeWidth={2.5} 
                  dot={{ r: 2.5, fill: '#6366f1', strokeWidth: 2, stroke: '#0a1525' }}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#6366f1' }}
                />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass-lg p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="w-3.5 h-3.5 text-purple-400" />
              Expense Breakdown
            </h3>
            <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">By Category</span>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="65%"
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f1729', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">Report downloaded</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default DashboardView;
