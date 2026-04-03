import React, { forwardRef } from 'react';
import { UserProfile, Transaction } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface Props {
  profile: UserProfile;
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  insights: string[];
}

const COLORS = ['#6366f1', '#a855f7', '#34d399', '#fb7185', '#f59e0b'];

export const MonthlyReport = forwardRef<HTMLDivElement, Props>(({ profile, transactions, formatCurrency, insights }, ref) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const categoryData = React.useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(tx => tx.amount < 0).forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const spendingTrend = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = transactions.filter(tx => 
        new Date(tx.timestamp).toISOString().split('T')[0] === date && tx.amount < 0
      );
      return {
        date: date.split('-').slice(1).join('/'),
        amount: Math.abs(dayTxs.reduce((acc, tx) => acc + tx.amount, 0))
      };
    });
  }, [transactions]);

  const totalIncome = React.useMemo(() => {
    return transactions.filter(tx => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-12 w-[800px] font-sans"
      style={{ position: 'absolute', left: '-9999px', top: 0 }}
    >
      {/* Header */}
      <div className="border-b-2 border-accent-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-accent-900 mb-2">Monthly Wealth Report</h1>
          <p className="text-[#4b5563] text-lg">Prepared for {profile.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-accent-600">{currentMonth}</p>
          <p className="text-nudge-secondary-text">Nudge Financial Intelligence</p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#1f2937] mb-4 border-b pb-2">Financial Summary</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Total Income</p>
            <p className="text-3xl font-bold text-[#059669]">{formatCurrency(totalIncome || profile.balance * 0.2)}</p>
          </div>
          <div className="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Monthly Spending</p>
            <p className="text-3xl font-bold text-[#e11d48]">{formatCurrency(profile.monthly_spending)}</p>
          </div>
          <div className="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Total Savings</p>
            <p className="text-3xl font-bold text-accent-600">{formatCurrency(profile.savings)}</p>
          </div>
          <div className="bg-[#f9fafb] p-6 rounded-xl border border-[#f3f4f6]">
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Vitality Score</p>
            <p className="text-3xl font-bold text-accent-600">{profile.vitality_score}/100</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Expense Breakdown</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4">Spending Trend (Last 7 Days)</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#1f2937] mb-4 border-b pb-2">AI Financial Insights</h2>
        <div className="bg-accent-50 rounded-xl p-6 border border-accent-100">
          <ul className="space-y-3">
            {insights.length > 0 ? insights.map((insight, idx) => (
              <li key={idx} className="flex gap-3 text-accent-900">
                <span className="text-accent-500 font-bold">•</span>
                {insight}
              </li>
            )) : (
              <li className="text-accent-900">No recent insights available. Keep using Nudge to generate personalized advice.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* Credit Card Usage */}
        <div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4 border-b pb-2">Credit Card Usage</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
              <div>
                <p className="font-bold text-[#1f2937]">Sapphire Reserve</p>
                <p className="text-xs text-nudge-secondary-text">Ending in 4092</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#e11d48]">{formatCurrency(1240.50)}</p>
                <p className="text-xs text-[#059669]">+3,420 pts</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
              <div>
                <p className="font-bold text-[#1f2937]">Amex Gold</p>
                <p className="text-xs text-nudge-secondary-text">Ending in 1005</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#e11d48]">{formatCurrency(850.20)}</p>
                <p className="text-xs text-[#059669]">+1,200 pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Analysis */}
        <div>
          <h2 className="text-xl font-bold text-[#1f2937] mb-4 border-b pb-2">Bill Analysis</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
              <div>
                <p className="font-bold text-[#1f2937]">Electricity</p>
                <p className="text-xs text-[#d97706]">15% higher than average</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1f2937]">{formatCurrency(145.00)}</p>
                <p className="text-xs text-nudge-secondary-text">Paid on 12th</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
              <div>
                <p className="font-bold text-[#1f2937]">Internet</p>
                <p className="text-xs text-[#059669]">Optimal plan</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1f2937]">{formatCurrency(79.99)}</p>
                <p className="text-xs text-nudge-secondary-text">Paid on 15th</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Overview */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-[#1f2937] mb-4 border-b pb-2">Investment Overview</h2>
        <div className="bg-[#f9fafb] rounded-xl p-6 border border-[#f3f4f6] flex items-center justify-between">
          <div>
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-accent-600">{formatCurrency(profile.balance * 0.6)}</p>
          </div>
          <div className="text-right">
            <p className="text-nudge-secondary-text text-sm uppercase tracking-wider font-semibold mb-1">Expected Annual Return</p>
            <p className="text-3xl font-bold text-[#059669]">+8.4%</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div>
        <h2 className="text-2xl font-bold text-[#1f2937] mb-4 border-b pb-2">Recent Transactions</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f3f4f6] text-[#4b5563] text-sm uppercase tracking-wider">
              <th className="p-3 rounded-tl-lg">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 8).map((tx, idx) => (
              <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
                <td className="p-3 text-[#4b5563] text-sm border-b border-[#f3f4f6]">{new Date(tx.timestamp).toLocaleDateString()}</td>
                <td className="p-3 font-medium text-[#1f2937] border-b border-[#f3f4f6]">{tx.name}</td>
                <td className="p-3 text-[#4b5563] text-sm border-b border-[#f3f4f6]">{tx.category}</td>
                <td className={`p-3 text-right font-bold border-b border-[#f3f4f6] ${tx.amount > 0 ? 'text-[#059669]' : 'text-[#1f2937]'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-[#e5e7eb] text-center text-nudge-secondary-text text-sm">
        <p>This report is generated automatically by Nudge AI. For any discrepancies, please check your live dashboard.</p>
        <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

MonthlyReport.displayName = 'MonthlyReport';
