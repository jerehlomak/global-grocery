const fs = require('fs');
const path = require('path');

function stripBOM(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      stripBOM(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.startsWith('\uFEFF')) {
        console.log('Stripping BOM from:', fullPath);
        content = content.replace('\uFEFF', '');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  });
}

console.log('Starting BOM strip...');
stripBOM('app/api');
stripBOM('lib/salesforce');
console.log('Done.');
