const Newsletter = require("../models/newsletterModel");
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// ============= GET Routes (Read) =============

// Get all subscribers
exports.getSubscribers = (req, res, next) => {
    Newsletter.getAll((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get single subscriber
exports.getSubscriberById = (req, res, next) => {
    const { id } = req.params;
    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Subscriber not found" 
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Get active subscribers
exports.getActiveSubscribers = (req, res, next) => {
    Newsletter.getActive((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get pending subscribers (not replied)
exports.getPending = (req, res, next) => {
    Newsletter.getPending((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get unread subscribers
exports.getUnread = (req, res, next) => {
    Newsletter.getUnread((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get unreplied subscribers
exports.getUnreplied = (req, res, next) => {
    Newsletter.getUnreplied((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get unsubscribed subscribers
exports.getUnsubscribed = (req, res, next) => {
    Newsletter.getUnsubscribed((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get statistics
exports.getStats = (req, res, next) => {
    Newsletter.getStats((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Export to CSV
exports.exportCSV = (req, res, next) => {
    Newsletter.getAll((err, results) => {
        if (err) return next(err);
        
        // Create CSV header
        let csv = 'ID,Name,Email,Status,Read Status,Replied,Subscribed At\n';
        
        // Add data rows
        results.forEach(item => {
            csv += `${item.id},"${item.name || ''}",${item.email},${item.status},${item.read_status},${item.replied ? 'Yes' : 'No'},${item.created_at}\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`newsletters-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    });
};

// ============= POST Routes (Create) =============

// Subscribe (create new subscriber)
exports.subscribe = (req, res, next) => {
    const { email, name } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false,
            error: "Email is required" 
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Invalid email format"
        });
    }

    // Check if email already exists
    Newsletter.getByEmail(email, (err, results) => {
        if (err) return next(err);
        
        if (results.length > 0) {
            // If exists and inactive, reactivate
            if (results[0].status === 'inactive') {
                Newsletter.updateStatus(results[0].id, 'active', (err, result) => {
                    if (err) return next(err);
                    return res.json({ 
                        success: true,
                        message: "Subscription reactivated successfully",
                        data: {
                            id: results[0].id,
                            email: results[0].email,
                            status: 'active'
                        }
                    });
                });
            } else {
                return res.status(400).json({ 
                    success: false,
                    error: "Email already subscribed" 
                });
            }
        } else {
            // Create new subscription
            Newsletter.create(email, name || null, (err, result) => {
                if (err) return next(err);
                
                // Get the newly created subscriber
                Newsletter.getById(result.insertId, (err, newSubscriber) => {
                    if (err) return next(err);
                    res.status(201).json({
                        success: true,
                        message: "Subscribed successfully",
                        data: newSubscriber[0]
                    });
                });
            });
        }
    });
};

// Unsubscribe by email
exports.unsubscribeByEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false,
            error: "Email is required" 
        });
    }

    Newsletter.getByEmail(email, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Email not found" 
            });
        }

        Newsletter.deleteByEmail(email, (err, result) => {
            if (err) return next(err);
            res.json({ 
                success: true,
                message: "Unsubscribed successfully",
                data: {
                    email: email
                }
            });
        });
    });
};

// Send single reply email
exports.sendReply = (req, res, next) => {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            error: "Subject and message are required"
        });
    }

    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Subscriber not found"
            });
        }

        const subscriber = results[0];
        
        // Send email
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
            to: subscriber.email,
            subject: subject,
            text: message
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                return res.status(500).json({
                    success: false,
                    error: "Failed to send email",
                    details: error.message
                });
            }
            
            // Mark as replied
            Newsletter.markAsReplied(id, (err) => {
                if (err) console.error('Error marking as replied:', err);
            });
            
            res.json({
                success: true,
                message: "Reply sent successfully",
                data: {
                    to: subscriber.email,
                    subject: subject
                }
            });
        });
    });
};

// Send bulk reply emails
exports.sendBulkReply = (req, res, next) => {
    const { ids, subject, message } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one subscriber ID is required"
        });
    }

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            error: "Subject and message are required"
        });
    }

    // Get all subscribers
    Newsletter.getByIds(ids, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No subscribers found"
            });
        }

        // Send emails to all
        const emailPromises = results.map(subscriber => {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
                to: subscriber.email,
                subject: subject,
                text: message
            };
            
            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(`Failed to send to ${subscriber.email}:`, error);
                        reject(error);
                    } else {
                        // Mark as replied
                        Newsletter.markAsReplied(subscriber.id, (err) => {
                            if (err) console.error('Error marking as replied:', err);
                        });
                        resolve(info);
                    }
                });
            });
        });

        Promise.allSettled(emailPromises)
            .then(results => {
                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                
                res.json({
                    success: true,
                    message: `Bulk reply sent: ${successful} successful, ${failed} failed`,
                    data: {
                        total: results.length,
                        successful: successful,
                        failed: failed
                    }
                });
            })
            .catch(error => {
                console.error('Bulk email error:', error);
                res.status(500).json({
                    success: false,
                    error: "Failed to send bulk replies"
                });
            });
    });
};

// ============= PUT Routes (Update) =============

// Update subscriber status
exports.updateSubscriberStatus = (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
            success: false,
            error: "Valid status (active/inactive) is required" 
        });
    }

    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Subscriber not found" 
            });
        }

        Newsletter.updateStatus(id, status, (err, result) => {
            if (err) return next(err);
            
            // Get updated subscriber
            Newsletter.getById(id, (err, updatedResult) => {
                if (err) return next(err);
                res.json({ 
                    success: true,
                    message: `Subscriber status updated to ${status}`,
                    data: updatedResult[0]
                });
            });
        });
    });
};

// Update subscriber email
exports.updateSubscriberEmail = (req, res, next) => {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: "Email is required"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Invalid email format"
        });
    }

    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Subscriber not found"
            });
        }

        // Check if email already exists
        Newsletter.getByEmail(email, (err, emailResults) => {
            if (err) return next(err);
            if (emailResults.length > 0 && emailResults[0].id != id) {
                return res.status(400).json({
                    success: false,
                    error: "Email already in use by another subscriber"
                });
            }

            Newsletter.updateEmail(id, email, (err, result) => {
                if (err) return next(err);
                
                Newsletter.getById(id, (err, updatedResult) => {
                    if (err) return next(err);
                    res.json({
                        success: true,
                        message: "Email updated successfully",
                        data: updatedResult[0]
                    });
                });
            });
        });
    });
};

// Mark as read
exports.markAsRead = (req, res, next) => {
    const { id } = req.params;
    
    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Subscriber not found"
            });
        }

        Newsletter.markAsRead(id, (err, result) => {
            if (err) return next(err);
            res.json({
                success: true,
                message: "Marked as read successfully"
            });
        });
    });
};

// Mark as replied
exports.markAsReplied = (req, res, next) => {
    const { id } = req.params;
    
    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Subscriber not found"
            });
        }

        Newsletter.markAsReplied(id, (err, result) => {
            if (err) return next(err);
            res.json({
                success: true,
                message: "Marked as replied successfully"
            });
        });
    });
};

// ============= DELETE Routes (Delete) =============

// Unsubscribe (delete by ID)
exports.unsubscribe = (req, res, next) => {
    const { id } = req.params;

    Newsletter.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Subscriber not found" 
            });
        }

        Newsletter.delete(id, (err, result) => {
            if (err) return next(err);
            res.json({ 
                success: true,
                message: "Unsubscribed successfully",
                data: {
                    id: id,
                    email: results[0].email
                }
            });
        });
    });
};