import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  Plane, 
  Building, 
  Gift, 
  DollarSign, 
  ArrowRightLeft, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight,
  Info,
  X,
  ArrowRight,
  Award,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction } from '../types';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
}

interface UserCard {
  id: string;
  bank: string;
  name: string;
  last4: string;
  network: 'Visa' | 'Mastercard' | 'Amex';
  color: string;
  limit: number;
  available: number;
  points: number;
  expiringPoints: number;
  expiryDate: string;
}

interface MarketCard {
  id: string;
  bank: string;
  name: string;
  annualFee: number;
  benefits: string[];
  eligibility: string;
  matchScore: number;
  color: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const INITIAL_USER_CARDS: UserCard[] = [
  {
    id: 'c1',
    bank: 'HDFC Bank',
    name: 'Infinia Metal',
    last4: '4092',
    network: 'Visa',
    color: 'from-slate-800 to-slate-900 text-white',
    limit: 15000,
    available: 12400,
    points: 45000,
    expiringPoints: 2000,
    expiryDate: '12/26'
  },
  {
    id: 'c2',
    bank: 'American Express',
    name: 'Platinum Travel',
    last4: '8123',
    network: 'Amex',
    color: 'from-zinc-300 to-zinc-500 text-zinc-900',
    limit: 10000,
    available: 8500,
    points: 12500,
    expiringPoints: 0,
    expiryDate: '08/27'
  },
  {
    id: 'c3',
    bank: 'SBI Card',
    name: 'Octane',
    last4: '5514',
    network: 'Mastercard',
    color: 'from-teal-600 to-teal-800 text-white',
    limit: 5000,
    available: 1200,
    points: 8400,
    expiringPoints: 500,
    expiryDate: '03/25'
  }
];

export default function CreditIntel({ profile, transactions }: Props) {
  const { formatCurrency, ...settings } = useSettings();
  const [userCards, setUserCards] = useState<UserCard[]>(INITIAL_USER_CARDS);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferAdvice, setTransferAdvice] = useState<any>(null);
  
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [marketCards, setMarketCards] = useState<MarketCard[]>([]);
  
