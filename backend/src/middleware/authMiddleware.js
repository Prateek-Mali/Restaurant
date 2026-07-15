const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
  }

  req.user = user;
  next();
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// Populates req.user when a valid token is present, but never rejects the
// request outright — lets a route decide its own authorization rules (used to
// let registerStaff bootstrap the very first admin on an empty database).
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Invalid/expired token on an optional-auth route — proceed unauthenticated.
  }

  next();
}

module.exports = { protect, restrictTo, optionalAuth };
