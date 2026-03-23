import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Zap, 
  Wallet, 
  Globe, 
  Shield, 
  Camera, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Download, 
  Trash2,
  X,
  Loader2,
  Info,
  Moon,
  Sun,
  RefreshCw,
  Database,
  Fingerprint,
  Clock,
  Eye,
  MessageSquare,
  TrendingUp,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, Transaction } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings, Theme, Currency, AIMode, AIDetail, NotificationIntensity, RiskPreference } from '../context/SettingsContext';
import { MonthlyReport } from './MonthlyReport';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getFinancialInsights } from '../services/aiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Memoized Sub-components
const Toggle = memo(({ enabled, onChange, label, icon: Icon }: { enabled: boolean, onChange: () => void, label: string, icon?: any }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-nudge-secondary" />}
      <span className="text-nudge-primary font-medium">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        enabled ? "bg-indigo-600" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </div>
));

const Section = memo(({ title, icon: Icon, children, description }: { title: string, icon: any, children: React.ReactNode, description?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass rounded-[32px] p-8"
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <div>
        <h3 className="text-xl font-bold tracking-tight text-nudge-primary">{title}</h3>
        {description && <p className="text-sm text-nudge-secondary">{description}</p>}
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
));

export default function Settings({ profile, transactions, onUpdateProfile }: Props) {
  const { 
    theme, currency, region, notifications, ai, financials, security, 
    updateSettings, formatCurrency 
  } = useSettings();
  
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeModal, setActiveModal] = useState<'password' | 'delete' | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const reportRef = React.useRef<HTMLDivElement>(null);

  // Local state for numeric inputs to avoid global re-renders on every keystroke
  const [localBudget, setLocalBudget] = useState(financials.budget.toString());
  const [localSavings, setLocalSavings] = useState(financials.savingsGoal.toString());
  const [reportHistory, setReportHistory] = useState<{id: string, date: string, month: string}[]>([]);
  const [autoGenerateReport, setAutoGenerateReport] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('nudge_report_history') || '[]');
    setReportHistory(history.reverse());
    const autoGen = localStorage.getItem('nudge_auto_generate_report') === 'true';
    setAutoGenerateReport(autoGen);
    
    getFinancialInsights(transactions, profile).then(setInsights);
  }, [transactions, profile]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const handleToggleAutoGenerate = useCallback(() => {
    const newVal = !autoGenerateReport;
    setAutoGenerateReport(newVal);
    localStorage.setItem('nudge_auto_generate_report', String(newVal));
    addToast(newVal ? 'Auto-generate enabled' : 'Auto-generate disabled');
  }, [autoGenerateReport, addToast]);

  const handleSaveProfile = useCallback(async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const updatedData = {
        ...localProfile,
        notifications,
        ai_mode: ai.mode,
        currency: currency
      };
      await updateDoc(userRef, updatedData);
      onUpdateProfile(updatedData as UserProfile);
      addToast('Profile updated successfully');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [profile.uid, localProfile, notifications, ai.mode, currency, onUpdateProfile, addToast]);

  const handleSyncData = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Data synced successfully');
    }, 1500);
  }, [addToast]);

  const handleDownloadData = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ 
      profile, 
      settings: { theme, currency, region, notifications, ai, financials, security } 
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nudge_data_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast('Data export started', 'info');
  }, [profile, theme, currency, region, notifications, ai, financials, security, addToast]);

  const handleBudgetBlur = useCallback(() => {
    const val = Number(localBudget);
    if (!isNaN(val)) {
      updateSettings({ financials: { ...financials, budget: val } });
    }
  }, [localBudget, financials, updateSettings]);

  const handleSavingsBlur = useCallback(() => {
    const val = Number(localSavings);
    if (!isNaN(val)) {
      updateSettings({ financials: { ...financials, savingsGoal: val } });
    }
  }, [localSavings, financials, updateSettings]);

  const downloadReport = async (month: string, id: string) => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(id);
    addToast(`Generating ${month} report...`, 'info');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Nudge_Wealth_Report_${month.replace(' ', '_')}.pdf`);
      
      addToast('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast('Failed to generate report', 'error');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Hidden Report Template */}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <MonthlyReport 
          ref={reportRef} 
          profile={profile} 
          transactions={transactions} 
          formatCurrency={formatCurrency} 
          insights={insights} 
        />
      </div>

      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-nudge-primary">Settings</h1>
        <p className="text-nudge-secondary">Manage your account, security, and AI preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <Section title="Theme Settings" icon={theme === 'dark' ? Moon : Sun} description="Customize how Nudge looks for you">
          <div className="flex p-1 bg-white/5 rounded-2xl">
            <button 
              onClick={() => { updateSettings({ theme: 'light' }); addToast('Theme updated to Light'); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                theme === 'light' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Sun className="w-4 h-4" />
              <span className="font-bold">Light</span>
            </button>
            <button 
              onClick={() => { updateSettings({ theme: 'dark' }); addToast('Theme updated to Dark'); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                theme === 'dark' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Moon className="w-4 h-4" />
              <span className="font-bold">Dark</span>
            </button>
          </div>
        </Section>

        {/* Profile Settings */}
        <Section title="Profile Settings" icon={User} description="Update your personal information">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center border-2 border-dashed border-indigo-500/50 overflow-hidden">
                <User className="w-10 h-10 text-indigo-400" />
              </div>
              <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            <div>
              <h4 className="font-bold text-lg text-nudge-primary">{localProfile.name}</h4>
              <p className="text-sm text-nudge-secondary">Personal Account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={localProfile.name}
                onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-nudge-primary"
              />
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </Section>

        {/* AI Personalization */}
        <Section title="AI Intelligence" icon={Zap} description="Configure how Nudge works for you">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">AI Mode</label>
              <select 
                value={ai.mode}
                onChange={(e) => {
                  updateSettings({ ai: { ...ai, mode: e.target.value as AIMode } });
                  addToast(`AI Mode set to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="Conservative">Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Insight Detail Level</label>
              <select 
                value={ai.detailLevel}
                onChange={(e) => {
                  updateSettings({ ai: { ...ai, detailLevel: e.target.value as AIDetail } });
                  addToast(`Insight detail set to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="Short">Short (to-the-point)</option>
                <option value="Detailed">Detailed</option>
              </select>
            </div>
            <Toggle 
              label="Enable Real-time Insights" 
              enabled={ai.enableInsights} 
              onChange={() => {
                updateSettings({ ai: { ...ai, enableInsights: !ai.enableInsights } });
                addToast(ai.enableInsights ? 'Insights disabled' : 'Insights enabled');
              }} 
              icon={Eye}
            />
            <Toggle 
              label="Smart Suggestions" 
              enabled={ai.enableSuggestions} 
              onChange={() => {
                updateSettings({ ai: { ...ai, enableSuggestions: !ai.enableSuggestions } });
                addToast(ai.enableSuggestions ? 'Suggestions disabled' : 'Suggestions enabled');
              }} 
              icon={MessageSquare}
            />
          </div>
        </Section>

        {/* Notification Preferences */}
        <Section title="Notifications" icon={Bell} description="Choose what you want to be notified about">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Notification Intensity</label>
              <select 
                value={notifications.intensity}
                onChange={(e) => {
                  updateSettings({ notifications: { ...notifications, intensity: e.target.value as NotificationIntensity } });
                  addToast(`Intensity set to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="Minimal">Minimal</option>
                <option value="Balanced">Balanced</option>
                <option value="Frequent">Frequent</option>
              </select>
            </div>
            <Toggle label="Fraud Alerts" enabled={notifications.fraud} onChange={() => updateSettings({ notifications: { ...notifications, fraud: !notifications.fraud } })} />
            <Toggle label="Bill Reminders" enabled={notifications.bills} onChange={() => updateSettings({ notifications: { ...notifications, bills: !notifications.bills } })} />
            <Toggle label="Investment Alerts" enabled={notifications.investments} onChange={() => updateSettings({ notifications: { ...notifications, investments: !notifications.investments } })} />
            <Toggle label="Credit Card Alerts" enabled={notifications.credit} onChange={() => updateSettings({ notifications: { ...notifications, credit: !notifications.credit } })} />
          </div>
        </Section>

        {/* Currency & Region */}
        <Section title="Currency & Region" icon={Globe} description="Set your local preferences">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Currency</label>
              <select 
                value={currency}
                onChange={(e) => {
                  updateSettings({ currency: e.target.value as Currency });
                  addToast(`Currency updated to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Region</label>
              <select 
                value={region}
                onChange={(e) => {
                  updateSettings({ region: e.target.value });
                  addToast(`Region set to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Europe">Europe</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Financial Preferences */}
        <Section title="Financial Preferences" icon={Wallet} description="Customize your financial targets">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Monthly Budget</label>
                <input 
                  type="number" 
                  value={localBudget}
                  onChange={(e) => setLocalBudget(e.target.value)}
                  onBlur={handleBudgetBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-nudge-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Savings Goal</label>
                <input 
                  type="number" 
                  value={localSavings}
                  onChange={(e) => setLocalSavings(e.target.value)}
                  onBlur={handleSavingsBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all text-nudge-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Default Investment Preference</label>
              <select 
                value={financials.riskPreference}
                onChange={(e) => {
                  updateSettings({ financials: { ...financials, riskPreference: e.target.value as RiskPreference } });
                  addToast(`Investment preference: ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="Low Risk">Low Risk</option>
                <option value="Balanced">Balanced</option>
                <option value="High Growth">High Growth</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Security Settings */}
        <Section title="Security" icon={Lock} description="Protect your account and data">
          <div className="space-y-4">
            <Toggle 
              label="Enable 2FA" 
              enabled={security.enable2FA} 
              onChange={() => {
                updateSettings({ security: { ...security, enable2FA: !security.enable2FA } });
                addToast(security.enable2FA ? '2FA disabled' : '2FA enabled');
              }} 
              icon={Shield}
            />
            <Toggle 
              label="Biometric Login" 
              enabled={security.enableBiometric} 
              onChange={() => {
                updateSettings({ security: { ...security, enableBiometric: !security.enableBiometric } });
                addToast(security.enableBiometric ? 'Biometrics disabled' : 'Biometrics enabled');
              }} 
              icon={Fingerprint}
            />
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Session Timeout</label>
              <select 
                value={security.sessionTimeout}
                onChange={(e) => {
                  updateSettings({ security: { ...security, sessionTimeout: e.target.value } });
                  addToast(`Timeout set to ${e.target.value}`);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all appearance-none text-nudge-primary"
              >
                <option value="5 min">5 min</option>
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
              </select>
            </div>
            <button 
              onClick={() => setActiveModal('password')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <span className="font-medium text-nudge-primary">Change Password</span>
              <ChevronRight className="w-5 h-5 text-nudge-secondary group-hover:text-nudge-primary transition-colors" />
            </button>
          </div>
        </Section>

        {/* Monthly Reports */}
        <Section title="Monthly Reports" icon={FileText} description="Access and manage your financial reports">
          <div className="space-y-6">
            <Toggle 
              label="Auto-generate monthly report" 
              enabled={autoGenerateReport} 
              onChange={handleToggleAutoGenerate} 
              icon={Clock}
            />
            
            <div>
              <h4 className="text-sm font-bold text-nudge-secondary uppercase tracking-widest mb-4">Report History</h4>
              {reportHistory.length > 0 ? (
                <div className="space-y-3">
                  {reportHistory.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-bold text-nudge-primary">{report.month} Report</p>
                          <p className="text-xs text-nudge-secondary">Generated on {new Date(report.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadReport(report.month, report.id)}
                        disabled={isGeneratingPDF === report.id}
                        className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600/20 transition-all disabled:opacity-50"
                        title="Download PDF"
                      >
                        {isGeneratingPDF === report.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                  <FileText className="w-8 h-8 text-nudge-secondary mx-auto mb-2 opacity-50" />
                  <p className="text-nudge-secondary text-sm">No reports generated yet.</p>
                  <p className="text-nudge-secondary text-xs mt-1">Generate your first report from the Dashboard.</p>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Data Sync & Backup */}
        <Section title="Data Sync & Backup" icon={Database} description="Keep your data safe and updated">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleSyncData}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 py-4 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl font-bold hover:bg-indigo-600/20 transition-all"
            >
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Sync Data
            </button>
            <button 
              onClick={() => addToast('Backup created successfully')}
              className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-nudge-primary rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              <Database className="w-5 h-5" />
              Backup Data
            </button>
          </div>
        </Section>

        {/* Data & Privacy */}
        <Section title="Data & Privacy" icon={Shield} description="Manage your data and account status">
          <div className="space-y-3">
            <button 
              onClick={handleDownloadData}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-nudge-primary">Download My Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-nudge-secondary group-hover:text-nudge-primary transition-colors" />
            </button>
            <button 
              onClick={() => setActiveModal('delete')}
              className="w-full flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span className="font-medium text-rose-400">Delete Account</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </button>
          </div>
        </Section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-nudge-secondary border border-nudge rounded-[32px] p-8 shadow-2xl"
            >
              {activeModal === 'password' ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-nudge-primary">Change Password</h3>
                  <p className="text-nudge-secondary text-sm">Enter your current password and a new one to update your security.</p>
                  <div className="space-y-4">
                    <input type="password" placeholder="Current Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-nudge-primary" />
                    <input type="password" placeholder="New Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-nudge-primary" />
                    <input type="password" placeholder="Confirm New Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-nudge-primary" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all text-nudge-primary">Cancel</button>
                    <button onClick={() => { setActiveModal(null); addToast('Password updated'); }} className="flex-1 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all text-white">Update</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-nudge-primary">Delete Account?</h3>
                    <p className="text-nudge-secondary text-sm">This action is permanent and cannot be undone. All your financial data will be wiped from our servers.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-all text-nudge-primary">Keep Account</button>
                    <button onClick={() => { setActiveModal(null); addToast('Account deletion requested', 'error'); }} className="flex-1 py-3 bg-rose-600 rounded-2xl font-bold hover:bg-rose-500 transition-all text-white">Delete Forever</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
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
                toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" :
                "bg-indigo-500/20 border-indigo-500/20 text-indigo-400"
              )}
            >
              {toast.type === 'success' ? <Check className="w-5 h-5" /> : 
               toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
               <Info className="w-5 h-5" />}
              <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
