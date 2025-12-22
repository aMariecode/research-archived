const router = require("express").Router();
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
router.put("/:id", verifyToken, authorizeRoles("Faculty"), 
    upload.fields([
        { name: 'previewImage', maxCount: 1 },
        { name: 'pdfFile', maxCount: 1 }
    ]),
    CapstoneController.updateCapstone
)
router.patch("/delete/:capstoneId", verifyToken, authorizeRoles("Faculty", "Admin"), CapstoneController.deleteCapstoneById);
router.patch("/restore/:capstoneId", verifyToken, authorizeRoles("Faculty", "Admin"), CapstoneController.restoreCapstoneById)

module.exports = router;
