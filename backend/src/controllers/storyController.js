
// controllers/storyController.js

const Story = require("../models/storyModel");

// ============================================================
// IMAGE HELPERS
// ============================================================

/**
 * Detect actual image MIME type from binary header.
 *
 * Supported:
 * - JPEG / JPG
 * - PNG
 * - GIF
 * - WEBP
 */
const getImageMimeType = (buffer) => {

    if (
        !Buffer.isBuffer(buffer) ||
        buffer.length < 4
    ) {
        return null;
    }


    // ========================================================
    // JPEG
    // FF D8 FF
    // ========================================================

    if (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
    ) {
        return "image/jpeg";
    }


    // ========================================================
    // PNG
    // 89 50 4E 47
    // ========================================================

    if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
    ) {
        return "image/png";
    }


    // ========================================================
    // GIF
    // ========================================================

    if (buffer.length >= 6) {

        const gifHeader =
            buffer.toString(
                "ascii",
                0,
                6
            );

        if (
            gifHeader === "GIF87a" ||
            gifHeader === "GIF89a"
        ) {
            return "image/gif";
        }
    }


    // ========================================================
    // WEBP
    // RIFF....WEBP
    // ========================================================

    if (buffer.length >= 12) {

        const riffHeader =
            buffer.toString(
                "ascii",
                0,
                4
            );

        const webpHeader =
            buffer.toString(
                "ascii",
                8,
                12
            );

        if (
            riffHeader === "RIFF" &&
            webpHeader === "WEBP"
        ) {
            return "image/webp";
        }
    }


    return null;
};


// ============================================================
// BLOB → BASE64 DATA URL
// ============================================================
//
// Used only when a complete story response needs
// the image inside JSON.
//
// IMPORTANT:
// Home recent stories DO NOT use this anymore.
//
// ============================================================

const blobToDataUrl = (image) => {

    if (!image) {
        return null;
    }


    try {

        // ====================================================
        // MYSQL BLOB → BUFFER
        // ====================================================

        if (Buffer.isBuffer(image)) {

            const mimeType =
                getImageMimeType(image);

            if (!mimeType) {

                console.warn(
                    "⚠️ Unknown image BLOB format"
                );

                return null;
            }


            return (
                `data:${mimeType};base64,` +
                image.toString("base64")
            );
        }


        // ====================================================
        // UINT8ARRAY
        // ====================================================

        if (image instanceof Uint8Array) {

            const buffer =
                Buffer.from(image);

            const mimeType =
                getImageMimeType(buffer);

            if (!mimeType) {

                console.warn(
                    "⚠️ Unknown Uint8Array image format"
                );

                return null;
            }


            return (
                `data:${mimeType};base64,` +
                buffer.toString("base64")
            );
        }


        // ====================================================
        // JSON BUFFER
        // ====================================================

        if (
            image &&
            image.type === "Buffer" &&
            Array.isArray(image.data)
        ) {

            const buffer =
                Buffer.from(image.data);

            const mimeType =
                getImageMimeType(buffer);

            if (!mimeType) {

                console.warn(
                    "⚠️ Unknown JSON Buffer image format"
                );

                return null;
            }


            return (
                `data:${mimeType};base64,` +
                buffer.toString("base64")
            );
        }


        return null;

    } catch (error) {

        console.error(
            "❌ BLOB → Base64 conversion error:",
            error
        );

        return null;
    }
};


// ============================================================
// ADD IMAGE TO SINGLE STORY
// ============================================================

const addImageToStory = (story) => {

    if (!story) {
        return story;
    }


    return {
        ...story,

        image:
            blobToDataUrl(
                story.image
            ),

        banner_image:
            story.banner_image || null
    };
};


// ============================================================
// ADD IMAGE TO STORIES ARRAY
// ============================================================

const addImageToStories = (stories) => {

    if (!Array.isArray(stories)) {
        return stories;
    }


    return stories.map(
        (story) =>
            addImageToStory(story)
    );
};


// ============================================================
// GET ALL STORIES
// ============================================================
//
// Existing behavior maintained.
//
// NOTE:
// This endpoint still returns Base64 images.
//
// Later we can optimize All Stories separately.
// ============================================================

exports.getStories = (req, res, next) => {

    Story.getAll(
        (err, results) => {

            if (err) {
                return next(err);
            }


            const stories =
                addImageToStories(
                    results || []
                );


            return res.json(
                stories
            );
        }
    );
};


