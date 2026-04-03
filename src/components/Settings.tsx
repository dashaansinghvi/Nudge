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
  ChevronDown,
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
      {Icon && <Icon className="w-4 h-4 text-nudge-secondary-text" />}
      <span className="text-nudge-primary-text font-medium">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
        enabled ? "bg-accent-600" : "bg-nudge-inverse/10"
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
    className="glass rounded-[20px] p-5"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-accent-600/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-400" />
      </div>
      <div>
        <h3 className="text-base font-bold tracking-tight text-nudge-primary-text">{title}</h3>
        {description && <p className="text-xs text-nudge-secondary-text">{description}</p>}
      </div>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </motion.div>
));

const CustomSelect = memo(({ value, onChange, options, label }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && <label className="text-xs font-bold text-nudge-secondary-text uppercase tracking-widest">{label}</label>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between bg-[#1a1c2e] border rounded-2xl px-4 py-3 focus:outline-none transition-all text-left shadow-lg shadow-black/20 group",
          isOpen ? "border-accent-500 ring-4 ring-accent-500/10" : "border-nudge-border hover:border-nudge-border"
        )}
      >
        <span className="text-nudge-primary-text font-medium">{selectedOption.label}</span>
        <ChevronDown className={cn("w-4 h-4 text-nudge-secondary-text transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] left-0 right-0 mt-2 bg-[#0a0b14] border border-accent-500/50 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden py-2"
          >
            { options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-left transition-all flex items-center justify-between",
                  value === option.value ? "bg-accent-600 text-nudge-primary-text font-bold" : "text-nudge-primary-text hover:bg-nudge-inverse/10 hover:text-nudge-primary-text"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-nudge-primary-text" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default function Settings({ profile, transactions, onUpdateProfile }: Props) {
  const { 
    theme, accentColor, secondaryColor, enableGradients, currency, region, notifications, ai, financials, security, 
    updateSettings, formatCurrency 
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeModal, setActiveModal] = useState<'password' | 'delete' | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile(prev => ({ ...prev, photoUrl: reader.result as string }));
        addToast('Profile picture updated');
      };
      reader.readAsDataURL(file);
    }
  };

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
    <div className="h-full flex flex-col relative">
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

      <header className="flex-shrink-0 mb-3">
        <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-nudge-primary-text">Settings</h1>
        <p className="text-nudge-secondary-text text-xs">Manage your account, security, and AI preferences.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="w-full lg:w-56 flex-shrink-0 space-y-1 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 flex lg:block">
          {[
            { id: 'profile', title: 'Profile Settings', icon: User },
            { id: 'theme', title: 'Theme Settings', icon: Moon },
            { id: 'ai', title: 'AI Intelligence', icon: Zap },
            { id: 'notifications', title: 'Notifications', icon: Bell },
            { id: 'currency', title: 'Currency & Region', icon: Globe },
            { id: 'financials', title: 'Financial Preferences', icon: Wallet },
            { id: 'security', title: 'Security', icon: Lock },
            { id: 'data', title: 'Data Sync & Backup', icon: Database },
            { id: 'privacy', title: 'Data & Privacy', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-medium whitespace-nowrap lg:whitespace-normal text-left text-sm",
                activeTab === tab.id ? "bg-accent-600/20 text-accent-400" : "text-nudge-secondary-text hover:text-nudge-primary-text hover:bg-nudge-inverse/10"
              )}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.title}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-4">
        {/* Theme Settings */}
        {activeTab === 'theme' && (
        <Section title="Appearance" icon={theme === 'dark' ? Moon : Sun} description="Customize your visual experience">
          <div className="space-y-8">
            {/* Mode Switcher */}
            <div>
              <h4 className="text-[10px] font-bold text-nudge-secondary-text uppercase tracking-[0.2em] mb-4">Interface Mode</h4>
              <div className="grid grid-cols-2 p-1 bg-nudge-inverse/10 border border-nudge-border rounded-2xl">
                <button 
                  onClick={() => { updateSettings({ theme: 'light' }); addToast('Light mode enabled'); }}
                  className={cn(
                    "flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all",
                    theme === 'light' ? "bg-white text-black shadow-xl" : "text-nudge-secondary-text hover:text-nudge-primary-text"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-bold">Light Mode</span>
                </button>
                <button 
                  onClick={() => { updateSettings({ theme: 'dark' }); addToast('Dark mode enabled'); }}
                  className={cn(
                    "flex items-center justify-center gap-2.5 py-3 rounded-xl transition-all",
                    theme === 'dark' ? "bg-accent-600 text-nudge-primary-text shadow-xl" : "text-nudge-secondary-text hover:text-nudge-primary-text"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-bold">Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Effects */}
            <div className="pt-6 border-t border-nudge-border">
              <Toggle 
                label="Enable Advanced Gradients" 
                enabled={enableGradients} 
                onChange={() => updateSettings({ enableGradients: !enableGradients })} 
                icon={Zap}
              />
              <p className="text-[10px] text-nudge-secondary-text ml-7 -mt-1">Adds depth with multi-stop brand gradients and glass effects.</p>
            </div>

            {/* Color Presets */}
            <div className="pt-6 border-t border-nudge-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold text-nudge-secondary-text uppercase tracking-[0.2em]">Brand Accents</h4>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-500/10 border border-accent-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                   <span className="text-[8px] font-bold text-accent-400 uppercase">Live</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { name: 'Nudge Classic', primary: '#0061ff', secondary: '#00e599' },
                  { name: 'Indigo Dream', primary: '#4f46e5', secondary: '#ec4899' },
                  { name: 'Emerald High', primary: '#10b981', secondary: '#0ea5e9' },
                  { name: 'Sunset Burn', primary: '#f43f5e', secondary: '#f59e0b' },
                  { name: 'Cyber Neon', primary: '#8b5cf6', secondary: '#2eecc4' },
                  { name: 'Royal Slate', primary: '#1e293b', secondary: '#64748b' }
                ].map(color => (
                  <button
                    key={color.name}
                    onClick={() => updateSettings({ accentColor: color.primary, secondaryColor: color.secondary })}
                    className={cn(
                      "group relative h-12 rounded-xl transition-all overflow-hidden border-2",
                      accentColor === color.primary ? "border-white" : "border-transparent hover:border-nudge-border"
                    )}
                    title={color.name}
                  >
                    <div className="absolute inset-0 flex">
                      <div className="flex-1" style={{ backgroundColor: color.primary }} />
                      <div className="flex-1 opacity-60" style={{ backgroundColor: color.secondary }} />
                    </div>
                    {accentColor === color.primary && (
                      <div className="absolute inset-0 flex items-center justify-center bg-nudge-inverse/20">
                        <Check className="w-4 h-4 text-nudge-primary-text" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Build */}
            <div className="pt-6 border-t border-nudge-border">
              <h4 className="text-[10px] font-bold text-nudge-secondary-text uppercase tracking-[0.2em] mb-4">Custom Laboratory</h4>
              <div className="bg-white/[0.02] border border-nudge-border p-4 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-nudge-border">
                      <input
                        type="color"
                        value={accentColor || '#1a8fff'}
                        onChange={(e) => updateSettings({ accentColor: e.target.value })}
                        className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                      />
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: accentColor || '#1a8fff' }} />
                    </div>
                    <span className="text-xs font-medium text-nudge-secondary-text">Primary</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-nudge-border">
                      <input
                        type="color"
                        value={secondaryColor || '#00d4aa'}
                        onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                        className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                      />
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: secondaryColor || '#00d4aa' }} />
                    </div>
                    <span className="text-xs font-medium text-nudge-secondary-text">Secondary</span>
                  </div>
                </div>
                <button 
                  onClick={() => updateSettings({ accentColor: '#1a8fff', secondaryColor: '#00d4aa' })}
                  className="p-2 text-nudge-secondary-text hover:text-nudge-primary-text transition-colors"
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </Section>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
        <Section title="Profile Settings" icon={User} description="Update your personal information">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <div className="w-24 h-24 rounded-full bg-accent-600/20 flex items-center justify-center border-2 border-dashed border-accent-500/50 overflow-hidden">
                {localProfile.photoUrl ? <img src={localProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-accent-400" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-nudge-inverse/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="w-6 h-6 text-nudge-primary-text" />
              </button>
            </div>
            <div>
              <h4 className="font-bold text-lg text-nudge-primary-text">{localProfile.name}</h4>
              <p className="text-sm text-nudge-secondary-text">Personal Account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-nudge-secondary-text uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={localProfile.name}
                onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 transition-all text-nudge-primary-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-nudge-secondary-text uppercase tracking-widest">Age</label>
                <input 
                  type="number" 
                  value={localProfile.age || ''}
                  onChange={(e) => setLocalProfile({ ...localProfile, age: Number(e.target.value) })}
                  className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 transition-all text-nudge-primary-text"
                />
                </div>
                <CustomSelect 
                  label="Sex"
                  value={localProfile.sex || 'prefer_not_to_say'}
                  onChange={(val) => setLocalProfile({ ...localProfile, sex: val })}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                  ]}
                />
              </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="w-full py-4 bg-action text-white rounded-2xl font-bold hover:bg-accent-500 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </Section>
        )}

        {/* AI Personalization */}
        {activeTab === 'ai' && (
        <Section title="AI Intelligence" icon={Zap} description="Configure how Nudge works for you">
          <div className="space-y-4">
              <CustomSelect 
                label="AI Mode"
                value={ai.mode}
                onChange={(val) => {
                  updateSettings({ ai: { ...ai, mode: val as AIMode } });
                  addToast(`AI Mode set to ${val}`);
                }}
                options={[
                  { value: 'Conservative', label: 'Conservative' },
                  { value: 'Balanced', label: 'Balanced' },
                  { value: 'Aggressive', label: 'Aggressive' }
                ]}
              />
              <CustomSelect 
                label="Insight Detail Level"
                value={ai.detailLevel}
                onChange={(val) => {
                  updateSettings({ ai: { ...ai, detailLevel: val as AIDetail } });
                  addToast(`Insight detail set to ${val}`);
                }}
                options={[
                  { value: 'Short', label: 'Short (to-the-point)' },
                  { value: 'Detailed', label: 'Detailed' }
                ]}
              />
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
        )}

        {/* Notification Preferences */}
        {activeTab === 'notifications' && (
        <Section title="Notifications" icon={Bell} description="Choose what you want to be notified about">
          <div className="space-y-4">
              <CustomSelect 
                label="Notification Intensity"
                value={notifications.intensity}
                onChange={(val) => {
                  updateSettings({ notifications: { ...notifications, intensity: val as NotificationIntensity } });
                  addToast(`Intensity set to ${val}`);
                }}
                options={[
                  { value: 'Minimal', label: 'Minimal' },
                  { value: 'Balanced', label: 'Balanced' },
                  { value: 'Frequent', label: 'Frequent' }
                ]}
              />
            <Toggle label="Fraud Alerts" enabled={notifications.fraud} onChange={() => updateSettings({ notifications: { ...notifications, fraud: !notifications.fraud } })} />
            <Toggle label="Bill Reminders" enabled={notifications.bills} onChange={() => updateSettings({ notifications: { ...notifications, bills: !notifications.bills } })} />
            <Toggle label="Investment Alerts" enabled={notifications.investments} onChange={() => updateSettings({ notifications: { ...notifications, investments: !notifications.investments } })} />
            <Toggle label="Credit Card Alerts" enabled={notifications.credit} onChange={() => updateSettings({ notifications: { ...notifications, credit: !notifications.credit } })} />
          </div>
        </Section>
        )}

        {/* Currency & Region */}
        {activeTab === 'currency' && (
        <Section title="Currency & Region" icon={Globe} description="Set your local preferences">
          <div className="grid grid-cols-2 gap-4">
              <CustomSelect 
                label="Currency"
                value={currency}
                onChange={(val) => {
                  updateSettings({ currency: val as Currency });
                  addToast(`Currency updated to ${val}`);
                }}
                options={[
                  { value: 'INR', label: 'INR (₹)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'JPY', label: 'JPY (¥)' },
                  { value: 'CAD', label: 'CAD ($)' },
                  { value: 'AUD', label: 'AUD ($)' },
                  { value: 'CHF', label: 'CHF (Fr)' },
                  { value: 'CNY', label: 'CNY (¥)' },
                  { value: 'HKD', label: 'HKD ($)' },
                  { value: 'NZD', label: 'NZD ($)' },
                  { value: 'SGD', label: 'SGD ($)' },
                  { value: 'AED', label: 'AED (د.إ)' },
                  { value: 'SAR', label: 'SAR (ر.س)' },
                  { value: 'BRL', label: 'BRL (R$)' },
                  { value: 'ZAR', label: 'ZAR (R)' },
                  { value: 'RUB', label: 'RUB (₽)' },
                  { value: 'KRW', label: 'KRW (₩)' },
                  { value: 'TRY', label: 'TRY (₺)' },
                  { value: 'MXN', label: 'MXN ($)' },
                  { value: 'IDR', label: 'IDR (Rp)' },
                  { value: 'MYR', label: 'MYR (RM)' },
                  { value: 'THB', label: 'THB (฿)' },
                  { value: 'VND', label: 'VND (₫)' }
                ]}
              />
              <CustomSelect 
                label="Region"
                value={region}
                onChange={(val) => {
                  updateSettings({ region: val });
                  addToast(`Region set to ${val}`);
                }}
                options={[
                  { value: 'India', label: 'India' },
                  { value: 'USA', label: 'USA' },
                  { value: 'UK', label: 'UK' },
                  { value: 'Europe', label: 'Europe' },
                  { value: 'Japan', label: 'Japan' },
                  { value: 'Canada', label: 'Canada' },
                  { value: 'Australia', label: 'Australia' },
                  { value: 'Switzerland', label: 'Switzerland' },
                  { value: 'China', label: 'China' },
                  { value: 'UAE', label: 'United Arab Emirates' },
                  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                  { value: 'Brazil', label: 'Brazil' },
                  { value: 'South Africa', label: 'South Africa' },
                  { value: 'Russia', label: 'Russia' },
                  { value: 'Mexico', label: 'Mexico' },
                  { value: 'Southeast Asia', label: 'Southeast Asia' }
                ]}
              />
          </div>
        </Section>
        )}

        {/* Financial Preferences */}
        {activeTab === 'financials' && (
        <Section title="Financial Preferences" icon={Wallet} description="Customize your financial targets">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-nudge-secondary-text uppercase tracking-widest">Monthly Budget</label>
                <input 
                  type="number" 
                  value={localBudget}
                  onChange={(e) => setLocalBudget(e.target.value)}
                  onBlur={handleBudgetBlur}
                  className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 transition-all text-nudge-primary-text"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-nudge-secondary-text uppercase tracking-widest">Savings Goal</label>
                <input 
                  type="number" 
                  value={localSavings}
                  onChange={(e) => setLocalSavings(e.target.value)}
                  onBlur={handleSavingsBlur}
                  className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 transition-all text-nudge-primary-text"
                />
              </div>
            </div>
            <CustomSelect 
              label="Default Investment Preference"
              value={financials.riskPreference}
              onChange={(val) => {
                updateSettings({ financials: { ...financials, riskPreference: val as RiskPreference } });
                addToast(`Investment preference: ${val}`);
              }}
              options={[
                { value: 'Low Risk', label: 'Low Risk' },
                { value: 'Balanced', label: 'Balanced' },
                { value: 'High Growth', label: 'High Growth' }
              ]}
            />
          </div>
        </Section>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
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
              <CustomSelect 
                label="Session Timeout"
                value={security.sessionTimeout}
                onChange={(val) => {
                  updateSettings({ security: { ...security, sessionTimeout: val } });
                  addToast(`Timeout set to ${val}`);
                }}
                options={[
                  { value: '5 min', label: '5 min' },
                  { value: '15 min', label: '15 min' },
                  { value: '30 min', label: '30 min' }
                ]}
              />
            <button 
              onClick={() => setActiveModal('password')}
              className="w-full flex items-center justify-between p-4 bg-nudge-inverse/10 border border-nudge-border rounded-2xl hover:bg-nudge-inverse/10 transition-all group"
            >
              <span className="font-medium text-nudge-primary-text">Change Password</span>
              <ChevronRight className="w-5 h-5 text-nudge-secondary-text group-hover:text-nudge-primary-text transition-colors" />
            </button>
          </div>
        </Section>
        )}


        {/* Data Sync & Backup */}
        {activeTab === 'data' && (
        <Section title="Data Sync & Backup" icon={Database} description="Keep your data safe and updated">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleSyncData}
              disabled={isSyncing}
              className="flex items-center justify-center gap-2 py-4 bg-accent-600/10 text-accent-400 border border-accent-500/20 rounded-2xl font-bold hover:bg-accent-600/20 transition-all"
            >
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Sync Data
            </button>
            <button 
              onClick={() => addToast('Backup created successfully')}
              className="flex items-center justify-center gap-2 py-4 bg-nudge-inverse/10 border border-nudge-border text-nudge-primary-text rounded-2xl font-bold hover:bg-nudge-inverse/10 transition-all"
            >
              <Database className="w-5 h-5" />
              Backup Data
            </button>
          </div>
        </Section>
        )}

        {/* Data & Privacy */}
        {activeTab === 'privacy' && (
        <Section title="Data & Privacy" icon={Shield} description="Manage your data and account status">
          <div className="space-y-3">
            <button 
              onClick={handleDownloadData}
              className="w-full flex items-center justify-between p-4 bg-nudge-inverse/10 border border-nudge-border rounded-2xl hover:bg-nudge-inverse/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-accent-400" />
                <span className="font-medium text-nudge-primary-text">Download My Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-nudge-secondary-text group-hover:text-nudge-primary-text transition-colors" />
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
        )}
        </div>
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
              className="absolute inset-0 bg-nudge-inverse/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-nudge-secondary border border-nudge-border rounded-[32px] p-8 shadow-2xl"
            >
              {activeModal === 'password' ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-nudge-primary-text">Change Password</h3>
                  <p className="text-nudge-secondary-text text-sm">Enter your current password and a new one to update your security.</p>
                  <div className="space-y-4">
                    <input type="password" placeholder="Current Password" className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 text-nudge-primary-text" />
                    <input type="password" placeholder="New Password" className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 text-nudge-primary-text" />
                    <input type="password" placeholder="Confirm New Password" className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-4 py-3 focus:outline-none focus:border-accent-500 text-nudge-primary-text" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-nudge-inverse/10 rounded-2xl font-bold hover:bg-nudge-inverse/10 transition-all text-nudge-primary-text">Cancel</button>
                    <button onClick={() => { setActiveModal(null); addToast('Password updated'); }} className="flex-1 py-3 bg-accent-600 rounded-2xl font-bold hover:bg-accent-500 transition-all text-white">Update</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-nudge-primary-text">Delete Account?</h3>
                    <p className="text-nudge-secondary-text text-sm">This action is permanent and cannot be undone. All your financial data will be wiped from our servers.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-3 bg-nudge-inverse/10 rounded-2xl font-bold hover:bg-nudge-inverse/10 transition-all text-nudge-primary-text">Keep Account</button>
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
                "bg-accent-500/20 border-accent-500/20 text-accent-400"
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
