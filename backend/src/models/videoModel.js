const db = require("../config/db");

const queryAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const Video = {
    // --- Existing callback-based methods ---
    getAll: (callback) => {
        const query = "SELECT * FROM videos ORDER BY id DESC";
        db.query(query, callback);
    },

    getById: (id, callback) => {
        const query = "SELECT * FROM videos WHERE id = ?";
        db.query(query, [id], callback);
    },

    getByCategory: (category, callback) => {
        const query = "SELECT * FROM videos WHERE category = ?";
        db.query(query, [category], callback);
    },

    create: (videoData, callback) => {
        const { title, description, youtube_url, thumbnail, category, duration } = videoData;
        const query = `
            INSERT INTO videos (title, description, youtube_url, thumbnail, category, duration) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [title, description, youtube_url, thumbnail, category, duration], callback);
    },

    update: (id, videoData, callback) => {
        const { title, description, youtube_url, thumbnail, category, duration } = videoData;
        const query = `
            UPDATE videos 
            SET title = ?, description = ?, youtube_url = ?, thumbnail = ?, category = ?, duration = ?
            WHERE id = ?
        `;
        db.query(query, [title, description, youtube_url, thumbnail, category, duration, id], callback);
    },

    delete: (id, callback) => {
        const query = "DELETE FROM videos WHERE id = ?";
        db.query(query, [id], callback);
    },

    // --- NEW: static async findAll (returns all videos) ---
    async findAll() {
        const sql = "SELECT * FROM videos ORDER BY id DESC";
        return await queryAsync(sql);
    }
};

module.exports = Video;