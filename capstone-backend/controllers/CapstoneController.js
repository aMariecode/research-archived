const Capstone = require("../models/Capstone.js");
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadHelper');
const https = require("https");
const axios = require('../utils/axios');

// Helper function to fix PDF URLs with proper filename
const fixPdfUrl = (pdfUrl, title) => {
    if (!pdfUrl || !pdfUrl.includes('cloudinary.com')) {
        return pdfUrl;
    }
    
    // Clean title for filename
    const cleanTitle = (title || 'capstone').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const filename = `${cleanTitle}.pdf`;
    
    // If URL already has fl_attachment, replace it; otherwise add it
    if (pdfUrl.includes('/raw/upload/fl_attachment')) {
        return pdfUrl.replace(/\/raw\/upload\/fl_attachment[^/]*\//, `/raw/upload/fl_attachment:${filename}/`);
    } else if (pdfUrl.includes('/raw/upload/')) {
        return pdfUrl.replace('/raw/upload/', `/raw/upload/fl_attachment:${filename}/`);
    }
    
    return pdfUrl;
};

// Helper function to process capstone data
const processCapstoneData = (capstone) => {
    if (Array.isArray(capstone)) {
        return capstone.map(c => {
            const data = c.toObject ? c.toObject() : c;
            if (data.pdfUrl) {
                data.pdfUrl = fixPdfUrl(data.pdfUrl, data.title);
            }
            return data;
        });
    } else {
        const data = capstone.toObject ? capstone.toObject() : capstone;
        if (data.pdfUrl) {
            data.pdfUrl = fixPdfUrl(data.pdfUrl, data.title);
        }
        return data;
    }
};

exports.getAllCapstone = async (req, res) => {
    try {
        let query = { isDeleted: false };
        // Show all capstones to all users (admin or not)
        // If you want to hide unapproved capstones from users, add a filter here
        const capstone = await Capstone.find(query)
        .select(
            "_id title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy status isApproved"
        )
        .populate([
            {
                path: "createdBy",
                select: "_id fullName email",
            },
            {
                path: "approvedBy",
                select: "_id fullName email"
            }
        ])
        .sort({ year: -1 });

        if(!capstone || capstone.length === 0) {
            return res.status(200).send({
                message: "No capstone projects found!",
                data: [],
            })
        };

        const processedData = processCapstoneData(capstone);
        return res.status(200).send({
            message: "All Capstone Project Lists:",
            data: processedData
        })
    } catch (err) {
        console.log(`Capstone Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching capstones",
        });
    }
}

exports.getRecentCapstones = async (req, res) => {
    try {
        const capstone = await Capstone.find({
            isDeleted: false,
            isApproved: true
        })
        .select(
            "_id title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy"
        )
        .populate([
            {
                path: "createdBy",
                select: "_id fullName email",
            },
            {
                path: "approvedBy",
                select: "_id fullName email"
            }
        ])
        .sort({ year: 1 }).limit(20);

        if(!capstone || capstone.length === 0) {
            return res.status(200).send({
                message: "No capstone projects found!",
                data: [],
            })
        };

        const processedData = processCapstoneData(capstone);
        return res.status(200).send({
            message: "Recent Capstone Project Lists:",
            data: processedData
        });

    } catch (err) {
        console.log(`Capstone Fetching Error: ${err}`);
    }
}

exports.getApprovedCapstones = async (req, res) => {
    try {
        const capstone = await Capstone.find({
            isDeleted: false,
            isApproved: true
        })
        .select(
            "_id title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy previewImage"
        )
        .populate([
            {
                path: "createdBy",
                select: "_id fullName email",
            },
            {
                path: "approvedBy",
                select: "_id fullName email"
            }
        ])
        .sort({ year: -1 });

        if(!capstone || capstone.length === 0) {
            return res.status(200).send({
                message: "No capstone projects found!",
                data: [],
            })
        };

        return res.status(200).send({
            message: "Approved Capstone Project Lists:",
            data: capstone
        });

    } catch (err) {
        console.log(`Capstone Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching capstones",
        });
    }
}

exports.getCapstoneById = async (req, res) => {
    try {
        const capstoneId = req.params.capstoneId;
        let query = { _id: capstoneId, isDeleted: false };
        // Show all capstones to all users (admin or not)
        const specificCapstone = await Capstone.findOne(query)
            .select("_id title abstract members adviser year technologies pdfUrl pdfPublicId githubUrl createdBy approvedBy status isApproved")
            .populate([
                { path: "createdBy", select: "_id fullName email" },
                { path: "approvedBy", select: "_id fullName email" }
            ]);
        if (!specificCapstone) {
            return res.status(404).send({ message: `Capstone with the ID: ${capstoneId} not found!` });
        }
        
        const processedData = processCapstoneData(specificCapstone);
        return res.status(200).send({ message: `Capstone with the ID: ${capstoneId} found!`, data: processedData });
    } catch (err) {
        console.log(`Specific Capstone Fetching Error: ${err}`);
        return res.status(500).send({
            message: "Server error when fetching specific capstone",
        });
    }
}

