const { verifyToken } = require("../utils/jwt");
const UserModel = require("../models/User");
const AppError = require("../utils/AppError");

const verifyTokenMiddleware = async (req, res, next) => {
  try {
    console.log("====================================");
    console.log("Protected Route:", req.method, req.originalUrl);
    console.log("Authorization Header:", req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("No token provided. Please log in.", 401));
    }

    const token = authHeader.split(" ")[1];

    console.log("Token Received:", token);

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found. Please log in again.", 401));
    }

    if (user.status !== "active") {
      return next(
        new AppError("Your account is inactive. Contact support.", 403)
      );
    }

    req.user = user;
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return next(new AppError("Authentication failed", 401));
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Please log in first", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to access this resource", 403)
      );
    }

    next();
  };
};

module.exports = {
  verifyTokenMiddleware,
  authorize,
  isSuperAdmin: authorize("superadmin"),
  isAdmin: authorize("admin", "superadmin"),
  isAuthenticated: verifyTokenMiddleware,
};