import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Admin login — verifies the password against ADMIN_PASSWORD (server-side env)
// and returns a short-lived JWT. The password is never shipped to the client.
router.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Admin auth is not configured on the server.',
      errors: { config: 'ADMIN_PASSWORD or JWT_SECRET is missing.' },
      statusCode: 500
    });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin password.',
      errors: { password: 'The provided password is incorrect.' },
      statusCode: 401
    });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });

  res.status(200).json({
    success: true,
    message: 'Admin authenticated successfully.',
    data: { token },
    statusCode: 200
  });
});

export default router;