exports.addCapstone = async (req, res) => {
    try {
        const {
            title,
            abstract,
            members,
            adviser,
            year,
            technologies,
            githubUrl,
        } = req.body;

        console.log('Received body:', req.body);
        console.log('Received files:', req.files);

        // Validate required text fields
        if (!title || !abstract || !year) {
            return res.status(400).send({
                message: "Title, abstract, and year are required",
            });
        }

        // Validate files
        if (!req.files || !req.files.pdfFile) {
            return res.status(400).send({
                message: "PDF file is required"
            });
        }

        // Validate year
        const yearNum = parseInt(year);
        const now = new Date().getFullYear();
        if (yearNum <= 1900 || yearNum > now + 1) {
            return res.status(400).send({
                message: "Invalid Year! Please input a valid one."
            });
        }



        console.log('Uploading PDF...');
        // Upload PDF with original filename
        const pdfResult = await uploadToCloudinary(
            req.files.pdfFile[0].buffer,
            'pdfs',
            'pdf',
            req.files.pdfFile[0].originalname  // Pass the original filename
        );
        console.log('PDF uploaded:', pdfResult.url);

        // Robust parsing for members and technologies
        let parsedMembers = [];
        let parsedTechnologies = [];
        // Parse members
        try {
            if (typeof members === 'string' && members.trim().startsWith('[')) {
                parsedMembers = JSON.parse(members);
                if (!Array.isArray(parsedMembers)) throw new Error();
            } else if (typeof members === 'string') {
                parsedMembers = members.split(',').map(m => m.trim()).filter(Boolean);
            } else if (Array.isArray(members)) {
                parsedMembers = members;
            }
        } catch {
            parsedMembers = members
                ? members.split(',').map(m => m.trim()).filter(Boolean)
                : [];
        }
        // Parse technologies
        try {
            if (typeof technologies === 'string' && technologies.trim().startsWith('[')) {
                parsedTechnologies = JSON.parse(technologies);
                if (!Array.isArray(parsedTechnologies)) throw new Error();
            } else if (typeof technologies === 'string') {
                parsedTechnologies = technologies.split(',').map(t => t.trim()).filter(Boolean);
            } else if (Array.isArray(technologies)) {
                parsedTechnologies = technologies;
            }
        } catch {
            parsedTechnologies = technologies
                ? technologies.split(',').map(t => t.trim()).filter(Boolean)
                : [];
        }

        const newCapstone = new Capstone({
            title,
            abstract,
            members: parsedMembers, // Fixed typo
            adviser: adviser || '',
            year: yearNum,
            technologies: parsedTechnologies,
            pdfUrl: pdfResult.url,
            pdfPublicId: pdfResult.public_id,
            githubUrl: githubUrl || '',
            createdBy: req.user.id, // Important!
            isApproved: true,
            status: 'approved'
        });

        await newCapstone.save();
        console.log('Capstone saved to database');

        return res.status(201).send({
            message: "Capstone project submitted successfully! Awaiting admin approval.",
            data: newCapstone
        });

    } catch (err) {
        console.error(`Capstone Creation Error:`, err);
        return res.status(500).send({
            message: "Server error when creating capstone",
            error: err.message
        });
    }
};

exports.downloadCapstonePdf = async (req, res) => {
    try {
        const capstone = await Capstone.findById(req.params.id);

        if (!capstone || capstone.isDeleted) {
            return res.status(404).send({ message: "Capstone not found" });
        }

        // If you want it public only when approved:
        if (!capstone.isApproved) {
            return res.status(403).send({ message: "PDF is not available" });
        }

        if (!capstone.pdfUrl) {
            return res.status(404).send({ message: "PDF not found" });
        }

        // Force filename as PDF
        const safeName = String(capstone.title || "capstone")
            .replace(/[^\w\- ]+/g, "")
            .trim()
            .replace(/\s+/g, "_");

        // Set Content-Disposition based on ?download=1 param
        res.setHeader("Content-Type", "application/pdf");
        if (req.query.download === '1') {
            res.setHeader("Content-Disposition", `attachment; filename=\"${safeName}.pdf\"`);
            console.log("[PDF] Content-Disposition: attachment; filename=", `${safeName}.pdf`);
        } else {
            res.setHeader("Content-Disposition", `inline; filename=\"${safeName}.pdf\"`);
            console.log("[PDF] Content-Disposition: inline; filename=", `${safeName}.pdf`);
        }
        try {
            const response = await axios.get(capstone.pdfUrl, { responseType: 'stream' });
            response.data.pipe(res);
        } catch (e) {
            console.error("PDF proxy error (axios):", e);
            res.status(500).send({ message: "Failed to download PDF" });
        }
    } catch (err) {
        console.error("downloadCapstonePdf error:", err);
        res.status(500).send({ message: "Server error" });
    }
};

