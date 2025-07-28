const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  placeInitialOrder,
  uploadPrescriptionForOrder,
  getValidationQueue,
  validateOrder,
  getPrescriptionsForOrder,
  getOrderById,
  initiatePayment,
  getPaymentQueue,
  confirmPayment,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `prescription-order-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// --- CORRECTED AND MORE ROBUST FILE FILTER ---
function checkFileType(file, cb) {
  // Check if the file object and its originalname property exist
  if (!file || !file.originalname || typeof file.originalname !== 'string') {
    // Reject the file if it's malformed
    return cb(new Error('Invalid file data received.'));
  }

  const filetypes = /jpeg|jpg|png/; // Removed PDF as per requirement
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype && filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Use a proper error object for rejection
    cb(new Error('Error: File upload only supports JPG and PNG formats.'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// Custom middleware for role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: This route is only for ${roles.join(' or ')}.` });
    }
    next();
  };
};

// --- Route Definitions ---

// Customer routes
router.post('/', protect, authorize('customer'), placeInitialOrder);
router.post('/:id/prescriptions', protect, authorize('customer'), upload.single('prescriptionFile'), uploadPrescriptionForOrder);
router.post('/:id/initiate-payment', protect, authorize('customer'), initiatePayment);

// Pharmacist routes
router.get('/validation-queue', protect, authorize('pharmacist'), getValidationQueue);
router.put('/:id/validate', protect, authorize('pharmacist'), validateOrder);
router.get('/:id/prescriptions', protect, authorize('pharmacist'), getPrescriptionsForOrder);

// Cashier routes  
router.get('/payment-queue', protect, authorize('cashier'), getPaymentQueue);
router.post('/:id/confirm-payment', protect, authorize('cashier'), confirmPayment);

// Generic route (MUST BE LAST due to :id parameter)
router.get('/:id', protect, authorize('customer', 'pharmacist', 'cashier'), getOrderById);

module.exports = router;
