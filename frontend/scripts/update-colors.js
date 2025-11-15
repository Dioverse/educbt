import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const colorReplacements = {
  // Background colors
  'bg-blue-50': 'bg-primary-50',
  'bg-blue-100': 'bg-primary-100',
  'bg-blue-500': 'bg-primary-500',
  'bg-blue-600': 'bg-primary-600',
  'bg-blue-700': 'bg-primary-700',
  'bg-blue-800': 'bg-primary-800',
  
  // Text colors
  'text-blue-50': 'text-primary-50',
  'text-blue-100': 'text-primary-100',
  'text-blue-600': 'text-primary-600',
  'text-blue-700': 'text-primary-700',
  'text-blue-800': 'text-primary-800',
  'text-blue-900': 'text-primary-900',
  
  // Border colors
  'border-blue-200': 'border-primary-200',
  'border-blue-300': 'border-primary-300',
  'border-blue-500': 'border-primary-500',
  'border-blue-600': 'border-primary-600',
  
  // Hover states
  'hover:bg-blue-50': 'hover:bg-primary-50',
  'hover:bg-blue-700': 'hover:bg-primary-700',
  'hover:text-blue-600': 'hover:text-primary-600',
  
  // Focus states
  'focus:ring-blue-500': 'focus:ring-primary-500',
  'focus:border-blue-500': 'focus:border-primary-500',
  
  // From/to gradient colors
  'from-blue-500': 'from-primary-600',
  'to-purple-600': 'to-primary-800',
  'from-blue-600': 'from-primary-600',
};

function updateFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let updated = false;
  
  Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
    if (content.includes(oldColor)) {
      content = content.replace(new RegExp(oldColor, 'g'), newColor);
      updated = true;
    }
  });
  
  if (updated) {
    writeFileSync(filePath, content);
    console.log(`✓ Updated: ${filePath}`);
  }
}

function walkDirectory(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      updateFile(filePath);
    }
  });
}

// Start from src directory
walkDirectory('./src');
console.log('\n✅ Color update complete!');