// ============================================================
// GET RECENT STORIES - FAST HOME VERSION
// ============================================================
//
// GET /api/stories/recent?limit=4
//
// IMPORTANT:
//
// The optimized Story.getRecent() does NOT select
// the image column.
//
// Therefore:
// NO BLOB
// NO Base64
// NO large image data
//
// is sent in this response.
//
// ============================================================

exports.getRecentStories = (
    req,
    res,
    next
) => {

    try {

        const requestedLimit =
            parseInt(
                req.query.limit,
                10
            );


        const limit =
            Math.max(
                1,
                Math.min(
                    requestedLimit || 4,
                    20
                )
            );


        console.log(
            "===================================="
        );

        console.log(
            "⚡ GET RECENT STORIES - FAST"
        );

        console.log(
            "===================================="
        );

        console.log(
            "Requested limit:",
            requestedLimit
        );

        console.log(
            "Safe limit:",
            limit
        );


        // ====================================================
        // FETCH STORY DETAILS ONLY
        // ====================================================

        Story.getRecent(
            limit,
            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Error fetching recent stories:",
                        err
                    );

                    return next(err);
                }


                const stories =
                    Array.isArray(results)
                        ? results
                        : [];


                console.log(
                    "✅ Recent stories loaded:",
                    stories.length
                );

                console.log(
                    "🚀 Image BLOB skipped from Home response"
                );


                // =================================================
                // SEND SMALL JSON RESPONSE
                // =================================================

                return res.json(
                    stories
                );
            }
        );

    } catch (error) {

        console.error(
            "❌ Get Recent Stories Error:",
            error
        );

        return next(error);
    }
};


// ============================================================
// GET STORY IMAGE
// ============================================================
//
// GET /api/stories/:id/image
//
// This endpoint returns ONLY the image.
//
// Browser can request the image independently.
//
// Example:
// <img src="http://localhost:5000/api/stories/12/image" />
//
// ============================================================

exports.getStoryImage = (
    req,
    res,
    next
) => {

    const { id } =
        req.params;


    if (!id) {

        return res.status(400).json({

            success: false,

            error:
                "Story ID is required"
        });
    }


    Story.getImage(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "❌ Error fetching story image:",
                    err
                );

                return next(err);
            }


            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Story not found"
                });
            }


            const image =
                results[0].image;


            // =================================================
            // NO IMAGE
            // =================================================

            if (!image) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Story image not found"
                });
            }


            // =================================================
            // CONVERT TO BUFFER
            // =================================================

            let imageBuffer = image;


            if (
                !Buffer.isBuffer(
                    imageBuffer
                )
            ) {

                if (
                    imageBuffer instanceof
                    Uint8Array
                ) {

                    imageBuffer =
                        Buffer.from(
                            imageBuffer
                        );

                } else if (
                    imageBuffer &&
                    imageBuffer.type === "Buffer" &&
                    Array.isArray(
                        imageBuffer.data
                    )
                ) {

                    imageBuffer =
                        Buffer.from(
                            imageBuffer.data
                        );

                } else {

                    return res.status(500).json({

                        success: false,

                        error:
                            "Invalid image data"
                    });
                }
            }


            // =================================================
            // DETECT MIME TYPE
            // =================================================

            const mimeType =
                getImageMimeType(
                    imageBuffer
                );


            if (!mimeType) {

                return res.status(415).json({

                    success: false,

                    error:
                        "Unsupported image format"
                });
            }


            // =================================================
            // CACHE IMAGE
            // =================================================
            //
            // Browser can reuse the image for 1 day.
            //
            // This means repeated visits do not need
            // to download the image again unless cache
            // expires.
            //
            // =================================================

            res.setHeader(
                "Content-Type",
                mimeType
            );

            res.setHeader(
                "Content-Length",
                imageBuffer.length
            );

            res.setHeader(
                "Cache-Control",
                "public, max-age=86400"
            );


            // =================================================
            // SEND RAW IMAGE
            // =================================================

            return res.send(
                imageBuffer
            );
        }
    );
};


// ============================================================
// GET SINGLE STORY
// ============================================================
//
// Existing behavior maintained.
//
// This endpoint can still return the complete story
// including Base64 image because StoryModal may need it.
//
// ============================================================

