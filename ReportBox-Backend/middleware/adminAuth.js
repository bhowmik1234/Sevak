import jwt from 'jsonwebtoken';

// Verifies a Bearer JWT issued by /api/admin/login and checks the admin role.
const adminAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.',
      errors: { auth: 'Missing bearer token.' },
      statusCode: 401
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      throw new Error('Not an admin token');
    }
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token.',
      errors: { auth: err.message },
      statusCode: 401
    });
  }
};

export default adminAuth;
