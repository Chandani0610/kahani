
const db = require("../config/db");

// =========================================
// ASYNC QUERY HELPER
// =========================================

const queryAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(results);
        });
    });
};


// =========================================
// STORY MODEL
// =========================================

const Story = {

    // =========================================
    // GET ALL STORIES
    // =========================================

    getAll: (callback) => {

        const query = `
            SELECT *
            FROM stories
            ORDER BY id DESC
        `;

        db.query(query, callback);
    },


    // =========================================
    // GET RECENT STORIES - FAST VERSION
    // =========================================
    //
    // IMPORTANT:
    //
    // Home page only needs story information initially.
    //
    // DO NOT fetch LONGBLOB image here.
    //
    // Image will be loaded separately using:
    //
    // GET /stories/:id/image
    //
    // This makes the initial Home API response
    // much smaller and faster.
    //
    // =========================================

    getRecent: (limit = 4, callback) => {

        const safeLimit = Math.max(
            1,
            Math.min(
                Number(limit) || 4,
                20
            )
        );

        const query = `
            SELECT
                id,
                category_id,
                author_id,
                title,
                slug,
                banner_image,
                age_group,
                read_time,
                language,
                description,
                story,
                status
            FROM stories
            ORDER BY id DESC
            LIMIT ?
        `;

        db.query(
            query,
            [safeLimit],
            callback
        );
    },


    // =========================================
    // GET ONLY STORY IMAGE
    // =========================================
    //
    // Used by:
    //
    // GET /stories/:id/image
    //
    // Only the image BLOB is fetched.
    //
    // =========================================

    getImage: (id, callback) => {

        const query = `
            SELECT image
            FROM stories
            WHERE id = ?
            LIMIT 1
        `;

        db.query(
            query,
            [id],
            callback
        );
    },


    // =========================================
    // GET STORY BY ID
    // =========================================
    //
    // Full story is still returned here because
    // StoryModal may need the complete content.
    //
    // =========================================

    getById: (id, callback) => {

        const query = `
            SELECT *
            FROM stories
            WHERE id = ?
        `;

        db.query(
            query,
            [id],
            callback
        );
    },


    // =========================================
    // GET STORIES BY CATEGORY
    // =========================================

    getByCategory: (categoryId, callback) => {

        const query = `
            SELECT *
            FROM stories
            WHERE category_id = ?
            ORDER BY id DESC
        `;

        db.query(
            query,
            [categoryId],
            callback
        );
    },


    // =========================================
    // GET STORIES BY AGE GROUP
    // =========================================

    getByAgeGroup: (ageGroup, callback) => {

        const query = `
            SELECT *
            FROM stories
            WHERE age_group = ?
            ORDER BY id DESC
        `;

        db.query(
            query,
            [ageGroup],
            callback
        );
    },


    // =========================================
    // CREATE NEW STORY
    // =========================================

    create: (storyData, callback) => {

        const {
            category_id,
            author_id,
            title,
            slug,
            image,
            banner_image,
            age_group,
            read_time,
            language,
            description,
            story,
            status
        } = storyData;


        // -----------------------------------------
        // PREPARE IMAGE BUFFER
        // -----------------------------------------

        let imageBuffer = null;

        if (
            image !== undefined &&
            image !== null
        ) {

            if (Buffer.isBuffer(image)) {

                imageBuffer = image;

            } else if (image instanceof Uint8Array) {

                imageBuffer = Buffer.from(image);

            } else {

                console.warn(
                    "⚠️ Story image is not a Buffer."
                );

                imageBuffer = null;
            }
        }


        // -----------------------------------------
        // NORMALIZE VALUES
        // -----------------------------------------

        const categoryValue =
            category_id === "" ||
            category_id === undefined ||
            category_id === null
                ? null
                : category_id;


        const authorValue =
            author_id === "" ||
            author_id === undefined ||
            author_id === null
                ? null
                : author_id;


        const slugValue =
            slug === "" ||
            slug === undefined ||
            slug === null
                ? null
                : slug;


        const bannerImageValue =
            banner_image === "" ||
            banner_image === undefined ||
            banner_image === null
                ? null
                : banner_image;


        const ageGroupValue =
            age_group === "" ||
            age_group === undefined ||
            age_group === null
                ? null
                : age_group;


        const readTimeValue =
            read_time === "" ||
            read_time === undefined ||
            read_time === null
                ? null
                : read_time;


        const languageValue =
            language === "" ||
            language === undefined ||
            language === null
                ? "English"
                : language;


        const descriptionValue =
            description === "" ||
            description === undefined ||
            description === null
                ? null
                : description;


        const statusValue =
            status === "draft"
                ? "draft"
                : "published";


        // -----------------------------------------
        // INSERT QUERY
        // -----------------------------------------

        const query = `
            INSERT INTO stories (
                category_id,
                author_id,
                title,
                slug,
                image,
                banner_image,
                age_group,
                read_time,
                language,
                description,
                story,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;


        const values = [
            categoryValue,
            authorValue,
            title || null,
            slugValue,
            imageBuffer,
            bannerImageValue,
            ageGroupValue,
            readTimeValue,
            languageValue,
            descriptionValue,
            story || null,
            statusValue
        ];


        console.log(
            "===================================="
        );

        console.log(
            "📖 CREATING STORY"
        );

        console.log(
            "===================================="
        );

        console.log({
            category_id: categoryValue,
            author_id: authorValue,
            title: title || null,
            slug: slugValue,

            image: imageBuffer
                ? `[LONGBLOB ${imageBuffer.length} bytes]`
                : null,

            banner_image: bannerImageValue,
            age_group: ageGroupValue,
            read_time: readTimeValue,
            language: languageValue,
            status: statusValue
        });


        // -----------------------------------------
        // DATABASE INSERT
        // -----------------------------------------

        db.query(
            query,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Story INSERT Error:",
                        err
                    );

                    return callback(err);
                }


                console.log(
                    "✅ Story inserted successfully"
                );

                console.log(
                    "Story ID:",
                    result.insertId
                );

                console.log(
                    "Image stored as MySQL LONGBLOB:",
                    !!imageBuffer
                );


                callback(
                    null,
                    result
                );
            }
        );
    },


    // =========================================
    // UPDATE STORY
    // =========================================

    update: (id, storyData, callback) => {

        const allowedFields = [
            "category_id",
            "author_id",
            "title",
            "slug",
            "image",
            "banner_image",
            "age_group",
            "read_time",
            "language",
            "description",
            "story",
            "status"
        ];


        const fields = [];

        const values = [];


        // -----------------------------------------
        // PROCESS FIELDS
        // -----------------------------------------

        allowedFields.forEach((field) => {

            if (
                !Object.prototype.hasOwnProperty.call(
                    storyData,
                    field
                )
            ) {
                return;
            }


            const value = storyData[field];


            // =====================================
            // IMAGE
            // =====================================

            if (field === "image") {

                if (value === null) {

                    fields.push(
                        "image = ?"
                    );

                    values.push(null);

                    console.log(
                        `🗑️ Removing image from story ${id}`
                    );

                    return;
                }


                if (Buffer.isBuffer(value)) {

                    fields.push(
                        "image = ?"
                    );

                    values.push(value);

                    console.log(
                        `🖼️ Replacing image for story ${id}: ${value.length} bytes`
                    );

                    return;
                }


                if (
                    value instanceof Uint8Array
                ) {

                    const imageBuffer =
                        Buffer.from(value);


                    fields.push(
                        "image = ?"
                    );

                    values.push(
                        imageBuffer
                    );


                    console.log(
                        `🖼️ Replacing image for story ${id}: ${imageBuffer.length} bytes`
                    );

                    return;
                }


                console.warn(
                    `⚠️ Invalid image value for story ${id}. Image update skipped.`
                );

                return;
            }


            // =====================================
            // CATEGORY ID
            // =====================================

            if (
                field === "category_id" &&
                (
                    value === "" ||
                    value === undefined ||
                    value === null
                )
            ) {

                fields.push(
                    "category_id = ?"
                );

                values.push(null);

                return;
            }


            // =====================================
            // AUTHOR ID
            // =====================================

            if (
                field === "author_id" &&
                (
                    value === "" ||
                    value === undefined ||
                    value === null
                )
            ) {

                fields.push(
                    "author_id = ?"
                );

                values.push(null);

                return;
            }


            // =====================================
            // SLUG
            // =====================================

            if (
                field === "slug" &&
                (
                    value === "" ||
                    value === undefined ||
                    value === null
                )
            ) {

                fields.push(
                    "slug = ?"
                );

                values.push(null);

                return;
            }


            // =====================================
            // BANNER IMAGE
            // =====================================

            if (
                field === "banner_image" &&
                (
                    value === "" ||
                    value === undefined ||
                    value === null
                )
            ) {

                fields.push(
                    "banner_image = ?"
                );

                values.push(null);

                return;
            }


            // =====================================
            // NORMAL FIELD
            // =====================================

            fields.push(
                `${field} = ?`
            );

            values.push(value);
        });


        // -----------------------------------------
        // NOTHING TO UPDATE
        // -----------------------------------------

        if (fields.length === 0) {

            console.log(
                `⚠️ No fields supplied for story ${id}`
            );

            return callback(
                null,
                {
                    affectedRows: 0,
                    warning:
                        "No fields provided for update"
                }
            );
        }


        // -----------------------------------------
        // UPDATE QUERY
        // -----------------------------------------

        const query = `
            UPDATE stories
            SET ${fields.join(", ")}
            WHERE id = ?
        `;


        values.push(id);


        // -----------------------------------------
        // SAFE LOGGING
        // -----------------------------------------

        console.log(
            "===================================="
        );

        console.log(
            "📝 STORY UPDATE"
        );

        console.log(
            "===================================="
        );

        console.log(query);


        console.log(
            values.map((value) => {

                if (
                    Buffer.isBuffer(value)
                ) {

                    return `[LONGBLOB ${value.length} bytes]`;
                }

                return value;
            })
        );


        // -----------------------------------------
        // DATABASE UPDATE
        // -----------------------------------------

        db.query(
            query,
            values,
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Story UPDATE Error:",
                        err
                    );

                    return callback(err);
                }


                console.log(
                    "✅ Story updated successfully"
                );


                callback(
                    null,
                    result
                );
            }
        );
    },


    // =========================================
    // DELETE STORY
    // =========================================

    delete: (id, callback) => {

        const query = `
            DELETE FROM stories
            WHERE id = ?
        `;


        db.query(
            query,
            [id],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Story DELETE Error:",
                        err
                    );

                    return callback(err);
                }


                console.log(
                    "🗑️ Story deleted:",
                    id
                );

                console.log(
                    "🗑️ Its LONGBLOB image was deleted with the row."
                );


                callback(
                    null,
                    result
                );
            }
        );
    },


    // =========================================
    // SEARCH STORIES
    // =========================================

    search: (searchTerm, callback) => {

        const query = `
            SELECT *
            FROM stories
            WHERE title LIKE ?
               OR description LIKE ?
               OR story LIKE ?
            ORDER BY id DESC
        `;


        const searchPattern =
            `%${searchTerm}%`;


        db.query(
            query,
            [
                searchPattern,
                searchPattern,
                searchPattern
            ],
            callback
        );
    },


    // =========================================
    // FIND ALL STORIES - ASYNC
    // =========================================

    async findAll() {

        const sql = `
            SELECT *
            FROM stories
            ORDER BY id DESC
        `;


        return await queryAsync(sql);
    }
};


// =========================================
// EXPORT
// =========================================

module.exports = Story;