// ---------------- Update Capstone ----------------
exports.updateCapstone = async (req, res) => {
    try {
        const capstone = await Capstone.findById(req.params.id);

        if (!capstone || capstone.isDeleted) {
            return res.status(404).send({ message: "Capstone not found" });
        }

        // Only Admin or owner can update
        const isAdmin = req.user.role === "Admin";
        if (capstone.createdBy.toString() !== req.user.id && !isAdmin) {
            return res.status(403).send({ message: "Not authorized." });
        }

        const { title, abstract, members, adviser, year, technologies, githubUrl } = req.body;

        if (title !== undefined) capstone.title = title;
        if (abstract !== undefined) capstone.abstract = abstract;
        if (adviser !== undefined) capstone.adviser = adviser;
        if (githubUrl !== undefined) capstone.githubUrl = githubUrl;

        if (year !== undefined) {
            const yearNum = parseInt(year);
            const now = new Date().getFullYear();
            if (Number.isNaN(yearNum) || yearNum <= 1900 || yearNum > now + 1) {
                return res.status(400).send({ message: "Invalid Year!" });
            }
            capstone.year = yearNum;
        }

        // previewImage removed

        if (req.files?.pdfFile?.[0]) {
            if (capstone.pdfPublicId) {
                await deleteFromCloudinary(capstone.pdfPublicId, "pdf");
            }
            const pdfResult = await uploadToCloudinary(
                req.files.pdfFile[0].buffer,
                "pdfs",
                "pdf",
                req.files.pdfFile[0].originalname
            );
            capstone.pdfUrl = pdfResult.url;
            capstone.pdfPublicId = pdfResult.public_id;
        }

        // Prevent non-admins from changing approval status
        if (!isAdmin) {
            capstone.isApproved = capstone.isApproved;
            capstone.status = capstone.status;
        }

        await capstone.save();

        return res.status(200).send({
            message: "Capstone updated successfully",
            data: capstone,
        });
    } catch (err) {
        console.error("Update Capstone error:", err);
        return res.status(500).send({
            message: "Server error when updating capstone",
            error: err.message,
        });
    }
};

// ---------------- Delete Capstone ----------------
exports.deleteCapstoneById = async (req, res) => {
    try {
        const capstoneId = req.params.capstoneId;
        const specificCapstone = await Capstone.findOne({ _id: capstoneId, isDeleted: false });

        if (!specificCapstone) {
            return res.status(404).send({ message: `Capstone with the ID: ${capstoneId} not found!` });
        }

        if (specificCapstone.createdBy.toString() !== req.user.id && req.user.role !== "Admin") {
            return res.status(403).send({ message: "Not authorized." });
        }

        specificCapstone.isDeleted = true;
        specificCapstone.deletedAt = new Date();
        await specificCapstone.save();

        return res.status(200).send({
            message: `Capstone with the ID: ${capstoneId} successfully archived!`,
            data: {
                _id: specificCapstone._id,
                title: specificCapstone.title,
                isDeleted: specificCapstone.isDeleted,
                deletedAt: specificCapstone.deletedAt
            }
        });
    } catch (err) {
        console.log(`Specific Capstone Archival Error: ${err}`);
        return res.status(500).send({ message: "Server error when archiving capstone" });
    }
};

// ---------------- Restore Capstone ----------------
exports.restoreCapstoneById = async (req, res) => {
    try {
        const capstoneId = req.params.capstoneId;
        const specificCapstone = await Capstone.findOne({ _id: capstoneId, isDeleted: true });

        if (!specificCapstone) {
            return res.status(404).send({ message: `Archived capstone with the ID: ${capstoneId} not found!` });
        }

        if (specificCapstone.createdBy.toString() !== req.user.id && req.user.role !== "Admin") {
            return res.status(403).send({ message: "Not authorized to restore this capstone." });
        }

        specificCapstone.isDeleted = false;
        specificCapstone.deletedAt = null;
        await specificCapstone.save();

        return res.status(200).send({
            message: `Capstone with the ID: ${capstoneId} successfully restored!`,
            data: {
                _id: specificCapstone._id,
                title: specificCapstone.title,
                isDeleted: specificCapstone.isDeleted,
                deletedAt: specificCapstone.deletedAt
            }
        });
    } catch (err) {
        console.log(`Specific Capstone Restoration Error: ${err}`);
        return res.status(500).send({ message: "Server error when restoring capstone" });
    }
};