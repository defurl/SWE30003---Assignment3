const db = require("../config/db");

/**
 * @desc    Generate a sales report for the manager's branch
 * @route   POST /api/reports/sales
 * @access  Private (BranchManager)
 */
const generateSalesReport = async (req, res) => {
  const branchId = req.user.branchId;
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required." });
  }
  if (!branchId) {
    return res
      .status(403)
      .json({ message: "User is not assigned to a branch." });
  }

  try {
    // Query to get overall summary stats
    const [summary] = await db.query(
      `SELECT
                COUNT(DISTINCT o.order_id) as totalOrders,
                SUM(o.total_amount) as totalRevenue,
                AVG(o.total_amount) as averageOrderValue
             FROM \`order\` o
             WHERE o.branch_id = ?
               AND o.status = 'completed'
               AND o.order_date BETWEEN ? AND ?`,
      [branchId, startDate, `${endDate} 23:59:59`]
    );

    // Query to get sales breakdown by product
    const [productSales] = await db.query(
      `SELECT
                p.product_id,
                p.name,
                SUM(oi.quantity) as unitsSold,
                SUM(oi.quantity * oi.price_per_unit) as productRevenue
             FROM order_item oi
             JOIN \`order\` o ON oi.order_id = o.order_id
             JOIN product p ON oi.product_id = p.product_id
             WHERE o.branch_id = ?
               AND o.status = 'completed'
               AND o.order_date BETWEEN ? AND ?
             GROUP BY p.product_id, p.name
             ORDER BY productRevenue DESC`,
      [branchId, startDate, `${endDate} 23:59:59`]
    );

    res.status(200).json({
      summary: {
        totalOrders: summary[0].totalOrders || 0,
        totalRevenue: summary[0].totalRevenue || 0,
        averageOrderValue: summary[0].averageOrderValue || 0,
      },
      productSales: productSales,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ message: "Server error while generating report." });
  }
};

module.exports = {
  generateSalesReport,
};
