import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Receipt, 
  Smartphone, 
  Upload, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Search, 
  Check, 
  X, 
  Loader2, 
  ChevronRight, 
  Info, 
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Trash2,
  FileText,
  Activity,
  DollarSign,
  PieChart as PieChartIcon,
  Wifi,
  Tv,
  Lightbulb,
  Phone,
  Camera,
  RotateCcw,
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  profile: UserProfile;
}

interface Bill {
  id: string;
  provider: string;
  type: 'Electricity' | 'Internet' | 'Subscription' | 'Mobile';
  amount: number;
  prevAmount: number;
  date: string;
  status: 'Normal' | 'High' | 'Suspicious';
  change: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface Issue {
  id: string;
  title: string;
  description: string;
  impact: number;
}

export default function BillOptimizer({ profile }: Props) {
  const { bills: globalBills, addBill } = useData();
  const { formatCurrency, ...settings } = useSettings();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isCheckingIssues, setIsCheckingIssues] = useState(false);
  const [isFindingSavings, setIsFindingSavings] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzingScan, setIsAnalyzingScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [savings, setSavings] = useState<{ label: string, monthly: number, yearly: number }[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "I'm your Bill Optimizer AI. I can help you understand your utility costs and find ways to save. Why not start by fetching your bills?" }
  ]);

  // Sync with global bills
  useEffect(() => {
    if (globalBills.length > 0) {
      // Map global bills to local format if needed, or just use them
      const mappedBills: Bill[] = globalBills.map(b => ({
        id: b.id,
        provider: b.name,
        type: b.category as any,
        amount: b.amount,
        prevAmount: b.amount * 0.9, // Mock previous amount
        date: b.dueDate,
        status: b.status === 'Overdue' ? 'Suspicious' : 'Normal',
        change: 10
      }));
      setBills(mappedBills);
    }
  }, [globalBills]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const simulateFetch = () => {
    setIsFetching(true);
    setTimeout(() => {
      const fetchedBills: Bill[] = [
        { id: '1', provider: 'GridPower Co.', type: 'Electricity', amount: 145.50, prevAmount: 118.20, date: '2024-03-15', status: 'High', change: 23.1 },
        { id: '2', provider: 'FiberConnect', type: 'Internet', amount: 89.99, prevAmount: 89.99, date: '2024-03-12', status: 'Normal', change: 0 },
        { id: '3', provider: 'StreamMax', type: 'Subscription', amount: 19.99, prevAmount: 14.99, date: '2024-03-10', status: 'High', change: 33.3 },
        { id: '4', provider: 'GlobalMobile', type: 'Mobile', amount: 55.00, prevAmount: 55.00, date: '2024-03-08', status: 'Normal', change: 0 },
      ];
      setBills(fetchedBills);
      setIsFetching(false);
      addToast('Bills fetched from SMS and Email successfully.', 'success');
      
      // Also add to global state
      fetchedBills.forEach(b => {
        addBill({
          name: b.provider,
          amount: b.amount,
          dueDate: b.date,
          category: b.type,
          status: 'Pending'
        });
      });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload();
    }
  };

  const triggerFileUpload = () => {
    if (!isAnalyzing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const simulateUpload = () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalysisStep(0);
    
    const steps = [
      "Reading bill structure...",
      "Extracting vendor data...",
      "Parsing line items...",
      "Verifying against history...",
      "Generating AI insights..."
    ];

    const runStep = (index: number) => {
      if (index < steps.length) {
        setAnalysisStep(index);
        analysisTimeoutRef.current = setTimeout(() => runStep(index + 1), 600);
      } else {
        const newBill: Bill = { 
          id: Math.random().toString(36).substring(7), 
          provider: 'WaterWorks', 
          type: 'Electricity', 
          amount: 62.40, 
          prevAmount: 58.00, 
          date: '2024-03-18', 
          status: 'Normal', 
          change: 7.5 
        };
        setBills(prev => [newBill, ...prev]);
        setIsAnalyzing(false);
        addToast('Bill analyzed and added to dashboard.', 'success');
        
        addBill({
          name: newBill.provider,
          amount: newBill.amount,
          dueDate: newBill.date,
          category: newBill.type,
          status: 'Pending'
        });
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    runStep(0);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    };
  }, []);

  const analysisSteps = [
    "Reading bill structure...",
    "Extracting vendor data...",
    "Parsing line items...",
    "Verifying against history...",
    "Generating AI insights..."
  ];

  const checkIssues = () => {
    setIsCheckingIssues(true);
    setTimeout(() => {
      const detectedIssues: Issue[] = [
        { id: '1', title: 'Duplicate Subscription', description: 'You have both StreamMax and CineStream active. They offer 90% overlapping content.', impact: 15 },
        { id: '2', title: 'Hidden Service Fee', description: 'GridPower Co. added a $12.50 "Infrastructure Maintenance" fee not present in previous bills.', impact: 12.5 },
      ];
      setIssues(detectedIssues);
      setIsCheckingIssues(false);
      addToast('Issues check complete.', 'warning');
    }, 2000);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    setCapturedImage(null);
    setScanResult(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera permission required or device not found.");
      addToast("Camera access denied.", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        addToast("Image captured.", "success");
      }
    }
  };

  const analyzeScan = () => {
    setIsAnalyzingScan(true);
    setTimeout(() => {
      const result = {
        provider: 'VoltEnergy Solutions',
        amount: 182.40,
        date: '2024-03-20',
        breakdown: [
          { label: 'Base Charge', value: 140.00 },
          { label: 'Taxes & Regulatory', value: 22.40 },
          { label: 'Service Fee (New)', value: 20.00 }
        ],
        insights: [
          "Bill increased by 20% vs last month.",
          "Unusual $20 'Service Fee' detected."
        ],
        savings: "You can save $35/month by switching to the 'Eco-Saver' plan."
      };
      setScanResult(result);
      setIsAnalyzingScan(false);
      addToast("Analysis complete.", "success");
      
      // Add to main bills list
      const newBill: Bill = {
        id: Math.random().toString(36).substring(7),
        provider: result.provider,
        type: 'Electricity',
        amount: result.amount,
        prevAmount: 152.00,
        date: result.date,
        status: 'High',
        change: 20
      };
      setBills(prev => [newBill, ...prev]);
    }, 3000);
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setTimeout(() => {
      let aiMsg = "Direct Answer: ";
      if (userMsg.toLowerCase().includes('high')) {
        aiMsg += "Your electricity bill is high due to a 23% increase in peak-hour usage.\n\nKey Insight: Usage spike detected on weekends.\n\n👉 Suggestion: Shift heavy appliance use to off-peak hours (after 10 PM).";
      } else if (userMsg.toLowerCase().includes('reduce')) {
        aiMsg += "You can reduce costs by bundling your FiberConnect and GlobalMobile plans.\n\nKey Insight: Potential savings of $20/month.\n\n👉 Suggestion: Contact FiberConnect support for the 'Home Bundle' offer.";
      } else {
        aiMsg += "I've analyzed your bills. You have a total monthly liability of " + formatCurrency(bills.reduce((acc, b) => acc + b.amount, 0)) + ".\n\nKey Insight: Subscriptions account for 15% of your total bills.\n\n👉 Suggestion: Review your active subscriptions to find unused services.";
      }
      setChatHistory(prev => [...prev, { role: 'ai', text: aiMsg }]);
    }, 1000);
  };

  const totalBills = bills.reduce((acc, b) => acc + b.amount, 0);
  const highestBill = bills.length > 0 ? Math.max(...bills.map(b => b.amount)) : 0;
  // Let potentialSavings be fixed as 55 for summary demo
  const potentialSavings = 55;
  const overpaymentAlerts = issues.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Electricity': return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'Internet': return <Wifi className="w-4 h-4 text-accent-400" />;
      case 'Subscription': return <Tv className="w-4 h-4 text-rose-400" />;
      case 'Mobile': return <Phone className="w-4 h-4 text-emerald-400" />;
      default: return <Receipt className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight mb-0.5 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent-500" />
            Smart Bill Optimizer
          </h1>
          <p className="text-gray-500 text-xs text-left">AI-powered bill analysis and cost reduction.</p>
        </div>
        <button 
          onClick={simulateFetch}
          disabled={isFetching}
          className="px-3 py-2 bg-action text-white rounded-lg font-bold hover:bg-accent-500 transition-all flex items-center gap-2 text-xs disabled:opacity-50"
        >
          {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Fetch Bills
        </button>
      </header>

      {/* Top Meta Row */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Total Monthly</p>
          <h3 className="text-lg font-bold">{formatCurrency(totalBills)}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Highest Bill</p>
          <h3 className="text-lg font-bold">{formatCurrency(highestBill)}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Savings Potential</p>
          <h3 className="text-lg font-bold text-emerald-400">{formatCurrency(potentialSavings)}</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
          <p className="text-[9px] text-white/50 uppercase tracking-widest font-bold mb-1">Overpayment</p>
          <h3 className={cn("text-lg font-bold", overpaymentAlerts > 0 ? "text-rose-500" : "text-white")}>
            {overpaymentAlerts} Alerts
          </h3>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-3 flex-shrink-0">
        <button onClick={startCamera} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 text-xs font-bold">
          <Camera className="w-3.5 h-3.5 text-accent-400" /> Scan Bill
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
        <button onClick={triggerFileUpload} disabled={isAnalyzing} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50">
          {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-accent-400" />} Upload File
        </button>
        <button onClick={checkIssues} disabled={isCheckingIssues} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 text-xs font-bold disabled:opacity-50">
          {isCheckingIssues ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 text-rose-400" />} Find Issues
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-3">
        {/* Left: Table */}
        <div className="flex-[5.5] bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col overflow-hidden backdrop-blur-md relative">
           {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0A0A0A]/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-6 h-6 text-accent-500 animate-spin mb-2" />
                <p className="text-xs font-bold text-accent-400">{analysisSteps[analysisStep]}</p>
                <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }} className="h-full bg-accent-500" />
                </div>
              </div>
           )}
           <div className="flex-1 overflow-y-auto w-full">
             <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0A0A0A] z-10">
                  <tr className="text-white/50 text-[9px] uppercase tracking-widest border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Change</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center">
                            {getIcon(bill.type)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{bill.provider}</div>
                            <div className="text-[10px] text-gray-500">{bill.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold">{formatCurrency(bill.amount)}</td>
                      <td className="px-4 py-2.5">
                        <div className={cn("flex items-center gap-1 text-[10px] font-bold", bill.change > 0 ? "text-rose-500" : bill.change < 0 ? "text-emerald-500" : "text-gray-500")}>
                          {bill.change > 0 ? '+' : ''}{bill.change}%
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest", bill.status === 'High' ? "bg-rose-500/10 text-rose-500" : bill.status === 'Suspicious' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-500 border-b-0">No bills analyzed yet. Fetch or upload a bill.</td></tr>
                  )}
                </tbody>
             </table>
           </div>
        </div>

        {/* Right: AI Chat & Issues Sidebar */}
        <div className="flex-[4.5] flex flex-col gap-3 min-h-0">
          
          {/* Issues Box (if any) */}
          {issues.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 flex-shrink-0">
              <h3 className="text-[10px] font-bold text-rose-500 mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5" /> Action Required ({issues.length})
              </h3>
              <div className="space-y-2">
                {issues.map(issue => (
                  <div key={issue.id} className="text-[10px]">
                    <p className="font-bold text-rose-300">{issue.title}</p>
                    <p className="text-gray-400 mt-0.5">{issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col overflow-hidden min-h-0">
             <div className="p-3 border-b border-white/5 bg-accent-600/5 flex items-center gap-2 flex-shrink-0">
                <div className="w-6 h-6 bg-action rounded text-white flex items-center justify-center">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <h3 className="text-xs font-bold">Bill Expert AI</h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-2.5 text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-action text-white rounded-xl rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-xl rounded-bl-sm'}`}>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
             </div>
            
             <form onSubmit={handleChat} className="p-2 border-t border-white/5 flex-shrink-0">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your bills..."
                    className="w-full bg-white/5 border border-white/10 rounded flex-1 py-1.5 pl-2.5 pr-8 focus:outline-none focus:border-accent-500 text-[11px]"
                  />
                  <button type="submit" className="absolute right-1 top-1 bottom-1 px-1.5 text-accent-400 hover:bg-accent-500/20 rounded flex items-center justify-center transition-all">
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-4">
             <div className="relative w-full max-w-sm aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
                    <h4 className="text-sm font-bold mb-2">Camera Error</h4>
                    <p className="text-gray-400 text-xs mb-6">{cameraError}</p>
                    <button onClick={stopCamera} className="px-6 py-2 bg-white/10 rounded-lg text-xs font-bold">Close</button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                      <button onClick={stopCamera} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={captureImage} className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white/20 active:scale-90 transition-transform">
                        <div className="w-12 h-12 border-2 border-black rounded-full" />
                      </button>
                      <div className="w-10 h-10" />
                    </div>
                  </>
                )}
             </div>
             <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Retake/Analyze Screen Overlay (condensed) */}
      <AnimatePresence>
        {capturedImage && !isCameraOpen && !scanResult && !isAnalyzingScan && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0a0a0a]/95 backdrop-blur-lg rounded-2xl border border-white/10 p-5 flex flex-col items-center justify-center shadow-2xl">
            <h3 className="text-sm font-bold mb-3">Captured Bill</h3>
            <img src={capturedImage} className="w-full h-40 object-contain rounded border border-white/5 mb-4" alt="Scanned Bill" />
            <div className="flex gap-2 w-full">
              <button onClick={startCamera} className="flex-1 py-2 bg-white/10 hover:bg-white/15 rounded text-xs font-bold transition-colors">Retake</button>
              <button onClick={analyzeScan} className="flex-1 py-2 bg-action text-white rounded text-xs font-bold">Analyze</button>
            </div>
          </motion.div>
        )}
        {scanResult && !isAnalyzingScan && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#0a0a0a]/95 backdrop-blur-lg rounded-2xl border border-white/10 p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Scanned Successfully</h3>
              <button onClick={() => {setScanResult(null); setCapturedImage(null);}} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-white/5 rounded-lg p-3 mb-3 border border-white/5">
              <p className="text-[10px] text-white/50 uppercase">Provider</p>
              <p className="text-sm font-bold">{scanResult.provider}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-white/50 uppercase">Amount Due</p>
                <p className="text-lg font-bold text-rose-400">{formatCurrency(scanResult.amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase">Date</p>
                <p className="text-xs font-medium">{scanResult.date}</p>
              </div>
            </div>
            <button onClick={() => {setScanResult(null); setCapturedImage(null);}} className="w-full py-2 bg-action text-white rounded text-xs font-bold">Save and Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[200] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn("pointer-events-auto px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 min-w-[200px] backdrop-blur-xl border text-[11px]", toast.type === 'success' ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400" : toast.type === 'error' ? "bg-rose-500/20 border-rose-500/20 text-rose-400" : "bg-accent-500/20 border-accent-500/20 text-accent-400")}>
              {toast.type === 'success' ? <Check className="w-3.5 h-3.5" /> : toast.type === 'error' ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
