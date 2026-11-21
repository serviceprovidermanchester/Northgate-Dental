/**
 * Middleware: JWT Authentication
 * SPManchester Private Limited
 */

'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'northgate-dental-jwt-secret-change-in-production';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token is invalid or expired.' });
  }
}

function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.admin.role !== 'super') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Super admin access required.' });
    }
    next();
  });
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

module.exports = { requireAuth, requireSuperAdmin, signToken };
