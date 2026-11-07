// Serverless Function handler for Vercel / Netlify / Node.js
// Handles POST /api/contact for Harshith's Portfolio

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Malformed JSON payload.' });
      }
    }

    const { name, email, message, _gotcha } = body || {};

    // 1. Silent Honeypot Protection (Bots fill hidden fields, humans never do)
    if (_gotcha && String(_gotcha).trim().length > 0) {
      // Silently accept without sending email
      return res.status(200).json({ success: true, message: 'Message received.' });
    }

    // 2. Server side validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedMsg = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name (under 100 characters).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 120) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (!trimmedMsg || trimmedMsg.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message of at least 10 characters.'
      });
    }

    if (trimmedMsg.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (maximum 5000 characters).'
      });
    }

    // 3. Check Resend API Key configuration
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.includes('your_api_key') || apiKey.trim() === '') {
      return res.status(503).json({
        success: false,
        missingConfig: true,
        error: 'Resend API key is not configured. Add RESEND_API_KEY to your environment variables or .env file to enable live email delivery to sharshith346@gmail.com.'
      });
    }

    // 4. Send email via Resend API
    const destinationEmail = process.env.CONTACT_EMAIL || 'sharshith346@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

    const escapeHtml = (str) =>
      str.replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');

    const resendResponse = await fetch('https://api.resend.com/emails', {
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

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return res.status(resendResponse.status).json({
        success: false,
        error: resendData.message || 'Resend API rejected the delivery request. Please check sender domain or contact sharshith346@gmail.com directly.'
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      message: 'Note delivered successfully to Harshith.'
    });

  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while transmitting your note. Please try again or email sharshith346@gmail.com.'
    });
  }
}
