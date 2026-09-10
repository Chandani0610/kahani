const db = require("../config/db");

const Newsletter = {
    // Get all subscribers
    getAll: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get single subscriber by ID
    getById: (id, callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Get multiple subscribers by IDs
    getByIds: (ids, callback) => {
        const placeholders = ids.map(() => '?').join(',');
        const query = `SELECT *, subscribed_at AS created_at FROM newsletters WHERE id IN (${placeholders})`;
        db.query(query, ids, callback);
    },

    // Get subscriber by email
    getByEmail: (email, callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE email = ?";
        db.query(query, [email], callback);
    },

    // Create new subscriber
    create: (email, name, callback) => {
        const query = "INSERT INTO newsletters (email, status, subscribed_at) VALUES (?, 'active', NOW())";
        db.query(query, [email], callback);
    },

    // Update subscriber status
    updateStatus: (id, status, callback) => {
        const query = "UPDATE newsletters SET status = ? WHERE id = ?";
        db.query(query, [status, id], callback);
    },

    // Update subscriber email
    updateEmail: (id, email, callback) => {
        const query = "UPDATE newsletters SET email = ? WHERE id = ?";
        db.query(query, [email, id], callback);
    },

    // Mark as read
    markAsRead: (id, callback) => {
        callback(null, { affectedRows: 1 });
    },

    // Mark as replied
    markAsReplied: (id, callback) => {
        callback(null, { affectedRows: 1 });
    },

    // Unsubscribe (delete)
    delete: (id, callback) => {
        const query = "DELETE FROM newsletters WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Delete by email (unsubscribe)
    deleteByEmail: (email, callback) => {
        const query = "DELETE FROM newsletters WHERE email = ?";
        db.query(query, [email], callback);
    },

    // Get active subscribers
    getActive: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE status = 'active' ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get pending subscribers (not replied)
    getPending: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE status = 'active' ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get unread subscribers
    getUnread: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE status = 'active' ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get unreplied subscribers
    getUnreplied: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE status = 'active' ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get unsubscribed subscribers
    getUnsubscribed: (callback) => {
        const query = "SELECT *, subscribed_at AS created_at FROM newsletters WHERE status = 'inactive' ORDER BY subscribed_at DESC";
        db.query(query, callback);
    },

    // Get statistics
    getStats: (callback) => {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                0 as pending,
                0 as unread,
                0 as unreplied,
                SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as unsubscribed
            FROM newsletters
        `;
        db.query(query, callback);
    }
};

module.exports = Newsletter;