// src/services/storyService.js

import api from "./api";

// =====================================================
// CONFIG
// =====================================================

const STORIES_CACHE_TIME = 30 * 1000;

// =====================================================
// CACHE - ALL STORIES
// =====================================================

let storiesCache = null;
let storiesCacheTime = 0;
let storiesRequestPromise = null;

// =====================================================
// CACHE - RECENT STORIES
// =====================================================

let recentStoriesCache = {};
let recentStoriesCacheTime = {};
let recentStoriesRequestPromises = {};

// =====================================================
// IMAGE HELPERS
// =====================================================

const isBase64Image = (value) => {
    return (
        typeof value === "string" &&
        value.startsWith("data:image/")
    );
};

const isFile = (value) => {
    return (
        typeof File !== "undefined" &&
        value instanceof File
    );
};

const isBlob = (value) => {
    return (
        typeof Blob !== "undefined" &&
        value instanceof Blob
    );
};

const isUploadableImage = (value) => {
    return isFile(value) || isBlob(value);
};

// =====================================================
// IMAGE MIME DETECTION
// =====================================================

const getMimeTypeFromBytes = (bytes) => {
    if (!bytes || bytes.length < 4) {
        return null;
    }

    // JPEG
    if (
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
    ) {
        return "image/jpeg";
    }

    // PNG
    if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
    ) {
        return "image/png";
    }

    // GIF
    if (bytes.length >= 6) {
        const header = String.fromCharCode(
            ...bytes.slice(0, 6)
        );

        if (
            header === "GIF87a" ||
            header === "GIF89a"
        ) {
            return "image/gif";
        }
    }

    // WEBP
    if (bytes.length >= 12) {
        const riff = String.fromCharCode(
            ...bytes.slice(0, 4)
        );

        const webp = String.fromCharCode(
            ...bytes.slice(8, 12)
        );

        if (
            riff === "RIFF" &&
            webp === "WEBP"
        ) {
            return "image/webp";
        }
    }

    // AVIF
    if (bytes.length >= 12) {
        const ftyp = String.fromCharCode(
            ...bytes.slice(4, 8)
        );

        const brand = String.fromCharCode(
            ...bytes.slice(8, 12)
        );

        if (
            ftyp === "ftyp" &&
            (
                brand === "avif" ||
                brand === "avis"
            )
        ) {
            return "image/avif";
        }
    }

    return null;
};

// =====================================================
// MIME TYPE -> FORMAT
// =====================================================

const getImageFormat = (mimeType) => {
    const formats = {
        "image/jpeg": "JPEG",
        "image/jpg": "JPEG",
        "image/png": "PNG",
        "image/gif": "GIF",
        "image/webp": "WEBP",
        "image/svg+xml": "SVG",
        "image/avif": "AVIF",
    };

    return formats[mimeType] || null;
};

// =====================================================
// IMAGE EXISTS VALUE
// =====================================================

const isTruthyImageFlag = (value) => {
    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true" ||
        value === "TRUE"
    );
};

// =====================================================
// NORMALIZE IMAGE METADATA
// =====================================================

const normalizeImageMetadata = (
    metadata,
    image = null
) => {
    const source =
        metadata &&
        typeof metadata === "object"
            ? metadata
            : {};

    let exists =
        isTruthyImageFlag(source.exists) ||
        isTruthyImageFlag(source.has_image) ||
        isTruthyImageFlag(source.hasImage);

    let mimeType =
        source.mime_type ||
        source.mimeType ||
        source.type ||
        null;

    let format =
        source.format ||
        null;

    let size = Number(
        source.size ??
        source.image_size ??
        source.imageSize ??
        source.bytes ??
        0
    );

    if (!Number.isFinite(size)) {
        size = 0;
    }

    // =================================================
    // BASE64 IMAGE
    // =================================================

    if (isBase64Image(image)) {
        exists = true;

        if (!mimeType) {
            const match = image.match(
                /^data:(image\/[^;]+);base64,/i
            );

            if (match?.[1]) {
                mimeType = match[1];
            }
        }

        if (!size) {
            try {
                const base64 = image.split(",")[1];

                if (base64) {
                    size = Math.floor(
                        (base64.length * 3) / 4
                    );
                }
            } catch {
                // Ignore
            }
        }
    }

    // =================================================
    // FILE / BLOB
    // =================================================

    if (isUploadableImage(image)) {
        exists = true;

        if (!mimeType && image.type) {
            mimeType = image.type;
        }

        if (!size && image.size) {
            size = image.size;
        }
    }

    if (!format && mimeType) {
        format = getImageFormat(mimeType);
    }

    return {
        exists,
        mime_type: mimeType,
        format,
        size,
    };
};

