// This file defines the API routes for management-level operations.

const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/managementController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/management/dashboard
// @desc    Get dashboard data for the logged-in staff member
// @access  Private
router.get('/dashboard', protect, getDashboardData); // Note: 'protect' middleware is used here

module.exports = router;
