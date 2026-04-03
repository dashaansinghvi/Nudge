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
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  FileText
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
import NudgeLogo from './components/NudgeLogo';

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
const FinancialIntelView = lazy(() => import('./components/FinancialIntelView'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const Home = lazy(() => import('./components/Home'));
const ReportsView = lazy(() => import('./components/ReportsView'));


import { QuestionnaireResult } from './components/Questionnaire';
import LandingPage from './components/LandingPage';
import { DataProvider } from './context/DataContext';

const TABS = [
  { id: 'home', label: 'Home', icon: HomeIcon, category: 'Overview' },
  { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard, category: 'Overview' },
  
  { id: 'intel', label: 'Financial Intel', icon: Zap, category: 'Intelligence' },
  
  { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert, category: 'Security & AI' },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare, category: 'Security & AI' },
  
  { id: 'settings', label: 'Settings', icon: SettingsIcon, category: 'Account' },
];


const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <RefreshCw className="w-8 h-8 text-accent-500 opacity-50" />
    </motion.div>
  </div>
);

export default function App() {
  const { theme, formatCurrency } = useSettings();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [intelSubTab, setIntelSubTab] = useState('expense-ai');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [pendingTestResult, setPendingTestResult] = useState<QuestionnaireResult | null>(null);

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

  const handleEmailAuth = async (e: React.FormEvent, testResult?: QuestionnaireResult) => {
    e.preventDefault();
    if (testResult) {
      setPendingTestResult(testResult);
    }
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
  const handleTabChange = useCallback((id: string) => {
    const intelTabs = ['expense-ai', 'bills', 'tax', 'invest', 'credit'];
    if (intelTabs.includes(id)) {
      setIntelSubTab(id);
      setActiveTab('intel');
    } else {
      setActiveTab(id);
    }
  }, []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-nudge-primary text-nudge-primary">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-accent-500" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage 
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        authError={authError}
        isAuthLoading={isAuthLoading}
        handleEmailAuth={handleEmailAuth}
        onLoginSetup={() => {}}
      />
    );
  }

  if (!profile) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding user={user} onComplete={handleUpdateProfile} initialData={pendingTestResult} />
      </Suspense>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home profile={profile} transactions={transactions} onNavigate={handleTabChange} />;
      case 'dashboard': return <DashboardView profile={profile} transactions={transactions} />;
      case 'intel': return <FinancialIntelView profile={profile} transactions={transactions} onNavigate={handleTabChange} initialTab={intelSubTab} />;
      case 'fraud': return <FraudDetection profile={profile} transactions={transactions} />;
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
    <div className="h-screen bg-nudge-primary text-nudge-primary flex font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-nudge-secondary border-r border-white/[0.06] flex flex-col z-50 relative overflow-hidden"
      >
        {/* Logo area */}
        <div className="p-5 flex items-center justify-between min-h-[72px]">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NudgeLogo iconSize={28} textSize="text-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={toggleSidebar} 
            className="p-2 hover:bg-white/5 rounded-xl transition-colors group"
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {Object.entries(
            TABS.reduce((acc, tab) => {
              if (!acc[tab.category]) acc[tab.category] = [];
              acc[tab.category].push(tab);
              return acc;
            }, {} as Record<string, typeof TABS>)
          ).map(([category, tabs]) => (
            <div key={category} className="space-y-1">
              {isSidebarOpen && (
                <div className="px-4 mb-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                  {category}
                </div>
              )}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`sidebar-item ${
                    activeTab === tab.id 
                      ? 'sidebar-item-active' 
                      : 'sidebar-item-inactive'
                  }`}
                  title={!isSidebarOpen ? tab.label : undefined}
                >
                  <tab.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm whitespace-nowrap overflow-hidden"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={handleLogout}
            className="sidebar-item text-rose-400/70 hover:bg-rose-500/8 hover:text-rose-400"
            title={!isSidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-medium text-sm whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative h-full">
        <div className="max-w-7xl mx-auto p-4 lg:p-5 h-full">
          <ErrorBoundary>
            <DataProvider initialProfile={profile} initialTransactions={transactions}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
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