// =====================================================
// BUFFER OBJECT -> DATA URL
// =====================================================

const bufferObjectToDataUrl = (
    bufferObject,
    metadata = null
) => {
    if (
        !bufferObject ||
        bufferObject.type !== "Buffer" ||
        !Array.isArray(bufferObject.data)
    ) {
        return "";
    }

    try {
        const bytes = bufferObject.data;

        const detectedMime =
            getMimeTypeFromBytes(bytes);

        const metadataMime =
            metadata?.mime_type ||
            metadata?.mimeType ||
            null;

        const mimeType =
            metadataMime ||
            detectedMime;

        if (!mimeType) {
            console.warn(
                "⚠️ Unable to detect image MIME type"
            );

            return "";
        }

        const chunkSize = 0x8000;

        let binary = "";

        for (
            let i = 0;
            i < bytes.length;
            i += chunkSize
        ) {
            const chunk = bytes.slice(
                i,
                i + chunkSize
            );

            binary += String.fromCharCode(
                ...chunk
            );
        }

        const base64 =
            window.btoa(binary);

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.warn(
            "⚠️ Could not convert image Buffer:",
            error
        );

        return "";
    }
};

// =====================================================
// EXTRACT SINGLE STORY
// =====================================================

const extractStoryResponse = (
    responseData
) => {
    if (!responseData) {
        return null;
    }

    // Direct object
    if (
        typeof responseData === "object" &&
        !Array.isArray(responseData) &&
        (
            responseData.id !== undefined ||
            responseData._id !== undefined ||
            responseData.title !== undefined
        )
    ) {
        return responseData;
    }

    // { story: {...} }
    if (
        responseData.story &&
        typeof responseData.story === "object" &&
        !Array.isArray(responseData.story)
    ) {
        return responseData.story;
    }

    // { data: {...} }
    if (
        responseData.data &&
        typeof responseData.data === "object" &&
        !Array.isArray(responseData.data)
    ) {
        if (
            responseData.data.story &&
            typeof responseData.data.story === "object"
        ) {
            return responseData.data.story;
        }

        return responseData.data;
    }

    return null;
};

// =====================================================
// EXTRACT STORY ARRAY
// =====================================================

const extractStoriesResponse = (
    responseData
) => {
    if (Array.isArray(responseData)) {
        return responseData;
    }

    if (
        responseData &&
        typeof responseData === "object"
    ) {
        if (
            Array.isArray(
                responseData.stories
            )
        ) {
            return responseData.stories;
        }

        if (
            Array.isArray(
                responseData.data
            )
        ) {
            return responseData.data;
        }

        if (
            Array.isArray(
                responseData.results
            )
        ) {
            return responseData.results;
        }

        if (
            responseData.data &&
            typeof responseData.data === "object"
        ) {
            if (
                Array.isArray(
                    responseData.data.stories
                )
            ) {
                return responseData.data.stories;
            }

            if (
                Array.isArray(
                    responseData.data.results
                )
            ) {
                return responseData.data.results;
            }
        }
    }

    return [];
};

// =====================================================
// GET STORY IMAGE URL
// =====================================================

