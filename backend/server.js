require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const startScheduler = require("./scheduler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Smart Todo Reminder API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error("[GLOBAL_ERROR]", err);
  res.status(500).json({ message: "Something went wrong." });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB] MongoDB connected");

    startScheduler();

    app.listen(PORT, () => {
      console.log(`[SERVER] Listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("[BOOT] Failed to start:", error.message);
    process.exit(1);
  }
}

startServer();
