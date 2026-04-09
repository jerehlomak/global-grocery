const https = require('https');
const params = new URLSearchParams({
  grant_type: 'password',
  client_id: process.env.SF_CLIENT_ID,
  client_secret: process.env.SF_CLIENT_SECRET,
  username: process.env.SF_USERNAME,
  password: process.env.SF_PASSWORD
}).toString();
const req = https.request({ hostname: 'wise-wolf-3sucf2-dev-ed.trailblaze.my.salesforce.com', path: '/services/oauth2/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(params) } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Password Flow Response:', d));
});
req.on('error', e => console.error('Error:', e.message));
req.write(params);
req.end();
