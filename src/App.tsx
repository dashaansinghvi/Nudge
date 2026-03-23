import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldAlert, 
  CreditCard, 
  ReceiptText, 
  MessageSquare, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Zap,
  Receipt,
  Briefcase
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, Transaction, OperationType, FirestoreErrorInfo } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSettings } from './context/SettingsContext';

// Lazy Loaded Components
const DashboardView = lazy(() => import('./components/DashboardView'));
const ExpenseAI = lazy(() => import('./components/ExpenseAI'));
const CreditIntel = lazy(() => import('./components/CreditIntel'));
const AIChat = lazy(() => import('./components/AIChat'));
const Settings = lazy(() => import('./components/Settings'));
const FraudDetection = lazy(() => import('./components/FraudDetection'));
const TaxAssistant = lazy(() => import('./components/TaxAssistant'));
const BillOptimizer = lazy(() => import('./components/BillOptimizer'));
const InvestmentIntel = lazy(() => import('./components/InvestmentIntel'));
const Onboarding = lazy(() => import('./components/Onboarding'));

import { DataProvider } from './context/DataContext';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expense-ai', label: 'Expense AI', icon: TrendingUp },
  { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
  { id: 'credit', label: 'Credit Intel', icon: CreditCard },
  { id: 'tax', label: 'Tax Assistant', icon: ReceiptText },
  { id: 'bills', label: 'Bill Optimizer', icon: Receipt },
  { id: 'invest', label: 'Investment Intel', icon: Briefcase },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <RefreshCw className="w-8 h-8 text-indigo-500 opacity-50" />
    </motion.div>
  </div>
);

export default function App() {
  const { theme, formatCurrency } = useSettings();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null); // Triggers onboarding
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user || !profile) return;

    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => doc.data() as Transaction);
      setTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return unsubscribe;
  }, [user, profile]);

  const handleFirestoreError = useCallback((error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email || undefined,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let message = error.message || 'An error occurred during authentication.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Email is already in use.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setAuthError(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = useCallback(() => signOut(auth), []);

  const handleUpdateProfile = useCallback((p: UserProfile) => setProfile(p), []);
  const handleTabChange = useCallback((id: string) => setActiveTab(id), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-nudge-primary text-nudge-primary">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-nudge-primary text-nudge-primary flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Nudge
          </h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
            Nudge – Your AI Financial Companion. Smarter Financial Decisions, One Nudge at a Time.
          </p>
          
          <form onSubmit={handleEmailAuth} className="max-w-md mx-auto bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white text-left">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            {authError && (
              <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-start gap-3 text-rose-200 text-left text-sm">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {isAuthLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
            
            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
                  setAuthError(null);
                }}
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding user={user} onComplete={handleUpdateProfile} />
      </Suspense>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView profile={profile} transactions={transactions} />;
      case 'expense-ai': return <ExpenseAI profile={profile} transactions={transactions} onNavigate={handleTabChange} />;
      case 'fraud': return <FraudDetection profile={profile} transactions={transactions} />;
      case 'tax': return <TaxAssistant profile={profile} />;
      case 'bills': return <BillOptimizer profile={profile} />;
      case 'invest': return <InvestmentIntel profile={profile} />;
      case 'credit': return <CreditIntel profile={profile} transactions={transactions} />;
      case 'chat': return <AIChat profile={profile} transactions={transactions} onNavigate={handleTabChange} />;
      case 'settings': return <Settings profile={profile} transactions={transactions} onUpdateProfile={handleUpdateProfile} />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Zap className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-xl font-medium uppercase tracking-widest">{activeTab.replace('-', ' ')} Module Coming Soon</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-nudge-primary text-nudge-primary flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-nudge-secondary border-r border-nudge transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Nudge</span>
            </div>
          )}
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/5 rounded-lg">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-8">
          <ErrorBoundary>
            <DataProvider initialProfile={profile} initialTransactions={transactions}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {renderContent()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </DataProvider>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
