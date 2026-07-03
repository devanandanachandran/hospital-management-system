const jwt = require('jsonwebtoken');

// Checks if the request has a valid token
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches { userId, role } to the request
    next(); // proceed to the actual route
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Checks if the logged-in user has one of the allowed roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for your role' });
    }
    next();
  };
};

module.exports = { protect, authorize };