import fs from 'fs';
import path from 'path';

const componentsDir = path.join(process.cwd(), 'src', 'components');

function tweakOpacities(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Convert transparent black text/borders to standard theme variables for better contrast in Light Mode
  content = content.replace(/text-nudge-primary-text\/10\b/g, 'text-nudge-secondary-text');
  content = content.replace(/text-nudge-primary-text\/30\b/g, 'text-nudge-secondary-text');
  content = content.replace(/text-nudge-primary-text\/40\b/g, 'text-nudge-secondary-text');
  content = content.replace(/text-nudge-primary-text\/50\b/g, 'text-nudge-secondary-text');
  content = content.replace(/text-nudge-primary-text\/60\b/g, 'text-nudge-secondary-text');
  content = content.replace(/text-nudge-primary-text\/70\b/g, 'text-nudge-primary-text');
  content = content.replace(/text-nudge-primary-text\/80\b/g, 'text-nudge-primary-text');
  
  content = content.replace(/bg-nudge-inverse\/4\b/g, 'bg-nudge-inverse/10');
  content = content.replace(/bg-nudge-inverse\/5\b/g, 'bg-nudge-inverse/10');
  
  // Also any border that was too faint
  content = content.replace(/border-nudge-inverse\/6\b/g, 'border-nudge-border');
  content = content.replace(/border-nudge-inverse\/10\b/g, 'border-nudge-border');

  // text-nudge-secondary-text/x
  content = content.replace(/text-nudge-secondary-text\/\d+\b/g, 'text-nudge-secondary-text');

  fs.writeFileSync(filePath, content, 'utf-8');
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      tweakOpacities(fullPath);
    }
  }
}

walk(componentsDir);
console.log('Done tweaking opacities.');
