const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { testConnection } = require("./config/db");
const schoolRoutes = require("./routes/schoolRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Utility Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Management API is running",
    version: "1.0.0",
    endpoints: {
      addSchool:   "POST /addSchool",
      listSchools: "GET  /listSchools?latitude={lat}&longitude={lon}",
      health:      "GET  /health",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/", schoolRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
    availableRoutes: ["POST /addSchool", "GET /listSchools"],
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST http://localhost:${PORT}/addSchool`);
    console.log(`  GET  http://localhost:${PORT}/listSchools?latitude=28.56&longitude=77.21\n`);
  });
};

start();

module.exports = app;