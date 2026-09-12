require("dotenv").config();
const fs = require("fs");
const path = require("path");
const http = require("http");
const app = require("./app");
require("./config/db");

// Configure ports to try
const primaryPort = parseInt(process.env.PORT, 10) || 5000;
const configuredPorts = process.env.PORTS
  ? process.env.PORTS.split(",").map((p) => parseInt(p.trim(), 10)).filter(Boolean)
  : [];

// Build ordered list of candidate ports (starting with primary, then up to 10 sequential fallbacks)
const candidatePorts = Array.from(
  new Set([
    primaryPort,
    ...configuredPorts,
    5000,
    5001,
    5002,
    5003,
    5004,
    5005,
    5006,
    5007,
    5008,
    5009,
  ])
);

let activeServer = null;

const startServer = (portIndex = 0) => {
  if (portIndex >= candidatePorts.length) {
    console.error(
      "\n❌ All candidate ports are currently in use! Tried:",
      candidatePorts.join(", ")
    );
    console.error("👉 Please free a port or set a custom PORT in .env\n");
    process.exit(1);
  }

  const currentPort = candidatePorts[portIndex];
  const server = http.createServer(app);

  server.listen(currentPort, () => {
    activeServer = server;
    console.log("========================================");
    console.log(`🚀 KahaniLand Server Running on http://localhost:${currentPort}`);
    console.log(`📚 Stories API     : http://localhost:${currentPort}/api/stories`);
    console.log(`🎥 Videos API      : http://localhost:${currentPort}/api/videos`);
    console.log(`📧 Newsletter API  : http://localhost:${currentPort}/api/newsletters`);
    console.log(`📞 Contact API     : http://localhost:${currentPort}/api/contacts`);
    console.log(`❤️ Health Check    : http://localhost:${currentPort}/api/health`);
    console.log("========================================");

    // Save active port for local discovery
    try {
      fs.writeFileSync(path.join(__dirname, "../.active_port"), String(currentPort));
      const fePortPath = path.resolve(__dirname, "../../frontend/.active_port");
      fs.writeFileSync(fePortPath, String(currentPort));
    } catch (_) {}
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${currentPort} is in use. Trying fallback port ${candidatePorts[portIndex + 1]}...`);
      server.close();
      startServer(portIndex + 1);
    } else {
      console.error("Server Error:", err);
      process.exit(1);
    }
  });
};

startServer(0);

// Graceful shutdown handling
const shutdown = () => {
  console.log("\nStopping KahaniLand server...");
  if (activeServer) {
    activeServer.close(() => {
      console.log("Server stopped successfully.");
      try {
        const portFile = path.join(__dirname, "../.active_port");
        if (fs.existsSync(portFile)) fs.unlinkSync(portFile);
      } catch (_) {}
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);