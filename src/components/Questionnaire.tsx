import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Target, Wallet, CreditCard, ArrowRight, ShieldAlert, TrendingDown,
  Coins, Briefcase, Activity, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export interface QuestionnaireResult {
  name?: string;
  age?: number;
  sex?: string;
  primary_goal: string;
  income: number;
  expenses: number;
  savings: number;
  credit_score: number;
  risk_tolerance: string;
  financial_worry: string;
}

interface Props {
  onComplete: (answers: QuestionnaireResult) => void;
  isTestMode?: boolean; 
  onCancel?: () => void;
}

// 7 Questions
const QUESTIONS = [
  {
    id: 'name',
    type: 'input',
    title: 'What is your name?',
    subtitle: 'So we know what to call you.',
    placeholder: 'Enter your name'
  },
  {
    id: 'age',
    type: 'slider',
    title: 'How old are you?',
    subtitle: 'This helps our AI understand your financial timeline.',
    min: 18,
    max: 100,
    step: 1,
    prefix: '',
  },
  {
    id: 'sex',
    type: 'choice',
    title: 'What is your sex/gender?',
    subtitle: 'To better personalize your language and risk assessments.',
    options: [
      { id: 'male', label: 'Male', icon: Target },
      { id: 'female', label: 'Female', icon: Target },
      { id: 'other', label: 'Other', icon: Activity },
      { id: 'prefer_not_to_say', label: 'Prefer not to say', icon: ShieldAlert },
    ]
  },
  {
    id: 'primary_goal',
    type: 'choice',
    title: 'What is your primary financial goal?',
    subtitle: 'This helps us tailor Nudge exactly to your needs.',
    options: [
      { id: 'maximize-rewards', label: 'Maximize Rewards', icon: Zap },
      { id: 'build-credit', label: 'Build Credit', icon: CreditCard },
      { id: 'pay-debt', label: 'Pay Debt', icon: Wallet },
      { id: 'save-invest', label: 'Save & Invest', icon: Target },
    ]
  },
  {
    id: 'income',
    type: 'slider',
    title: 'Estimated annual income?',
    subtitle: 'Tell us how much you make a year.',
    min: 0,
    max: 500000,
    step: 5000,
    prefix: '$',
    formatOptions: { maximumFractionDigits: 0 }
  },
  {
    id: 'expenses',
    type: 'slider',
    title: 'Average monthly expenses?',
    subtitle: 'Not including big one-off purchases.',
    min: 0,
    max: 30000,
    step: 500,
    prefix: '$',
    formatOptions: { maximumFractionDigits: 0 }
  },
  {
    id: 'savings',
    type: 'slider',
    title: 'Total savings & investments?',
    subtitle: 'A rough estimate of your current nest egg.',
    min: 0,
    max: 1000000,
    step: 10000,
    prefix: '$',
    formatOptions: { maximumFractionDigits: 0 }
  },
  {
    id: 'credit_score',
    type: 'slider',
    title: 'Approximate credit score?',
    subtitle: 'This helps our Credit Intel engine gauge your baseline.',
    min: 300,
    max: 850,
    step: 10,
    prefix: '',
  },
  {
    id: 'risk_tolerance',
    type: 'choice',
    title: 'What is your investment risk tolerance?',
    subtitle: 'How do you react to market swings?',
    options: [
      { id: 'conservative', label: 'Conservative (Low risk)', icon: ShieldAlert },
      { id: 'moderate', label: 'Moderate (Balanced)', icon: Activity },
      { id: 'aggressive', label: 'Aggressive (High risk)', icon: TrendingDown },
    ]
  },
  {
    id: 'financial_worry',
    type: 'choice',
    title: 'What is your biggest financial worry?',
    subtitle: 'We can help mitigate these stress points.',
    options: [
      { id: 'debt', label: 'Drowning in Debt', icon: Coins },
      { id: 'inflation', label: 'Impact of Inflation', icon: TrendingDown },
      { id: 'unexpected', label: 'Unexpected Expenses', icon: AlertCircle },
      { id: 'not_saving', label: 'Not Saving Enough', icon: Briefcase },
    ]
  }
];

