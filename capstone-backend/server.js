const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: [
        "*"
    ],
  credentials: true 
}));

// Routes
app.use("/api/auth", require("./routes/AuthRoutes.js"));
app.use("/api", require("./routes/SearchRoutes.js"));
app.use("/api/capstone", require("./routes/CapstoneRoutes.js"));
app.use("/api/admin", require("./routes/AdminRoutes.js"));
app.use("/api/user", require("./routes/UserRoutes.js"));
app.use("/api/admin/analytics", require("./routes/AnalyticsRoutes.js"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
        });
    });
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log("MongoDB connection closed");
            process.exit(0);
        });
    });
});

