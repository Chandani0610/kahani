// src/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// ============= GET Routes =============
// Get all contacts
router.get("/", contactController.getContacts);

// Get contacts by status (must be before /:id to avoid conflict)
router.get("/pending", contactController.getPending);
router.get("/unread", contactController.getUnread);
router.get("/unreplied", contactController.getUnreplied);
router.get("/replied", contactController.getReplied);
router.get("/stats", contactController.getStats);
router.get("/export/csv", contactController.exportCSV);
router.get("/status/:status", contactController.getContactsByStatus);

// Get single contact (must be last)
router.get("/:id", contactController.getContactById);

// ============= POST Routes =============
// Create new contact
router.post("/", contactController.createContact);

// Send reply to contact
router.post("/:id/reply", contactController.sendReply);

// Send bulk replies
router.post("/bulk-reply", contactController.sendBulkReply);

// ============= PUT Routes =============
// Update contact status
router.put("/:id/status", contactController.updateContactStatus);

// Mark contact as read
router.put("/:id/read", contactController.markAsRead);

// Mark contact as replied
router.put("/:id/replied", contactController.markAsReplied);

// ============= DELETE Routes =============
// Delete contact
router.delete("/:id", contactController.deleteContact);

module.exports = router;