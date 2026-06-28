import express from 'express';
import twilio from 'twilio';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Limit OTP traffic to curb abuse / Twilio cost (per IP).
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again later.',
    statusCode: 429
  }
});

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(String(phone || ''));

// Send OTP
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { phone } = req.body;

  if (!isValidPhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number.',
      errors: { phone: 'Provide a valid 10-digit Indian mobile number.' },
      statusCode: 400
    });
  }

  try {
    await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: `+91${phone}`, channel: 'sms' });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      data: { phone: `+91${phone}` },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP.',
      errors: { exception: error.message },
      statusCode: 500
    });
  }
});

// Verify OTP
router.post('/verify-otp', otpLimiter, async (req, res) => {
  const { phone, otp } = req.body;

  if (!isValidPhone(phone) || !/^\d{4,8}$/.test(String(otp || ''))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number or OTP format.',
      errors: { input: 'Check the phone number and OTP and try again.' },
      statusCode: 400
    });
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: `+91${phone}`, code: otp });

    if (verificationCheck.status === 'approved') {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
        data: { phone: `+91${phone}` },
        statusCode: 200
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP.',
        errors: { otp: 'The provided OTP is incorrect or expired.' },
        statusCode: 400
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP.',
      errors: { exception: error.message },
      statusCode: 500
    });
  }
});

export default router;
