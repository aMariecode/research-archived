const Capstone = require("../models/Capstone.js");
const User = require("../models/User.js");
const { deleteFromCloudinary } = require("../utils/uploadHelper");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            isDeleted: false,
        })
        .select(
            "_id ullName email role"
        );

        if(!users || users.length === 0) {
            return res.status(200).send({
                message: `There are no users registered!`,
                data: []
            })
        };

        return res.status(200).send({
            message: `List of all Users:`,
            data: users
        });
    } catch (err) {
        console.log(`User Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching users",
        });
    }
}

exports.getAllUsersByRole = async (req, res) => {
    try {
        const role = req.params.role
        const users = await User.find({
            role: role,
            isDeleted: false,
            isDisabled: false
        })
        .select(
            "_id fullName email role"
        );
        
        if(!users || users.length === 0) {
            return res.status(200).send({
                message: `There are no users with role ${role} registered!`,
                data: []
            })
        };

        return res.status(200).send({
            message: `List of ${role}s:`,
            data: users
        });
    } catch (err) {
        console.log(`User Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching users",
        });
    }
}

exports.getAllArchivedUsers = async (req, res) => {
    try {
        const archivedUsers = await User.find({
            isDeleted: true
        })
        .select(
            "_id fullName email role"
        )
        .sort({ deletedAt: -1 });

        if(!archivedUsers || archivedUsers.length === 0){
            return res.status(200).send({
                message: `There are no archived users found!`,
                data: []
            });
        }
        
        return res.status(200).send({
            message: `List of archived users:`,
            data: archivedUsers
        })

    } catch (err) {
        console.log(`Archived Users Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching archvied users",
        });
    }
}

exports.getAllArchivedCapstones = async (req, res) => {
    try {
        const archivedCapstones = await Capstone.find({
            isDeleted: true,
            isApproved: true
        })
        .select(
            "_id previewImage title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy"
        )
        .sort({ year: -1 });

        if(!archivedCapstones || archivedCapstones.length === 0){
            return res.status(200).send({
                message: `There are no archived capstones found!`,
                data: []
            });
        }
        
        return res.status(200).send({
            message: `List of archived capstone:`,
            data: archivedCapstones
        })
    } catch (err) {
        console.log(`Archived Capstones Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching archived capstones",
        });
    }
}

exports.getAllSubmittedCapstonesByStatus = async (req, res) => {
    try {
        const status = req.params.status;
        const submittedCapstones = await Capstone.find({
            status: status,
            isDeleted: false,
            isApproved: true
        })
        .select(
            "_id previewImage title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy"
        )
        .sort({ createdAt: 1 });

        if(!submittedCapstones || submittedCapstones.length === 0){
            return res.status(200).send({
                message: `There are no ${status} submitted capstones found!`,
                data: []
            });
        }

        return res.status(200).send({
            message: `List of all ${status} submitted capstones:`,
            data: submittedCapstones
        })

    } catch (err) {
        console.log(`Submitted Capstones Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching submitted capstones",
        });
    }
}

exports.disableUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const specificUser = await User.findOne({
            _id: userId,
            isDisabled: false,
            isDeleted: false
        })
        .select(
            "_id fullName email role"
        );

        if(!specificUser) {
            return res.status(404).send({
                message: `User with the ID: ${userId} not found!`,
            });
        }

        if (specificUser.role === "admin") {
            return res.status(403).send({
                message: "Unauthorized: Forbidden to modify admin account."
            });
        }

        specificUser.isDisabled = true;
        await specificUser.save();

        res.status(200).send({
            message: `User with the ID: ${userId} enabled`,
            disabledAccount: specificUser
        });
        
    } catch (err) {

    }
}

exports.enableUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const specificUser = await User.findOne({
            _id: userId,
            isDisabled: true,
            isDeleted: false
        })
        .select(
            "fullName email role"
        );

        if(!specificUser) {
            return res.status(404).send({
                message: `User with the ID: ${userId} not found!`,
            });
        }

        if (specificUser.role === "admin") {
            return res.status(403).send({
                message: "Unauthorized: Forbidden to modify admin account."
            });
        }

        specificUser.isDisabled = false;
        await specificUser.save();

        res.status(200).send({
            message: `User with the ID: ${userId} enabled`,
            enabledAccount: specificUser
        });
    } catch (err) {
        console.log(`User Patching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when updating users",
        });
    }
}

