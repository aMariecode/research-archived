const SystemSetting = require("../models/SystemSetting.js");

const DEFAULT_MAINTENANCE = {
    isActive: false,
    title: "Scheduled Maintenance",
    message: "The system is currently under maintenance. Some features may be temporarily unavailable.",
    expectedBackAt: null,
    updatedAt: null,
};

exports.getMaintenanceStatus = async (req, res) => {
    try {
        const settings = await SystemSetting.findOne({ key: "singleton" }).lean();
        const maintenance = settings?.maintenance || DEFAULT_MAINTENANCE;

        return res.status(200).send({
            message: "Maintenance status fetched successfully",
            data: {
                isActive: Boolean(maintenance.isActive),
                title: maintenance.title || DEFAULT_MAINTENANCE.title,
                message: maintenance.message || DEFAULT_MAINTENANCE.message,
                expectedBackAt: maintenance.expectedBackAt || null,
                updatedAt: maintenance.updatedAt || null,
            },
        });
    } catch (err) {
        console.log(`Get Maintenance Status Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching maintenance status",
        });
    }
};

exports.updateMaintenanceStatus = async (req, res) => {
    try {
        const { isActive, title, message, expectedBackAt } = req.body;

        const normalizedIsActive = Boolean(isActive);
        const normalizedTitle = (title || "").trim() || DEFAULT_MAINTENANCE.title;
        const normalizedMessage = (message || "").trim();
        const normalizedExpectedBackAt = expectedBackAt ? new Date(expectedBackAt) : null;

        if (normalizedIsActive && !normalizedMessage) {
            return res.status(400).send({
                message: "Maintenance message is required when maintenance mode is active.",
            });
        }

        if (normalizedExpectedBackAt && Number.isNaN(normalizedExpectedBackAt.getTime())) {
            return res.status(400).send({
                message: "Invalid expected return date.",
            });
        }

        const updated = await SystemSetting.findOneAndUpdate(
            { key: "singleton" },
            {
                $set: {
                    key: "singleton",
                    "maintenance.isActive": normalizedIsActive,
                    "maintenance.title": normalizedTitle,
                    "maintenance.message": normalizedMessage || DEFAULT_MAINTENANCE.message,
                    "maintenance.expectedBackAt": normalizedExpectedBackAt,
                    "maintenance.updatedAt": new Date(),
                    "maintenance.updatedBy": req.user.id,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        return res.status(200).send({
            message: normalizedIsActive
                ? "Maintenance mode enabled successfully"
                : "Maintenance mode disabled successfully",
            data: {
                isActive: Boolean(updated?.maintenance?.isActive),
                title: updated?.maintenance?.title || DEFAULT_MAINTENANCE.title,
                message: updated?.maintenance?.message || DEFAULT_MAINTENANCE.message,
                expectedBackAt: updated?.maintenance?.expectedBackAt || null,
                updatedAt: updated?.maintenance?.updatedAt || null,
            },
        });
    } catch (err) {
        console.log(`Update Maintenance Status Error: ${err}`);
        return res.status(500).send({
            message: "Server error when updating maintenance status",
        });
    }
};
