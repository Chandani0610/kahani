// const express = require('express');
// const router = express.Router();
// const {
//     getAllUsers,
//     getUserById,
//     createAdmin,
//     updateUser,
//     deleteUser,
//     getUserStats,
//     getAllAdmins,
//     getUsersOnly
// } = require('../controllers/userController');
// const {
//     validate,
//     createAdminValidation,
//     updateUserValidation
// } = require('../middleware/validation');
// const { isSuperAdmin, isAdmin } = require('../middleware/auth');

// router.get('/', isSuperAdmin, getAllUsers);
// router.get('/stats', isSuperAdmin, getUserStats);
// router.get('/admins', isSuperAdmin, getAllAdmins);
// router.post('/admin', isSuperAdmin, validate(createAdminValidation), createAdmin);
// router.get('/:id', isSuperAdmin, getUserById);
// router.put('/:id', isSuperAdmin, validate(updateUserValidation), updateUser);
// router.delete('/:id', isSuperAdmin, deleteUser);
// router.get('/users-only', isAdmin, getUsersOnly);

// module.exports = router;



const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    createAdmin,
    updateUser,
    deleteUser,
    getUserStats,
    getAllAdmins,
    getUsersOnly,
} = require("../controllers/userController");

const {
    validate,
    createAdminValidation,
    updateUserValidation,
} = require("../middleware/validation");

const {
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
} = require("../middleware/auth");

// Admin & Super Admin Routes
router.get(
    "/",
    isAuthenticated,
    isAdmin,
    getAllUsers
);

router.get(
    "/stats",
    isAuthenticated,
    isAdmin,
    getUserStats
);

router.get(
    "/admins",
    isAuthenticated,
    isAdmin,
    getAllAdmins
);

router.post(
    "/admin",
    isAuthenticated,
    isSuperAdmin,
    validate(createAdminValidation),
    createAdmin
);

router.get(
    "/:id",
    isAuthenticated,
    isSuperAdmin,
    getUserById
);

router.put(
    "/:id",
    isAuthenticated,
    isSuperAdmin,
    validate(updateUserValidation),
    updateUser
);

router.delete(
    "/:id",
    isAuthenticated,
    isSuperAdmin,
    deleteUser
);

// Admin & Super Admin
router.get(
    "/users-only",
    isAuthenticated,
    isAdmin,
    getUsersOnly
);

module.exports = router;