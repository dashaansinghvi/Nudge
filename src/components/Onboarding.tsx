import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Transaction } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

import Questionnaire, { QuestionnaireResult } from './Questionnaire';

interface Props {
  user: FirebaseUser;
  onComplete: (profile: UserProfile) => void;
  initialData?: QuestionnaireResult | null;
}

export default function Onboarding({ user, onComplete, initialData }: Props) {
  const [isFinishing, setIsFinishing] = useState(false);

  // If initialData is provided, it means they took the test on the landing page,
  // we immediately finalize their profile.
  React.useEffect(() => {
    if (initialData && !isFinishing) {
      finishOnboarding(initialData);
    }
  }, [initialData]);

  const finishOnboarding = async (finalAnswers: QuestionnaireResult) => {
    setIsFinishing(true);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'User',
        vitality_score: 82, // Base score, might adjust based on answers
        balance: finalAnswers.savings + 2450.80,
        monthly_spending: finalAnswers.expenses,
        savings: finalAnswers.savings,
        currency: 'USD',
        primary_goal: finalAnswers.primary_goal,
        income_range: finalAnswers.income.toString(),
        credit_score_range: finalAnswers.credit_score.toString(),
        notifications: {
          fraud: true,
          spending: true,
          credit: true
        }
      };

      const batch = writeBatch(db);
      
      // Create user doc
      batch.set(doc(db, 'users', user.uid), profile);

      // Seed dummy transactions scaling loosely around their expenses 
      const multiplier = Math.max(0.5, finalAnswers.expenses / 5000);
      const dummyTransactions = [
        { name: 'Whole Foods Market', amount: -60.50 * multiplier, category: 'Food' },
        { name: 'Uber Trip', amount: -18.20 * multiplier, category: 'Travel' },
        { name: 'Netflix Subscription', amount: -15.99, category: 'Bills' },
        { name: 'Apple Store', amount: -299.00 * multiplier, category: 'Shopping' },
        { name: 'Starbucks Coffee', amount: -6.50, category: 'Food' },
        { name: 'Local Gas Station', amount: -45.00 * multiplier, category: 'Travel' },
        { name: 'Rent/Mortgage Payment', amount: -(finalAnswers.expenses * 0.4), category: 'Bills' },
        { name: 'Salary Deposit', amount: finalAnswers.income / 12, category: 'Income' },
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
      setIsFinishing(false);
    }
  };

  if (initialData) {
    // Show finishing state immediately if they are coming from the landing page test
    return (
      <div className="min-h-screen bg-nudge-primary text-nudge-primary-text flex items-center justify-center p-4">
        <FinishingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nudge-primary text-nudge-primary-text flex flex-col items-center justify-center p-4">
      {isFinishing ? (
        <FinishingScreen />
      ) : (
        <div className="w-full max-w-4xl pt-12">
          <Questionnaire onComplete={finishOnboarding} />
        </div>
      )}
    </div>
  );
}

function FinishingScreen() {
  return (
    <motion.div
      key="finishing"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-8"
      />
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Setting up your Nudge vault...</h2>
      <p className="text-nudge-secondary-text">We're analyzing your goals and securing your data.</p>
    </motion.div>
  );
}
