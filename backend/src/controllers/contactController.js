const Contact = require("../models/contactModel");
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

// Get all contacts
exports.getContacts = (req, res, next) => {
    Contact.getAll((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get single contact
exports.getContactById = (req, res, next) => {
    const { id } = req.params;
    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Contact not found" 
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Get contacts by status
exports.getContactsByStatus = (req, res, next) => {
    const { status } = req.params;
    Contact.getByStatus(status, (err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get pending contacts
exports.getPending = (req, res, next) => {
    Contact.getPending((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get unread contacts
exports.getUnread = (req, res, next) => {
    Contact.getUnread((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get unreplied contacts
exports.getUnreplied = (req, res, next) => {
    Contact.getUnreplied((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
};

// Get replied contacts
exports.getReplied = (req, res, next) => {
    Contact.getReplied((err, results) => {
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
    Contact.getStats((err, results) => {
        if (err) return next(err);
        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Export to CSV - FIXED: removed columns that don't exist
exports.exportCSV = (req, res, next) => {
    Contact.getAll((err, results) => {
        if (err) return next(err);
        
        let csv = 'ID,Name,Email,Subject,Status,Date\n';
        results.forEach(item => {
            csv += `${item.id},"${item.name}",${item.email},"${item.subject || ''}",${item.status},${item.created_at}\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.attachment(`contacts-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    });
};

// ============= POST Routes (Create) =============

// Create new contact
exports.createContact = (req, res, next) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ 
            success: false,
            error: "Name, email, and message are required fields" 
        });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: "Invalid email format"
        });
    }

    Contact.create(req.body, (err, result) => {
        if (err) return next(err);
        
        Contact.getById(result.insertId, (err, newContact) => {
            if (err) return next(err);
            res.status(201).json({
                success: true,
                message: "Contact message sent successfully",
                data: newContact[0]
            });
        });
    });
};

// Send reply email
exports.sendReply = (req, res, next) => {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            error: "Subject and message are required"
        });
    }

    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        const contact = results[0];
        
        // Send email
        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
            to: contact.email,
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
            Contact.markAsReplied(id, (err) => {
                if (err) console.error('Error marking as replied:', err);
            });
            
            res.json({
                success: true,
                message: "Reply sent successfully",
                data: {
                    to: contact.email,
                    subject: subject
                }
            });
        });
    });
};

// Send bulk reply
exports.sendBulkReply = (req, res, next) => {
    const { ids, subject, message } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one contact ID is required"
        });
    }

    if (!subject || !message) {
        return res.status(400).json({
            success: false,
            error: "Subject and message are required"
        });
    }

    Contact.getByIds(ids, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No contacts found"
            });
        }

        const emailPromises = results.map(contact => {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
                to: contact.email,
                subject: subject,
                text: message
            };
            
            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(`Failed to send to ${contact.email}:`, error);
                        reject(error);
                    } else {
                        Contact.markAsReplied(contact.id, (err) => {
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

// Update contact status
exports.updateContactStatus = (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ 
            success: false,
            error: "Status is required" 
        });
    }

    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Contact not found" 
            });
        }

        Contact.updateStatus(id, status, (err, result) => {
            if (err) return next(err);
            
            Contact.getById(id, (err, updatedResult) => {
                if (err) return next(err);
                res.json({
                    success: true,
                    message: "Contact status updated successfully",
                    data: updatedResult[0]
                });
            });
        });
    });
};

// Mark as read
exports.markAsRead = (req, res, next) => {
    const { id } = req.params;
    
    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        Contact.markAsRead(id, (err, result) => {
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
    
    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Contact not found"
            });
        }

        Contact.markAsReplied(id, (err, result) => {
            if (err) return next(err);
            res.json({
                success: true,
                message: "Marked as replied successfully"
            });
        });
    });
};

// ============= DELETE Routes (Delete) =============

// Delete contact
exports.deleteContact = (req, res, next) => {
    const { id } = req.params;

    Contact.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Contact not found" 
            });
        }

        Contact.delete(id, (err, result) => {
            if (err) return next(err);
            res.json({ 
                success: true,
                message: "Contact deleted successfully",
                data: {
                    id: id,
                    email: results[0].email
                }
            });
        });
    });
};