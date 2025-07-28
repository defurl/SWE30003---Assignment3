// This controller handles logic for notification endpoints.


const db = require('../config/db');

/**
 * @desc    Get list of notifications for the logged-in user
 * @route   GET /api/notifications
 * @access  Private (Customer/ Staff)
 */
const getNotifications = async (req, res) => {
  // The user's ID and role are attached to the request object by the authMiddleware
  const userId = req.user.id;

  console.log(`Fetching notifications for user ID: ${userId}`);

  try {
    // Fetch notifications for the user
    const [notificationsResult] = await db.query('SELECT notification_id, order_id, message, status, created_at, sent_at FROM notifications WHERE customer_id = ? OR staff_id = ?', [userId]);

    if (notificationsResult.length === 0) {
      return res.status(404).json({ message: 'No notifications found.' });
    }

    // Combine all fetched data into a single profile object
    const profileData = {
      notifications: notificationsResult,
    };

    res.status(200).json(profileData);

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};

module.exports = {
  getNotifications,
};
