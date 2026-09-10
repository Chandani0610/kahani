const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const errorHandler = require("./middleware/errorMiddleware");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storyRoutes = require("./routes/storyRoutes");
const videoRoutes = require("./routes/videoRouters");
const newsletterRoutes = require("./routes/newsletterRoutes");
const contactRoutes = require("./routes/contactRoutes");
const uploadRoutes = require("./routes/upload"); // <-- ADD THIS

// Import User Model
const UserModel = require("./models/User");

const app = express();

// ======================================
// Ensure Upload Directory Exists
// ======================================
const uploadDir = path.join(__dirname, "uploads/stories");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Upload directory created:", uploadDir);
}

// ======================================
// Middlewares
// ======================================

app.use(cors());

// Increase limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb",
    })
);

// ======================================
// Serve Static Files (ADD THIS)
// ======================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================================
// Initialize Default Admin
// ======================================

UserModel.initializeAdmin().catch((err) => {
    console.error("Failed to initialize default admin:", err);
});

// ======================================
// API Routes
// ======================================

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", userRoutes);

// Stories
app.use("/api/stories", storyRoutes);

// Videos
app.use("/api/videos", videoRoutes);

// Newsletters
app.use("/api/newsletters", newsletterRoutes);

// Contacts
app.use("/api/contacts", contactRoutes);

// Upload (ADD THIS)
app.use("/api", uploadRoutes);

// ======================================
// Health Check
// ======================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        storage: {
            uploads: fs.existsSync(uploadDir) ? "available" : "unavailable"
        }
    });
});

// ======================================
// 404 Handler
// ======================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});

// ======================================
// Global Error Handler
// ======================================

app.use(errorHandler);

module.exports = app;