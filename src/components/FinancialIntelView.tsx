import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Receipt, 
  ReceiptText, 
  Briefcase, 
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';

// Import sub-components
const ExpenseAI = React.lazy(() => import('./ExpenseAI'));
const BillOptimizer = React.lazy(() => import('./BillOptimizer'));
const TaxAssistant = React.lazy(() => import('./TaxAssistant'));
const InvestmentIntel = React.lazy(() => import('./InvestmentIntel'));
const CreditIntel = React.lazy(() => import('./CreditIntel'));

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  initialTab?: string;
}

const INTEL_TABS = [
  { id: 'expense-ai', label: 'Expense AI', icon: TrendingUp },
  { id: 'bills', label: 'Bill Optimizer', icon: Receipt },
  { id: 'tax', label: 'Tax Assistant', icon: ReceiptText },
  { id: 'invest', label: 'Investment Intel', icon: Briefcase },
  { id: 'credit', label: 'Credit Intel', icon: CreditCard },
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
      <RefreshCw className="w-8 h-8 text-accent-500 opacity-50" />
    </motion.div>
  </div>
);

export default function FinancialIntelView({ profile, transactions, onNavigate, initialTab = 'expense-ai' }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'expense-ai': return <ExpenseAI profile={profile} transactions={transactions} onNavigate={onNavigate} />;
      case 'bills': return <BillOptimizer profile={profile} />;
      case 'tax': return <TaxAssistant profile={profile} />;
      case 'invest': return <InvestmentIntel profile={profile} />;
      case 'credit': return <CreditIntel profile={profile} transactions={transactions} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Sub-navigation Header */}
      <div className="flex gap-1.5 p-1 overflow-x-auto bg-white/[0.02] border border-white/[0.05] rounded-xl flex-shrink-0">
        {INTEL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-xs font-medium ${
                isActive 
                  ? 'bg-action text-white shadow-md' 
                  : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
