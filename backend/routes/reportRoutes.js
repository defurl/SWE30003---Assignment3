const express = require("express");
const router = express.Router();
const { generateSalesReport, generatePharmacistPerformanceReport, generateDeliveryReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

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

// @route   POST /api/reports/sales
// @desc    Generate a sales report
// @access  Private (BranchManager)
router.post("/sales", protect, authorize("branchManager"), generateSalesReport);

// @route  POST /api/reports/pharmacists
// @desc   Generate a pharmacist performance report
// @access Private (BranchManager)
router.post("/pharmacists", protect, authorize("branchManager"), generatePharmacistPerformanceReport);

// @route  POST /api/reports/delivery
// @desc   Generate a delivery report
// @access Private (BranchManager)
router.post("/delivery", protect, authorize("branchManager"), generateDeliveryReport);

module.exports = router;
