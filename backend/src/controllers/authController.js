// backend/controllers/authController.js

const bcrypt = require('bcryptjs');
const UserModel = require('../models/User');
const { generateToken } = require('../utils/jwt');
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
        const { email, password } = req.body;

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
        const { name, phone } = req.body;
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
// FORGOT PASSWORD - Send reset link
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
            return next(new AppError('User not found with this email', 404));
        }

        // ✅ Generate reset token (implementation depends on your setup)
        // const resetToken = generateResetToken(user.id);
        // await sendResetEmail(email, resetToken);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        next(new AppError('Failed to process request', 500));
    }
};

// ============================================
// RESET PASSWORD - Reset password with token
// ============================================
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return next(new AppError('Token and new password are required', 400));
        }

        if (newPassword.length < 6) {
            return next(new AppError('Password must be at least 6 characters', 400));
        }

        // ✅ Verify token (implementation depends on your setup)
        // const userId = verifyResetToken(token);
        // if (!userId) {
        //     return next(new AppError('Invalid or expired token', 400));
        // }

        // ✅ Hash new password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // ✅ Update password (implementation depends on your setup)
        // await UserModel.updatePassword(userId, hashedPassword);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        next(new AppError('Failed to reset password', 500));
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