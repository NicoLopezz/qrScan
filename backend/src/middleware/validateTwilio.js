import twilio from 'twilio';

export function validateTwilioRequest(req, res, next) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return next(); // Skip if Twilio not configured

  const signature = req.headers['x-twilio-signature'];
  if (!signature) return res.sendStatus(403);

  const url = `${process.env.BASE_URL || 'https://pickup-time-backend.onrender.com'}${req.originalUrl}`;
  const isValid = twilio.validateRequest(authToken, signature, url, req.body || {});

  if (!isValid) return res.sendStatus(403);
  next();
}
