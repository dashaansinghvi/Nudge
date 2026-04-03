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
  IndianRupee,
  RefreshCw
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

  // Run calculation initially
  useEffect(() => {
    const totalInc = income.annual;
    const tax = calculateTax(totalInc, regime, deductions);
    const oldTax = calculateTax(totalInc, 'old', deductions);
    const newTax = calculateTax(totalInc, 'new', deductions);
    setTaxResult({
      payable: tax,
      effectiveRate: (tax / totalInc) * 100,
      savings: Math.max(0, Math.abs(oldTax - newTax))
    });
  }, []);

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent-500" />
            Smart Tax Assistant
          </h1>
          <p className="text-gray-500 text-xs text-left">Professional tax management and AI-powered optimization.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleUpload} disabled={isUploading} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 hover:bg-white/10">
             {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
             Auto Fill W-2/Form 16
           </button>
           <button onClick={() => addToast('Tax report exported successfully.', 'success')} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 hover:bg-white/10">
             <FileText className="w-3.5 h-3.5" /> Export
           </button>
        </div>
      </header>

      {/* Inputs & Analytics row */}
      <div className="flex gap-3 flex-shrink-0 h-48">
        
        {/* Income Card */}
        <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col justify-between overflow-y-auto min-h-0 backdrop-blur-md">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" /> Income</h3>
           <div className="space-y-2.5">
             <div className="flex bg-white/5 rounded-lg p-1">
               <button className={cn("flex-1 text-[10px] font-bold py-1.5 rounded transition-all", regime === 'new' ? 'bg-action text-white shadow-md' : 'text-gray-500 hover:text-white')} onClick={() => setRegime('new')}>New Regime</button>
               <button className={cn("flex-1 text-[10px] font-bold py-1.5 rounded transition-all", regime === 'old' ? 'bg-action text-white shadow-md' : 'text-gray-500 hover:text-white')} onClick={() => setRegime('old')}>Old Regime</button>
             </div>
             <div>
               <label className="text-[10px] text-gray-500">Annual Income</label>
               <input type="number" value={income.annual} onChange={(e) => setIncome({ ...income, annual: Number(e.target.value) })} onBlur={handleCalculate} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-500" />
             </div>
           </div>
        </div>

        {/* Deductions Card */}
        <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col overflow-y-auto min-h-0 backdrop-blur-md">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Deductions</h3>
           <div className="grid grid-cols-2 gap-2 mt-auto">
             <div>
               <label className="text-[10px] text-gray-500">80C (PPF, ELSS)</label>
               <input type="number" value={deductions.section80C} onChange={(e) => setDeductions({ ...deductions, section80C: Number(e.target.value) })} onBlur={handleCalculate} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-500" disabled={regime === 'new'} />
             </div>
             <div>
               <label className="text-[10px] text-gray-500">80D (Health)</label>
               <input type="number" value={deductions.section80D} onChange={(e) => setDeductions({ ...deductions, section80D: Number(e.target.value) })} onBlur={handleCalculate} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-500" disabled={regime === 'new'} />
             </div>
             <div>
               <label className="text-[10px] text-gray-500">HRA</label>
               <input type="number" value={deductions.hra} onChange={(e) => setDeductions({ ...deductions, hra: Number(e.target.value) })} onBlur={handleCalculate} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-500" disabled={regime === 'new'} />
             </div>
             <div>
               <label className="text-[10px] text-gray-500">Edu Loan (80E)</label>
               <input type="number" value={deductions.eduLoan} onChange={(e) => setDeductions({ ...deductions, eduLoan: Number(e.target.value) })} onBlur={handleCalculate} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-500" disabled={regime === 'new'} />
             </div>
           </div>
        </div>

        {/* Dashboard Outcomes */}
        <div className="flex-[1.5] bg-gradient-to-br from-accent-600/10 to-purple-600/10 border border-accent-500/10 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden backdrop-blur-md">
           <div className="absolute top-0 right-0 p-3 opacity-20"><Zap className="w-16 h-16 text-accent-500" /></div>
           <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Total Tax Payable</p>
           <div className="flex items-end gap-3 mb-4">
             <h3 className="text-3xl font-bold text-rose-400">{formatCurrency(taxResult.payable)}</h3>
             {isCalculating && <Loader2 className="w-4 h-4 animate-spin text-accent-500 mb-2" />}
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-[9px] text-gray-500 uppercase font-bold">Effective Rate</p>
               <p className="text-sm font-bold text-white/80">{taxResult.effectiveRate.toFixed(1)}%</p>
             </div>
             <div>
               <p className="text-[9px] text-gray-500 uppercase font-bold">Regime Savings</p>
               <p className={cn("text-sm font-bold", taxResult.savings > 0 ? "text-emerald-400" : "text-gray-500")}>+{formatCurrency(taxResult.savings)}</p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Left: AI Suggestions & History */}
        <div className="flex-[1] flex flex-col gap-3 min-h-0">
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col min-h-0 backdrop-blur-md relative">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-bold text-white flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-accent-400" /> AI Tax Optimizer</h3>
               <button onClick={findOpportunities} disabled={isGeneratingSuggestions} className="text-[10px] bg-action text-white px-2 py-1 rounded disabled:opacity-50">
                  {isGeneratingSuggestions ? 'Optimizing...' : 'Optimize'}
               </button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2">
               {aiSuggestions.map((s, idx) => (
                 <div key={idx} className="p-2 bg-accent-500/5 border border-accent-500/10 rounded-lg text-[11px] leading-relaxed flex gap-2">
                   <Zap className="w-3.5 h-3.5 text-accent-400 flex-shrink-0 mt-0.5" />
                   <span>{s}</span>
                 </div>
               ))}
               {aiSuggestions.length === 0 && !isGeneratingSuggestions && (
                 <p className="text-[11px] text-gray-500 py-4 text-center border border-dashed border-white/10 rounded-lg">Click Optimize to find tax loopholes.</p>
               )}
             </div>
          </div>
          
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col p-3 min-h-0 backdrop-blur-md">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Tax History</h3>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#111] text-white/50 text-[9px] uppercase tracking-widest sticky top-0">
                  <tr><th className="font-bold py-1 px-2">FY</th><th className="font-bold py-1 px-2">Income</th><th className="font-bold py-1 px-2 text-right">Tax Paid</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map(h => (
                    <tr key={h.year}>
                      <td className="py-2 px-2 text-gray-300">{h.year}</td>
                      <td className="py-2 px-2 font-medium">{formatCurrency(h.income)}</td>
                      <td className="py-2 px-2 text-rose-400 font-medium text-right">{formatCurrency(h.taxPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: AI Expert Chat */}
        <div className="flex-[1] bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col min-h-0 backdrop-blur-md">
           <div className="p-3 border-b border-white/5 bg-accent-600/5 flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 bg-action rounded flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-xs font-bold">Tax Expert AI</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-2.5 text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-action text-white rounded-xl rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-xl rounded-bl-sm'}`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
           </div>
          
           <form onSubmit={handleChat} className="p-2 border-t border-white/5 flex-shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a tax question..."
                  className="w-full bg-white/5 border border-white/10 rounded py-1.5 pl-2 pr-8 focus:outline-none focus:border-accent-500 text-[11px]"
                />
                <button type="submit" className="absolute right-1 top-1 bottom-1 px-1.5 text-accent-400 hover:bg-accent-500/20 rounded flex items-center justify-center transition-all">
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
           </form>
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
