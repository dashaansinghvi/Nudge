import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Target, Wallet, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Transaction } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

import { useSettings } from '../context/SettingsContext';

interface Props {
  user: FirebaseUser;
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ user, onComplete }: Props) {
  const { formatCurrency } = useSettings();
  
  const STEPS = [
    {
      id: 'goal',
      title: 'What is your primary financial goal?',
      options: [
        { id: 'maximize-rewards', label: 'Maximize Rewards', icon: Zap },
        { id: 'build-credit', label: 'Build Credit', icon: CreditCard },
        { id: 'pay-debt', label: 'Pay Debt', icon: Wallet },
        { id: 'save-invest', label: 'Save & Invest', icon: Target },
      ]
    },
    {
      id: 'income',
      title: 'Estimated annual income range?',
      options: [
        { id: 'under-50k', label: `Under ${formatCurrency(50000)}` },
        { id: '50k-100k', label: `${formatCurrency(50000)} - ${formatCurrency(100000)}` },
        { id: '100k-200k', label: `${formatCurrency(100000)} - ${formatCurrency(200000)}` },
        { id: 'over-200k', label: `Over ${formatCurrency(200000)}` },
      ]
    },
    {
      id: 'credit',
      title: 'Approximate credit score range?',
      options: [
        { id: 'poor', label: 'Poor (< 580)' },
        { id: 'fair', label: 'Fair (580 - 669)' },
        { id: 'good', label: 'Good (670 - 739)' },
        { id: 'excellent', label: 'Excellent (740+)' },
      ]
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [STEPS[currentStep].id]: optionId };
    setAnswers(newAnswers);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding(newAnswers);
    }
  };

  const finishOnboarding = async (finalAnswers: Record<string, string>) => {
    setIsFinishing(true);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'User',
        vitality_score: 82,
        balance: 12450.80,
        monthly_spending: 3200,
        savings: 45000,
        currency: 'USD',
        primary_goal: finalAnswers.goal,
        income_range: finalAnswers.income,
        credit_score_range: finalAnswers.credit,
        notifications: {
          fraud: true,
          spending: true,
          credit: true
        }
      };

      const batch = writeBatch(db);
      
      // Create user doc
      batch.set(doc(db, 'users', user.uid), profile);

      // Seed dummy transactions
      const dummyTransactions = [
        { name: 'Whole Foods Market', amount: -142.50, category: 'Food' },
        { name: 'Uber Trip', amount: -24.20, category: 'Travel' },
        { name: 'Netflix Subscription', amount: -15.99, category: 'Bills' },
        { name: 'Apple Store', amount: -1299.00, category: 'Shopping' },
        { name: 'Starbucks Coffee', amount: -6.50, category: 'Food' },
        { name: 'Shell Gas Station', amount: -45.00, category: 'Travel' },
        { name: 'Rent Payment', amount: -2200.00, category: 'Bills' },
        { name: 'Salary Deposit', amount: 5200.00, category: 'Income' },
      ];

      dummyTransactions.forEach((tx, idx) => {
        const txId = `seed_${idx}_${Date.now()}`;
        const txDoc: Transaction = {
          id: txId,
          user_id: user.uid,
          amount: tx.amount,
          category: tx.category,
          is_flagged: tx.amount < -1000 && tx.category !== 'Bills',
          timestamp: Date.now() - (idx * 86400000) - (Math.random() * 3600000),
          name: tx.name
        };
        batch.set(doc(db, 'transactions', txId), txDoc);
      });

      await batch.commit();
      onComplete(profile);
    } catch (error) {
      console.error('Onboarding Error:', error);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-nudge-primary text-nudge-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {isFinishing ? (
            <motion.div
              key="finishing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-8"
              />
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Setting up your Nudge vault...</h2>
              <p className="text-nudge-secondary">We're analyzing your goals and securing your data.</p>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-12">
                {STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      idx <= currentStep ? 'bg-indigo-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <h2 className="text-4xl font-bold tracking-tight mb-12 leading-tight">
                {STEPS[currentStep].title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STEPS[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left hover:bg-white/10 hover:border-indigo-500/50 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {option.icon && <option.icon className="w-6 h-6 text-indigo-400" />}
                      <span className="text-xl font-medium">{option.label}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all text-indigo-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
