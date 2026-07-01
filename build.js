// Simple build script to copy static files to dist for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToCopy = [
  { src: 'pages', dest: 'pages' },
  { src: 'js', dest: 'js' },
  { src: 'css', dest: 'css' },
  { src: 'assets', dest: 'assets' },
  { src: 'api', dest: 'api' },
];

const filesToCopy = [
  'index.html',
  'package.json',
  'vercel.json',
  'sitemap.xml',
  'robots.txt',
  'metadata.json',
];

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist', { recursive: true });

// Copy directories
for (const dir of dirsToCopy) {
  const srcPath = path.join(__dirname, dir.src);
  const destPath = path.join(__dirname, 'dist', dir.dest);
  if (fs.existsSync(srcPath)) {
    copyRecursive(srcPath, destPath);
    console.log('Copied:', dir.src, '->', 'dist/' + dir.dest);
  }
}

// Copy root files
for (const file of filesToCopy) {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(__dirname, 'dist', file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log('Copied:', file);
  }
}

// Create empty.js stub for Vite compatibility
const emptyJsPath = path.join(__dirname, 'dist', 'js', 'empty.js');
if (!fs.existsSync(emptyJsPath)) {
  fs.writeFileSync(emptyJsPath, '// Empty module for server-only dependencies\n');
}

console.log('\nBuild complete. Files ready in dist/');