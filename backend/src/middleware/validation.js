// backend/middleware/validation.js

const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// ==================== Generic Validation Middleware ====================

const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ==================== Simple Validation (Backward Compatible) ====================

const validateRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name) {
    return next(new AppError("Name is required", 400));
  }

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  // Additional validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError("Please provide a valid email", 400));
  }

  // Password length validation
  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  next();
};

// ==================== Register Validation (Express Validator) ====================

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
];

// ==================== Login Validation ====================

const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// ==================== Update Profile Validation ====================

const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("email")
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email"),
];

// ==================== Change Password Validation ====================

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// ==================== Forgot Password Validation ====================

const forgotPasswordValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),
];

// ==================== Reset Password Validation ====================

const resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// ==================== Export All ====================

module.exports = {
  // Generic validator
  validate,
  
  // Simple validators (backward compatible)
  validateRegister,
  
  // Express-validator validations
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};