exports.getStoryById = (
    req,
    res,
    next
) => {

    const { id } =
        req.params;


    Story.getById(
        id,
        (err, results) => {

            if (err) {
                return next(err);
            }


            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Story not found"
                });
            }


            const story =
                addImageToStory(
                    results[0]
                );


            return res.json(
                story
            );
        }
    );
};


// ============================================================
// GET STORIES BY CATEGORY
// ============================================================

exports.getStoriesByCategory = (
    req,
    res,
    next
) => {

    const { categoryId } =
        req.params;


    Story.getByCategory(
        categoryId,
        (err, results) => {

            if (err) {
                return next(err);
            }


            const stories =
                addImageToStories(
                    results || []
                );


            return res.json(
                stories
            );
        }
    );
};


// ============================================================
// GET STORIES BY AGE GROUP
// ============================================================

exports.getStoriesByAgeGroup = (
    req,
    res,
    next
) => {

    const { ageGroup } =
        req.params;


    Story.getByAgeGroup(
        ageGroup,
        (err, results) => {

            if (err) {
                return next(err);
            }


            const stories =
                addImageToStories(
                    results || []
                );


            return res.json(
                stories
            );
        }
    );
};


// ============================================================
// SEARCH STORIES
// ============================================================

exports.searchStories = (
    req,
    res,
    next
) => {

    const { q } =
        req.query;


    if (
        !q ||
        !q.trim()
    ) {

        return res.status(400).json({

            success: false,

            error:
                "Search term is required"
        });
    }


    Story.search(
        q.trim(),
        (err, results) => {

            if (err) {
                return next(err);
            }


            const stories =
                addImageToStories(
                    results || []
                );


            return res.json(
                stories
            );
        }
    );
};


// ============================================================
// CREATE STORY
// ============================================================
//
// POST /api/stories
//
// Content-Type:
// multipart/form-data
//
// Image:
// formData.append("image", file)
//
// Flow:
//
// File
//   ↓
// Multer memoryStorage
//   ↓
// req.file.buffer
//   ↓
// MySQL LONGBLOB
//
// ============================================================

