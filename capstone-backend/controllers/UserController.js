const bcrypt = require("bcryptjs");
const User = require("../models/User.js");

// GET /api/user/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user.id,
            isDeleted: false,
        }).select("_id fullName email role isDisabled isDeleted createdAt updatedAt");

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        return res.status(200).send({
            message: "User profile fetched successfully",
            data: user,
        });
    } catch (err) {
        console.error("getMe error:", err);
        return res.status(500).send({ message: "Server error when fetching profile" });
    }
};

// PUT /api/user/me  (update name only, email optional)
exports.updateMe = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        const user = await User.findOne({
            _id: req.user.id,
            isDeleted: false,
        }).select("_id fullName email role");

        if (!user) return res.status(404).send({ message: "User not found" });

        if (fullName !== undefined) {
        const nextName = String(fullName).trim();
        if (!nextName) return res.status(400).send({ message: "fullName cannot be empty" });
        user.fullName = nextName;
        }

        // Optional: allow email change (and keep it unique)
        if (email !== undefined) {
        const nextEmail = String(email).toLowerCase().trim();
        if (!nextEmail) return res.status(400).send({ message: "email cannot be empty" });

        const existing = await User.findOne({
            email: nextEmail,
            _id: { $ne: user._id },
        });

        if (existing) {
            return res.status(409).send({ message: "Email already in use" });
        }

        user.email = nextEmail;
        }

        await user.save();

        return res.status(200).send({
            message: "Profile updated successfully",
            data: user,
        });
    } catch (err) {
        console.error("updateMe error:", err);
        return res.status(500).send({ message: "Server error when updating profile" });
    }
};

// PATCH /api/user/me/password
exports.changeMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).send({
                message: "currentPassword and newPassword are required",
            });
        }

        const user = await User.findOne({
            _id: req.user.id,
            isDeleted: false,
        }).select("+password _id email");

        if (!user) return res.status(404).send({ message: "User not found" });

        const ok = await bcrypt.compare(currentPassword, user.password);
        if (!ok) return res.status(401).send({ message: "Current password is incorrect" });

        const nextPassword = String(newPassword);
        if (nextPassword.length < 6) {
            return res.status(400).send({ message: "New password must be at least 6 characters" });
        }

        user.password = await bcrypt.hash(nextPassword, 10);
        await user.save();

        return res.status(200).send({ message: "Password updated successfully" });
    } catch (err) {
        console.error("changeMyPassword error:", err);
        return res.status(500).send({ message: "Server error when changing password" });
    }
};

// PATCH /api/user/me/delete  (soft delete own account)
exports.deleteMe = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user.id,
            isDeleted: false,
        }).select("_id isDeleted deletedAt");

        if (!user) return res.status(404).send({ message: "User not found" });

        user.isDeleted = true;
        user.deletedAt = new Date();
        await user.save();

        return res.status(200).send({
            message: "Account deleted (archived) successfully",
            data: { id: user._id, isDeleted: user.isDeleted, deletedAt: user.deletedAt },
        });
    } catch (err) {
        console.error("deleteMe error:", err);
        return res.status(500).send({ message: "Server error when deleting account" });
    }
};