// This middleware will verify the JSON Web Token (JWT) sent by the client.

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user payload (id, role) to the request object
      // so that subsequent protected routes can access it.
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
  else {
    console.error('No token found.');
    res.status(401).json({ message: 'Unauthorized' });
  }

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { protect };
