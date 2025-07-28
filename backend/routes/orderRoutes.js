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
  payForOrder,
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

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}

const upload = multer({ storage, fileFilter: checkFileType });

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
router.post('/:id/pay', protect, authorize('customer'), payForOrder);
router.get('/:id', protect, authorize('customer', 'pharmacist', 'cashier'), getOrderById);


// Pharmacist routes
router.get('/validation-queue', protect, authorize('pharmacist'), getValidationQueue);
router.put('/:id/validate', protect, authorize('pharmacist'), validateOrder);
router.get('/:id/prescriptions', protect, authorize('pharmacist'), getPrescriptionsForOrder);

// Cashier routes
router.get('/payment-queue', protect, authorize('cashier'), getPaymentQueue);
router.post('/:id/confirm-payment', protect, authorize('cashier'), confirmPayment);

module.exports = router;
