
// Global error logging for debugging
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}))
// CORS configuration - supports both development and production
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL, // Add your Vercel frontend URL here
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? (allowedOrigins.length > 2 ? allowedOrigins : process.env.FRONTEND_URL)
        : allowedOrigins,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));

// Analytics event logging
const AnalyticsEvent = require('./models/AnalyticsEvent');
// Analytics event logging middleware
app.use(async (req, res, next) => {
    try {
        // Log site visit for GET requests to root or index
        if (req.method === 'GET' && (req.path === '/' || req.path === '/index.html')) {
            await AnalyticsEvent.create({ type: 'visit', user: req.user?._id });
        }
        // Log capstone view event
        if (
            req.method === 'GET' &&
            /^\/api\/capstone\/(view|[a-fA-F0-9]{24})$/.test(req.path)
        ) {
            // If the route is /api/capstone/view or /api/capstone/:id (24-char hex)
            await AnalyticsEvent.create({ type: 'view', user: req.user?._id, capstone: req.params?.id });
        }
        // Log capstone download event
        if (
            req.method === 'GET' &&
            /^\/api\/capstone\/download\/[a-fA-F0-9]{24}$/.test(req.path)
        ) {
            // If the route is /api/capstone/download/:id
            const capstoneId = req.path.split('/').pop();
            await AnalyticsEvent.create({ type: 'download', user: req.user?._id, capstone: capstoneId });
        }
    } catch (e) {
        console.error('Analytics event log error:', e);
    }
    next();
});

// Routes
app.use("/api/auth", require("./routes/AuthRoutes.js"));
app.use("/api", require("./routes/SearchRoutes.js"));
app.use("/api/capstone", require("./routes/CapstoneRoutes.js"));
app.use("/api/admin", require("./routes/AdminRoutes.js"));
app.use("/api/user", require("./routes/UserRoutes.js"));
app.use("/api/admin/analytics", require("./routes/AnalyticsRoutes.js"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
        stack: err.stack
    });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown

// Graceful shutdown (fixed for Mongoose 6+)
async function gracefulShutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await mongoose.connection.close(false);
            console.log("MongoDB connection closed");
            process.exit(0);
        } catch (err) {
            console.error("Error closing MongoDB connection:", err);
            process.exit(1);
        }
    });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

