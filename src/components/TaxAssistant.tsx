import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Zap, 
  Upload, 
  Calendar, 
  History, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle, 
  Check, 
  X, 
  Loader2, 
  ArrowRight,
  FileText,
  Info,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { UserProfile } from '../types';
import { useSettings } from '../context/SettingsContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile;
}

interface TaxRecord {
  year: string;
  income: number;
  taxPaid: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function TaxAssistant({ profile }: Props) {
  const { formatCurrency, ...settings } = useSettings();
  // --- State ---
  const [income, setIncome] = useState({
    annual: 1200000,
    salary: 1000000,
    other: 200000
  });
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [deductions, setDeductions] = useState({
    section80C: 150000,
    section80D: 25000,
    hra: 50000,
    eduLoan: 0
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [taxResult, setTaxResult] = useState({ payable: 0, effectiveRate: 0, savings: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [futureIncome, setFutureIncome] = useState(1500000);
  const [projectedTax, setProjectedTax] = useState(0);
  const [history, setHistory] = useState<TaxRecord[]>([
    { year: '2023-24', income: 1050000, taxPaid: 85000 },
    { year: '2022-23', income: 900000, taxPaid: 62000 }
  ]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "I'm your Nudge Tax Expert. Ask me anything about Indian tax laws, 80C, or how to save more!" }
  ]);

  // --- Helpers ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const calculateTax = (inc: number, reg: 'old' | 'new', deds: typeof deductions) => {
    let taxableIncome = inc;
    let tax = 0;

    if (reg === 'new') {
      // New Regime FY 2024-25
      taxableIncome -= 75000; // Standard Deduction
      if (taxableIncome <= 700000) return 0; // Rebate u/s 87A

      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
        taxableIncome = 1500000;
      }
      if (taxableIncome > 1200000) {
        tax += (taxableIncome - 1200000) * 0.20;
        taxableIncome = 1200000;
      }
      if (taxableIncome > 900000) {
        tax += (taxableIncome - 900000) * 0.15;
        taxableIncome = 900000;
      }
      if (taxableIncome > 600000) {
        tax += (taxableIncome - 600000) * 0.10;
        taxableIncome = 600000;
      }
      if (taxableIncome > 300000) {
        tax += (taxableIncome - 300000) * 0.05;
      }
    } else {
      // Old Regime
      const totalDeds = Math.min(deds.section80C, 150000) + Math.min(deds.section80D, 25000) + deds.hra + deds.eduLoan + 50000;
      taxableIncome -= totalDeds;
      if (taxableIncome <= 500000) return 0; // Rebate u/s 87A

      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        taxableIncome = 1000000;
      }
      if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        taxableIncome = 500000;
      }
      if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
      }
    }
    return tax * 1.04; // 4% Cess
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const totalInc = income.annual;
      const tax = calculateTax(totalInc, regime, deductions);
      const oldTax = calculateTax(totalInc, 'old', deductions);
      const newTax = calculateTax(totalInc, 'new', deductions);
      
      setTaxResult({
        payable: tax,
        effectiveRate: (tax / totalInc) * 100,
        savings: Math.max(0, Math.abs(oldTax - newTax))
      });
      setIsCalculating(false);
      addToast('Tax calculated successfully');
    }, 1000);
  };

  const handleApplyDeductions = () => {
    handleCalculate();
    addToast('Deductions applied and tax recalculated');
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIncome({
        annual: 1500000,
        salary: 1350000,
        other: 150000
      });
      setIsUploading(false);
      addToast('Document analyzed. Income fields auto-filled.', 'info');
    }, 2000);
  };

  const handlePredict = () => {
    const pTax = calculateTax(futureIncome, regime, deductions);
    setProjectedTax(pTax);
    addToast('Future tax projected');
  };

  const findOpportunities = () => {
    setIsGeneratingSuggestions(true);
    setTimeout(() => {
      const suggestions = [];
      if (deductions.section80C < 150000) {
        suggestions.push(`Invest ${formatCurrency(150000 - deductions.section80C)} more in ELSS or PPF to maximize 80C.`);
      }
      if (deductions.section80D < 25000) {
        suggestions.push(`Consider a health insurance policy to claim up to ${formatCurrency(25000)} under 80D.`);
      }
      if (regime === 'old' && deductions.hra === 0) {
        suggestions.push("If you pay rent, ensure you submit rent receipts to claim HRA exemption.");
      }
      if (suggestions.length === 0) {
        suggestions.push(`You've maximized your current deductions! Consider NPS for an extra ${formatCurrency(50000)} deduction.`);
      }
      setAiSuggestions(suggestions);
      setIsGeneratingSuggestions(false);
      addToast('AI Optimization complete', 'success');
    }, 1500);
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Simple mock AI responses for tax
    setTimeout(() => {
      let aiMsg = "That's a great question. Under Indian Tax Law, ";
      if (userMsg.toLowerCase().includes('80c')) {
        aiMsg += `Section 80C allows deductions up to ${formatCurrency(150000)} for investments like LIC, PPF, and ELSS.`;
      } else if (userMsg.toLowerCase().includes('save')) {
        aiMsg += "you can save tax by maximizing 80C, 80D, and considering NPS (Section 80CCD).";
      } else {
        aiMsg += "I recommend consulting with a chartered accountant for specific complex scenarios, but I can help with general slab rates!";
      }
      setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg }]);
    }, 1000);
  };

  // --- Charts Data ---
  const chartData = [
    { name: 'Income', value: income.annual, fill: '#6366f1' },
    { name: 'Tax', value: taxResult.payable, fill: '#fb7185' },
    { name: 'Savings', value: taxResult.savings, fill: '#34d399' }
  ];

  const pieData = [
    { name: 'Take Home', value: income.annual - taxResult.payable },
    { name: 'Tax', value: taxResult.payable }
  ];

  const COLORS = ['#6366f1', '#fb7185'];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Calculator className="w-10 h-10 text-indigo-500" />
            Smart Tax Assistant
          </h1>
          <p className="text-gray-500">Professional tax management and AI-powered optimization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => addToast('Tax report exported successfully.', 'success')} 
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Calculator */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Income Input */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-indigo-400" />
                Income Details
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Annual Income (Total)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={income.annual}
                      onChange={(e) => setIncome({ ...income, annual: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Salary</label>
                    <input 
                      type="number" 
                      value={income.salary}
                      onChange={(e) => setIncome({ ...income, salary: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Other Income</label>
                    <input 
                      type="number" 
                      value={income.other}
                      onChange={(e) => setIncome({ ...income, other: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tax Regime</label>
                  <select 
                    value={regime}
                    onChange={(e) => setRegime(e.target.value as 'old' | 'new')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="new">New Regime (Default)</option>
                    <option value="old">Old Regime</option>
                  </select>
                </div>
                <button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                  Calculate Tax
                </button>
              </div>
            </motion.div>

            {/* Tax Result Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[32px] p-8 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold mb-8">Tax Summary</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Total Tax Payable</p>
                    <h2 className="text-5xl font-bold tracking-tighter">{formatCurrency(taxResult.payable)}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Effective Rate</p>
                      <p className="text-2xl font-bold">{taxResult.effectiveRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Regime Savings</p>
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(taxResult.savings)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <p className="text-xs text-gray-400">Calculated based on FY 2024-25 Indian Tax Slabs.</p>
              </div>
            </motion.div>
          </div>

          {/* Deduction Manager */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Deductions & Exemptions (Old Regime)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Section 80C (Investments)</label>
                <input 
                  type="number" 
                  value={deductions.section80C}
                  onChange={(e) => setDeductions({ ...deductions, section80C: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder={`Max ${formatCurrency(150000)}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Section 80D (Health Insurance)</label>
                <input 
                  type="number" 
                  value={deductions.section80D}
                  onChange={(e) => setDeductions({ ...deductions, section80D: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder={`Max ${formatCurrency(25000)}/${formatCurrency(50000)}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">HRA Exemption</label>
                <input 
                  type="number" 
                  value={deductions.hra}
                  onChange={(e) => setDeductions({ ...deductions, hra: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Education Loan Interest</label>
                <input 
                  type="number" 
                  value={deductions.eduLoan}
                  onChange={(e) => setDeductions({ ...deductions, eduLoan: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <button 
              onClick={handleApplyDeductions}
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Apply Deductions
            </button>
          </div>

          {/* Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Tax Breakdown
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                Take Home vs Tax
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI & Planning */}
        <div className="space-y-8">
          {/* AI Tax Optimization */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-indigo-600/20 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Nudge Optimization
              </h3>
              <button 
                onClick={findOpportunities}
                disabled={isGeneratingSuggestions}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {isGeneratingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed flex gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  {suggestion}
                </motion.div>
              ))}
              {aiSuggestions.length === 0 && (
                <button 
                  onClick={findOpportunities}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Find Tax Saving Opportunities
                </button>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Document Analysis
            </h3>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center space-y-4 hover:border-indigo-500/50 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold">Upload Salary Slip or Form 16</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (Max 5MB)</p>
              </div>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Analyze Document
              </button>
            </div>
          </div>

          {/* Tax Planning & Forecast */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Tax Planning
            </h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <span>Future Income</span>
                  <span className="text-white">{formatCurrency(futureIncome)}</span>
                </div>
                <input 
                  type="range" 
                  min="500000" 
                  max="5000000" 
                  step="50000"
                  value={futureIncome}
                  onChange={(e) => setFutureIncome(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Projected Tax</p>
                <h4 className="text-2xl font-bold">{formatCurrency(projectedTax)}</h4>
              </div>
              <button 
                onClick={handlePredict}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                Predict Future Tax
              </button>
            </div>
          </div>

          {/* Alerts & Deadlines */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Deadlines
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-rose-500">ITR Filing Due</p>
                  <p className="text-xs text-gray-400">Assessment Year 2024-25</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">102</p>
                  <p className="text-[10px] uppercase tracking-tighter font-bold text-gray-500">Days Left</p>
                </div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber-500">Advance Tax</p>
                  <p className="text-xs text-gray-400">Q1 Installment</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">15</p>
                  <p className="text-[10px] uppercase tracking-tighter font-bold text-gray-500">Days Left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax History Tracker */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Tax History
          </h3>
          <button 
            onClick={() => addToast('Add Record functionality coming soon.', 'info')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all"
          >
            Add Record
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4 font-bold">Financial Year</th>
                <th className="px-8 py-4 font-bold">Gross Income</th>
                <th className="px-8 py-4 font-bold">Tax Paid</th>
                <th className="px-8 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((record, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="px-8 py-6 font-bold">{record.year}</td>
                  <td className="px-8 py-6">{formatCurrency(record.income)}</td>
                  <td className="px-8 py-6 font-bold text-indigo-400">{formatCurrency(record.taxPaid)}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest">Filed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nudge Tax Chat Assistant */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
        <div className="p-8 border-b border-white/5 bg-indigo-600/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Nudge AI Tax Expert</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Expert Guidance • Indian Tax Laws</p>
          </div>
        </div>
        <div className="h-[400px] overflow-y-auto p-8 space-y-6">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleChat} className="p-8 border-t border-white/5">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about 80C, HRA, or New vs Old Regime..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-8 pr-16 focus:outline-none focus:border-indigo-500 transition-all text-lg"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </form>
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
                "bg-indigo-500/20 border-indigo-500/20 text-indigo-400"
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

// Mock RefreshCw icon if not available from lucide
function RefreshCw({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
