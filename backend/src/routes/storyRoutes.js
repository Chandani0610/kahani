
// routes/storyRoutes.js

const express = require("express");
const multer = require("multer");
const storyController = require("../controllers/storyController");

const router = express.Router();

/* =========================================================
   MULTER CONFIGURATION
   ========================================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
        ),
        false
      );
    }
  },
});


/* =========================================================
   GET ROUTES
   ========================================================= */

// Get all stories
router.get(
  "/",
  storyController.getStories
);


/*
  IMPORTANT:
  Specific routes MUST come before /:id.

  Otherwise Express may treat:
      recent
      search
      category
      age-group

  as an ID.
*/


// =========================================================
// GET RECENT STORIES
// =========================================================
//
// Home page:
//
// GET /api/stories/recent?limit=4
//
// This response does NOT contain the image BLOB.
//
// =========================================================

router.get(
  "/recent",
  storyController.getRecentStories
);


// =========================================================
// SEARCH STORIES
// =========================================================

router.get(
  "/search",
  storyController.searchStories
);


// =========================================================
// GET STORIES BY CATEGORY
// =========================================================

router.get(
  "/category/:categoryId",
  storyController.getStoriesByCategory
);


// =========================================================
// GET STORIES BY AGE GROUP
// =========================================================

router.get(
  "/age-group/:ageGroup",
  storyController.getStoriesByAgeGroup
);


// =========================================================
// GET STORY IMAGE
// =========================================================
//
// IMPORTANT:
//
// This MUST come before:
//
//     /:id
//
// Example:
//
// GET /api/stories/12/image
//
// Only the image is returned.
//
// =========================================================

router.get(
  "/:id/image",
  storyController.getStoryImage
);


// =========================================================
// GET SINGLE STORY
// =========================================================
//
// Example:
//
// GET /api/stories/12
//
// =========================================================

router.get(
  "/:id",
  storyController.getStoryById
);


/* =========================================================
   POST ROUTE
   ========================================================= */

// Create new story
router.post(
  "/",
  upload.single("image"),
  storyController.createStory
);


/* =========================================================
   PUT ROUTE
   ========================================================= */

// Update story
//
// If a new image is uploaded:
//     old image → replaced
//
// If no image:
//     old image → remains
//
// If remove_image=true:
//     image → NULL
//

router.put(
  "/:id",
  upload.single("image"),
  storyController.updateStory
);


/* =========================================================
   DELETE ROUTE
   ========================================================= */

// Delete story
//
// Story row + associated LONGBLOB
// will be deleted from MySQL.
//

router.delete(
  "/:id",
  storyController.deleteStory
);


/* =========================================================
   MULTER ERROR HANDLER
   ========================================================= */

router.use((err, req, res, next) => {

  // -------------------------------------------------------
  // MULTER ERRORS
  // -------------------------------------------------------

  if (err instanceof multer.MulterError) {

    if (
      err.code === "LIMIT_FILE_SIZE"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Image size must be less than 10 MB.",
      });
    }


    return res.status(400).json({

      success: false,

      message:
        err.message ||
        "Image upload error.",
    });
  }


  // -------------------------------------------------------
  // OTHER UPLOAD ERRORS
  // -------------------------------------------------------

  if (err) {

    return res.status(400).json({

      success: false,

      message:
        err.message ||
        "Something went wrong.",
    });
  }


  next();
});


/* =========================================================
   EXPORT
   ========================================================= */

module.exports = router;