export default function Questionnaire({ onComplete, isTestMode = false, onCancel }: Props) {
  const { formatCurrency, updateSettings, currency: globalCurrency } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(globalCurrency);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const currencyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const CURRENCIES = [
    { value: 'INR', symbol: '₹' },
    { value: 'USD', symbol: '$' },
    { value: 'EUR', symbol: '€' },
    { value: 'GBP', symbol: '£' },
    { value: 'JPY', symbol: '¥' },
    { value: 'CAD', symbol: '$' },
    { value: 'AUD', symbol: '$' },
    { value: 'CHF', symbol: 'Fr' },
    { value: 'CNY', symbol: '¥' },
    { value: 'HKD', symbol: '$' },
    { value: 'NZD', symbol: '$' },
    { value: 'SGD', symbol: '$' },
    { value: 'AED', symbol: 'د.إ' },
    { value: 'SAR', symbol: 'ر.س' },
    { value: 'BRL', symbol: 'R$' },
    { value: 'ZAR', symbol: 'R' },
    { value: 'RUB', symbol: '₽' },
    { value: 'KRW', symbol: '₩' },
    { value: 'TRY', symbol: '₺' },
    { value: 'MXN', symbol: '$' },
    { value: 'IDR', symbol: 'Rp' },
    { value: 'MYR', symbol: 'RM' },
    { value: 'THB', symbol: '฿' },
    { value: 'VND', symbol: '₫' }
  ];

  const currentSymbol = CURRENCIES.find(c => c.value === selectedCurrency)?.symbol || '$';

  const handleNextStep = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Default slider values for next step
      const nextQ = QUESTIONS[currentStep + 1];
      if (nextQ.type === 'slider') {
        setSliderValue(answers[nextQ.id] || ((nextQ.max! - nextQ.min!) / 2));
      }
    } else {
      // Complete
      updateSettings({ currency: selectedCurrency });
      const formattedAnswers: QuestionnaireResult = {
        name: answers['name'] || '',
        age: answers['age'] || 30,
        sex: answers['sex'] || 'prefer_not_to_say',
        primary_goal: answers['primary_goal'] || 'save-invest',
        income: answers['income'] || 60000,
        expenses: answers['expenses'] || 3000,
        savings: answers['savings'] || 10000,
        credit_score: answers['credit_score'] || 700,
        risk_tolerance: answers['risk_tolerance'] || 'moderate',
        financial_worry: answers['financial_worry'] || 'not_saving'
      };
      onComplete(formattedAnswers);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevQ = QUESTIONS[currentStep - 1];
      if (prevQ.type === 'slider') {
        setSliderValue(answers[prevQ.id] || ((prevQ.max! - prevQ.min!) / 2));
      }
    }
  };

  const handleSelectChoice = (optionId: string) => {
    const qid = QUESTIONS[currentStep].id;
    setAnswers(prev => ({ ...prev, [qid]: optionId }));
    
    // Auto-advance on choice
    setTimeout(handleNextStep, 350);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
    setSliderValue(numValue);
  };

  const handleSliderConfirm = () => {
    const qid = QUESTIONS[currentStep].id;
    setAnswers(prev => ({ ...prev, [qid]: sliderValue }));
    handleNextStep();
  };

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto relative min-h-[400px]">
      
      {/* Top Navigation & Progress */}
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={currentStep === 0 ? onCancel : handlePrevStep}
          className="p-2 hover:bg-nudge-inverse/10 rounded-xl transition-all mr-2 group flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-nudge-secondary-text group-hover:text-nudge-primary-text transition-colors" />
        </button>

        <div className="flex flex-1 items-center gap-2">
          {QUESTIONS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${
                idx <= currentStep ? 'bg-accent-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-nudge-inverse/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Question Container */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col min-h-[300px]"
          >
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-3 leading-tight text-nudge-primary-text">
                {currentQ.title}
              </h2>
              <p className="text-lg text-accent-200/60 mb-10">
                {currentQ.subtitle}
              </p>
            </div>

            {currentQ.type === 'choice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                {currentQ.options?.map((option) => {
                  const isSelected = answers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectChoice(option.id)}
                      className={`p-6 border rounded-3xl text-left transition-all group flex items-center justify-between ${
                        isSelected 
                          ? 'bg-accent-600/20 border-accent-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-nudge-inverse/10 border-nudge-border hover:bg-nudge-inverse/10 hover:border-accent-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {option.icon && <option.icon className={`w-6 h-6 ${isSelected ? 'text-accent-400' : 'text-nudge-secondary-text group-hover:text-accent-400'} transition-colors`} />}
                        <span className="text-xl font-medium text-nudge-primary-text">{option.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                         isSelected ? 'border-accent-500' : 'border-nudge-border group-hover:border-accent-500/50'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQ.type === 'input' && (
              <div className="mt-8 flex flex-col gap-10">
                <input
                  type="text"
                  placeholder={currentQ.placeholder}
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                  className="w-full bg-nudge-inverse/10 border border-nudge-border rounded-2xl px-6 py-5 text-xl text-nudge-primary-text placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNextStep();
                    }
                  }}
                />
                <div className="flex mt-4">
                  <button
                    onClick={handleNextStep}
                    disabled={!answers[currentQ.id]?.trim()}
                    className="px-8 py-4 bg-action text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:shadow-none"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentQ.type === 'slider' && (
              <div className="mt-8 flex flex-col items-center gap-12">
                <div className="w-full max-w-md relative">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {currentQ.prefix && (
                      <div className="relative" ref={currencyRef}>
                        <button
                          onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                          className="text-4xl text-accent-400 font-bold hover:text-accent-300 transition-colors bg-nudge-inverse/10 px-4 py-2 rounded-2xl border border-nudge-border hover:border-accent-500/50 group flex items-center gap-2"
                        >
                          {currentSymbol}
                          <div className="w-2 h-2 rounded-full bg-accent-500 group-hover:animate-ping" />
                        </button>

                        <AnimatePresence>
                          {isCurrencyOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 border border-nudge-border rounded-2xl shadow-2xl p-2 grid grid-cols-4 gap-1 w-64 z-[110]"
                            >
                              {CURRENCIES.map(curr => (
                                <button
                                  key={curr.value}
                                  onClick={() => {
                                    setSelectedCurrency(curr.value);
                                    setIsCurrencyOpen(false);
                                  }}
                                  className={`p-2 rounded-lg text-xs font-bold transition-all text-center ${
                                    selectedCurrency === curr.value 
                                      ? 'bg-accent-600 text-nudge-primary-text' 
                                      : 'text-nudge-secondary-text hover:bg-nudge-inverse/10 hover:text-nudge-primary-text'
                                  }`}
                                >
                                  {curr.symbol}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={sliderValue === 0 ? '' : new Intl.NumberFormat('en-US').format(sliderValue)}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-nudge-primary-text text-7xl font-bold tracking-tighter text-center focus:outline-none placeholder-white/10 caret-accent-500"
                        placeholder="0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSliderConfirm();
                        }}
                      />
                      <div className="absolute -bottom-2 left-0 right-0 h-px bg-nudge-inverse/10 group-focus-within:bg-accent-500/50 transition-colors" />
                    </div>
                  </div>

                  <div className="flex justify-between px-2 text-[10px] font-bold text-nudge-primary-text/20 uppercase tracking-widest">
                    <span>min: {currentQ.prefix}{currentQ.min}</span>
                    <span>max: {currentQ.prefix}{currentQ.max}+</span>
                  </div>
                </div>

                <button
                  onClick={handleSliderConfirm}
                  className="px-12 py-4 bg-action text-white rounded-2xl font-bold text-lg shadow-xl shadow-accent-600/20 transition-all active:scale-95 flex items-center gap-3"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
