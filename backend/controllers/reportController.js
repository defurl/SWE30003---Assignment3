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

/**
 * @desc    Generate a performance report for pharmacists
 * @route   POST /api/reports/pharmacists
 * @access  Private (BranchManager)
 * This report shows the number of prescriptions processed by each pharmacist.
 */

const generatePharmacistPerformanceReport = async (req, res) => {
  const branchId = req.user.branchId;
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Start date and end date are required.",
    });
  }

  if (!branchId) {
    return res
      .status(403)
      .json({ message: "User is not assigned to a branch." });
  }

  try {
    const [report] = await db.query(
      `SELECT
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) AS pharmacistName,
        COUNT(p.prescription_id) AS prescriptionsProcessed
      FROM staff s
      LEFT JOIN prescription p ON s.staff_id = p.pharmacist_id
      WHERE s.branch_id = ?
        AND s.role = 'pharmacist'
        AND p.validated_at BETWEEN ? AND ?
      GROUP BY s.staff_id, pharmacistName
      ORDER BY prescriptionsProcessed DESC`,
      [branchId, startDate, `${endDate} 23:59:59`]
    );

    // Summary (total prescriptions processed, no of approved prescriptions, declined prescriptions and average per pharmacist)
    const totalPrescriptions = report.reduce((sum, row) => sum + row.prescriptionsProcessed, 0);
    const approvedPrescriptions = report.filter(row => row.prescriptionsProcessed > 0).length;
    const declinedPrescriptions = report.filter(row => row.prescriptionsProcessed === 0).length;
    const averagePerPharmacist = totalPrescriptions / (report.length || 1);

    const summary = {
      totalPrescriptions,
      approvedPrescriptions,
      declinedPrescriptions,
      averagePerPharmacist,
    };

    res.status(200).json({ report, summary });
  } catch (error) {
    console.error("Error generating pharmacist performance report:", error);
    res.status(500).json({ message: "Server error while generating report." });
  }
};

/**
 * @desc    Generate a delivery report
 * @route   POST /api/reports/delivery
 * @access  Private (BranchManager)
 * This report shows the number of deliveries in a given period with different status:
 * - Pending
 * - Out for delivery
 * - Delivered
 * - Picked up
 * Also we display a summary with number of deliveries:
 * - Total deliveries
 * - Number of deliveries by delivery_method (home_delivery, pickup)
 */

const generateDeliveryReport = async (req, res) => {
  const branchId = req.user.branchId;
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Start date and end date are required.",
    });
  }

  if (!branchId) {
    return res
      .status(403)
      .json({ message: "User is not assigned to a branch." });
  }

  try {
    // Query to get delivery status counts
    const [statusCounts] = await db.query(
      `SELECT
        d.status,
        COUNT(*) AS count
      FROM delivery d
      JOIN \`order\` o ON d.order_id = o.order_id
      WHERE o.branch_id = ?
      AND d.created_at BETWEEN ? AND ?
      GROUP BY d.status`,
      [branchId, startDate, `${endDate} 23:59:59`]
    );

    // Query to get delivery method counts
    const [methodCounts] = await db.query(
      `SELECT
        d.delivery_method,
        COUNT(*) AS count
      FROM delivery d
      JOIN \`order\` o ON d.order_id = o.order_id
      WHERE o.branch_id = ?
      AND d.created_at BETWEEN ? AND ?
      GROUP BY d.delivery_method`,
      [branchId, startDate, `${endDate} 23:59:59`]
    );

    // Combine results into a single report object
    const report = {
      statusCounts: statusCounts.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      methodCounts: methodCounts.reduce((acc, row) => {
        acc[row.delivery_method] = row.count;
        return acc;
      }, {}),
      totalDeliveries: statusCounts.reduce((sum, row) => sum + row.count, 0),
      branchId,
      startDate,
      endDate,
    };

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating delivery report:", error);
    res.status(500).json({ message: "Server error while generating report." });
  }
};

module.exports = {
  generateSalesReport,
  generatePharmacistPerformanceReport,
  generateDeliveryReport,
};