exports.approveCapstoneById = async (req, res) => {
    try {
        const capstoneId = req.params.capstoneId;

        const capstone = await Capstone.findOne({
            _id: capstoneId,
            isDeleted: false,
            status: "pending",
        });

        if (!capstone) {
            return res.status(404).send({
                message: "Capstone not found (must be pending and not deleted).",
            });
        }

        if (capstone.status === "rejected") {
            return res.status(409).send({
                message: `Cannot approve a rejected casptone!`,
            });
        }

        capstone.status = "approved";
        capstone.isApproved = true;
        capstone.approvedBy = req.user.id;
        capstone.approvedAt = new Date();

        await capstone.save();

        return res.status(200).send({
            message: "Capstone with ID: ${casptoneId} has been approved successfully!",
            data: {
                id: capstoneId,
                title: capstone.title,
                status: "approved",
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
        });
    } catch (err) {
        console.log(`Approve Capstone Error: ${err}`);
        return res.status(500).send({
            message: "Server error when approving capstone",
        });
    }
};

exports.rejectCapstoneById = async (req, res) => {
    try {
        const capstoneId = req.params.capstoneId;

        const capstone = await Capstone.findOne({
            _id: capstoneId,
            isDeleted: false,
            status: "pending",
        });

        if (!capstone) {
            return res.status(404).send({
                message: "Capstone not found (must be pending and not deleted).",
            });
        }

        if (capstone.status === "approved") {
            return res.status(409).send({
                message: `Cannot reject an approved capstone`,
            });
        }

        // Delete Cloudinary assets first (so we only mark rejected if cleanup succeeds)
        const imagePublicId = capstone.previewImage?.public_id;
        if (imagePublicId) {
            await deleteFromCloudinary(imagePublicId, "image");
        }

        const pdfPublicId = capstone.pdfPublicId; // must be stored when uploading
        if (pdfPublicId) {
            await deleteFromCloudinary(pdfPublicId, "pdf");
        }

        capstone.status = "rejected";
        capstone.isApproved = false;
        capstone.approvedBy = req.user.id; // reuse as "reviewedBy"
        capstone.approvedAt = new Date();

        await capstone.save();

        return res.status(200).send({
            message: `Capstone with ID: ${capstoneId} has been rejected and files removed from Cloudinary.`,
            data: {
                id: capstoneId,
                title: capstone.title,
                status: capstone.status,
                reviewedBy: req.user.id,
                reviewedAt: capstone.approvedAt,
            },
        });
    } catch (err) {
        console.log(`Reject Capstone Error: ${err}`);
            return res.status(500).send({
            message: "Server error when rejecting capstone",
        });
    }
};

exports.deleteUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const specificUser = await User.findOne({
            _id: userId,
            isDeleted: false,
        });

        if(!specificUser) {
            return res.send({
                message: `User with the ID: ${userId} not found!`
            });
        }

         if (req.user.id === userId) {
            return res.status(403).send({
                message: "You cannot delete your own account.",
            });
        }

        if (specificUser.role === "Admin") {
            return res.status(403).send({
                message: `Unauthorized: Unable to delete an admin account.`,
            });
        }

        specificUser.isDeleted = true;
        specificUser.deletedAt = new Date();

        await specificUser.save();

        return res.status(200).send({
            message: `User with the ID: ${userId} successfully archived!`,
            data: {
                _id: specificUser._id,
                fullName: specificUser.fullName,
                isDeleted: specificUser.isDeleted,
                deletedAt: specificUser.deletedAt
            }
        });
    } catch (err) {
        console.log(`Specific User Archival Error: ${err}`);
        return res.send({
            message: "Server error when archiving user",
        });
    }
}

exports.restoreUserById = async (req, res) => {
    try {
        const userId = req.params.userId;

        const specificUser = await User.findOne({
            _id: userId,
            isDeleted: true,
        });

        if(!specificUser) {
            return res.send({
                message: `User with the ID: ${userId} not found!`
            });
        }

        if(
            userId === req.user.id && req.user.role !== "Admin"
        ) {
            return res.status(403).send({
                message: "Not authorized."
            });
        }

        specificUser.isDeleted = false;
        specificUser.deletedAt = null;

        await specificUser.save();

        return res.status(200).send({
            message: `User with the ID: ${userId} successfully restored!`,
            data: {
                _id: specificUser._id,
                fullName: specificUser.fullName,
                isDeleted: specificUser.isDeleted,
                deletedAt: specificUser.deletedAt
            }
        })
    } catch (err) {
        console.log(`Specific User Restoration Error: ${err}`);
        return res.send({
            message: "Server error when restoring user",
        });
    }
}