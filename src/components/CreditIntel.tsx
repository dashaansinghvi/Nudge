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
  cvv: string;
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
    color: 'from-slate-800 to-slate-900 text-nudge-primary-text',
    limit: 15000,
    available: 12400,
    points: 45000,
    expiringPoints: 2000,
    expiryDate: '12/26',
    cvv: '123'
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
    expiryDate: '08/27',
    cvv: '456'
  },
  {
    id: 'c3',
    bank: 'SBI Card',
    name: 'Octane',
    last4: '5514',
    network: 'Mastercard',
    color: 'from-teal-600 to-teal-800 text-nudge-primary-text',
    limit: 5000,
    available: 1200,
    points: 8400,
    expiringPoints: 500,
    expiryDate: '03/25',
    cvv: '789'
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
          color: 'from-blue-800 to-blue-950 text-nudge-primary-text'
        },
        {
          id: 'm2',
          bank: 'Capital One',
          name: 'Venture X',
          annualFee: 395,
          benefits: ['10,000 Anniv Miles', '2X Miles All'],
          eligibility: 'Excellent Credit Required',
          matchScore: 88,
          color: 'from-slate-700 to-slate-900 text-nudge-primary-text'
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
          <h1 className="text-2xl font-bold tracking-tight mb-0.5">Credit Intelligence</h1>
          <p className="text-nudge-secondary-text text-xs">Manage cards, maximize rewards, and discover premium offers.</p>
        </div>
        <div className="card-glass px-4 py-2 flex items-center gap-3">
          <Award className="w-4 h-4 text-accent-400" />
          <div className="text-right">
            <p className="text-[10px] text-nudge-secondary-text uppercase tracking-widest font-bold">Total Points</p>
            <h2 className="text-sm font-bold text-nudge-primary-text">{totalPoints.toLocaleString()}</h2>
          </div>
        </div>
      </header>

      {/* Your Wallet - Compact Cards Row */}
      <div className="card-glass flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent-400" /> Wallet</h2>
          {totalExpiring > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 rounded-md">
              <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-rose-500">{totalExpiring.toLocaleString()} expiring</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 noscrollbar perspective-1000">
          {userCards.map(card => {
            const isFlipped = flippedCardId === card.id;
            
            return (
              <div 
                key={card.id}
                className="w-56 h-32 flex-shrink-0 relative cursor-pointer group"
                onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="w-full h-full relative"
                  initial={false}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front View */}
                  <div 
                    className={cn(
                      "absolute inset-0 w-full h-full rounded-xl p-4 shadow-xl border border-nudge-border bg-gradient-to-br flex flex-col justify-between backface-hidden",
                      card.color
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold tracking-widest opacity-80">{card.bank}</span>
                      <span className="text-[10px] font-bold">{card.network}</span>
                    </div>
                    <div>
                      <div className="w-7 h-5 bg-yellow-400/80 rounded shadow-inner mb-2" />
                      <div className="text-sm tracking-[0.25em] font-mono mb-2 text-nudge-primary-text/90">•••• {card.last4}</div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] tracking-widest font-bold uppercase truncate pr-2 opacity-80">{profile.name}</p>
                        <p className="text-[10px] font-bold opacity-80">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Back View */}
                  <div 
                    className={cn(
                      "absolute inset-0 w-full h-full rounded-xl shadow-xl border border-nudge-border bg-gradient-to-br flex flex-col items-stretch backface-hidden",
                      card.color
                    )}
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <div className="h-7 bg-nudge-inverse/80 w-full mt-4" />
                    <div className="px-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-6 bg-nudge-inverse/10 rounded flex items-center justify-end px-2">
                          <span className="text-[10px] font-mono italic text-nudge-secondary-text">authorized signature</span>
                        </div>
                        <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                          <span className="text-[10px] font-bold text-black font-mono">{card.cvv}</span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-[6px] opacity-40 leading-none">This card is property of {card.bank}. If found, please return to any branch.</p>
                        <p className="text-[6px] opacity-40 leading-none">Customer Service: 1-800-NUDGE-AI</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
          <button className="w-56 h-32 rounded-xl flex-shrink-0 border border-dashed border-nudge-border flex flex-col items-center justify-center hover:bg-nudge-inverse/10 transition-all gap-2 text-nudge-secondary-text hover:text-nudge-primary-text group">
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Connect New Card</span>
          </button>
        </div>
      </div>

      {/* Main Bottom Section */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Left Col: Rewards Engine & Smart Transfer */}
        <div className="flex-[1] flex flex-col gap-3 min-h-0">
          
          {/* Reward Engine */}
          <div className="card-glass flex-1 flex flex-col min-h-0 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-accent-400" /> Optimization Engine</h3>
              <button onClick={handleOptimize} disabled={isOptimizing} className="px-2 py-1 bg-action text-white rounded text-[10px] font-bold disabled:opacity-50">
                {isOptimizing ? 'Analyzing...' : 'Maximize'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {!optimizationResults && !isOptimizing && (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <p className="text-[10px] text-nudge-secondary-text">Run optimization to see the best card for every expense category.</p>
                </div>
              )}
              {optimizationResults?.map((res: any, i: number) => (
                <div key={i} className="p-2 border border-accent-500/10 bg-accent-500/5 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-nudge-secondary-text uppercase tracking-widest">{res.category}</p>
                    <p className="text-sm font-bold text-nudge-primary-text leading-tight">{res.card}</p>
                    <p className="text-[10px] text-accent-400">{res.reason}</p>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                    {res.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points Transfer */}
          <div className="card-glass flex-1 flex flex-col min-h-0 p-4">
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold flex items-center gap-1.5"><ArrowRightLeft className="w-4 h-4 text-emerald-400" /> Smart Transfer</h3>
              <button onClick={handleTransferAdvice} disabled={isTransferring} className="px-2 py-1 border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 rounded text-[10px] font-bold hover:bg-emerald-500/20 disabled:opacity-50">
                Best Option
              </button>
            </div>
            
            <div className="flex gap-2 mb-3">
              <div className="flex-1 py-1.5 bg-nudge-inverse/10 border border-nudge-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-nudge-inverse/10">
                <Plane className="w-4 h-4 text-nudge-secondary-text mb-1" /><span className="text-[8px] font-bold text-nudge-secondary-text uppercase tracking-widest">Flights</span>
              </div>
              <div className="flex-1 py-1.5 bg-nudge-inverse/10 border border-nudge-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-nudge-inverse/10">
                <Building className="w-4 h-4 text-nudge-secondary-text mb-1" /><span className="text-[8px] font-bold text-nudge-secondary-text uppercase tracking-widest">Hotels</span>
              </div>
              <div className="flex-1 py-1.5 bg-nudge-inverse/10 border border-nudge-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-nudge-inverse/10">
                <Gift className="w-4 h-4 text-nudge-secondary-text mb-1" /><span className="text-[8px] font-bold text-nudge-secondary-text uppercase tracking-widest">Cards</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!transferAdvice && !isTransferring && (
                <div className="h-full flex items-center justify-center border border-nudge-border border-dashed rounded-lg">
                  <p className="text-[10px] text-nudge-secondary-text px-4 text-center">Let AI find the best value for your 45K points.</p>
                </div>
              )}
              {transferAdvice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-emerald-400">{transferAdvice.recommendation}</h4>
                    <span className="px-1 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">{transferAdvice.valueMultiplier} Value</span>
                  </div>
                  <p className="text-[10px] text-nudge-secondary-text mb-2 leading-relaxed">{transferAdvice.details}</p>
                  <button className="w-full py-1.5 bg-emerald-600/80 text-nudge-primary-text rounded text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-500">
                    {transferAdvice.action} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Market Intelligence */}
        <div className="card-glass flex-[1] flex flex-col min-h-0 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><Search className="w-4 h-4 text-accent-400" /> Market Check</h3>
            <button onClick={fetchMarketCards} disabled={isFetchingMarket} className="px-2 py-1 bg-nudge-inverse/10 border border-nudge-border rounded text-[10px] font-bold hover:bg-nudge-inverse/10 flex items-center gap-1 disabled:opacity-50">
              {isFetchingMarket ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3"/>}
              Refresh
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {!isFetchingMarket && marketCards.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Search className="w-8 h-8 text-nudge-secondary-text mb-2" />
                <p className="text-[10px] text-nudge-secondary-text">Scan market for premium credit card offers tailored to you.</p>
              </div>
            )}
            {marketCards.map((card) => (
               <div key={card.id} className="p-3 bg-nudge-inverse/10 border border-nudge-border rounded-xl hover:bg-nudge-inverse/10 transition-all cursor-pointer">
                 <div className="flex gap-3">
                   <div className={cn("w-14 h-10 rounded shadow-md bg-gradient-to-br flex-shrink-0 border border-nudge-border", card.color)} />
                   <div className="flex-1 min-w-0">
                     <p className="text-[8px] text-nudge-secondary-text font-bold uppercase tracking-widest leading-none">{card.bank}</p>
                     <p className="text-sm font-bold truncate leading-tight mt-0.5">{card.name}</p>
                     <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold rounded">
                       <Sparkles className="w-3 h-3" /> {card.matchScore}% Match
                     </span>
                   </div>
                 </div>
                 <div className="mt-2.5 pt-2 border-t border-nudge-border flex items-center justify-between">
                   <span className="text-[10px] font-bold">{formatCurrency(card.annualFee)}/yr</span>
                   <span className="text-[10px] text-accent-400 font-medium truncate">{card.eligibility}</span>
                 </div>
                 <ul className="mt-2 space-y-1">
                   {card.benefits.map((b, i) => (
                     <li key={i} className="text-[10px] text-nudge-secondary-text flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {b}</li>
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
            <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn("pointer-events-auto px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border text-xs", toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" : toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" : "bg-accent-500/20 border-accent-500/20 text-accent-400")}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : toast.type === 'error' ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
