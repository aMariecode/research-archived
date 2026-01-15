const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required!"],
            trim: true,
            maxlength: [100, "Full Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required!"],
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
            select: false,
        },
        role: {
            type: String,
            enum: ["Viewer", "Faculty", "Admin"],
            default: "Viewer",
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);