exports.createStory = (
    req,
    res,
    next
) => {

    try {

        console.log(
            "===================================="
        );

        console.log(
            "CREATE STORY"
        );

        console.log(
            "===================================="
        );

        console.log(
            "Request body:",
            req.body
        );

        console.log(
            "Content-Type:",
            req.headers["content-type"]
        );


        console.log(
            "Uploaded file:",
            req.file
                ? {
                    fieldname:
                        req.file.fieldname,

                    originalname:
                        req.file.originalname,

                    mimetype:
                        req.file.mimetype,

                    size:
                        req.file.size,

                    hasBuffer:
                        !!req.file.buffer
                }
                : null
        );


        // ====================================================
        // REQUEST DATA
        // ====================================================

        const {
            category_id,
            author_id,
            title,
            slug,
            age_group,
            read_time,
            language,
            description,
            story,
            status,
            banner_image
        } = req.body;


        // ====================================================
        // VALIDATE TITLE
        // ====================================================

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Title is required"
            });
        }


        // ====================================================
        // VALIDATE STORY
        // ====================================================

        if (
            !story ||
            typeof story !== "string" ||
            !story.trim()
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Story is required"
            });
        }


        // ====================================================
        // IMAGE
        // ====================================================

        let image = null;


        if (req.file) {

            if (!req.file.buffer) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Uploaded image data is not available"
                });
            }


            const detectedMime =
                getImageMimeType(
                    req.file.buffer
                );


            if (!detectedMime) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Invalid or unsupported image binary"
                });
            }


            image =
                req.file.buffer;


            console.log(
                "===================================="
            );

            console.log(
                "✅ STORY IMAGE READY FOR MYSQL"
            );

            console.log(
                "===================================="
            );


            console.log({

                filename:
                    req.file.originalname,

                uploadedMime:
                    req.file.mimetype,

                detectedMime:
                    detectedMime,

                size:
                    image.length,

                storage:
                    "MySQL LONGBLOB"
            });
        }


        // ====================================================
        // BANNER IMAGE
        // ====================================================

        let bannerImage = null;


        if (
            typeof banner_image === "string" &&
            banner_image.trim()
        ) {

            const cleanBannerImage =
                banner_image.trim();


            if (
                cleanBannerImage.startsWith(
                    "http://"
                ) ||
                cleanBannerImage.startsWith(
                    "https://"
                ) ||
                cleanBannerImage.startsWith(
                    "/uploads/"
                )
            ) {

                bannerImage =
                    cleanBannerImage;
            }
        }


        // ====================================================
        // STORY DATA
        // ====================================================

        const storyData = {

            category_id:
                category_id || null,

            author_id:
                author_id || null,

            title:
                title.trim(),

            slug:
                slug || null,

            image:
                image,

            banner_image:
                bannerImage,

            age_group:
                age_group || null,

            read_time:
                read_time || null,

            language:
                language || null,

            description:
                description || null,

            story:
                story.trim(),

            status:
                status || "published"
        };


        console.log(
            "Story data prepared:"
        );


        console.log({

            ...storyData,

            image:
                Buffer.isBuffer(
                    storyData.image
                )
                    ? `[LONGBLOB ${storyData.image.length} bytes]`
                    : null
        });


        // ====================================================
        // SAVE TO MYSQL
        // ====================================================

        Story.create(
            storyData,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Database Create Story Error:",
                        err
                    );

                    return next(err);
                }


                console.log(
                    "✅ Story inserted into MySQL"
                );

                console.log(
                    "Story ID:",
                    result.insertId
                );


                // =================================================
                // FETCH CREATED STORY
                // =================================================

                Story.getById(
                    result.insertId,
                    (fetchErr, results) => {

                        if (fetchErr) {

                            console.error(
                                "⚠️ Story created but fetch failed:",
                                fetchErr
                            );


                            return res.status(201).json({

                                success: true,

                                message:
                                    "Story created successfully",

                                id:
                                    result.insertId,

                                image:
                                    blobToDataUrl(
                                        image
                                    )
                            });
                        }


                        if (
                            !results ||
                            results.length === 0
                        ) {

                            return res.status(201).json({

                                success: true,

                                message:
                                    "Story created successfully",

                                id:
                                    result.insertId,

                                image:
                                    blobToDataUrl(
                                        image
                                    )
                            });
                        }


                        const createdStory =
                            addImageToStory(
                                results[0]
                            );


                        return res.status(201).json({

                            success: true,

                            message:
                                "Story created successfully",

                            story:
                                createdStory
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "❌ Create Story Error:",
            error
        );

        return next(error);
    }
};


// ============================================================
// UPDATE STORY
// ============================================================

exports.updateStory = (
    req,
    res,
    next
) => {

    const { id } =
        req.params;


    console.log(
        "===================================="
    );

    console.log(
        "UPDATE STORY"
    );

    console.log(
        "===================================="
    );

    console.log(
        "Story ID:",
        id
    );


    console.log(
        "Request body:",
        req.body
    );


    console.log(
        "Uploaded file:",
        req.file
            ? {
                originalname:
                    req.file.originalname,

                mimetype:
                    req.file.mimetype,

                size:
                    req.file.size,

                hasBuffer:
                    !!req.file.buffer
            }
            : null
    );


    // ========================================================
    // CHECK STORY EXISTS
    // ========================================================

    Story.getById(
        id,
        (err, results) => {

            if (err) {
                return next(err);
            }


            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Story not found"
                });
            }


            console.log(
                "✅ Existing story found:",
                id
            );


            // ====================================================
            // VALIDATE TITLE
            // ====================================================

            if (
                req.body.title !== undefined &&
                (
                    typeof req.body.title !== "string" ||
                    !req.body.title.trim()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Title cannot be empty"
                });
            }


            // ====================================================
            // VALIDATE STORY
            // ====================================================

            if (
                req.body.story !== undefined &&
                (
                    typeof req.body.story !== "string" ||
                    !req.body.story.trim()
                )
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Story cannot be empty"
                });
            }


            // ====================================================
            // COPY REQUEST DATA
            // ====================================================

            const updateData = {
                ...req.body
            };


            delete updateData.image;

            delete updateData.image_url;

            delete updateData.imageFile;

            delete updateData.id;


            // ====================================================
            // REMOVE IMAGE CONTROL
            // ====================================================

            const removeImage =
                String(
                    req.body.remove_image
                ).toLowerCase() === "true";


            // ====================================================
            // CASE 1: NEW IMAGE
            // ====================================================

            if (req.file) {

                if (!req.file.buffer) {

                    return res.status(400).json({

                        success: false,

                        error:
                            "Uploaded image data is not available"
                    });
                }


                const detectedMime =
                    getImageMimeType(
                        req.file.buffer
                    );


                if (!detectedMime) {

                    return res.status(400).json({

                        success: false,

                        error:
                            "Invalid or unsupported image binary"
                    });
                }


                updateData.image =
                    req.file.buffer;


                console.log(
                    "===================================="
                );

                console.log(
                    "✅ NEW IMAGE WILL REPLACE OLD IMAGE"
                );

                console.log(
                    "===================================="
                );


                console.log({

                    filename:
                        req.file.originalname,

                    mime:
                        detectedMime,

                    size:
                        req.file.buffer.length
                });
            }


            // ====================================================
            // CASE 2: REMOVE IMAGE
            // ====================================================

            else if (removeImage) {

                updateData.image =
                    null;


                console.log(
                    "🗑️ IMAGE REMOVAL REQUESTED"
                );
            }


            // ====================================================
            // CASE 3: NO IMAGE CHANGE
            // ====================================================

            else {

                delete updateData.image;


                console.log(
                    "🟢 NO IMAGE CHANGE"
                );
            }


            delete updateData.remove_image;


            // ====================================================
            // BANNER IMAGE
            // ====================================================

            if (
                req.body.banner_image !== undefined
            ) {

                updateData.banner_image =
                    req.body.banner_image || null;
            }


            // ====================================================
            // UPDATE MYSQL
            // ====================================================

            Story.update(
                id,
                updateData,
                (err, result) => {

                    if (err) {

                        console.error(
                            "❌ Database Update Story Error:",
                            err
                        );

                        return next(err);
                    }


                    if (
                        !result ||
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            error:
                                "Story not found"
                        });
                    }


                    console.log(
                        "✅ Story updated successfully in MySQL"
                    );


                    // =================================================
                    // FETCH UPDATED STORY
                    // =================================================

                    Story.getById(
                        id,
                        (fetchErr, results) => {

                            if (fetchErr) {

                                console.error(
                                    "⚠️ Updated story saved but fetch failed:",
                                    fetchErr
                                );


                                return res.json({

                                    success: true,

                                    message:
                                        "Story updated successfully",

                                    id:
                                        id
                                });
                            }


                            if (
                                !results ||
                                results.length === 0
                            ) {

                                return res.json({

                                    success: true,

                                    message:
                                        "Story updated successfully",

                                    id:
                                        id
                                });
                            }


                            const updatedStory =
                                addImageToStory(
                                    results[0]
                                );


                            return res.json({

                                success: true,

                                message:
                                    "Story updated successfully",

                                story:
                                    updatedStory
                            });
                        }
                    );
                }
            );
        }
    );
};


