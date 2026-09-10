// const bcrypt = require('bcryptjs');
// const UserModel = require('../models/User');
// const AppError = require('../utils/AppError');

// const getAllUsers = async (req, res, next) => {
//     try {
//         const users = await UserModel.findAll();
        
//         res.status(200).json({
//             success: true,
//             count: users.length,
//             users
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const getUserById = async (req, res, next) => {
//     try {
//         const { id } = req.params;
        
//         const user = await UserModel.findById(id);
//         if (!user) {
//             return next(new AppError('User not found', 404));
//         }

//         res.status(200).json({
//             success: true,
//             user
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const createAdmin = async (req, res, next) => {
//     try {
//         const { name, email, password, phone } = req.body;

//         const existingUser = await UserModel.findByEmail(email);
//         if (existingUser) {
//             return next(new AppError('User already exists with this email', 400));
//         }

//         const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || 10));
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const userId = await UserModel.create({
//             name,
//             email,
//             password: hashedPassword,
//             phone,
//             role: 'admin',
//             status: 'active'
//         });

//         const user = await UserModel.findById(userId);

//         res.status(201).json({
//             success: true,
//             message: 'Admin created successfully',
//             user
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const updateUser = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { name, email, phone, role, status } = req.body;

//         const user = await UserModel.findById(id);
//         if (!user) {
//             return next(new AppError('User not found', 404));
//         }

//         if (user.role === 'superadmin') {
//             return next(new AppError('Cannot modify super admin user', 403));
//         }

//         if (role === 'superadmin') {
//             return next(new AppError('Cannot assign super admin role through update', 403));
//         }

//         const updated = await UserModel.update(id, {
//             name: name || user.name,
//             email: email || user.email,
//             phone: phone || user.phone,
//             role: role || user.role,
//             status: status || user.status
//         });

//         if (!updated) {
//             return next(new AppError('Failed to update user', 400));
//         }

//         const updatedUser = await UserModel.findById(id);

//         res.status(200).json({
//             success: true,
//             message: 'User updated successfully',
//             user: updatedUser
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const deleteUser = async (req, res, next) => {
//     try {
//         const { id } = req.params;

//         const user = await UserModel.findById(id);
//         if (!user) {
//             return next(new AppError('User not found', 404));
//         }

//         if (user.role === 'superadmin') {
//             return next(new AppError('Cannot delete super admin user', 403));
//         }

//         if (id == req.userId) {
//             return next(new AppError('Cannot delete your own account', 403));
//         }

//         const deleted = await UserModel.delete(id);
//         if (!deleted) {
//             return next(new AppError('Failed to delete user', 400));
//         }

//         res.status(200).json({
//             success: true,
//             message: 'User deleted successfully'
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const getUserStats = async (req, res, next) => {
//     try {
//         const stats = await UserModel.getStats();
        
//         res.status(200).json({
//             success: true,
//             stats
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const getAllAdmins = async (req, res, next) => {
//     try {
//         const admins = await UserModel.findByRole('admin');
        
//         res.status(200).json({
//             success: true,
//             count: admins.length,
//             admins
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// const getUsersOnly = async (req, res, next) => {
//     try {
//         const users = await UserModel.findByRole('user');
        
//         res.status(200).json({
//             success: true,
//             count: users.length,
//             users
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// module.exports = {
//     getAllUsers,
//     getUserById,
//     createAdmin,
//     updateUser,
//     deleteUser,
//     getUserStats,
//     getAllAdmins,
//     getUsersOnly
// };



const bcrypt = require("bcryptjs");
const UserModel = require("../models/User");
const AppError = require("../utils/AppError");

// Get all users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.findAll();

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};

// Get single user
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Create Admin (Super Admin Only)
exports.createAdmin = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return next(new AppError("Name, email and password are required", 400));
        }

        const existingUser = await UserModel.findByEmail(email);

        if (existingUser) {
            return next(new AppError("Email already exists", 400));
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number(process.env.BCRYPT_ROUNDS || 10)
        );

        const userId = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role: "admin",
            status: "active",
        });

        const user = await UserModel.findById(userId);

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};

// Update User
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, status } = req.body;

        const user = await UserModel.findById(id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (user.role === "superadmin") {
            return next(new AppError("Super Admin cannot be modified", 403));
        }

        if (role === "superadmin") {
            return next(new AppError("Cannot assign Super Admin role", 403));
        }

        const updated = await UserModel.update(id, {
            name: name ?? user.name,
            email: email ?? user.email,
            phone: phone ?? user.phone,
            role: role ?? user.role,
            status: status ?? user.status,
        });

        if (!updated) {
            return next(new AppError("Failed to update user", 400));
        }

        const updatedUser = await UserModel.findById(id);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (user.role === "superadmin") {
            return next(new AppError("Cannot delete Super Admin", 403));
        }

        if (Number(id) === Number(req.userId)) {
            return next(new AppError("You cannot delete your own account", 403));
        }

        const deleted = await UserModel.delete(id);

        if (!deleted) {
            return next(new AppError("Delete failed", 400));
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Get Dashboard Stats
exports.getUserStats = async (req, res, next) => {
    try {
        const stats = await UserModel.getStats();

        res.status(200).json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
};

// Get Admins
exports.getAllAdmins = async (req, res, next) => {
    try {
        const admins = await UserModel.findByRole("admin");

        res.status(200).json({
            success: true,
            count: admins.length,
            admins,
        });
    } catch (error) {
        next(error);
    }
};

// Get Normal Users
exports.getUsersOnly = async (req, res, next) => {
    try {
        const users = await UserModel.findByRole("user");

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        next(error);
    }
};