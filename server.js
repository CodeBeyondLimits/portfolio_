// Lightweight local dev server with API routes for Harshith's Portfolio
// Pure Node.js standard library (ES Module)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Simple zero-dependency .env loader
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
      console.log('📄 Loaded environment variables from .env');
    } catch (err) {
      console.warn('⚠️ Could not parse .env file:', err.message);
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function handleContactApi(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  let bodyData = '';
  req.on('data', chunk => {
    bodyData += chunk;
    // Guard against excessively large requests (1MB max)
    if (bodyData.length > 1e6) {
      req.destroy();
    }
  });

  req.on('end', async () => {
    let parsed = {};
    try {
      parsed = JSON.parse(bodyData || '{}');
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
      return;
    }

    const { name, email, message, _gotcha } = parsed;

    // 1. Silent Honeypot Protection for Spam Bots
    if (_gotcha && String(_gotcha).trim().length > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: 'Message received.' }));
      return;
    }

    // 2. Server validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedMsg = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length > 100) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Please provide your name (under 100 characters).' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 120) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Please provide a valid email address.' }));
      return;
    }

    if (!trimmedMsg || trimmedMsg.length < 10) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Please provide a message of at least 10 characters.' }));
      return;
    }

    if (trimmedMsg.length > 5000) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Message is too long (maximum 5000 characters).' }));
      return;
    }

    // 3. Verify Resend API Key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.includes('your_api_key') || apiKey.trim() === '') {
      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: false,
        missingConfig: true,
        error: 'Resend API key is not configured. Add RESEND_API_KEY in your .env file to enable live email delivery to sharshith346@gmail.com.'
      }));
      return;
    }

    // 4. Send via Resend API using standard global fetch
    try {
      const destinationEmail = process.env.CONTACT_EMAIL || 'sharshith346@gmail.com';
      const fromEmail = process.env.FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [destinationEmail],
          reply_to: trimmedEmail,
          subject: `Portfolio Message from ${trimmedName}`,
          text: `Sender Name: ${trimmedName}\nSender Email: ${trimmedEmail}\n\nMessage:\n${trimmedMsg}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="border-bottom: 2px solid #DA7B93; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #2F4454; margin: 0; font-size: 20px;">New Message from Portfolio Visitor</h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Received via harshith-portfolio contact form</p>
              </div>
              <div style="margin-bottom: 16px;">
                <strong style="color: #475569; font-size: 13px; text-transform: uppercase;">From:</strong>
                <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${escapeHtml(trimmedName)}</div>
                <div style="font-size: 14px; color: #3b82f6;"><a href="mailto:${escapeHtml(trimmedEmail)}" style="color: #3b82f6; text-decoration: none;">${escapeHtml(trimmedEmail)}</a></div>
              </div>
              <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-left: 4px solid #DA7B93; border-radius: 6px;">
                <strong style="color: #475569; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 8px;">Message:</strong>
                <div style="white-space: pre-wrap; font-size: 15px; color: #334155;">${escapeHtml(trimmedMsg)}</div>
              </div>
              <div style="margin-top: 28px; padding-top: 14px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
                Harshith Digital Identity • Personal Interactive Portfolio
              </div>
            </div>
          `
        })
      });

      const resendData = await resendRes.json().catch(() => ({}));

      if (!resendRes.ok) {
        console.error('Resend delivery error:', resendData);
        res.writeHead(resendRes.status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: resendData.message || 'Resend rejected the transmission request. Please reach out to sharshith346@gmail.com directly.'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        id: resendData.id,
        message: 'Note delivered successfully to Harshith.'
      }));

    } catch (err) {
      console.error('Fetch error transmitting email:', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: false,
        error: 'Network error communicating with the email provider. Please contact sharshith346@gmail.com directly.'
      }));
    }
  });
}

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];

  // API endpoint routing
  if (cleanUrl === '/api/contact' || cleanUrl === '/api/contact/') {
    handleContactApi(req, res);
    return;
  }

  if (cleanUrl === '/') cleanUrl = '/index.html';

  const filePath = path.join(PUBLIC_DIR, cleanUrl);

  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve custom 404
      const notFoundPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(notFoundPath, (err404, data) => {
        if (!err404) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Harshith's Engineering Portfolio is running live!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`✉️ Contact Endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`======================================================\n`);
});
