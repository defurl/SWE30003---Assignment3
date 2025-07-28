const express = require("express");
const router = express.Router();
const {
  getFulfillmentQueue,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");
const { protect } = require("../middleware/authMiddleware");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden.` });
    }
    next();
  };
};

router.get(
  "/queue",
  protect,
  authorize("warehousePersonnel"),
  getFulfillmentQueue
);
router.put(
  "/:orderId/status",
  protect,
  authorize("warehousePersonnel"),
  updateDeliveryStatus
);

module.exports = router;
