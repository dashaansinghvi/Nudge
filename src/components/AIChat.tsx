import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  User, 
  Bot, 
  Clock, 
  Check, 
  AlertTriangle, 
  CreditCard, 
  ShieldCheck, 
  TrendingDown,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Transaction } from '../types';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSettings } from '../context/SettingsContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  actions?: { label: string, tab: string, icon: any }[];
}

const QUICK_ACTIONS = [
  { label: "Optimize Spending", tab: "expense-ai", icon: TrendingDown },
  { label: "View Fraud Alerts", tab: "fraud", icon: ShieldCheck },
  { label: "Save Tax", tab: "tax", icon: Zap },
  { label: "Best Card", tab: "credit", icon: CreditCard }
];

const AIChat = React.memo(function AIChat({ profile, transactions, onNavigate }: Props) {
  const { ai: aiSettings, formatCurrency } = useSettings();
  
  const SUGGESTIONS = useMemo(() => [
    "Where am I overspending?",
    `How to save ${formatCurrency(5000)}?`,
    "Best credit card for me?",
    "Tax saving tips"
  ], [formatCurrency]);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1',
      role: 'ai', 
      text: `Direct Answer: I'm ready to analyze your finances.\n\nKey Insights:\n- Connected to your ${transactions.length} recent transactions\n- Aware of your ${formatCurrency(profile.monthly_spending)} budget\n\n👉 Suggestion: Ask me about your spending patterns or tax deductions.`,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const generateResponse = useCallback(async (userMsg: string) => {
    if (!aiSettings.enableInsights) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: "Direct Answer: AI Insights are currently disabled in your settings.\n\nKey Insight:\n- Privacy mode active\n\n👉 Suggestion: Enable AI Insights in Settings to get analysis.",
        timestamp: new Date()
      }]);
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: userMsg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const systemInstruction = `
        You are a precise, no-nonsense AI Financial Advisor for Nudge.
        Your goal is to provide short, clear, actionable, and data-driven answers.
        
        AI MODE: ${aiSettings.mode}
        DETAIL LEVEL: ${aiSettings.detailLevel}
        
        RESPONSE RULES:
        - Max 3-5 lines total (unless detail level is high).
        - No fluff, no long explanations, no generic greetings.
        - Use numbers and insights from the user data provided.
        - Always follow this structure:
          1. Direct Answer (1-2 lines)
          2. Key Insight (1-2 bullet points)
          3. Action Suggestion (👉 Suggestion: [Clear next step])
        
        USER DATA:
        - Profile: ${JSON.stringify(profile)}
        - Recent Transactions: ${JSON.stringify(transactions.slice(0, 10))}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: systemInstruction
        }
      });

      const aiText = response.text || "Direct Answer: I couldn't analyze that.\n\nKey Insight:\n- Error in processing\n\n👉 Suggestion: Try rephrasing your question.";
      
      const aiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: aiText,
        timestamp: new Date(),
        actions: QUICK_ACTIONS.slice(0, 2) // Default actions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: "Direct Answer: Connection error.\n\nKey Insight:\n- AI brain temporarily offline\n\n👉 Suggestion: Check your internet or try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [aiSettings, profile, transactions]);

  const handleSend = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    generateResponse(msg);
  }, [input, isLoading, generateResponse]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-nudge-card border border-nudge rounded-[28px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3 border-b border-nudge bg-white/5 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-nudge-primary">Financial Advisor</h2>
            <p className="text-[9px] text-accent-400 uppercase tracking-widest font-bold">Precision Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Analysis</span>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth"
      >
        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => generateResponse(s)}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-left text-xs hover:bg-white/10 transition-all group flex items-center justify-between"
              >
                <span className="text-nudge-secondary group-hover:text-nudge-primary transition-colors">{s}</span>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-accent-400 transition-all" />
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col gap-2",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] p-4 rounded-[20px] text-xs leading-relaxed shadow-xl border",
                msg.role === 'user' 
                  ? "bg-accent-600 border-accent-500 text-white rounded-tr-none" 
                  : "bg-white/5 border-white/10 text-nudge-primary rounded-tl-none"
              )}>
                <div className="whitespace-pre-wrap font-medium">
                  {msg.text}
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest opacity-40",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <Clock className="w-3 h-3" />
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Quick Actions for AI */}
              {msg.role === 'ai' && msg.actions && (
                <div className="flex flex-wrap gap-2 mt-2 ml-2">
                  {msg.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate(action.tab)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 text-nudge-secondary hover:text-nudge-primary"
                    >
                      <action.icon className="w-3 h-3 text-accent-400" />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] rounded-tl-none">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
                <span className="text-xs font-bold text-nudge-secondary uppercase tracking-widest">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-nudge bg-white/[0.02]">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a precise financial question..."
            className="w-full bg-white/5 border border-white/10 rounded-[18px] py-3.5 pl-5 pr-14 focus:outline-none focus:border-accent-500 transition-all text-sm shadow-inner placeholder:text-gray-600 text-nudge-primary"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-action text-white rounded-xl disabled:opacity-50 hover:bg-accent-500 transition-all shadow-lg shadow-accent-600/20 flex items-center justify-center"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-2 flex justify-center gap-5">
          {QUICK_ACTIONS.map((action, i) => (
            <button 
              key={i}
              onClick={() => onNavigate(action.tab)}
              className="text-[9px] font-bold text-nudge-secondary uppercase tracking-widest hover:text-accent-400 transition-colors flex items-center gap-1"
            >
              <action.icon className="w-2.5 h-2.5" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AIChat;
