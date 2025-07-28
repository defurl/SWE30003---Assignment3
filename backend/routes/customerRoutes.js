// This file defines the API routes for customer-specific operations.

const express = require('express');
const router = express.Router();
const { getCustomerProfile } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/customers/profile
// @desc    Get the profile of the currently logged-in customer
// @access  Private
router.get('/profile', protect, getCustomerProfile);

module.exports = router;