  const [compareMode, setCompareMode] = useState(false);
  const [cardsToCompare, setCardsToCompare] = useState<string[]>([]);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const totalPoints = userCards.reduce((acc, card) => acc + card.points, 0);
  const totalExpiring = userCards.reduce((acc, card) => acc + card.expiringPoints, 0);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setOptimizationResults([
        { category: 'Travel & Flights', card: 'HDFC Infinia Metal', reason: '5X Reward Points on SmartBuy', impact: `Save ~${formatCurrency(120)}/mo` },
        { category: 'Dining & Groceries', card: 'Amex Platinum Travel', reason: 'Milestone benefits + 3X points', impact: `Save ~${formatCurrency(60)}/mo` },
        { category: 'Fuel & Transit', card: 'SBI Octane', reason: '7.25% Value back on BPCL pumps', impact: `Save ~${formatCurrency(40)}/mo` },
        { category: 'Utilities & Bills', card: 'Amazon Pay ICICI', reason: 'Flat 2% reward on all utility payments', impact: `Save ~${formatCurrency(25)}/mo` },
        { category: 'Entertainment', card: 'RBL Play', reason: 'Buy 1 Get 1 on movie tickets', impact: `Save ~${formatCurrency(35)}/mo` }
      ]);
      setIsOptimizing(false);
      addToast('Spending analyzed. Rewards optimized!', 'success');
    }, 1500);
  };

  const handleTransferAdvice = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setTransferAdvice({
        recommendation: 'Transfer to Airline Partners',
        valueMultiplier: '2.5X',
        details: `Converting your 45,000 HDFC points to KrisFlyer miles yields a value of ${formatCurrency(900)} towards flights, compared to just ${formatCurrency(360)} if taken as statement cashback.`,
        action: 'Transfer to KrisFlyer'
      });
      setIsTransferring(false);
      addToast('Transfer options analyzed.', 'success');
    }, 1500);
  };

  const fetchMarketCards = () => {
    setIsFetchingMarket(true);
    setTimeout(() => {
      setMarketCards([
        {
          id: 'm1',
          bank: 'Chase',
          name: 'Sapphire Reserve',
          annualFee: 550,
          benefits: ['$300 Travel Credit', '3X Points Dining'],
          eligibility: 'Excellent Credit Required',
          matchScore: 94,
          color: 'from-blue-800 to-blue-950 text-white'
        },
        {
          id: 'm2',
          bank: 'Capital One',
          name: 'Venture X',
          annualFee: 395,
          benefits: ['10,000 Anniv Miles', '2X Miles All'],
          eligibility: 'Excellent Credit Required',
          matchScore: 88,
          color: 'from-slate-700 to-slate-900 text-white'
        }
      ]);
      setIsFetchingMarket(false);
      addToast('New market cards fetched.', 'success');
    }, 2000);
  };

  const toggleCompare = (id: string) => {
    setCardsToCompare(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 2) {
        addToast('You can only compare 2 cards at a time.', 'warning');
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-500" />
            Credit Intelligence
          </h1>
          <p className="text-gray-500 text-xs">Manage cards, maximize rewards, and discover premium offers.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
          <Award className="w-4 h-4 text-accent-400" />
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Points</p>
            <h2 className="text-sm font-bold text-white">{totalPoints.toLocaleString()}</h2>
          </div>
        </div>
      </header>

      {/* Your Wallet - Compact Cards Row */}
      <div className="flex-shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent-400" /> Wallet</h2>
          {totalExpiring > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 rounded-md">
              <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />
              <span className="text-[9px] font-bold text-rose-500">{totalExpiring.toLocaleString()} expiring</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 noscrollbar">
          {userCards.map(card => (
            <div 
              key={card.id}
              className={cn("w-48 h-28 rounded-lg flex-shrink-0 p-3 shadow-lg bg-gradient-to-br flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-white/10", card.color)}
              onClick={() => addToast(`Viewing details for ${card.name}`, 'info')}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold tracking-widest">{card.bank}</span>
                <span className="text-[9px] font-bold">{card.network}</span>
              </div>
              <div>
                <div className="w-5 h-4 bg-yellow-400/80 rounded mb-1.5" />
                <div className="text-xs tracking-[0.2em] font-mono mb-1">•••• {card.last4}</div>
                <div className="flex justify-between items-end">
                  <p className="text-[8px] tracking-widest font-bold truncate pr-2">{profile.name}</p>
                  <p className="text-[8px] font-bold">{card.expiryDate}</p>
                </div>
              </div>
            </div>
          ))}
          <button className="w-48 h-28 rounded-lg flex-shrink-0 border border-dashed border-white/20 flex flex-col items-center justify-center hover:bg-white/5 transition-colors gap-2 text-gray-400 hover:text-white">
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Card</span>
          </button>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Left Col: Rewards Engine & Smart Transfer */}
        <div className="flex-[1] flex flex-col gap-3 min-h-0">
          
          {/* Reward Engine */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col min-h-0 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-accent-400" /> Optimization Engine</h3>
              <button onClick={handleOptimize} disabled={isOptimizing} className="px-2 py-1 bg-action text-white rounded text-[10px] font-bold disabled:opacity-50">
                {isOptimizing ? 'Analyzing...' : 'Maximize'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!optimizationResults && !isOptimizing && (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <p className="text-[10px] text-gray-500">Run optimization to see the best card for every expense category.</p>
                </div>
              )}
              {optimizationResults?.map((res: any, i: number) => (
                <div key={i} className="p-2 border border-accent-500/10 bg-accent-500/5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{res.category}</p>
                    <p className="text-[11px] font-bold text-white leading-tight">{res.card}</p>
                    <p className="text-[9px] text-accent-400">{res.reason}</p>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                    {res.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points Transfer */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col min-h-0 backdrop-blur-md">
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold flex items-center gap-1.5"><ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" /> Smart Transfer</h3>
              <button onClick={handleTransferAdvice} disabled={isTransferring} className="px-2 py-1 border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 rounded text-[10px] font-bold hover:bg-emerald-500/20 disabled:opacity-50">
                Best Option
              </button>
            </div>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-white/10">
                <Plane className="w-3.5 h-3.5 text-gray-400 mb-1" /><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Flights</span>
              </div>
              <div className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-white/10">
                <Building className="w-3.5 h-3.5 text-gray-400 mb-1" /><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Hotels</span>
              </div>
              <div className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-white/10">
                <Gift className="w-3.5 h-3.5 text-gray-400 mb-1" /><span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Cards</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!transferAdvice && !isTransferring && (
                <div className="h-full flex items-center justify-center border border-white/5 border-dashed rounded-lg">
                  <p className="text-[10px] text-gray-500 px-4 text-center">Let AI find the best value for your 45K points.</p>
                </div>
              )}
              {transferAdvice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[11px] font-bold text-emerald-400">{transferAdvice.recommendation}</h4>
                    <span className="px-1 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">{transferAdvice.valueMultiplier} Value</span>
                  </div>
                  <p className="text-[9px] text-gray-300 mb-2 leading-relaxed">{transferAdvice.details}</p>
                  <button className="w-full py-1.5 bg-emerald-600/80 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-500">
                    {transferAdvice.action} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Market Intelligence */}
        <div className="flex-[1] bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col min-h-0 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5"><Search className="w-3.5 h-3.5 text-accent-400" /> Market Check</h3>
            <button onClick={fetchMarketCards} disabled={isFetchingMarket} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold hover:bg-white/10 flex items-center gap-1 disabled:opacity-50">
              {isFetchingMarket ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
              Refresh
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {!isFetchingMarket && marketCards.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Search className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-[10px] text-gray-500">Scan market for premium credit card offers tailored to you.</p>
              </div>
            )}
            {marketCards.map((card) => (
               <div key={card.id} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                 <div className="flex gap-3">
                   <div className={cn("w-14 h-10 rounded shadow-md bg-gradient-to-br flex-shrink-0 border border-white/10", card.color)} />
                   <div className="flex-1 min-w-0">
                     <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">{card.bank}</p>
                     <p className="text-xs font-bold truncate leading-tight mt-0.5">{card.name}</p>
                     <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">
                       <Sparkles className="w-2.5 h-2.5" /> {card.matchScore}% Match
                     </span>
                   </div>
                 </div>
                 <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[10px] font-bold">{formatCurrency(card.annualFee)}/yr</span>
                   <span className="text-[9px] text-accent-400 font-medium truncate">{card.eligibility}</span>
                 </div>
                 <ul className="mt-2 space-y-1">
                   {card.benefits.map((b, i) => (
                     <li key={i} className="text-[9px] text-gray-400 flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> {b}</li>
                   ))}
                 </ul>
               </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn("pointer-events-auto px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border text-[11px]", toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" : toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" : "bg-accent-500/20 border-accent-500/20 text-accent-400")}>
              {toast.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : toast.type === 'error' ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
