// This controller handles logic for customer-specific, authenticated endpoints.

const db = require('../config/db');

/**
 * @desc    Get profile data for the logged-in customer
 * @route   GET /api/customers/profile
 * @access  Private (Customer only)
 */
const getCustomerProfile = async (req, res) => {
  // The user's ID and role are attached to the request object by the authMiddleware
  const customerId = req.user.id;
  const userRole = req.user.role;

  // Security check: Ensure the user making the request is a customer
  if (userRole !== 'customer') {
    return res.status(403).json({ message: 'Forbidden: Access is restricted to customers.' });
  }

  try {
    // Fetch personal details from the customer table
    const [detailsResult] = await db.query('SELECT customer_id, first_name, last_name, email, phone_number, address FROM customer WHERE customer_id = ?', [customerId]);
    
    if (detailsResult.length === 0) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Fetch order history from the order table
    const [ordersResult] = await db.query("SELECT order_id, order_date, total_amount, status FROM `order` WHERE customer_id = ? ORDER BY order_date DESC", [customerId]);

    // Fetch prescription history from the prescription table
    const [prescriptionsResult] = await db.query("SELECT prescription_id, image_url, status, uploaded_at FROM prescription WHERE customer_id = ? ORDER BY uploaded_at DESC", [customerId]);

    // Combine all fetched data into a single profile object
    const profileData = {
      details: detailsResult[0],
      orderHistory: ordersResult,
      prescriptions: prescriptionsResult,
    };

    res.status(200).json(profileData);

  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile data.' });
  }
};

module.exports = {
  getCustomerProfile,
};
