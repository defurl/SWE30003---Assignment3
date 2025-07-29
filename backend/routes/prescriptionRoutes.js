const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadPrescription,
  getPendingPrescriptions,
  validatePrescription,
  getPrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename(req, file, cb) {
    cb(null, `prescription-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
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

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
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

// @route   POST /api/prescriptions/:id
// @desc    Customer uploads a prescription for an order
router.post('/:id', protect, authorize('customer'), upload.single('prescriptionFile'), uploadPrescription);

// @route   GET /api/prescriptions/details/:id
// @desc    Pharmacist gets a specific prescription by ID
router.get('/details/:id', protect, authorize('pharmacist'), getPrescription);

// @route   GET /api/prescriptions/pending
// @desc    Pharmacist gets pending prescriptions
router.get('/pending', protect, authorize('pharmacist'), getPendingPrescriptions);

// @route   PUT /api/prescriptions/:id/validate
// @desc    Pharmacist validates a prescription
router.put('/:id/validate', protect, authorize('pharmacist'), validatePrescription);

module.exports = router;
