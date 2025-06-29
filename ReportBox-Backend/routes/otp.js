import express from 'express';
import twilio from 'twilio';

const router = express.Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSid, authToken);

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

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
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

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
