import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS lets the browser frontend call this API from a different origin.
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin include tools such as curl/Postman.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  }
}));

// Parse incoming JSON request bodies into req.body.
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected"
  });
});

app.use("/api/tasks", taskRoutes);

// Final error handler for errors such as a blocked CORS origin.
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({ message: error.message || "Internal server error." });
});

try {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Server startup failed:", error.message);
  process.exit(1);
}
