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

  const simulateUpload = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const newBill: Bill = { 
        id: Math.random().toString(36).substring(7), 
        provider: 'WaterWorks', 
        type: 'Electricity', // Using Electricity icon for water for now
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
    }, 2500);
  };

  const generateInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => {
      const newInsights = [
        "Electricity bill increased by 23% compared to last month. Unusual peak usage detected between 6 PM - 9 PM.",
        "StreamMax subscription price increased by $5.00. You might want to review your plan.",
        "Internet bill is consistent, but you are eligible for a loyalty discount of 10%."
      ];
      setInsights(newInsights);
      setIsGeneratingInsights(false);
      addToast('AI Insights generated.', 'success');
    }, 1500);
  };

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

  const findSavings = () => {
    setIsFindingSavings(true);
    setTimeout(() => {
      const suggestions = [
        { label: 'Switch to Time-of-Use Plan', monthly: 25, yearly: 300 },
        { label: 'Cancel Unused Subscription', monthly: 15, yearly: 180 },
        { label: 'Bundle Mobile & Internet', monthly: 20, yearly: 240 },
      ];
      setSavings(suggestions);
      setIsFindingSavings(false);
      addToast('Savings optimization complete.', 'success');
    }, 1800);
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
  const potentialSavings = savings.reduce((acc, s) => acc + s.monthly, 0);
  const overpaymentAlerts = issues.length;

  const trendData = useMemo(() => {
    return [
      { month: 'Oct', amount: 280 },
      { month: 'Nov', amount: 310 },
      { month: 'Dec', amount: 350 },
      { month: 'Jan', amount: 290 },
      { month: 'Feb', amount: 275 },
      { month: 'Mar', amount: totalBills || 310 },
    ];
  }, [totalBills]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Electricity': return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'Internet': return <Wifi className="w-5 h-5 text-indigo-400" />;
      case 'Subscription': return <Tv className="w-5 h-5 text-rose-400" />;
      case 'Mobile': return <Phone className="w-5 h-5 text-emerald-400" />;
      default: return <Receipt className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Receipt className="w-10 h-10 text-indigo-500" />
            Smart Bill Optimizer
          </h1>
          <p className="text-gray-500">AI-powered bill analysis, tracking, and cost reduction.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={simulateFetch}
            disabled={isFetching}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
            {isFetching ? 'Fetching...' : 'Fetch Bills'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Dashboard */}
        <div className="lg:col-span-2 space-y-8">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Auto Fetch</h3>
                <p className="text-sm text-gray-500 mb-6">Scan SMS and Email for utility bills.</p>
              </div>
              <button 
                onClick={simulateFetch}
                disabled={isFetching}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {isFetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5 text-indigo-400" />}
                Fetch from Phone
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Scan Bill</h3>
                <p className="text-sm text-gray-500 mb-6">Use your camera to scan a physical bill instantly.</p>
              </div>
              <button 
                onClick={startCamera}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Camera className="w-5 h-5" />
                Scan with Camera
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold mb-2">Upload Bill</h3>
              <div 
                onClick={simulateUpload}
                className="mt-4 border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500/50 transition-all group"
              >
                {isAnalyzing ? (
                  <div className="space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-sm font-bold">Analyzing...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-gray-500 mx-auto group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-bold">Upload File</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">PDF, JPG</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Camera Modal & Scan Results */}
          <AnimatePresence>
            {isCameraOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-4"
              >
                <div className="relative w-full max-w-2xl aspect-[3/4] bg-zinc-900 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                      <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                      <h4 className="text-xl font-bold mb-2">Camera Error</h4>
                      <p className="text-gray-400 mb-6">{cameraError}</p>
                      <button 
                        onClick={stopCamera}
                        className="px-8 py-3 bg-white/10 rounded-2xl font-bold"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                        <div className="w-full h-full border-2 border-indigo-500/50 rounded-2xl relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
                        <button 
                          onClick={stopCamera}
                          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={captureImage}
                          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/20 shadow-2xl active:scale-90 transition-transform"
                        >
                          <div className="w-14 h-14 border-2 border-black rounded-full" />
                        </button>
                        <div className="w-12 h-12" /> {/* Spacer */}
                      </div>
                    </>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {capturedImage && !isCameraOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Camera className="w-5 h-5 text-indigo-400" />
                      Captured Bill
                    </h3>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10">
                      <img src={capturedImage} alt="Captured Bill" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={startCamera}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retake
                      </button>
                      <button 
                        onClick={analyzeScan}
                        disabled={isAnalyzingScan}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        {isAnalyzingScan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Maximize className="w-4 h-4" />}
                        Analyze Bill
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {isAnalyzingScan ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <h4 className="text-lg font-bold">Analyzing captured bill...</h4>
                        <p className="text-sm text-gray-500 mt-2">Extracting charges and detecting patterns.</p>
                      </div>
                    ) : scanResult ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Extracted Total</p>
                          <h4 className="text-3xl font-bold">{formatCurrency(scanResult.amount)}</h4>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Provider</p>
                              <p className="text-sm font-bold">{scanResult.provider}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Date</p>
                              <p className="text-sm font-bold">{scanResult.date}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Charges Breakdown</p>
                          {scanResult.breakdown.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                              <span className="text-sm text-gray-400">{item.label}</span>
                              <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AI Insights</p>
                          {scanResult.insights.map((insight: string, i: number) => (
                            <div key={i} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 flex gap-2">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                              {insight}
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">Savings Opportunity</span>
                          </div>
                          <p className="text-xs text-gray-300">{scanResult.savings}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-[32px]">
                        <Activity className="w-12 h-12 text-gray-700 mb-4" />
                        <h4 className="text-lg font-bold text-gray-500">Ready for Analysis</h4>
                        <p className="text-sm text-gray-600 mt-2">Click "Analyze Bill" to extract data from the captured image.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overview Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Monthly</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalBills)}</h3>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-500">
                <TrendingUp className="w-3 h-3" />
                +12.4% vs last month
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Highest Bill</p>
              <h3 className="text-2xl font-bold">{formatCurrency(highestBill)}</h3>
              <p className="text-[10px] text-gray-500 mt-2">GridPower Co.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Savings Potential</p>
              <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(potentialSavings)}</h3>
              <p className="text-[10px] text-gray-500 mt-2">3 opportunities found</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Overpayment</p>
              <h3 className={cn("text-2xl font-bold", overpaymentAlerts > 0 ? "text-rose-500" : "text-white")}>
                {overpaymentAlerts} Alerts
              </h3>
              <p className="text-[10px] text-gray-500 mt-2">Check issues panel</p>
            </div>
          </div>

          {/* Bill Analysis Table */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Bill Analysis
              </h3>
              <span className="text-xs text-gray-500">March 2024</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-4 font-bold">Provider</th>
                    <th className="px-8 py-4 font-bold">Amount</th>
                    <th className="px-8 py-4 font-bold">Change %</th>
                    <th className="px-8 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                            {getIcon(bill.type)}
                          </div>
                          <div>
                            <div className="font-bold">{bill.provider}</div>
                            <div className="text-xs text-gray-500">{bill.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold">{formatCurrency(bill.amount)}</td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-bold",
                          bill.change > 0 ? "text-rose-500" : bill.change < 0 ? "text-emerald-500" : "text-gray-500"
                        )}>
                          {bill.change > 0 ? '+' : ''}{bill.change}%
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                          bill.status === 'High' ? "bg-rose-500/20 text-rose-500" : 
                          bill.status === 'Suspicious' ? "bg-amber-500/20 text-amber-500" :
                          "bg-emerald-500/20 text-emerald-500"
                        )}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-500">
                        No bills analyzed yet. Fetch or upload a bill to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Trend Visualization */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Monthly Bill Trend
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorBill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorBill)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI & Optimization */}
        <div className="space-y-8">
          {/* AI Bill Insights */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                AI Insights
              </h3>
              <button 
                onClick={generateInsights}
                disabled={isGeneratingInsights}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed flex gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-indigo-400" />
                  </div>
                  {insight}
                </motion.div>
              ))}
              {insights.length === 0 && !isGeneratingInsights && (
                <button 
                  onClick={generateInsights}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Generate AI Insights
                </button>
              )}
            </div>
          </div>

          {/* Savings Optimization Panel */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Savings Optimization
              </h3>
              <button 
                onClick={findSavings}
                disabled={isFindingSavings}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {isFindingSavings ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4">
              {savings.map((s, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold">{s.label}</span>
                    <span className="text-xs font-bold text-emerald-400">Save {formatCurrency(s.monthly)}/mo</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                    <span>Yearly Impact</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(s.yearly)}</span>
                  </div>
                </motion.div>
              ))}
              {savings.length === 0 && !isFindingSavings && (
                <button 
                  onClick={findSavings}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Find Savings Opportunities
                </button>
              )}
            </div>
          </div>

          {/* Duplicate & Hidden Charges */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-rose-400" />
                Issues Detected
              </h3>
              <button 
                onClick={checkIssues}
                disabled={isCheckingIssues}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                {isCheckingIssues ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-4">
              {issues.map((issue) => (
                <motion.div 
                  key={issue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-bold text-rose-500">{issue.title}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{issue.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Loss Impact</span>
                    <span className="text-xs font-bold text-rose-500">{formatCurrency(issue.impact)}</span>
                  </div>
                </motion.div>
              ))}
              {issues.length === 0 && !isCheckingIssues && (
                <button 
                  onClick={checkIssues}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/10 transition-all"
                >
                  Check for Hidden Charges
                </button>
              )}
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-white/5 bg-indigo-600/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Bill Expert AI</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Always Active</p>
              </div>
            </div>
            <div className="h-[300px] overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleChat} className="p-6 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your bills..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
               toast.type === 'error' ? <X className="w-5 h-5" /> : 
               <Info className="w-5 h-5" />}
              <span className="font-bold text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
