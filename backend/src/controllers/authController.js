// backend/controllers/authController.js

const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const { generateToken, generateResetToken, verifyResetToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

// ============================================
// REGISTER - Create new user
// ============================================
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // ✅ Enhanced validation
        if (!name || !email || !password) {
            return next(new AppError('Name, email and password are required', 400));
        }

        // ✅ Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new AppError('Please provide a valid email address', 400));
        }

        // ✅ Validate password length
        if (password.length < 6) {
            return next(new AppError('Password must be at least 6 characters long', 400));
        }

        // ✅ Validate name length
        if (name.length < 2 || name.length > 100) {
            return next(new AppError('Name must be between 2 and 100 characters', 400));
        }

        // ✅ Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return next(new AppError('User already exists with this email', 400));
        }

        // ✅ Hash password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create user
        const userId = await UserModel.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone || null,
            role: 'user',
            status: 'active'
        });

        // ✅ Get user data
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new AppError('User creation failed', 500));
        }

        // ✅ Generate token
        const token = generateToken(userId, email, 'user');

        // ✅ Return response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        next(new AppError('Registration failed. Please try again.', 500));
    }
};

// ============================================
// LOGIN - Authenticate user
// ============================================
const login = async (req, res, next) => {
    try {
        const { email, password, portal } = req.body;

        // ✅ Validation
        if (!email || !password) {
            return next(new AppError('Email and password are required', 400));
        }

        // ✅ Find user
        const user = await UserModel.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }

        // ✅ Check if account is active
        if (user.status !== 'active') {
            return next(new AppError('Your account is inactive. Please contact support.', 403));
        }

        // ✅ Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid email or password', 401));
        }

        // ✅ Role Separation Check
        if (portal === 'admin' && user.role !== 'admin' && user.role !== 'superadmin') {
            return next(new AppError('Access denied: Only administrators can log in through the Admin Portal.', 403));
        }

        // Note: Admin accounts ARE allowed to log into User Portal -> 200 OK (Allowed)

        // ✅ Generate token
        const token = generateToken(user.id, user.email, user.role);

        // ✅ Remove password from response
        const { password: _, ...userData } = user;

        // ✅ Return response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        next(new AppError('Login failed. Please try again.', 500));
    }
};

// ============================================
// GET PROFILE - Get current user profile
// ============================================
const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;

        // ✅ Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // ✅ Return response
        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        next(new AppError('Failed to get profile', 500));
    }
};

// ============================================
// UPDATE PROFILE - Update user profile
// ============================================
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, profile_image } = req.body;
        const userId = req.userId;

        // ✅ Validation
        if (name && (name.length < 2 || name.length > 100)) {
            return next(new AppError('Name must be between 2 and 100 characters', 400));
        }

        // ✅ Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // ✅ Prepare update data
        const updateData = {
            name: name ? name.trim() : user.name,
            email: user.email,
            phone: phone || user.phone,
            role: user.role,
            status: user.status
        };

        if (profile_image !== undefined) {
            updateData.profile_image = profile_image;
        }

        // ✅ Update user
        const updated = await UserModel.update(userId, updateData);
        if (!updated) {
            return next(new AppError('Failed to update profile', 400));
        }

        // ✅ Get updated user
        const updatedUser = await UserModel.findById(userId);

        // ✅ Return response
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        next(new AppError('Failed to update profile', 500));
    }
};

// ============================================
// CHANGE PASSWORD - Change user password
// ============================================
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        // ✅ Validation
        if (!currentPassword || !newPassword) {
            return next(new AppError('Current password and new password are required', 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError('New password must be at least 6 characters', 400));
        }

        if (currentPassword === newPassword) {
            return next(new AppError('New password must be different from current password', 400));
        }

        // ✅ Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // ✅ Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // ✅ Hash new password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // ✅ Update password
        const updated = await UserModel.updatePassword(userId, hashedPassword);
        if (!updated) {
            return next(new AppError('Failed to change password', 400));
        }

        // ✅ Return response
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        next(new AppError('Failed to change password', 500));
    }
};

// ============================================
// LOGOUT - Logout user
// ============================================
const logout = async (req, res, next) => {
    try {
        // ✅ Client-side will remove the token
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        next(new AppError('Logout failed', 500));
    }
};

// ============================================
// FORGOT PASSWORD - Send reset link & token
// ============================================
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new AppError('Email is required', 400));
        }

        // ✅ Find user
        const user = await UserModel.findByEmail(email.toLowerCase().trim());
        if (!user) {
            return next(new AppError('No account found with this email address', 404));
        }

        // ✅ Generate reset token (15 mins validity)
        const resetToken = generateResetToken(user.id, user.email);
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        console.log("====================================");
        console.log("🔑 PASSWORD RESET REQUEST");
        console.log("User  :", user.name);
        console.log("Email :", user.email);
        console.log("Token :", resetToken);
        console.log("Link  :", resetUrl);
        console.log("====================================");

        res.status(200).json({
            success: true,
            message: 'Password reset link and token generated successfully.',
            token: resetToken,
            resetToken,
            resetUrl,
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        next(new AppError('Failed to process password reset request', 500));
    }
};

// ============================================
// RESET PASSWORD - Reset password with token
// ============================================
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return next(new AppError('Reset token and new password are required', 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError('Password must be at least 6 characters long', 400));
        }

        // ✅ Verify token
        const decoded = verifyResetToken(token);
        if (!decoded || !decoded.id) {
            return next(new AppError('Password reset token is invalid or has expired. Please request a new one.', 400));
        }

        // ✅ Verify user exists
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return next(new AppError('User account not found', 404));
        }

        // ✅ Hash new password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // ✅ Update password in database
        await UserModel.updatePassword(user.id, hashedPassword);

        console.log(`✅ Password successfully reset for user: ${user.email} (ID: ${user.id})`);

        res.status(200).json({
            success: true,
            message: 'Your password has been reset successfully! You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        next(new AppError('Failed to reset password. Please try again.', 500));
    }
};

// ============================================
// EXPORT ALL CONTROLLERS
// ============================================
module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword
};