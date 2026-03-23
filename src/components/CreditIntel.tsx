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
    color: 'from-slate-800 to-slate-900',
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
    color: 'from-teal-600 to-teal-800',
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
        { category: 'Fuel & Transit', card: 'SBI Octane', reason: '7.25% Value back on BPCL pumps', impact: `Save ~${formatCurrency(40)}/mo` },
        { category: 'Dining & Groceries', card: 'Amex Platinum Travel', reason: 'Milestone benefits + 3X points', impact: `Save ~${formatCurrency(60)}/mo` }
      ]);
      setIsOptimizing(false);
      addToast('Spending analyzed. Rewards optimized!', 'success');
    }, 2000);
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
    }, 2000);
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
          benefits: ['$300 Travel Credit', '3X Points on Dining', 'Lounge Access'],
          eligibility: 'Excellent Credit Required',
          matchScore: 94,
          color: 'from-blue-800 to-blue-950'
        },
        {
          id: 'm2',
          bank: 'Capital One',
          name: 'Venture X',
          annualFee: 395,
          benefits: ['10,000 Anniversary Miles', '2X Miles on Everything', 'Global Entry Credit'],
          eligibility: 'Excellent Credit Required',
          matchScore: 88,
          color: 'from-slate-700 to-slate-900'
        }
      ]);
      setIsFetchingMarket(false);
      addToast('New market cards fetched based on your profile.', 'success');
    }, 2500);
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-indigo-500" />
            Credit Intelligence
          </h1>
          <p className="text-gray-500">Manage cards, maximize rewards, and discover premium offers.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Reward Points</p>
              <h2 className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Real Credit Card Display */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Your Wallet
          </h2>
          {totalExpiring > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
              <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold text-rose-500">{totalExpiring.toLocaleString()} points expiring soon</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
          {userCards.map((card) => (
            <div 
              key={card.id}
              className="relative w-full aspect-[1.586/1] cursor-pointer group"
              style={{ perspective: '1000px' }}
              onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-500"
                animate={{ rotateY: flippedCardId === card.id ? 180 : 0 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front of Card */}
                <div 
                  className={cn(
                    "absolute inset-0 backface-hidden rounded-2xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden bg-gradient-to-br border border-white/10",
                    card.color
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <span className="font-bold tracking-wider opacity-90">{card.bank}</span>
                    <span className="text-sm font-bold opacity-80">{card.network}</span>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-10 h-8 bg-yellow-400/80 rounded mb-4 opacity-80" /> {/* Chip */}
                    <div className="text-xl tracking-[0.2em] font-mono opacity-90 mb-1">
                      •••• •••• •••• {card.last4}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest opacity-60">Cardholder</p>
                        <p className="font-bold tracking-widest text-sm uppercase">{profile.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-widest opacity-60">Valid Thru</p>
                        <p className="font-bold tracking-widest text-sm">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="w-full h-12 bg-black mt-6" /> {/* Magnetic Stripe */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Available Credit</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(card.available)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Reward Points</p>
                        <p className="text-lg font-bold text-emerald-400">{card.points.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">CVV •••</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToast(`Viewing details for ${card.name}`, 'info');
                        }}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 2: Reward Optimization Engine */}
        <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Reward Optimization Engine
              </h3>
              <p className="text-sm text-gray-500 mt-1">AI analyzes your spending to suggest the best card per category.</p>
            </div>
            <button 
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Maximize Rewards
            </button>
          </div>

          <div className="space-y-4 min-h-[200px]">
            {isOptimizing ? (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400">Analyzing spending patterns...</p>
              </div>
            ) : optimizationResults ? (
              <AnimatePresence>
                {optimizationResults.map((res: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{res.category}</p>
                      <p className="font-bold text-white mt-1">Use {res.card}</p>
                      <p className="text-xs text-indigo-400 mt-1">{res.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                        {res.impact}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                <Sparkles className="w-8 h-8 text-gray-600 mb-4" />
                <p className="text-sm text-gray-500">Click "Maximize Rewards" to generate your personalized strategy.</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Points Utilization & Transfer System */}
        <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                Smart Point Transfer
              </h3>
              <p className="text-sm text-gray-500 mt-1">Discover the highest value redemption for your points.</p>
            </div>
            <button 
              onClick={handleTransferAdvice}
              disabled={isTransferring}
              className="px-6 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Best Option
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { icon: Plane, label: 'Flights' },
              { icon: Building, label: 'Hotels' },
              { icon: Gift, label: 'Gift Cards' },
              { icon: DollarSign, label: 'Cashback' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <item.icon className="w-5 h-5 text-gray-400 mb-2" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="min-h-[120px]">
            {isTransferring ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-3" />
                <p className="text-xs font-bold text-gray-400">Calculating redemption values...</p>
              </div>
            ) : transferAdvice ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-emerald-400">{transferAdvice.recommendation}</h4>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md">
                    {transferAdvice.valueMultiplier} Value
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{transferAdvice.details}</p>
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                  {transferAdvice.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-center">
                <p className="text-sm text-gray-500">Not sure how to use your points? Let AI find the best value.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Section 4: Market Intelligence */}
      <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Market Intelligence
            </h3>
            <p className="text-sm text-gray-500 mt-1">AI-curated credit cards based on your income and spending habits.</p>
          </div>
          <div className="flex gap-3">
            {marketCards.length > 0 && (
              <button 
                onClick={() => setCompareMode(!compareMode)}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                  compareMode ? "bg-indigo-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                <ArrowRightLeft className="w-4 h-4" />
                {compareMode ? 'Cancel Compare' : 'Compare Cards'}
              </button>
            )}
            <button 
              onClick={fetchMarketCards}
              disabled={isFetchingMarket}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isFetchingMarket ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Check New Cards
            </button>
          </div>
        </div>

        {isFetchingMarket ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-400">Scanning market for premium offers...</p>
          </div>
        ) : marketCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketCards.map((card) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all",
                  compareMode && cardsToCompare.includes(card.id) 
                    ? "bg-indigo-500/10 border-indigo-500" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                {compareMode && (
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => toggleCompare(card.id)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        cardsToCompare.includes(card.id) ? "bg-indigo-500 border-indigo-500" : "border-gray-500"
                      )}
                    >
                      {cardsToCompare.includes(card.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                )}
                
                <div className="flex items-start gap-6">
                  {/* Mini Card Visual */}
                  <div className={cn("w-24 h-16 rounded-lg shadow-lg bg-gradient-to-br flex-shrink-0", card.color)} />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{card.bank}</p>
                        <h4 className="text-lg font-bold text-white">{card.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">
                          <Sparkles className="w-3 h-3" />
                          {card.matchScore}% Match
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Annual Fee</span>
                        <span className="font-bold">{formatCurrency(card.annualFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Eligibility</span>
                        <span className="font-bold text-indigo-400">{card.eligibility}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Key Benefits</p>
                      <ul className="space-y-1">
                        {card.benefits.map((benefit, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
            <Search className="w-12 h-12 text-gray-700 mb-4" />
            <h4 className="text-lg font-bold text-gray-500">No Market Data</h4>
            <p className="text-sm text-gray-600 mt-2">Click "Check New Cards" to scan the market.</p>
          </div>
        )}
      </section>

      {/* Comparison Modal Overlay */}
      <AnimatePresence>
        {compareMode && cardsToCompare.length === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-white/20 shadow-2xl rounded-[32px] p-6 w-[90%] max-w-4xl flex gap-6 items-center"
          >
            <div className="flex-1 grid grid-cols-2 gap-6 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 z-10">
                VS
              </div>
              
              {cardsToCompare.map(id => {
                const card = marketCards.find(c => c.id === id)!;
                return (
                  <div key={id} className="text-center space-y-2">
                    <h4 className="font-bold text-lg">{card.name}</h4>
                    <p className="text-sm text-gray-400">Fee: {formatCurrency(card.annualFee)}</p>
                    <div className="text-xs text-emerald-400 font-bold">{card.benefits[0]}</div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => {
                setCompareMode(false);
                setCardsToCompare([]);
              }}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                toast.type === 'warning' ? "bg-amber-500/20 border-amber-500/20 text-amber-400" :
                toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" :
                "bg-indigo-500/20 border-indigo-500/20 text-indigo-400"
              )}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               toast.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
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
