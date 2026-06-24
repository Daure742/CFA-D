// config/sms.js - optional Twilio SMS sender (falls back to console.log)
const hasTwilio = !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_FROM;
let client = null;
if (hasTwilio) {
  const twilio = require('twilio');
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

async function sendSms(to, body) {
  if (client) {
    return client.messages.create({ body, from: process.env.TWILIO_FROM, to });
  }
  // fallback: log
  console.log('[SMS fallback] to:', to, 'body:', body);
  return Promise.resolve({ sid: 'fake-sid' });
}

module.exports = { sendSms, hasTwilio };
