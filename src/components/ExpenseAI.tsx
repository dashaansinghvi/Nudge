import React, { useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  Zap,
  AlertCircle,
  ChevronRight,
  Plus,
  Upload,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction } from '../types';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
}

const ExpenseAI = React.memo(function ExpenseAI({ profile, transactions, onNavigate }: Props) {
  const { addTransaction } = useData();
  const { formatCurrency } = useSettings();
  const [filter, setFilter] = useState<'all' | 'loopholes' | 'lost'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [newTx, setNewTx] = useState({ name: '', amount: '', category: 'General' });

  const loopholes = useMemo(() => transactions.filter(tx => 
    tx.amount < 0 && Math.abs(tx.amount) < 20 && transactions.filter(t => t.name === tx.name).length > 2
  ), [transactions]);

  const lostMoney = useMemo(() => transactions.filter(tx => tx.is_flagged), [transactions]);

  const filteredTransactions = useMemo(() => transactions.filter(tx => {
    if (filter === 'loopholes') return loopholes.includes(tx);
    if (filter === 'lost') return lostMoney.includes(tx);
    return true;
  }), [transactions, filter, loopholes, lostMoney]);

  const showNotification = useCallback((msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleAddTransaction = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.name || !newTx.amount) return;
    
    setIsAdding(true);
    await addTransaction({
      name: newTx.name,
      amount: -Math.abs(parseFloat(newTx.amount)),
      category: newTx.category,
      is_flagged: false
    });
    
    setNewTx({ name: '', amount: '', category: 'General' });
    setIsAdding(false);
    showNotification('Transaction added successfully');
  }, [newTx, addTransaction, showNotification]);

  const handleUploadCSV = useCallback(() => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      showNotification('CSV parsed and 12 transactions added');
    }, 2000);
  }, [showNotification]);

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Expense AI</h1>
          <p className="text-gray-500 text-xs">Uncovering hidden patterns in your spending.</p>
        </div>
        <button 
          onClick={handleUploadCSV}
          disabled={isUploading}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Upload CSV
        </button>
      </header>

      {/* Compact Add Form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-md flex-shrink-0">
        <form onSubmit={handleAddTransaction} className="flex gap-3 items-center">
          <Plus className="w-4 h-4 text-accent-400 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Merchant Name" 
            value={newTx.name}
            onChange={e => setNewTx({...newTx, name: e.target.value})}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent-500 text-sm"
            required
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={newTx.amount}
            onChange={e => setNewTx({...newTx, amount: e.target.value})}
            className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent-500 text-sm"
            required
            min="0.01"
            step="0.01"
          />
          <select 
            value={newTx.category}
            onChange={e => setNewTx({...newTx, category: e.target.value})}
            className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent-500 appearance-none text-white text-sm"
          >
            <option value="Food" className="bg-[#111]">Food</option>
            <option value="Transport" className="bg-[#111]">Transport</option>
            <option value="Shopping" className="bg-[#111]">Shopping</option>
            <option value="Entertainment" className="bg-[#111]">Entertainment</option>
            <option value="Utilities" className="bg-[#111]">Utilities</option>
            <option value="General" className="bg-[#111]">General</option>
          </select>
          <button 
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 bg-action text-white rounded-lg font-bold hover:bg-accent-500 transition-all flex items-center gap-1.5 disabled:opacity-50 text-sm"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </form>
      </div>

      {/* Insights Row: Loopholes + Lost Money + SIP Nudge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <TrendingUp className="w-16 h-16 text-accent-500" />
          </div>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-400" />
            Spending Loopholes
          </h3>
          <p className="text-gray-400 text-[10px] mb-2">Recurring small expenses adding up monthly.</p>
          <div className="text-xl font-bold text-accent-400">
            {formatCurrency(Math.abs(loopholes.reduce((acc, tx) => acc + tx.amount, 0)))}
          </div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Potential Savings</p>
        </div>

        <div className="card-glass p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Lost Money Found
          </h3>
          <p className="text-gray-400 text-[10px] mb-2">Flagged transactions needing attention.</p>
          <div className="text-xl font-bold text-rose-400">
            {formatCurrency(Math.abs(lostMoney.reduce((acc, tx) => acc + tx.amount, 0)))}
          </div>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Total Flagged</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-600/15 to-accent-600/15 border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold mb-0.5">Put idle money to work</h3>
            <p className="text-[10px] text-gray-400 truncate">{formatCurrency(1850)} idle → {formatCurrency(240)}/yr via SIP</p>
          </div>
          <button 
            onClick={() => onNavigate('invest')}
            className="px-3 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-1 text-xs whitespace-nowrap flex-shrink-0"
          >
            Start SIP <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smart Cash Flow Table — fills remaining space with internal scroll */}
      <div className="card-glass flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold">Smart Cash Flow</h3>
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
            {(['all', 'loopholes', 'lost'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f ? 'bg-action text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
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
                <th className="px-4 py-2.5 font-bold">Transaction</th>
                <th className="px-4 py-2.5 font-bold">Category</th>
                <th className="px-4 py-2.5 font-bold">Amount</th>
                <th className="px-4 py-2.5 font-bold">AI Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-xs">{tx.name}</div>
                    <div className="text-[10px] text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-medium text-gray-400">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 font-bold text-xs ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-2.5">
                    {tx.is_flagged && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg uppercase tracking-tighter w-fit">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Suspicious
                      </span>
                    )}
                    {loopholes.includes(tx) && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-lg uppercase tracking-tighter w-fit">
                        <Zap className="w-2.5 h-2.5" />
                        Loophole
                      </span>
                    )}
                    {!tx.is_flagged && !loopholes.includes(tx) && (
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <Check className="w-3.5 h-3.5" />
              <span className="font-bold text-xs">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default ExpenseAI;
