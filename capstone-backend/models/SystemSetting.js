const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "singleton",
            unique: true,
            trim: true,
        },
        maintenance: {
            isActive: {
                type: Boolean,
                default: false,
            },
            title: {
                type: String,
                trim: true,
                default: "Scheduled Maintenance",
            },
            message: {
                type: String,
                trim: true,
                default: "The system is currently under maintenance. Some features may be temporarily unavailable.",
            },
            expectedBackAt: {
                type: Date,
                default: null,
            },
            updatedAt: {
                type: Date,
                default: Date.now,
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
