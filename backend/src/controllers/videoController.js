const Video = require("../models/videoModel");

// Get all videos
exports.getVideos = (req, res, next) => {
    Video.getAll((err, results) => {
        if (err) return next(err);
        res.json(results);
    });
};

// Get single video
exports.getVideoById = (req, res, next) => {
    const { id } = req.params;
    Video.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ error: "Video not found" });
        }
        res.json(results[0]);
    });
};

// Get videos by category
exports.getVideosByCategory = (req, res, next) => {
    const { category } = req.params;
    Video.getByCategory(category, (err, results) => {
        if (err) return next(err);
        res.json(results);
    });
};

// Create new video
exports.createVideo = (req, res, next) => {
    const { title, youtube_url } = req.body;
    
    if (!title || !youtube_url) {
        return res.status(400).json({ 
            error: "Title and YouTube URL are required fields" 
        });
    }

    // Additional validation for YouTube URL format
    if (!youtube_url.includes('youtube.com') && !youtube_url.includes('youtu.be')) {
        return res.status(400).json({ 
            error: "Invalid YouTube URL. Please provide a valid YouTube link" 
        });
    }

    Video.create(req.body, (err, result) => {
        if (err) return next(err);
        res.status(201).json({
            message: "Video created successfully",
            id: result.insertId
        });
    });
};

// Update video
exports.updateVideo = (req, res, next) => {
    const { id } = req.params;
    const { youtube_url } = req.body;

    // Validate YouTube URL if provided in update
    if (youtube_url && !youtube_url.includes('youtube.com') && !youtube_url.includes('youtu.be')) {
        return res.status(400).json({ 
            error: "Invalid YouTube URL. Please provide a valid YouTube link" 
        });
    }

    Video.getById(id, (err, results) => {
        if (err) return next(err);
        if (results.length === 0) {
            return res.status(404).json({ error: "Video not found" });
        }

        Video.update(id, req.body, (err, result) => {
            if (err) return next(err);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Video not found" });
            }
            res.json({ message: "Video updated successfully" });
        });
    });
};

// Delete video
exports.deleteVideo = (req, res, next) => {
    const { id } = req.params;

    Video.delete(id, (err, result) => {
        if (err) return next(err);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Video not found" });
        }
        res.json({ message: "Video deleted successfully" });
    });
};