// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');
const authenticateToken = require('../middleware/auth');

router.post('/signup', validateSignup, authCtrl.signup);
router.post('/login', validateLogin, authCtrl.login);
router.get('/me', authenticateToken, authCtrl.me);

module.exports = router;
