// authRoutes.js
// author: Minh Hieu Tran
// This file defines the API routes for authentication operations.

const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Authenticate a user and return a JWT token
// @access  Public
router.post('/login', loginUser);

module.exports = router;
