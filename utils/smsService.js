const https = require('https');
const http  = require('http');

/**
 * Send SMS via Fast2SMS
 */
const sendViaFast2SMS = (phone, message) => {
  return new Promise((resolve) => {
    const apiKey   = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID || 'SCHOOL';

    if (!apiKey) {
      console.warn('⚠️  Fast2SMS API key not configured. SMS skipped.');
      return resolve({ success: false, error: 'API key not configured' });
    }

    const payload = JSON.stringify({
      route:      'q',         // Quick transactional route
      numbers:    phone,
      message,
      flash:      0,
    });

    const options = {
      hostname: 'www.fast2sms.com',
      path:     '/dev/bulkV2',
      method:   'POST',
      headers:  {
        'authorization': apiKey,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            resolve({ success: true, messageId: parsed.request_id });
          } else {
            resolve({ success: false, error: parsed.message || 'SMS failed' });
          }
        } catch {
          resolve({ success: false, error: 'Invalid response from Fast2SMS' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.write(payload);
    req.end();
  });
};

/**
 * Send SMS via Textlocal
 */
const sendViaTextlocal = (phone, message) => {
  return new Promise((resolve) => {
    const apiKey = process.env.TEXTLOCAL_API_KEY;
    const sender = process.env.TEXTLOCAL_SENDER || 'SCHOOL';

    if (!apiKey) {
      console.warn('⚠️  Textlocal API key not configured. SMS skipped.');
      return resolve({ success: false, error: 'API key not configured' });
    }

    // Prepend country code if not present
    const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`;

    const postData = new URLSearchParams({
      apikey:  apiKey,
      numbers: formattedPhone,
      message,
      sender,
    }).toString();

    const options = {
      hostname: 'api.textlocal.in',
      path:     '/send/',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'success') {
            resolve({ success: true, messageId: parsed.messages?.[0]?.id });
          } else {
            resolve({ success: false, error: parsed.errors?.[0]?.message || 'SMS failed' });
          }
        } catch {
          resolve({ success: false, error: 'Invalid response from Textlocal' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.write(postData);
    req.end();
  });
};

/**
 * Main sendSMS function — picks provider from .env
 */
const sendSMS = async (phone, message) => {
  // In development, just log and return success
  if (process.env.NODE_ENV === 'development' && !process.env.FAST2SMS_API_KEY && !process.env.TEXTLOCAL_API_KEY) {
    console.log(`📱 [DEV SMS] To: ${phone} | Message: ${message}`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  const provider = process.env.SMS_PROVIDER || 'fast2sms';

  if (provider === 'textlocal') {
    return sendViaTextlocal(phone, message);
  }

  return sendViaFast2SMS(phone, message);
};

/**
 * Send bulk SMS to multiple numbers
 */
const sendBulkSMS = async (phones, message) => {
  const results = await Promise.allSettled(
    phones.map(phone => sendSMS(phone, message))
  );

  const sent   = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;

  return { sent, failed, total: phones.length };
};

module.exports = { sendSMS, sendBulkSMS };