const getStoryImageUrl = (story) => {
    if (!story) {
        return "";
    }

    const id =
        story.id ??
        story._id ??
        null;

    if (!id) {
        return "";
    }

    /*
     * IMPORTANT:
     *
     * If api.js has:
     *
     * baseURL: "http://localhost:5000/api"
     *
     * result becomes:
     *
     * http://localhost:5000/api/stories/1/image
     *
     * If baseURL is "/api":
     *
     * result becomes:
     *
     * /api/stories/1/image
     */

    const baseURL = String(
        api?.defaults?.baseURL || ""
    ).replace(/\/+$/, "");

    if (baseURL) {
        return `${baseURL}/stories/${id}/image`;
    }

    // Safe fallback
    return `/api/stories/${id}/image`;
};

// =====================================================
// NORMALIZE STORY
// =====================================================

const normalizeStory = (rawStory) => {
    if (!rawStory) {
        return null;
    }

    const story =
        extractStoryResponse(rawStory) ||
        rawStory;

    if (
        !story ||
        typeof story !== "object" ||
        Array.isArray(story)
    ) {
        return null;
    }

    // =================================================
    // IMPORTANT IMAGE FLAG FIX
    // =================================================

    const imageExists =
        isTruthyImageFlag(
            story.has_image
        ) ||
        isTruthyImageFlag(
            story.hasImage
        ) ||
        isTruthyImageFlag(
            story.image_exists
        ) ||
        isTruthyImageFlag(
            story.imageExists
        ) ||
        isTruthyImageFlag(
            story.image_metadata?.exists
        ) ||
        isTruthyImageFlag(
            story.image_metadata?.has_image
        ) ||
        isTruthyImageFlag(
            story.image_metadata?.hasImage
        );

    // =================================================
    // IMAGE METADATA
    // =================================================

    const backendMetadata =
        story.image_metadata ||
        story.imageMetadata ||
        {
            exists: imageExists,

            mime_type:
                story.image_mime_type ||
                story.imageMimeType ||
                null,

            format:
                story.image_format ||
                story.imageFormat ||
                null,

            size:
                story.image_size ||
                story.imageSize ||
                0,
        };

    // =================================================
    // IMAGE
    // =================================================

    let image = "";
    let imageUrl = "";

    // -------------------------------------------------
    // Base64
    // -------------------------------------------------

    if (
        typeof story.image === "string" &&
        isBase64Image(story.image)
    ) {
        image = story.image;
        imageUrl = story.image;
    }

    // -------------------------------------------------
    // Buffer
    // -------------------------------------------------

    else if (
        story.image &&
        typeof story.image === "object"
    ) {
        const converted =
            bufferObjectToDataUrl(
                story.image,
                backendMetadata
            );

        if (converted) {
            image = converted;
            imageUrl = converted;
        }
    }

    // -------------------------------------------------
    // Existing image URL
    // -------------------------------------------------

    else if (
        typeof story.image === "string" &&
        story.image.trim()
    ) {
        image = story.image.trim();
        imageUrl = story.image.trim();
    }

    // -------------------------------------------------
    // Backend image endpoint
    // -------------------------------------------------

    else if (imageExists) {
        imageUrl =
            getStoryImageUrl(story);
    }

    // =================================================
    // IMAGE METADATA
    // =================================================

    const imageMetadata =
        normalizeImageMetadata(
            backendMetadata,
            image
        );

    const hasImage =
        imageMetadata.exists ||
        imageExists ||
        Boolean(imageUrl);

    // =================================================
    // BANNER IMAGE
    // =================================================

    let bannerImage = "";
    let bannerImageUrl = "";

    if (
        typeof story.banner_image === "string" &&
        story.banner_image.trim()
    ) {
        bannerImage =
            story.banner_image.trim();

        bannerImageUrl =
            story.banner_image.trim();
    }

    // =================================================
    // RETURN
    // =================================================

    return {
        ...story,

        _id:
            story._id ??
            story.id ??
            null,

        id:
            story.id ??
            story._id ??
            null,

        title:
            story.title ||
            "",

        category:
            story.category ||
            "",

        category_id:
            story.category_id ??
            story.categoryId ??
            "",

        age_group:
            story.age_group ||
            story.ageGroup ||
            "",

        read_time:
            story.read_time ||
            story.readTime ||
            "",

        author:
            story.author ||
            "",

        author_id:
            story.author_id ??
            story.authorId ??
            null,

        description:
            story.description ||
            "",

        language:
            story.language ||
            "English",

        status:
            story.status ||
            "published",

        story:
            typeof story.story === "string"
                ? story.story
                : (
                    typeof story.content === "string"
                        ? story.content
                        : ""
                ),

        content:
            typeof story.content === "string"
                ? story.content
                : (
                    typeof story.story === "string"
                        ? story.story
                        : ""
                ),

        views:
            Number(story.views) || 0,

        likes:
            Number(story.likes) || 0,

        featured:
            isTruthyImageFlag(
                story.featured
            ),

        created_at:
            story.created_at ||
            story.createdAt ||
            null,

        updated_at:
            story.updated_at ||
            story.updatedAt ||
            null,

        // Image
        image,

        image_url:
            imageUrl,

        has_image:
            hasImage,

        image_metadata: {
            ...imageMetadata,
            exists: hasImage,
        },

        image_mime_type:
            imageMetadata.mime_type,

        image_format:
            imageMetadata.format,

        image_size:
            imageMetadata.size,

        // Banner
        banner_image:
            bannerImage,

        banner_image_url:
            bannerImageUrl,
    };
};

