const router = require("express").Router();
const path = require('path');
// Test endpoint: serve a known-good PDF for inline viewing debug
router.get('/test-inline-pdf', (req, res) => {
    const filePath = path.join(__dirname, '../../capstone-frontend/public/test.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="test.pdf"');
    res.sendFile(filePath, err => {
        if (err) {
            res.status(500).send('Failed to send test PDF');
        }
    });
});
// Analytics endpoints for file view/download/visit
const AnalyticsEvent = require('../models/AnalyticsEvent');

// Track site visits
router.post('/analytics/visit', async (req, res) => {
    try {
        await AnalyticsEvent.create({ type: 'visit', user: req.user?._id });
        res.status(200).send({ message: 'Visit logged' });
    } catch (e) {
        res.status(500).send({ message: 'Error logging visit' });
    }
});

router.post('/analytics/view/:capstoneId', async (req, res) => {
    try {
        await AnalyticsEvent.create({ type: 'view', user: req.user?._id, capstone: req.params.capstoneId });
        res.status(200).send({ message: 'View logged' });
    } catch (e) {
        res.status(500).send({ message: 'Error logging view' });
    }
});
router.post('/analytics/download/:capstoneId', async (req, res) => {
    try {
        await AnalyticsEvent.create({ type: 'download', user: req.user?._id, capstone: req.params.capstoneId });
        res.status(200).send({ message: 'Download logged' });
    } catch (e) {
        res.status(500).send({ message: 'Error logging download' });
    }
});
const CapstoneController = require("../controllers/CapstoneController.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.js");
const multer = require('multer');

// For handling multiple file types
const upload = multer({ storage: multer.memoryStorage() });

router.get("/all", verifyToken, CapstoneController.getAllCapstone);
router.get("/recent", verifyToken, CapstoneController.getAllCapstone);
router.get("/approved", CapstoneController.getApprovedCapstones);
router.post("/", verifyToken, authorizeRoles("Faculty", "Admin"),
    upload.fields([
        { name: 'previewImage', maxCount: 1 },
        { name: 'pdfFile', maxCount: 1 }
    ]),
    CapstoneController.addCapstone
);
router.get("/:capstoneId", verifyToken, CapstoneController.getCapstoneById);
router.get("/:id/pdf", CapstoneController.downloadCapstonePdf);
router.put('/:id', verifyToken, authorizeRoles("Faculty", "Admin"), 
    upload.fields([
        { name: 'previewImage', maxCount: 1 },
        { name: 'pdfFile', maxCount: 1 }
    ]),
    CapstoneController.updateCapstone
)
router.patch("/delete/:capstoneId", verifyToken, authorizeRoles("Faculty", "Admin"), CapstoneController.deleteCapstoneById);
router.patch("/restore/:capstoneId", verifyToken, authorizeRoles("Faculty", "Admin"), CapstoneController.restoreCapstoneById)

module.exports = router;
