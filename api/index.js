// API entry point for Vercel serverless deployment
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("../capstone-backend/config/db");
const AnalyticsEvent = require('../capstone-backend/models/AnalyticsEvent');
require("dotenv").config();

const app = express();

// Initialize DB connection (will reuse across invocations)
let isConnected = false;
async function ensureDBConnection() {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../capstone-frontend/public')));

// CORS configuration for production
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));

// Analytics event logging middleware
app.use(async (req, res, next) => {
    try {
        await ensureDBConnection();
        
        // Log site visit for GET requests to root or index
        if (req.method === 'GET' && (req.path === '/' || req.path === '/index.html')) {
            await AnalyticsEvent.create({ type: 'visit', user: req.user?._id });
        }
        // Log capstone view event
        if (
            req.method === 'GET' &&
            /^\/api\/capstone\/(view|[a-fA-F0-9]{24})$/.test(req.path)
        ) {
            await AnalyticsEvent.create({ type: 'view', user: req.user?._id, capstone: req.params?.id });
        }
        // Log capstone download event
        if (
            req.method === 'GET' &&
            /^\/api\/capstone\/download\/[a-fA-F0-9]{24}$/.test(req.path)
        ) {
            const capstoneId = req.path.split('/').pop();
            await AnalyticsEvent.create({ type: 'download', user: req.user?._id, capstone: capstoneId });
        }
    } catch (e) {
        console.error('Analytics event log error:', e);
    }
    next();
});

// Routes
app.use("/api/auth", require("../capstone-backend/routes/AuthRoutes.js"));
app.use("/api", require("../capstone-backend/routes/SearchRoutes.js"));
app.use("/api/capstone", require("../capstone-backend/routes/CapstoneRoutes.js"));
app.use("/api/admin", require("../capstone-backend/routes/AdminRoutes.js"));
app.use("/api/user", require("../capstone-backend/routes/UserRoutes.js"));
app.use("/api/admin/analytics", require("../capstone-backend/routes/AnalyticsRoutes.js"));

// Serve SPA - fallback to index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../capstone-frontend/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal server error"
    });
});

// Export for Vercel serverless
module.exports = app;
