const express = require("express");
const router = express.Router();
const { generateSalesReport } = require("../controllers/reportController");
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

module.exports = router;
