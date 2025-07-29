const express = require("express");
const router = express.Router();
const {
    initiatePayment,
    getPaymentQueue,
    confirmPayment
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// Custom middleware for role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: This route is only for ${roles.join(' or ')}.` });
    }
    next();
  };
};

// @route   POST /api/payment/:id
// @desc    Initiates payment for an order
router.post('/:id', protect, authorize('customer'), initiatePayment);

// @route   GET /api/payment/queue
// @desc    Gets the payment queue for cashier
router.get('/queue', protect, authorize('cashier'), getPaymentQueue);

// @route   PUT /api/payment/:id
// @desc    Confirms payment for an order
router.put('/:id', protect, authorize('cashier'), confirmPayment);

module.exports = router;