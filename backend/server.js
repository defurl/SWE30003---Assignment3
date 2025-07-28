// Main entry point for the ExpressJS backend.

require("dotenv").config();
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// --- API Routes ---
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const managementRoutes = require("./routes/managementRoutes");
const customerRoutes = require("./routes/customerRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes"); // <-- IMPORT

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes); // <-- USE

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Long Chau PMS Backend API!" });
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Long Chau PMS Backend API!" });
});

// --- Server Startup ---
const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Successfully connected to the database.");
    console.log("Successfully connected to the database.");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
