// // app.js
//
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { connectDB } = require("./dbConnections/db");
// const usersRoute = require("./routes/usersRoutes");
// const adminsRoute = require("./routes/adminsRoutes");
//
// const app = express();
// app.use(express.json());
// app.set("trust proxy", true);
//
// // CORS configuration (your existing code is fine)
// app.use(
//   cors({
//     origin: (origin, cb) =>
//       !origin || origin.startsWith("https://codeveritus.makeatron.in")
//         ? cb(null, true)
//         : cb(new Error("CORS blocked")),
//     credentials: true,
//   })
// );
//
// // Test endpoint
// app.get("/", (req, res) => res.send("✅ CODEVERITUS BACKEND (Docker container running)"));
//
// // --- CORRECTED API ROUTES ---
// app.use("/api/users", usersRoute);
//
// // Use only ONE entry point for all admin routes.
// app.use("/api/admins", adminsRoute);
// // REMOVED: app.use("/api/admins/fetch", jwtAuthenticator, adminsRoute);
//
// // Connect to DB
// connectDB();
//
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Backend server running on port ${PORT}`);
// });



require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./dbConnections/db");
const usersRoute = require("./routes/usersRoutes");
const adminsRoute = require("./routes/adminsRoutes");
const jwtAuthenticator = require("./middleware/jwtAuthenticator");

const app = express();
app.use(express.json());
app.set("trust proxy", true);

// CORS: restrict to your frontend domain
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || origin.startsWith("https://codeveritus.makeatron.in") // Production domain
        ? cb(null, true)
        : cb(new Error("CORS blocked")),
    credentials: true,
  })
);

// Test endpoint
app.get("/", (req, res) => res.send("✅ CODEVERITUS BACKEND (Docker container running)"));

// API routes (Your original routes are untouched)
app.use("/api/users", usersRoute);
app.use("/api/admins", adminsRoute);
app.use("/api/admins/fetch", jwtAuthenticator, adminsRoute);

// Connect to DB
connectDB();

// Start HTTP server and capture the server instance for shutdown
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

// --- NEW CODE: GRACEFUL SHUTDOWN LOGIC ---
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  // 1. Stop the server from accepting new connections
  server.close(async () => {
    console.log("✅ HTTP server closed.");

    // IMPORTANT: Add your database connection closing logic here.
    // For example, if you are using Mongoose:
    // const mongoose = require("mongoose");
    // mongoose.connection.close(false, () => {
    //   console.log("✅ MongoDB connection closed.");
    //   process.exit(0); // Exit cleanly
    // });
    await closeDB(); // Call the new function to close the database connection
    // If you don't have a specific DB close function, you can exit directly.
    console.log("Exiting process now.");
    process.exit(0);
  });

  // Force exit after a 10-second timeout
  setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000);
};

// Listen for the signals to trigger the shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // from Docker
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // from Ctrl+C


















// require("dotenv").config();
//
// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const https = require("https");
//
// // Import your own modules
// const { connectDB } = require("./dbConnections/db");
// const usersRoute = require("./routes/usersRoutes");
// const adminsRoute = require("./routes/adminsRoutes");
// const jwtAuthenticator = require("./middleware/jwtAuthenticator");
// const corsMiddleware = require("./middleware/corsConfig");
//
// // Initialize Express app
// const app = express();
//
// // Middleware: parse JSON
// app.use(express.json());
//
// // Middleware: CORS (make sure this is before routes)
// app.use(corsMiddleware);
//
// // Register routes BEFORE server start
// app.use("/api/users", usersRoute);
// app.use("/api/admins", adminsRoute);
// app.use("/api/admins/fetch", jwtAuthenticator, adminsRoute);
//
// // Get port from env or fallback
// const PORT = process.env.PORT || 5000;
//
// // Read SSL cert and key from mounted paths
// const sslOptions = {
//   key: fs.readFileSync("/etc/ssl/private/api_origin.key"),
//   cert: fs.readFileSync("/etc/ssl/certs/api_origin.pem"),
//   // Add SNI support - this is crucial for Cloudflare Tunnel
//   SNICallback: (servername, callback) => {
//     console.log(`SNI request for: ${servername}`);
//     // For your case, always return the same certificate
//     // In production, you might want to serve different certs based on servername
//     callback(null, {
//       key: fs.readFileSync("/etc/ssl/private/api_origin.key"),
//       cert: fs.readFileSync("/etc/ssl/certs/api_origin.pem")
//     });
//   }
// };
//
// // Connect to DB then start HTTPS server
// connectDB()
//   .then(() => {
//     console.log("Database connected successfully!");
//
//     https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
//       console.log(`HTTPS Server running at https://0.0.0.0:${PORT}/`);
//     });
//   })
//   .catch((error) => {
//     console.error("Database connection error:", error.message);
//     process.exit(1);
//   });
