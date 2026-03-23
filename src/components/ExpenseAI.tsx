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
      amount: -Math.abs(parseFloat(newTx.amount)), // Expenses are negative
      category: newTx.category,
      is_flagged: false
    });
    
    setNewTx({ name: '', amount: '', category: 'General' });
    setIsAdding(false);
    showNotification('Transaction added successfully');
  }, [newTx, addTransaction, showNotification]);

  const handleUploadCSV = useCallback(() => {
    setIsUploading(true);
    // Simulate CSV parsing
    setTimeout(() => {
      setIsUploading(false);
      showNotification('CSV parsed and 12 transactions added');
    }, 2000);
  }, [showNotification]);

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Expense AI</h1>
          <p className="text-gray-500">Uncovering hidden patterns in your spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleUploadCSV}
            disabled={isUploading}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload CSV
          </button>
        </div>
      </header>

      {/* Add Transaction Form */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" />
          Quick Add Expense
        </h3>
        <form onSubmit={handleAddTransaction} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Merchant Name" 
            value={newTx.name}
            onChange={e => setNewTx({...newTx, name: e.target.value})}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
            required
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={newTx.amount}
            onChange={e => setNewTx({...newTx, amount: e.target.value})}
            className="w-full md:w-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500"
            required
            min="0.01"
            step="0.01"
          />
          <select 
            value={newTx.category}
            onChange={e => setNewTx({...newTx, category: e.target.value})}
            className="w-full md:w-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none"
          >
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Shopping">Shopping</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="General">General</option>
          </select>
          <button 
            type="submit"
            disabled={isAdding}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-32 h-32 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Spending Loopholes
          </h3>
          <p className="text-gray-400 text-sm mb-6">Recurring small expenses that add up to significant monthly leaks.</p>
          <div className="text-3xl font-bold text-indigo-400 mb-2">
            {formatCurrency(Math.abs(loopholes.reduce((acc, tx) => acc + tx.amount, 0)))}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Potential Monthly Savings</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="w-32 h-32 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Lost Money Found
          </h3>
          <p className="text-gray-400 text-sm mb-6">Unaccounted cash flow or flagged transactions needing your attention.</p>
          <div className="text-3xl font-bold text-rose-400 mb-2">
            {formatCurrency(Math.abs(lostMoney.reduce((acc, tx) => acc + tx.amount, 0)))}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Flagged Amount</p>
        </div>
      </div>

      {/* Nudge */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-1">Put your idle money to work</h3>
            <p className="text-gray-400">You have {formatCurrency(1850)} in idle cash. Moving this to a SIP could earn you {formatCurrency(240)} annually.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('invest')}
          className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          Start SIP Now
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Smart Cash Flow Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Smart Cash Flow</h3>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['all', 'loopholes', 'lost'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
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
                <th className="px-8 py-4 font-bold">Transaction</th>
                <th className="px-8 py-4 font-bold">Category</th>
                <th className="px-8 py-4 font-bold">Amount</th>
                <th className="px-8 py-4 font-bold">AI Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="font-bold">{tx.name}</div>
                    <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-8 py-6 font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="px-8 py-6">
                    {tx.is_flagged && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-tighter">
                        <AlertCircle className="w-3 h-3" />
                        Suspicious
                      </span>
                    )}
                    {loopholes.includes(tx) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-tighter">
                        <Zap className="w-3 h-3" />
                        Loophole
                      </span>
                    )}
                    {!tx.is_flagged && !loopholes.includes(tx) && (
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <Check className="w-5 h-5" />
              <span className="font-bold text-sm">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default ExpenseAI;
