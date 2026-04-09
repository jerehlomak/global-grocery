const fs = require('fs');
const html = fs.readFileSync('runtime-error.html', 'utf8');
const m = html.match(/"message":"(.*?)"/);
if (m) {
  console.log('Error Message:', m[1]);
} else {
  console.log('No specific error message found in the first match.');
  // Try to find the nextjs error toast header
  const m2 = html.match(/class="nextjs-toast-errors-header"[^>]*>(.*?)<\/div>/s);
  if (m2) console.log('Toast Header:', m2[1].replace(/<[^>]+>/g, ''));
}
