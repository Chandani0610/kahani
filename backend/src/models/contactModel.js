const db = require("../config/db");

const Contact = {
    // Get all contacts
    getAll: (callback) => {
        const query = "SELECT * FROM contacts ORDER BY created_at DESC";
        db.query(query, callback);
    },

    // Get single contact by ID
    getById: (id, callback) => {
        const query = "SELECT * FROM contacts WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Get multiple contacts by IDs
    getByIds: (ids, callback) => {
        const placeholders = ids.map(() => '?').join(',');
        const query = `SELECT * FROM contacts WHERE id IN (${placeholders})`;
        db.query(query, ids, callback);
    },

    // Create new contact message - FIXED: removed read_status and replied
    create: (contactData, callback) => {
        const { name, email, subject, message } = contactData;
        const query = `
            INSERT INTO contacts (name, email, subject, message, status) 
            VALUES (?, ?, ?, ?, 'pending')
        `;
        db.query(query, [name, email, subject, message], callback);
    },

    // Update contact status
    updateStatus: (id, status, callback) => {
        const query = "UPDATE contacts SET status = ? WHERE id = ?";
        db.query(query, [status, id], callback);
    },

    // Mark as read - FIXED: only update status
    markAsRead: (id, callback) => {
        const query = "UPDATE contacts SET status = 'read' WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Mark as replied - FIXED: only update status
    markAsReplied: (id, callback) => {
        const query = "UPDATE contacts SET status = 'read' WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Delete contact
    delete: (id, callback) => {
        const query = "DELETE FROM contacts WHERE id = ?";
        db.query(query, [id], callback);
    },

    // Get contacts by status
    getByStatus: (status, callback) => {
        const query = "SELECT * FROM contacts WHERE status = ? ORDER BY created_at DESC";
        db.query(query, [status], callback);
    },

    // Get pending contacts
    getPending: (callback) => {
        const query = "SELECT * FROM contacts WHERE status = 'pending' ORDER BY created_at DESC";
        db.query(query, callback);
    },

    // Get unread contacts - FIXED: use status = 'pending'
    getUnread: (callback) => {
        const query = "SELECT * FROM contacts WHERE status = 'pending' ORDER BY created_at DESC";
        db.query(query, callback);
    },

    // Get unreplied contacts - FIXED: use status = 'pending'
    getUnreplied: (callback) => {
        const query = "SELECT * FROM contacts WHERE status = 'pending' ORDER BY created_at DESC";
        db.query(query, callback);
    },

    // Get replied contacts - FIXED: use status = 'read'
    getReplied: (callback) => {
        const query = "SELECT * FROM contacts WHERE status = 'read' ORDER BY created_at DESC";
        db.query(query, callback);
    },

    // Get statistics - FIXED: simplified for existing schema
    getStats: (callback) => {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as replied,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as unreplied,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM contacts
        `;
        db.query(query, callback);
    }
};

module.exports = Contact;