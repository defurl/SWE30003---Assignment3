const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  placeInitialOrder,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `prescription-order-${req.params.id}-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

function checkFileType(file, cb) {
  if (!file || !file.originalname || typeof file.originalname !== "string") {
    return cb(new Error("Invalid file data received."));
  }
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype && filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: File upload only supports JPG and PNG formats."));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

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

router.post("/", protect, authorize("customer"), placeInitialOrder);
// router.post(
//   "/:id/prescriptions",
//   protect,
//   authorize("customer"),
//   upload.single("prescriptionFile"),
//   uploadPrescriptionForOrder
// );
// router.post(
//   "/:id/initiate-payment",
//   protect,
//   authorize("customer"),
//   initiatePayment
// );

// router.get(
//   "/validation-queue",
//   protect,
//   authorize("pharmacist"),
//   getValidationQueue
// );
// router.put("/:id/validate", protect, authorize("pharmacist"), validateOrder);
// router.get(
//   "/:id/prescriptions",
//   protect,
//   authorize("pharmacist"),
//   getPrescriptionsForOrder
// );

// router.get("/payment-queue", protect, authorize("cashier"), getPaymentQueue);
// router.post(
//   "/:id/confirm-payment",
//   protect,
//   authorize("cashier"),
//   confirmPayment
// );

router.get(
  "/:id",
  protect,
  authorize("customer", "pharmacist", "cashier", "warehousePersonnel"),
  getOrderById
);

module.exports = router;
