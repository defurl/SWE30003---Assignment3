// This file defines the API routes for customer-specific operations.

const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `Forbidden: This route is only for ${roles.join(" or ")}.`,
        });
    }
    next();
  };
};

// @route   GET /api/notifications
// @desc    Get notifications for the currently logged-in user
// @access  Private
router.get('/', protect, authorize('customer', 'pharmacist', 'cashier', 'branchManager', 'warehousePersonnel'), getNotifications);

module.exports = router;
