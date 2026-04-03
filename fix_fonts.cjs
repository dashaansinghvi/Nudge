const fs = require('fs');
const path = require('path');

const files = [
  'BillOptimizer.tsx',
  'TaxAssistant.tsx',
  'InvestmentIntel.tsx',
  'CreditIntel.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'components', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix main header
  content = content.replace(/text-xl font-bold tracking-tight/g, 'text-2xl font-bold tracking-tight');
  content = content.replace(/w-5 h-5 text-accent-500/g, 'w-6 h-6 text-accent-500');

  // Fix small texts
  content = content.replace(/text-\[9px\]/g, 'text-[10px]');
  content = content.replace(/text-\[11px\]/g, 'text-xs');
  content = content.replace(/text-xs font-bold/g, 'text-sm font-bold');
  
  // Undo double replacements if any
  content = content.replace(/text-sm font-bold/g, 'text-sm font-bold'); 

  // Icon sizes
  content = content.replace(/w-3\.5 h-3\.5/g, 'w-4 h-4');
  content = content.replace(/w-2\.5 h-2\.5/g, 'w-3 h-3');

  // Specific font-size bumps for headers of panels
  content = content.replace(/text-lg font-bold/g, 'text-xl font-bold');

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