// =====================================================
// NORMALIZE STORIES
// =====================================================

const normalizeStories = (
    responseData
) => {
    const stories =
        extractStoriesResponse(
            responseData
        );

    return stories
        .map(normalizeStory)
        .filter(Boolean);
};

// =====================================================
// BUILD FORM DATA
// =====================================================

const buildStoryFormData = (data) => {
    const formData =
        new FormData();

    if (data.title !== undefined) {
        formData.append(
            "title",
            data.title?.trim() || ""
        );
    }

    if (
        data.category_id !== undefined
    ) {
        formData.append(
            "category_id",
            data.category_id ?? ""
        );
    }

    if (
        data.age_group !== undefined
    ) {
        formData.append(
            "age_group",
            data.age_group || ""
        );
    }

    if (
        data.author !== undefined
    ) {
        formData.append(
            "author",
            data.author || ""
        );
    }

    if (
        data.description !== undefined
    ) {
        formData.append(
            "description",
            data.description || ""
        );
    }

    if (
        data.status !== undefined
    ) {
        formData.append(
            "status",
            data.status || "published"
        );
    }

    if (
        data.language !== undefined
    ) {
        formData.append(
            "language",
            data.language || "English"
        );
    }

    const storyContent =
        typeof data.content === "string" &&
        data.content.trim()
            ? data.content
            : (
                typeof data.story === "string"
                    ? data.story
                    : ""
            );

    formData.append(
        "story",
        storyContent
    );

    // =================================================
    // READ TIME
    // =================================================

    const wordCount =
        storyContent
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

    const calculatedReadTime =
        Math.max(
            1,
            Math.ceil(
                wordCount / 200
            )
        );

    const readTime =
        data.read_time ||
        `${calculatedReadTime} Min Read`;

    formData.append(
        "read_time",
        readTime
    );

    // =================================================
    // IMAGE
    // =================================================

    if (
        isUploadableImage(data.image)
    ) {
        formData.append(
            "image",
            data.image,
            isFile(data.image)
                ? data.image.name
                : "story-image"
        );

        console.log(
            "📤 Story image attached"
        );

        console.log({
            name:
                isFile(data.image)
                    ? data.image.name
                    : "story-image",

            type:
                data.image.type,

            size:
                data.image.size,

            storage:
                "MySQL LONGBLOB",
        });
    }

    // =================================================
    // REMOVE IMAGE
    // =================================================

    if (
        data.remove_image === true ||
        data.remove_image === "true"
    ) {
        formData.append(
            "remove_image",
            "true"
        );

        console.log(
            "🗑️ Image removal requested"
        );
    }

    // =================================================
    // BANNER IMAGE
    // =================================================

    if (
        data.banner_image !== undefined &&
        typeof data.banner_image === "string" &&
        data.banner_image.trim()
    ) {
        formData.append(
            "banner_image",
            data.banner_image.trim()
        );
    }

    return formData;
};

