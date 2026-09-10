const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================================
// UPLOAD DIRECTORY
// =========================================

const uploadDir = path.join(__dirname, "../uploads/stories");

// Folder automatically create ho jayega
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// =========================================
// STORAGE CONFIGURATION
// =========================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const fileName =
            `story-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, fileName);
    }
});

// =========================================
// FILE TYPE VALIDATION
// =========================================

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            ),
            false
        );
    }
};

// =========================================
// MULTER CONFIGURATION
// =========================================

const upload = multer({
    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload;