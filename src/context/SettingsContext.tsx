import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type Theme = 'dark' | 'light';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type AIMode = 'Conservative' | 'Balanced' | 'Aggressive';
export type AIDetail = 'Short' | 'Detailed';
export type NotificationIntensity = 'Minimal' | 'Balanced' | 'Frequent';
export type RiskPreference = 'Low Risk' | 'Balanced' | 'High Growth';

interface SettingsState {
  theme: Theme;
  currency: Currency;
  region: string;
  notifications: {
    fraud: boolean;
    bills: boolean;
    investments: boolean;
    credit: boolean;
    intensity: NotificationIntensity;
  };
  ai: {
    mode: AIMode;
    enableInsights: boolean;
    enableSuggestions: boolean;
    detailLevel: AIDetail;
  };
  financials: {
    budget: number;
    savingsGoal: number;
    riskPreference: RiskPreference;
  };
  security: {
    enable2FA: boolean;
    enableBiometric: boolean;
    sessionTimeout: string;
  };
}

interface SettingsContextType extends SettingsState {
  updateSettings: (updates: Partial<SettingsState>) => void;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const defaultSettings: SettingsState = {
      theme: 'dark',
      currency: 'INR',
      region: 'India',
      notifications: {
        fraud: true,
        bills: true,
        investments: true,
        credit: true,
        intensity: 'Balanced',
      },
      ai: {
        mode: 'Balanced',
        enableInsights: true,
        enableSuggestions: true,
        detailLevel: 'Detailed',
      },
      financials: {
        budget: 50000,
        savingsGoal: 1000000,
        riskPreference: 'Balanced',
      },
      security: {
        enable2FA: false,
        enableBiometric: true,
        sessionTimeout: '15 min',
      },
    };

    const saved = localStorage.getItem('nudge_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          notifications: {
            ...defaultSettings.notifications,
            ...(parsed.notifications || {})
          },
          ai: {
            ...defaultSettings.ai,
            ...(parsed.ai || {})
          },
          financials: {
            ...defaultSettings.financials,
            ...(parsed.financials || {})
          },
          security: {
            ...defaultSettings.security,
            ...(parsed.security || {})
          }
        };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('nudge_settings', JSON.stringify(settings));
    
    // Efficient theme switching without re-rendering the whole tree
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    const locales: Record<Currency, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
    };
    
    return new Intl.NumberFormat(locales[settings.currency], {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [settings.currency]);

  const value = useMemo(() => ({
    ...settings,
    updateSettings,
    formatCurrency
  }), [settings, updateSettings, formatCurrency]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
