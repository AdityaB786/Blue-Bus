const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'no_token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'invalid_user' });
    }

    req.user = user; // full user object with role
    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    return res.status(401).json({ success: false, error: 'auth_failed' });
  }
};
