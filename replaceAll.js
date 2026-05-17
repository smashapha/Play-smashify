import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf-8');

  let modified = false;

  const replaceMap = {
    'CheckCircle2': 'CircleCheck',
    'text-smash-red': 'text-red-400',
    'bg-smash-red': 'bg-red-500',
    'border-smash-red': 'border-red-500',
    'shadow-smash-red': 'shadow-red-500',
    'from-smash-red': 'from-red-500',
    'to-smash-red': 'to-red-500'
  };

  for (const [key, value] of Object.entries(replaceMap)) {
    if (content.includes(key)) {
      content = content.split(key).join(value);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Replaced in ${filePath}`);
  }
}

walkDir('src', replaceInFile);
