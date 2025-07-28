const express = require("express");
const router = express.Router();
const {
<<<<<<< Updated upstream
  getInventoryByBranch,
  updateStock,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

// Custom middleware for role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: `Forbidden: This route is only for ${roles.join(" or ")}.`,
        });
=======
  receiveStock,
  getBranchInventory,
  updateStockQuantity,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This route is only for ${roles.join(" or ")}.`,
      });
>>>>>>> Stashed changes
    }
    next();
  };
};

<<<<<<< Updated upstream
// @route   GET /api/inventory/:branchId
// @desc    Get all inventory for a specific branch
// @access  Private (Warehouse Personnel, Branch Manager)
router.get(
  "/:branchId",
  protect,
  authorize("warehousePersonnel", "branchManager"),
  getInventoryByBranch
);

// @route   PUT /api/inventory
// @desc    Update stock quantity for a product at a branch
// @access  Private (Warehouse Personnel, Branch Manager)
router.put(
  "/",
  protect,
  authorize("warehousePersonnel", "branchManager"),
  updateStock
);
=======
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
>>>>>>> Stashed changes

module.exports = router;
