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

  // --- DEBUG LOG 1 ---
  console.log("--- LOGIN ATTEMPT ---");
  console.log("Received username:", username);
  console.log("Received password:", password);

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password." });
  }

  try {
    // A single login endpoint needs to check both customer and staff tables.
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
      // --- DEBUG LOG 2 ---
      console.log(
        "DEBUG: No user found in staff or customer table for username:",
        username
      );
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = users[0];

    // --- DEBUG LOG 3 ---
    console.log("DEBUG: User found in database:", user);
    console.log("DEBUG: Hashed password from DB:", user.password_hash);

    // Compare the provided password with the hashed password stored in the database.
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // --- DEBUG LOG 4 ---
    console.log("DEBUG: bcrypt.compare result (isMatch):", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // If credentials are correct, create a JWT payload.
    const payload = {
      id: user.customer_id || user.staff_id,
      role: user.role || "customer",
      branchId: user.branch_id || null,
    };

    console.log("--- LOGIN SUCCESS ---");

    // Sign and send the token
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
