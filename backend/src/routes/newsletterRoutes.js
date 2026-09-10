const express = require("express");
const router = express.Router();
const newsletterController = require("../controllers/newsletterController");

// ============= GET Routes =============
router.get("/", newsletterController.getSubscribers);
router.get("/active", newsletterController.getActiveSubscribers);
router.get("/pending", newsletterController.getPending);
router.get("/unread", newsletterController.getUnread);
router.get("/unreplied", newsletterController.getUnreplied);
router.get("/unsubscribed", newsletterController.getUnsubscribed);
router.get("/stats", newsletterController.getStats);
router.get("/export/csv", newsletterController.exportCSV);
router.get("/:id", newsletterController.getSubscriberById);

// ============= POST Routes =============
router.post("/", newsletterController.subscribe);
router.post("/unsubscribe", newsletterController.unsubscribeByEmail);
router.post("/:id/reply", newsletterController.sendReply);
router.post("/bulk-reply", newsletterController.sendBulkReply);

// ============= PUT Routes =============
router.put("/:id/status", newsletterController.updateSubscriberStatus);
router.put("/:id/email", newsletterController.updateSubscriberEmail);
router.put("/:id/read", newsletterController.markAsRead);
router.put("/:id/replied", newsletterController.markAsReplied);

// ============= DELETE Routes =============
router.delete("/:id", newsletterController.unsubscribe);

module.exports = router;