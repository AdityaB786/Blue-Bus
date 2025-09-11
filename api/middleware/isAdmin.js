// middleware/isAdmin.js
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'admin_only' });
  }
  next();
};
