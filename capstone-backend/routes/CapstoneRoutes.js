const router = require("express").Router();
// Analytics endpoints for file view/download
const AnalyticsEvent = require('../models/AnalyticsEvent');
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
