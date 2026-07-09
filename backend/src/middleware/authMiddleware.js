const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check for Token in Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretchangeinproduction');

      // Attach userId to request
      req.userId = decoded.userId;

      next();
    } catch (error) {
      console.error('Token validation failed:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
