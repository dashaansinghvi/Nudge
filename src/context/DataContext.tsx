import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, UserProfile, CreditCard } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  category: string;
}

interface Investment {
  id: string;
  name: string;
  amount: number;
  type: string;
  returnRate: number;
  currentValue: number;
}

interface DataContextType {
  profile: UserProfile | null;
  transactions: Transaction[];
  bills: Bill[];
  creditCards: CreditCard[];
  investments: Investment[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'timestamp'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  payBill: (id: string) => void;
  addCreditCard: (card: CreditCard) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children, initialProfile, initialTransactions }: { children: ReactNode, initialProfile: UserProfile | null, initialTransactions: Transaction[] }) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  // Simulated global state for other entities
  const [bills, setBills] = useState<Bill[]>([
    { id: '1', name: 'Netflix', amount: 15.99, dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), status: 'Pending', category: 'Entertainment' },
    { id: '2', name: 'Electricity', amount: 120.50, dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Overdue', category: 'Utilities' },
    { id: '3', name: 'Internet', amount: 79.99, dueDate: new Date(Date.now() + 86400000 * 10).toISOString(), status: 'Pending', category: 'Utilities' },
  ]);

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  const [investments, setInvestments] = useState<Investment[]>([
    { id: '1', name: 'S&P 500 Index', amount: 10000, type: 'Stock', returnRate: 12.5, currentValue: 11250 },
    { id: '2', name: 'Tech ETF', amount: 5000, type: 'ETF', returnRate: 8.2, currentValue: 5410 },
    { id: '3', name: 'Crypto Portfolio', amount: 2000, type: 'Crypto', returnRate: -5.4, currentValue: 1892 },
  ]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'timestamp'>) => {
    if (!auth.currentUser) return;
    const newRef = doc(collection(db, 'transactions'));
    const newTx: Transaction = {
      ...tx,
      id: newRef.id,
      user_id: auth.currentUser.uid,
      timestamp: Date.now()
    };
    
    // Optimistic update
    setTransactions(prev => [newTx, ...prev]);
    
    try {
      await setDoc(newRef, newTx);
    } catch (error) {
      console.error("Error adding transaction", error);
      // Revert on error
      setTransactions(prev => prev.filter(t => t.id !== newTx.id));
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    // Optimistic update
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
    
    try {
      const txRef = doc(db, 'transactions', id);
      await updateDoc(txRef, updates);
    } catch (error) {
      console.error("Error updating transaction", error);
      // We should ideally revert here, but keeping it simple for now
    }
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill = { ...bill, id: Math.random().toString(36).substring(7) };
    setBills(prev => [...prev, newBill]);
  };

  const payBill = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'Paid' } : b));
    const bill = bills.find(b => b.id === id);
    if (bill) {
      addTransaction({
        name: bill.name,
        amount: -bill.amount,
        category: bill.category,
        is_flagged: false
      });
    }
  };

  const addCreditCard = (card: CreditCard) => {
    setCreditCards(prev => [...prev, card]);
  };

  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    setInvestments(prev => [...prev, { ...inv, id: Math.random().toString(36).substring(7) }]);
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !auth.currentUser) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), newProfile, { merge: true });
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <DataContext.Provider value={{
      profile,
      transactions,
      bills,
      creditCards,
      investments,
      addTransaction,
      updateTransaction,
      addBill,
      payBill,
      addCreditCard,
      addInvestment,
      updateInvestment,
      updateProfile
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
