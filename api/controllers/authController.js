const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// --- Signup ---
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'email_exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    let userRole = 'user';

    if (role === 'admin') {
      const adminExists = await User.findOne({ where: { role: 'admin' } });
      if (!adminExists) {
        userRole = 'admin';
      }
    }
    //create new user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: userRole,
    });

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[Signup Error]', err);
    return res.status(500).json({ success: false, error: 'signup_failed' });
  }
};

// --- Login ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user has an account
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'invalid_email' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: 'invalid_password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, error: 'login_failed' });
  }
};

// Returns logged in User data
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'user_not_found' });
    }

    return res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[Me Error]', err);
    return res.status(500).json({ success: false, error: 'failed_to_get_user' });
  }
};
