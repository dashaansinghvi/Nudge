import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

function fixMistakeLocally(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Any class containing "text-nudge-primary" should be "text-nudge-primary-text" if it doesn't already have "-text"
  content = content.replace(/(?<!-)text-nudge-primary(?!\-text)\b/g, 'text-nudge-primary-text');
  content = content.replace(/(?<!-)text-nudge-secondary(?!\-text)\b/g, 'text-nudge-secondary-text');
  
  // Any class containing "border-nudge" should be "border-nudge-border"
  content = content.replace(/(?<!-)border-nudge(?!\-border|-inverse)\b/g, 'border-nudge-border');
  
  // Any "bg-nudge-inverse" should actually use the proper variable mapping, which we did.

  fs.writeFileSync(filePath, content, 'utf-8');
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixMistakeLocally(fullPath);
    }
  }
}

walk(componentsDir);
console.log('Fixed manual variables.');