// ============================================================
// DELETE STORY
// ============================================================

exports.deleteStory = (
    req,
    res,
    next
) => {

    const { id } =
        req.params;


    console.log(
        "===================================="
    );

    console.log(
        "DELETE STORY"
    );

    console.log(
        "Story ID:",
        id
    );

    console.log(
        "===================================="
    );


    // ========================================================
    // CHECK STORY EXISTS
    // ========================================================

    Story.getById(
        id,
        (err, results) => {

            if (err) {
                return next(err);
            }


            if (
                !results ||
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Story not found"
                });
            }


            // ====================================================
            // DELETE STORY
            // ====================================================

            Story.delete(
                id,
                (err, result) => {

                    if (err) {
                        return next(err);
                    }


                    if (
                        !result ||
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({

                            success: false,

                            error:
                                "Story not found"
                        });
                    }


                    console.log(
                        "✅ Story deleted from MySQL"
                    );


                    console.log(
                        "✅ Associated BLOB deleted with story row"
                    );


                    return res.json({

                        success: true,

                        message:
                            "Story deleted successfully"
                    });
                }
            );
        }
    );
};


// ============================================================
// EXPORT HELPERS
// ============================================================

module.exports.addImageToStory =
    addImageToStory;

module.exports.addImageToStories =
    addImageToStories;

module.exports.blobToDataUrl =
    blobToDataUrl;

module.exports.getImageMimeType =
    getImageMimeType;

