import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NudgeLogo from './NudgeLogo';
import { Zap, ShieldAlert, TrendingUp, CreditCard, RefreshCw, ArrowRight, Save, Briefcase, Sparkles } from 'lucide-react';
import Questionnaire, { QuestionnaireResult } from './Questionnaire';
import { BackgroundPaths, FloatingPaths } from './ui/background-paths';

interface Props {
  onLoginSetup: (result?: QuestionnaireResult) => void; 
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  authError: string | null;
  isAuthLoading: boolean;
  handleEmailAuth: (e: React.FormEvent, testResults?: QuestionnaireResult) => void;
}

interface AuthFormProps {
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  authError: string | null;
  isAuthLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  testResult: QuestionnaireResult | null;
}

const AuthForm = ({
  authMode, setAuthMode, email, setEmail, password, setPassword, authError, isAuthLoading, onSubmit, testResult
}: AuthFormProps) => (
  <form onSubmit={onSubmit} className="card-glass-lg p-8 sm:p-10 shadow-2xl relative">
    <h2 className="text-3xl font-bold mb-2 text-nudge-primary-text text-left">
      {authMode === 'login' ? 'Welcome Back' : testResult ? 'Unlock Your Blueprint' : 'Create Account'}
    </h2>
    <p className="text-nudge-secondary-text mb-8">
      {authMode === 'login' 
        ? 'Log in to view your insights.' 
        : testResult 
          ? 'Create a free account to activate your personalized action plan.' 
          : 'Join Nudge to unlock your potential.'}
    </p>
    
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
          className="w-full bg-nudge-primary border border-nudge-border rounded-2xl px-5 py-4 text-nudge-primary-text placeholder-nudge-secondary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all font-medium"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-nudge-primary border border-nudge-border rounded-2xl px-5 py-4 text-nudge-primary-text placeholder-nudge-secondary focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all font-medium"
        />
      </div>
    </div>
    
    <button
      type="submit"
      disabled={isAuthLoading}
      className="w-full py-4 bg-accent-600 text-white rounded-2xl font-bold text-lg hover:bg-accent-500 transition-all shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
    >
      {isAuthLoading ? (
        <RefreshCw className="w-5 h-5 animate-spin" />
      ) : (
        <>{authMode === 'login' ? 'Sign In' : testResult ? 'Create & Save Profile' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>
      )}
    </button>
    
    <div className="mt-8 text-center pt-6 border-t border-nudge-border">
      <button
        type="button"
        onClick={() => {
          setAuthMode(authMode === 'login' ? 'signup' : 'login');
        }}
        className="text-nudge-secondary-text hover:text-nudge-primary-text transition-colors text-sm font-medium"
      >
        {authMode === 'login' 
          ? "Don't have an account? Sign up" 
          : "Already have an account? Sign in"}
      </button>
    </div>
  </form>
);

export default function LandingPage({
  authMode, setAuthMode, email, setEmail, password, setPassword, authError, isAuthLoading, handleEmailAuth
}: Props) {
  const [showTest, setShowTest] = useState(false);
  const [testResult, setTestResult] = useState<QuestionnaireResult | null>(null);

  const handleTestComplete = (result: QuestionnaireResult) => {
    setTestResult(result);
    setAuthMode('signup');
    setShowTest(false);
  };

  const submitAuth = (e: React.FormEvent) => {
    handleEmailAuth(e, testResult || undefined);
  };

  if (showTest) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Global Background */}
        <div className="fixed inset-0 z-0 bg-nudge-primary pointer-events-none">
          <FloatingPaths position={1} className="opacity-50" />
          <FloatingPaths position={-1} className="opacity-50" />
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="w-full max-w-4xl pt-12 relative z-10">
          <Questionnaire 
            isTestMode={true} 
            onComplete={handleTestComplete} 
            onCancel={() => setShowTest(false)} 
          />
        </div>
      </div>
    );
  }

  // EXPERT ANALYSIS EXPERIENCES (AFTER TEST)
  if (testResult) {
    const estimatedSavingsRate = testResult.income > 0 
      ? (((testResult.income - testResult.expenses * 12) / testResult.income) * 100).toFixed(1) 
      : 0;

    return (
      <div className="min-h-screen bg-transparent text-nudge-primary-text overflow-y-auto w-full relative pb-24 scroll-smooth">
        {/* Global Background */}
        <div className="fixed inset-0 z-0 bg-nudge-primary pointer-events-none">
          <FloatingPaths position={1} className="opacity-60" />
          <FloatingPaths position={-1} className="opacity-60" />
        </div>
        {/* Background elements */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-10">
          <NudgeLogo iconSize={24} textSize="text-xl" />
          <button 
            onClick={() => setTestResult(null)}
            className="text-nudge-secondary-text hover:text-nudge-primary-text transition-colors text-sm font-medium"
          >
            Cancel & Return Home
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-4 text-sm text-accent-400 backdrop-blur-sm">
               <Sparkles className="w-4 h-4" />
               AI Analysis Complete
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your Financial Blueprint
            </h1>
            <p className="text-xl text-nudge-secondary-text max-w-2xl mx-auto">
              We’ve analyzed your profile. Here is your initial breakdown. Create an account to unlock your personalized, daily action plan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Report Side */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
               <div className="card-glass-lg p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <TrendingUp className="w-48 h-48 text-nudge-secondary-text" />
                  </div>
                  <h3 className="text-2xl font-bold mb-8 text-nudge-primary-text">Expert Insights</h3>
                  
                  <div className="space-y-8 relative z-10">
                    <div className="flex gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center flex-shrink-0 border border-accent-500/20">
                          <Briefcase className="w-6 h-6 text-accent-400" />
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold text-nudge-primary-text">Savings Trajectory</h4>
                          <p className="text-nudge-secondary-text text-sm mt-1 leading-relaxed">Based on your stated income and expenses, your estimated savings rate is {Math.max(0, Number(estimatedSavingsRate))}%. Our AI can help you increase this painlessly.</p>
                       </div>
                    </div>
                    <div className="flex gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                          <CreditCard className="w-6 h-6 text-blue-400" />
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold text-nudge-primary-text">Credit Optimization</h4>
                          <p className="text-nudge-secondary-text text-sm mt-1 leading-relaxed">With a score of {testResult.credit_score}, you are positioned to {testResult.credit_score >= 700 ? 'maximize premium credit rewards' : 'build credit up systematically'} using targeted AI strategies.</p>
                       </div>
                    </div>
                    <div className="flex gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                          <ShieldAlert className="w-6 h-6 text-rose-400" />
                       </div>
                       <div>
                          <h4 className="text-lg font-semibold text-nudge-primary-text">Risk Profile ({testResult.risk_tolerance.charAt(0).toUpperCase() + testResult.risk_tolerance.slice(1)})</h4>
                          <p className="text-nudge-secondary-text text-sm mt-1 leading-relaxed">Our AI will structure a tailored {testResult.risk_tolerance} plan to pursue your primary goal of {testResult.primary_goal.replace('-', ' ')} while limiting market exposure.</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="card-glass-lg p-6 md:p-8 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 border border-accent-500/30">
                    <Zap className="w-6 h-6 text-accent-400" />
                  </div>
                  <p className="text-nudge-secondary-text font-medium text-sm md:text-base leading-relaxed">Create your free account now to get day-by-day actions exactly like these, customized specifically for your portfolio.</p>
               </div>
            </motion.div>

            {/* Auth Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
               <AuthForm 
                  authMode={authMode}
                  setAuthMode={setAuthMode}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  authError={authError}
                  isAuthLoading={isAuthLoading}
                  onSubmit={submitAuth}
                  testResult={testResult}
               />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-nudge-primary-text overflow-x-hidden relative scroll-smooth">
      {/* Global Background */}
      <div className="fixed inset-0 z-0 bg-nudge-primary pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      {/* Background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 bg-nudge-primary/60 backdrop-blur-xl border-b border-nudge-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NudgeLogo iconSize={32} textSize="text-xl" />
          </div>
          <button 
            onClick={() => { setTestResult(null); setAuthMode('login'); document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="text-sm font-medium text-accent-400 hover:text-accent-500 transition-colors"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <BackgroundPaths title="Master your money with zero effort." noPaths={true}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm opacity-80 mix-blend-plus-lighter">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-sm font-medium">AI-Powered Financial Intelligence</span>
          </div>
          
          <p className="text-xl text-nudge-secondary-text max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Nudge analyzes your spending, optimizes your bills, and builds your credit passively—so you can focus on living.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowTest(true)}
              className="px-8 py-4 rounded-full bg-accent-600 text-white font-bold text-lg hover:bg-accent-500 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Take Free Financial Test <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-nudge-primary-text font-bold text-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              Sign Up directly
            </button>
          </div>
        </motion.div>
      </BackgroundPaths>

      {/* Features Grid */}
      <section className="py-20 px-4 relative z-10 bg-nudge-secondary/40 backdrop-blur-md border-y border-nudge-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Expense AI', desc: 'Predictive budgeting that adapts to your life.' },
              { icon: ShieldAlert, title: 'Fraud Detection', desc: 'Real-time transaction scanning to keep you secure.' },
              { icon: CreditCard, title: 'Credit Intel', desc: 'Actionable steps to reach the 800 club faster.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-glass p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-accent-500" />
                </div>
                <h3 className="text-2xl font-bold text-nudge-primary-text mb-3">{feature.title}</h3>
                <p className="text-nudge-secondary-text">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth / Result Registration Form */}
      <section id="auth-form" className="py-24 px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="popLayout">
            {testResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mb-8 p-6 bg-accent-500/10 border border-accent-500/30 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Save className="text-accent-500 w-6 h-6" />
                  <h3 className="text-xl font-bold text-nudge-primary-text">Save your results</h3>
                </div>
                <p className="text-nudge-secondary-text text-sm mb-4">You completed the financial test! Create a free account now to save your custom profile and start optimizing.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AuthForm 
             authMode={authMode}
             setAuthMode={setAuthMode}
             email={email}
             setEmail={setEmail}
             password={password}
             setPassword={setPassword}
             authError={authError}
             isAuthLoading={isAuthLoading}
             onSubmit={submitAuth}
             testResult={testResult}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-nudge-secondary-text border-t border-glass bg-nudge-secondary/40 backdrop-blur-md z-10 relative">
        <p>© 2026 Nudgé Financial Intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
}
