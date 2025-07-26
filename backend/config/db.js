// This file handles the connection to the MySQL database using the mysql2 library.

// Load environment variables from the .env file
require('dotenv').config();

const mysql = require('mysql2');

// Create a connection pool. Using a pool is more efficient than creating a new
// connection for every single database query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// We export the promise-based version of the pool for use with async/await
// in our controllers. This makes database queries much cleaner to write.
console.log('Database connection pool created.');
module.exports = pool.promise();
