const express = require("express");
const router = express.Router();

const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const {
    verifyTokenMiddleware
} = require("../middleware/auth");

const {
    validate,
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} = require("../middleware/validation");


// Test route
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Auth route working"
    });
});


// Register
router.post(
    "/register",
    validate(registerValidation),
    register
);


// Login  ⭐ THIS MUST EXIST
router.post(
    "/login",
    validate(loginValidation),
    login
);


// Current User
router.get(
    "/me",
    verifyTokenMiddleware,
    getProfile
);


// Profile
router.get(
    "/profile",
    verifyTokenMiddleware,
    getProfile
);


// Update Profile
router.put(
    "/profile",
    verifyTokenMiddleware,
    validate(updateProfileValidation),
    updateProfile
);


// Change Password
router.post(
    "/change-password",
    verifyTokenMiddleware,
    validate(changePasswordValidation),
    changePassword
);


// Logout
router.post(
    "/logout",
    verifyTokenMiddleware,
    logout
);

// Forgot Password
router.post(
    "/forgot-password",
    validate(forgotPasswordValidation),
    forgotPassword
);

// Reset Password
router.post(
    "/reset-password",
    validate(resetPasswordValidation),
    resetPassword
);

module.exports = router;