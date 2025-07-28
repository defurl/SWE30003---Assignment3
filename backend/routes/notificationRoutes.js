// This file defines the API routes for customer-specific operations.

const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get notifications for the currently logged-in user
// @access  Private
router.get('/', protect, getNotifications);

module.exports = router;
