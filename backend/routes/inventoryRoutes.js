const express = require("express");
const router = express.Router();
const {
  receiveStock,
  getBranchInventory,
  updateStockQuantity,
  checkStock,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This route is only for ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

// @route   GET /api/inventory
// @desc    Get all stock for the user's branch
// @access  Private (WarehousePersonnel)
router.get("/", protect, authorize("warehousePersonnel"), getBranchInventory);

// @route   PUT /api/inventory/update
// @desc    Manually correct the quantity of a product
// @access  Private (WarehousePersonnel)
router.put(
  "/update",
  protect,
  authorize("warehousePersonnel"),
  updateStockQuantity
);

// @route   POST /api/inventory/receive
// @desc    Update stock levels from a new shipment
// @access  Private (WarehousePersonnel)
router.post("/receive", protect, authorize("warehousePersonnel"), receiveStock);

// @route   GET /api/inventory/check/:branchId/:productId
// @desc    Check stock for a single item at a branch
// @access  Public
router.get("/check/:branchId/:productId", checkStock);  

module.exports = router;
