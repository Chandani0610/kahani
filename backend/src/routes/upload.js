// routes/upload.js

const express = require("express");
const multer = require("multer");

const router = express.Router();


// ============================================================
// MULTER MEMORY STORAGE
// ============================================================
//
// IMPORTANT:
//
// Images are NOT stored on the server filesystem.
//
// The uploaded image is kept temporarily in memory:
//
//     req.file.buffer
//
// Then the image can be stored directly in MySQL LONGBLOB.
//
// There is NO:
//
//     /uploads/stories
//
// There is NO:
//
//     diskStorage()
//
// There is NO:
//
//     filename
//
// There is NO:
//
//     image path stored in database.
//
// ============================================================

const storage = multer.memoryStorage();


// ============================================================
// ALLOWED IMAGE TYPES
// ============================================================
//
// Supported:
//
//     JPG
//     JPEG
//     PNG
//     GIF
//     WEBP
//
// SVG is intentionally not included because your story image
// BLOB system is designed for raster images.
//
// ============================================================

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
];


// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {

    console.log(
        "===================================="
    );

    console.log(
        "UPLOAD ROUTE - FILE RECEIVED"
    );

    console.log(
        "===================================="
    );

    console.log({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });


    // --------------------------------------------------------
    // Check allowed image type
    // --------------------------------------------------------

    if (
        ALLOWED_IMAGE_TYPES.includes(
            file.mimetype
        )
    ) {

        console.log(
            "✅ Image format accepted:",
            file.mimetype
        );

        return cb(null, true);
    }


    // --------------------------------------------------------
    // Reject unsupported format
    // --------------------------------------------------------

    console.log(
        "❌ Image format rejected:",
        file.mimetype
    );

    return cb(
        new Error(
            "Only JPG, JPEG, PNG, GIF and WEBP images are allowed"
        ),
        false
    );
};


// ============================================================
// MULTER CONFIGURATION
// ============================================================
//
// Maximum image size:
//
//     10 MB
//
// Image is available as:
//
//     req.file.buffer
//
// ============================================================

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: fileFilter
});


// ============================================================
// POST /api/upload/upload
// ============================================================
//
// IMPORTANT:
//
// This endpoint now receives the image into memory.
//
// It DOES NOT save the image to disk.
//
// req.file.buffer contains the actual binary image.
//
// ============================================================

router.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {

        try {

            console.log(
                "===================================="
            );

            console.log(
                "POST /api/upload/upload"
            );

            console.log(
                "===================================="
            );


            // =================================================
            // CHECK FILE
            // =================================================

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    error:
                        "No image file uploaded"
                });
            }


            // =================================================
            // CHECK BUFFER
            // =================================================

            if (!req.file.buffer) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Image binary data is not available"
                });
            }


            // =================================================
            // IMAGE INFORMATION
            // =================================================

            const imageBuffer =
                req.file.buffer;

            const imageSize =
                imageBuffer.length;

            const mimeType =
                req.file.mimetype;

            const originalName =
                req.file.originalname;


            console.log(
                "✅ Image received successfully"
            );

            console.log({
                originalName: originalName,
                mimetype: mimeType,
                size: imageSize + " bytes"
            });


            // =================================================
            // IMPORTANT
            // =================================================
            //
            // This route does NOT save anything to disk.
            //
            // The image is currently:
            //
            //     req.file.buffer
            //
            // Your Story Controller should use this Buffer:
            //
            //     req.file.buffer
            //
            // and store it in:
            //
            //     stories.image
            //
            // where image is LONGBLOB.
            //
            // =================================================


            return res.status(200).json({

                success: true,

                message:
                    "Image received successfully",

                // ------------------------------------------------
                // IMPORTANT:
                //
                // This is NOT a file URL.
                //
                // This endpoint is returning information about
                // the binary image received in memory.
                //
                // ------------------------------------------------

                originalName:
                    originalName,

                mimetype:
                    mimeType,

                size:
                    imageSize,

                storage:
                    "MySQL LONGBLOB",

                // ------------------------------------------------
                // Do NOT return /uploads/... URL.
                // ------------------------------------------------

                url:
                    null
            });

        } catch (error) {

            console.error(
                "❌ Upload error:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    "Failed to process image",

                message:
                    error.message
            });
        }
    }
);


// ============================================================
// DELETE /api/upload/upload/:filename
// ============================================================
//
// OLD SYSTEM:
//
//     DELETE physical image file
//
// NEW SYSTEM:
//
//     Images are stored in MySQL.
//
// Therefore this endpoint MUST NOT delete files from disk.
//
// If you want to delete a story image, use:
//
//     PUT /api/stories/:id
//
// with:
//
//     remove_image=true
//
// or delete the entire story.
//
// ============================================================

router.delete(
    "/upload/:filename",
    async (req, res) => {

        return res.status(410).json({

            success: false,

            error:
                "Physical image deletion is disabled. Images are stored in MySQL LONGBLOB.",

            message:
                "Use the story update endpoint with remove_image=true or delete the story."
        });
    }
);


// ============================================================
// GET /api/upload/list
// ============================================================
//
// OLD SYSTEM:
//
//     List files from /uploads/stories
//
// NEW SYSTEM:
//
//     There is no uploads directory.
//
// Images are stored in:
//
//     MySQL stories.image
//
// Therefore there are no physical files to list.
//
// ============================================================

router.get(
    "/upload/list",
    async (req, res) => {

        return res.status(200).json({

            success: true,

            count: 0,

            files: [],

            storage:
                "MySQL LONGBLOB",

            message:
                "Images are stored permanently in MySQL. There are no physical upload files."
        });
    }
);


// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
    (err, req, res, next) => {

        // ----------------------------------------------------
        // Multer errors
        // ----------------------------------------------------

        if (
            err instanceof multer.MulterError
        ) {

            console.error(
                "❌ Multer Error:",
                err
            );


            // ------------------------------------------------
            // File too large
            // ------------------------------------------------

            if (
                err.code === "LIMIT_FILE_SIZE"
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Image size must be less than 10 MB"
                });
            }


            // ------------------------------------------------
            // Other Multer errors
            // ------------------------------------------------

            return res.status(400).json({

                success: false,

                error:
                    err.message ||
                    "Image upload error"
            });
        }


        // ====================================================
        // IMAGE FORMAT ERROR
        // ====================================================

        if (
            err &&
            err.message ===
                "Only JPG, JPEG, PNG, GIF and WEBP images are allowed"
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Only JPG, JPEG, PNG, GIF and WEBP images are allowed"
            });
        }


        // ====================================================
        // PASS OTHER ERRORS
        // ====================================================

        return next(err);
    }
);


// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;