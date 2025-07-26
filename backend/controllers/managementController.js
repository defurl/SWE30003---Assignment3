// This controller handles logic for management-level endpoints like the dashboard.

const db = require('../config/db');

/**
 * @desc    Get dashboard data based on user role
 * @route   GET /api/management/dashboard
 * @access  Private
 */
const getDashboardData = async (req, res) => {
  const { role } = req.user; // Get the user's role from the authenticated token

  try {
    let quickStats = {};

    // Fetch different stats based on the user's role
    if (role === 'pharmacist') {
      const [result] = await db.query("SELECT COUNT(*) as count FROM prescription WHERE status = 'pending'");
      quickStats = { "Pending Prescriptions": result[0].count, "Today's Validations": 34 };
    } else if (role === 'branchManager') {
      const [result] = await db.query("SELECT SUM(total_amount) as total FROM `order` WHERE status = 'completed' AND DATE(order_date) = CURDATE()");
      quickStats = { "Today's Revenue": result[0].total || 0, "Low Stock Items": 8 };
    } 
    // Add more cases for cashier and warehousePersonnel as needed
    
    res.status(200).json({ quickStats });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data.' });
  }
};

module.exports = {
  getDashboardData,
};
