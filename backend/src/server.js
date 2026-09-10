// // require("dotenv").config();
// // const app = require("./app");
// // require("./config/db");

// // const PORT = process.env.PORT || 5000;

// // const server = app.listen(PORT, () => {
// //     console.log(`🚀 Server Running on Port ${PORT}`);
// //     console.log(`📚 API available at http://localhost:${PORT}/api/videos/`);
// // });

// // // Handle shutdown gracefully
// // process.on("SIGTERM", () => {
// //     console.log("SIGTERM signal received: closing HTTP server");
// //     server.close(() => {
// //         console.log("HTTP server closed");
// //         process.exit(0);
// //     });
// // });
// require("dotenv").config();

// const app = require("./app");
// require("./config/db");

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//     console.log("========================================");
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//     console.log(`📚 Stories API     : http://localhost:${PORT}/api/stories`);
//     console.log(`🎥 Videos API      : http://localhost:${PORT}/api/videos`);
//     console.log(`📧 Newsletter API  : http://localhost:${PORT}/api/newsletters`);
//     console.log(`📞 Contact API     : http://localhost:${PORT}/api/contacts`);
//     console.log(`❤️ Health Check    : http://localhost:${PORT}/api/health`);
//     console.log("========================================");
// });

// server.on("error", (err) => {
//     console.error("Server Error:", err);
// });

// process.on("SIGINT", () => {
//     console.log("\nStopping server...");
//     server.close(() => {
//         console.log("Server stopped.");
//         process.exit(0);
//     });
// });

// process.on("SIGTERM", () => {
//     console.log("SIGTERM received.");
//     server.close(() => {
//         console.log("Server stopped.");
//         process.exit(0);
//     });
// });




require("dotenv").config();

const app = require("./app");
require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Server Error: Port ${PORT} is already in use!`);
        console.error(`👉 Stop the process using port ${PORT} or change PORT in .env\n`);
        process.exit(1);
    }
    console.error("Server Error:", err);
});

process.on("SIGINT", () => {
    console.log("\nStopping server...");
    server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received.");
    server.close(() => {
        console.log("Server stopped.");
        process.exit(0);
    });
});