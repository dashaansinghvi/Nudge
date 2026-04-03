import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src', 'components', 'MonthlyReport.tsx');
let content = fs.readFileSync(file, 'utf-8');

const map = {
  'bg-gray-50': 'bg-[#f9fafb]',
  'bg-gray-100': 'bg-[#f3f4f6]',
  'border-gray-100': 'border-[#f3f4f6]',
  'border-gray-200': 'border-[#e5e7eb]',
  'text-gray-600': 'text-[#4b5563]',
  'text-gray-800': 'text-[#1f2937]',
  'text-emerald-600': 'text-[#059669]',
  'text-rose-600': 'text-[#e11d48]',
  'text-amber-600': 'text-[#d97706]',
};

for (const [k, v] of Object.entries(map)) {
  content = content.replace(new RegExp(`\\b${k}\\b`, 'g'), v);
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed oklch dependencies in PDF report generator.');
