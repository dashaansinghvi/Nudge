import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip LandingPage.tsx because we've already done semantic refactoring on it.
  if (filePath.includes('LandingPage.tsx')) return;

  const replacements = [
    { from: /(?<!-)text-white\b/g, to: 'text-nudge-primary-text' },
    { from: /(?<!-)text-white\/(\d+)\b/g, to: 'text-nudge-primary-text/$1' },
    { from: /(?<!-)bg-white\/(\d+)\b/g, to: 'bg-nudge-inverse/$1' },
    { from: /(?<!-)border-white\/(\d+)\b/g, to: 'border-nudge-border' },
    { from: /(?<!-)text-gray-300\b/g, to: 'text-nudge-secondary-text' },
    { from: /(?<!-)text-gray-400\b/g, to: 'text-nudge-secondary-text' },
    { from: /(?<!-)text-gray-500\b/g, to: 'text-nudge-secondary-text' },
    { from: /(?<!-)bg-\[#111\]\b/g, to: 'bg-nudge-secondary' },
    { from: /(?<!-)bg-black\/(\d+)\b/g, to: 'bg-nudge-inverse/$1' },
    { from: /(?<!-)bg-\[#0a0a0a\]\b/g, to: 'bg-nudge-primary' },
    { from: /(?<!-)bg-\[#09090b\]\b/g, to: 'bg-nudge-primary' },
    { from: /(?<!-)border-white\/5\b/g, to: 'border-nudge-border' },
    { from: /(?<!-)border-white\/10\b/g, to: 'border-nudge-border' },
  ];

  content = content.replace(/(class(?:Name)?=["'][^"']*\b(?:bg-action|bg-accent-\d+|bg-rose-\d+|bg-blue-\d+|bg-purple-\d+)\b[^"']*)\btext-white\b/g, '$1__SW__');
  content = content.replace(/(class(?:Name)?=["'][^"']*\b(?:bg-action|bg-accent-\d+|bg-rose-\d+|bg-blue-\d+|bg-purple-\d+)\b[^"']*)\btext-white\/(\d+)\b/g, '$1__SW__/$2');
  content = content.replace(/\btext-white\b([^"']*\b(?:bg-action|bg-accent-\d+|bg-rose-\d+|bg-blue-\d+|bg-purple-\d+)\b)/g, '__SW__$1');

  for (const rule of replacements) {
    content = content.replace(rule.from, rule.to);
  }

  content = content.replace(/__SW__/g, 'text-white');
  fs.writeFileSync(filePath, content, 'utf-8');
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walk(componentsDir);
console.log('Done refactoring theme utility classes properly.');
