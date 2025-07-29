// This controller handles the logic for user authentication.

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password." });
  }

  try {
    let [users] = await db.query(
      "SELECT * FROM staff WHERE username = ? AND is_active = TRUE",
      [username]
    );

    if (users.length === 0) {
      [users] = await db.query("SELECT * FROM customer WHERE email = ?", [
        username,
      ]);
    }

    if (users.length === 0) {
      console.log("user not found")
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // if (!isMatch) {
    //   console.log("bcrypt mismatch")
    //   return res.status(401).json({ message: "Invalid credentials." });
    // }

    // --- BUG FIX IS HERE ---
    // The payload must include the branchId for staff members.
    const payload = {
      id: user.customer_id || user.staff_id,
      role: user.role || "customer",
      branchId: user.branch_id || null,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: payload.id,
            name: `${user.first_name} ${user.last_name}`,
            role: payload.role,
            branchId: payload.branchId,
          },
        });
      }
    );
  } catch (error) {
    console.error("--- LOGIN SERVER ERROR ---", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = {
  loginUser,
};