// =====================================================
// VALIDATE IMAGE
// =====================================================

const validateImageFile = (file) => {
    if (!file) {
        throw new Error(
            "Image file is required"
        );
    }

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/avif",
    ];

    const extension =
        file.name
            ?.split(".")
            .pop()
            ?.toLowerCase();

    const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "avif",
    ];

    if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(
            extension
        )
    ) {
        throw new Error(
            "Please upload JPG, JPEG, PNG, GIF, WEBP or AVIF image."
        );
    }

    if (
        file.size >
        10 * 1024 * 1024
    ) {
        throw new Error(
            "Image size must be less than 10MB."
        );
    }

    return true;
};

// =====================================================
// CLEAR CACHE
// =====================================================

const clearStoriesCache = () => {
    storiesCache = null;
    storiesCacheTime = 0;

    recentStoriesCache = {};
    recentStoriesCacheTime = {};
    recentStoriesRequestPromises = {};

    console.log(
        "🧹 Story cache cleared"
    );
};

// =====================================================
// STORY SERVICE
// =====================================================

export const storyService = {

    // ===================================================
    // UPLOAD IMAGE VALIDATION
    // ===================================================

    uploadImage: async (file) => {
        validateImageFile(file);

        console.log(
            "✅ Story image validated"
        );

        return file;
    },

    // ===================================================
    // GET ALL STORIES
    // ===================================================

    getAll: async (
        forceRefresh = false
    ) => {
        const now = Date.now();

        // Cache
        if (
            !forceRefresh &&
            storiesCache &&
            now - storiesCacheTime <
                STORIES_CACHE_TIME
        ) {
            console.log(
                "⚡ Stories loaded from cache"
            );

            return storiesCache;
        }

        // Existing request
        if (
            !forceRefresh &&
            storiesRequestPromise
        ) {
            console.log(
                "♻️ Reusing existing stories request"
            );

            return storiesRequestPromise;
        }

        storiesRequestPromise =
            (async () => {
                try {
                    console.log(
                        "📖 Fetching stories from API..."
                    );

                    const response =
                        await api.get(
                            "/stories"
                        );

                    const normalized =
                        normalizeStories(
                            response.data
                        );

                    storiesCache =
                        normalized;

                    storiesCacheTime =
                        Date.now();

                    console.log(
                        `📖 Loaded ${normalized.length} stories`
                    );

                    return normalized;
                } catch (error) {
                    console.error(
                        "❌ Error fetching stories:",
                        error
                    );

                    storiesCache = null;
                    storiesCacheTime = 0;

                    return [];
                } finally {
                    storiesRequestPromise =
                        null;
                }
            })();

        return storiesRequestPromise;
    },

    // ===================================================
    // GET STORY BY ID
    // ===================================================

    getById: async (id) => {
        try {
            if (!id) {
                throw new Error(
                    "Story ID is required"
                );
            }

            const response =
                await api.get(
                    `/stories/${id}`
                );

            const rawStory =
                extractStoryResponse(
                    response.data
                );

            const story =
                normalizeStory(
                    rawStory
                );

            if (!story) {
                throw new Error(
                    "Invalid story data received from server"
                );
            }

            return story;
        } catch (error) {
            console.error(
                `❌ Error fetching story ${id}:`,
                error
            );

            throw error;
        }
    },

    // ===================================================
    // CREATE
    // ===================================================

    create: async (data) => {
        try {
            if (!data.title?.trim()) {
                throw new Error(
                    "Title is required"
                );
            }

            if (
                !data.story?.trim() &&
                !data.content?.trim()
            ) {
                throw new Error(
                    "Story content is required"
                );
            }

            if (
                data.image &&
                isUploadableImage(data.image)
            ) {
                validateImageFile(
                    data.image
                );
            }

            console.log(
                "📝 Creating story..."
            );

            const formData =
                buildStoryFormData(
                    data
                );

            const response =
                await api.post(
                    "/stories",
                    formData
                );

            if (!response.data) {
                throw new Error(
                    "No data received from server"
                );
            }

            const rawStory =
                extractStoryResponse(
                    response.data
                );

            const createdStory =
                normalizeStory(
                    rawStory
                );

            if (!createdStory) {
                throw new Error(
                    "Invalid created story received from server"
                );
            }

            clearStoriesCache();

            console.log(
                "✅ Story created successfully"
            );

            return createdStory;
        } catch (error) {
            console.error(
                "❌ Error creating story:",
                error
            );

            throw error;
        }
    },

    // ===================================================
    // UPDATE
    // ===================================================

    update: async (
        id,
        data
    ) => {
        try {
            if (!id) {
                throw new Error(
                    "Story ID is required"
                );
            }

            if (!data.title?.trim()) {
                throw new Error(
                    "Title is required"
                );
            }

            if (
                !data.story?.trim() &&
                !data.content?.trim()
            ) {
                throw new Error(
                    "Story content is required"
                );
            }

            if (
                data.image &&
                isUploadableImage(data.image)
            ) {
                validateImageFile(
                    data.image
                );
            }

            console.log(
                `📝 Updating story ${id}...`
            );

            const formData =
                buildStoryFormData(
                    data
                );

            const response =
                await api.put(
                    `/stories/${id}`,
                    formData
                );

            if (!response.data) {
                throw new Error(
                    "No data received from server"
                );
            }

            const rawStory =
                extractStoryResponse(
                    response.data
                );

            const updatedStory =
                normalizeStory(
                    rawStory
                );

            if (!updatedStory) {
                throw new Error(
                    "Invalid updated story received from server"
                );
            }

            clearStoriesCache();

            console.log(
                "✅ Story updated successfully"
            );

            return updatedStory;
        } catch (error) {
            console.error(
                `❌ Error updating story ${id}:`,
                error
            );

            throw error;
        }
    },

    // ===================================================
    // DELETE
    // ===================================================

    delete: async (id) => {
        try {
            if (!id) {
                throw new Error(
                    "Story ID is required"
                );
            }

            console.log(
                `🗑️ Deleting story ${id}...`
            );

            const response =
                await api.delete(
                    `/stories/${id}`
                );

            clearStoriesCache();

            console.log(
                "✅ Story deleted successfully"
            );

            return response.data;
        } catch (error) {
            console.error(
                `❌ Error deleting story ${id}:`,
                error
            );

            throw error;
        }
    },

    // ===================================================
    // CATEGORY
    // ===================================================

    getByCategory: async (
        categoryId
    ) => {
        try {
            if (!categoryId) {
                return [];
            }

            const response =
                await api.get(
                    `/stories/category/${categoryId}`
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                `❌ Error fetching category ${categoryId}:`,
                error
            );

            return [];
        }
    },

    // ===================================================
    // AGE GROUP
    // ===================================================

    getByAgeGroup: async (
        ageGroup
    ) => {
        try {
            if (!ageGroup) {
                return [];
            }

            const response =
                await api.get(
                    `/stories/age-group/${encodeURIComponent(
                        ageGroup
                    )}`
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                `❌ Error fetching age group ${ageGroup}:`,
                error
            );

            return [];
        }
    },

    // ===================================================
    // SEARCH
    // ===================================================

    search: async (query) => {
        try {
            if (!query?.trim()) {
                return [];
            }

            const response =
                await api.get(
                    `/stories/search?q=${encodeURIComponent(
                        query.trim()
                    )}`
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                `❌ Error searching stories:`,
                error
            );

            return [];
        }
    },

    // ===================================================
    // FEATURED
    // ===================================================

    getFeatured: async () => {
        try {
            const response =
                await api.get(
                    "/stories/featured"
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                "❌ Error fetching featured stories:",
                error
            );

            return [];
        }
    },

    // ===================================================
    // GET RECENT STORIES
    // ===================================================

    getRecent: async (
        count = 4,
        forceRefresh = false
    ) => {
        try {
            const limit =
                Math.max(
                    1,
                    Math.min(
                        Number(count) || 4,
                        20
                    )
                );

            const cacheKey =
                String(limit);

            const now =
                Date.now();

            // -------------------------------------------------
            // CACHE
            // -------------------------------------------------

            if (
                !forceRefresh &&
                recentStoriesCache[
                    cacheKey
                ] &&
                now -
                    recentStoriesCacheTime[
                        cacheKey
                    ] <
                    STORIES_CACHE_TIME
            ) {
                console.log(
                    `⚡ Recent ${limit} stories loaded from cache`
                );

                return recentStoriesCache[
                    cacheKey
                ];
            }

            // -------------------------------------------------
            // SAME REQUEST
            // -------------------------------------------------

            if (
                !forceRefresh &&
                recentStoriesRequestPromises[
                    cacheKey
                ]
            ) {
                console.log(
                    `♻️ Reusing existing recent stories request (${limit})`
                );

                return recentStoriesRequestPromises[
                    cacheKey
                ];
            }

            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            const requestPromise =
                (async () => {
                    try {
                        console.log(
                            `📖 Fetching ${limit} recent stories...`
                        );

                        const response =
                            await api.get(
                                `/stories/recent?limit=${limit}`
                            );

                        const normalized =
                            normalizeStories(
                                response.data
                            );

                        recentStoriesCache[
                            cacheKey
                        ] = normalized;

                        recentStoriesCacheTime[
                            cacheKey
                        ] = Date.now();

                        console.log(
                            `✅ Loaded ${normalized.length} recent stories`
                        );

                        // Debug image URL
                        normalized.forEach(
                            (story) => {
                                console.log(
                                    "🖼️ Recent Story Image:",
                                    {
                                        id: story.id,
                                        title: story.title,
                                        has_image:
                                            story.has_image,
                                        image_url:
                                            story.image_url,
                                    }
                                );
                            }
                        );

                        return normalized;
                    } catch (error) {
                        console.error(
                            "❌ Error fetching recent stories:",
                            error
                        );

                        delete recentStoriesCache[
                            cacheKey
                        ];

                        delete recentStoriesCacheTime[
                            cacheKey
                        ];

                        return [];
                    } finally {
                        delete recentStoriesRequestPromises[
                            cacheKey
                        ];
                    }
                })();

            recentStoriesRequestPromises[
                cacheKey
            ] = requestPromise;

            return requestPromise;
        } catch (error) {
            console.error(
                "❌ Unexpected error in getRecent():",
                error
            );

            return [];
        }
    },

    // ===================================================
    // TRENDING
    // ===================================================

    getTrending: async () => {
        try {
            const response =
                await api.get(
                    "/stories/trending"
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                "❌ Error fetching trending stories:",
                error
            );

            return [];
        }
    },

    // ===================================================
    // POPULAR
    // ===================================================

    getPopular: async () => {
        try {
            const response =
                await api.get(
                    "/stories/popular"
                );

            return normalizeStories(
                response.data
            );
        } catch (error) {
            console.error(
                "❌ Error fetching popular stories:",
                error
            );

            return [];
        }
    },

    // ===================================================
    // STATS
    // ===================================================

    getStats: async () => {
        try {
            const response =
                await api.get(
                    "/stories/stats"
                );

            return (
                response.data || {
                    total: 0,
                    byCategory: {},
                    byAgeGroup: {},
                }
            );
        } catch (error) {
            console.error(
                "❌ Error fetching story stats:",
                error
            );

            return {
                total: 0,
                byCategory: {},
                byAgeGroup: {},
            };
        }
    },

    // ===================================================
    // CLEAR CACHE
    // ===================================================

    clearCache: () => {
        clearStoriesCache();
    },

    // ===================================================
    // HAS STORED IMAGE
    // ===================================================

    hasStoredImage: (story) => {
        if (!story) {
            return false;
        }

        if (
            isTruthyImageFlag(
                story.image_metadata?.exists
            )
        ) {
            return true;
        }

        if (
            isTruthyImageFlag(
                story.has_image
            )
        ) {
            return true;
        }

        if (
            isTruthyImageFlag(
                story.hasImage
            )
        ) {
            return true;
        }

        const image =
            story.image ||
            story.image_url ||
            "";

        return isBase64Image(
            image
        );
    },

    // ===================================================
    // HAS VALID IMAGE
    // ===================================================

    hasValidImage: (story) => {
        if (!story) {
            return false;
        }

        const image =
            story.image ||
            story.image_url ||
            "";

        if (
            isBase64Image(image)
        ) {
            return true;
        }

        if (
            isUploadableImage(image)
        ) {
            return true;
        }

        if (
            typeof image === "string" &&
            image.trim()
        ) {
            return true;
        }

        if (
            isTruthyImageFlag(
                story.has_image
            ) ||
            isTruthyImageFlag(
                story.hasImage
            ) ||
            isTruthyImageFlag(
                story.image_metadata?.exists
            )
        ) {
            return true;
        }

        return false;
    },

    // ===================================================
    // GET VALID IMAGE
    // ===================================================

    getValidImage: (story) => {
        if (!story) {
            return "";
        }

        const image =
            story.image ||
            story.image_url ||
            "";

        // Base64
        if (
            isBase64Image(image)
        ) {
            return image;
        }

        // File / Blob
        if (
            isUploadableImage(image)
        ) {
            try {
                return URL.createObjectURL(
                    image
                );
            } catch (error) {
                console.warn(
                    "⚠️ Could not create image preview:",
                    error
                );
            }
        }

        // URL
        if (
            typeof image === "string" &&
            image.trim()
        ) {
            return image.trim();
        }

        // Backend image
        if (
            isTruthyImageFlag(
                story.has_image
            ) ||
            isTruthyImageFlag(
                story.hasImage
            ) ||
            isTruthyImageFlag(
                story.image_metadata?.exists
            )
        ) {
            return getStoryImageUrl(
                story
            );
        }

        return "";
    },

    // ===================================================
    // BANNER IMAGE
    // ===================================================

    getBannerImage: (story) => {
        if (!story) {
            return "";
        }

        const banner =
            story.banner_image ||
            story.banner_image_url ||
            "";

        if (
            typeof banner === "string" &&
            banner.trim()
        ) {
            return banner.trim();
        }

        return "";
    },

    // ===================================================
    // IMAGE METADATA
    // ===================================================

    getImageMetadata: (story) => {
        if (!story) {
            return {
                exists: false,
                mime_type: null,
                format: null,
                size: 0,
            };
        }

        return normalizeImageMetadata(
            story.image_metadata,
            story.image ||
            story.image_url
        );
    },

    // ===================================================
    // FORMATTED IMAGE SIZE
    // ===================================================

    getFormattedImageSize: (
        story
    ) => {
        const metadata =
            storyService.getImageMetadata(
                story
            );

        const bytes =
            Number(metadata.size) || 0;

        if (bytes <= 0) {
            return "0 B";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (
            bytes <
            1024 * 1024
        ) {
            return `${(
                bytes / 1024
            ).toFixed(2)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;
    },

    // ===================================================
    // VALID IMAGE URL
    // ===================================================

    isValidImageUrl: (
        value
    ) => {
        return (
            isBase64Image(value) ||
            (
                typeof value === "string" &&
                (
                    value.includes(
                        "/stories/"
                    ) &&
                    value.includes(
                        "/image"
                    )
                )
            )
        );
    },

    // ===================================================
    // HELPERS EXPORT
    // ===================================================

    isBase64Image,

    isUploadableImage,

    // ===================================================
    // FULL IMAGE
    // ===================================================

    getFullImageUrl: (
        image
    ) => {
        if (
            isBase64Image(image)
        ) {
            return image;
        }

        if (
            isUploadableImage(image)
        ) {
            try {
                return URL.createObjectURL(
                    image
                );
            } catch {
                return "";
            }
        }

        if (
            typeof image === "string" &&
            image.trim()
        ) {
            return image.trim();
        }

        return "";
    },

    // ===================================================
    // ALIASES FOR COMPATIBILITY
    // ===================================================
    getStories: async (params) => {
        return storyService.getAll();
    },

    getStoryById: async (id) => {
        return storyService.getById(id);
    },
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default storyService;