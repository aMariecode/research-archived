const router = require("express").Router();
const SystemController = require("../controllers/SystemController.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.js");

router.get("/maintenance", SystemController.getMaintenanceStatus);
router.patch("/maintenance", verifyToken, authorizeRoles("Admin"), SystemController.updateMaintenanceStatus);

module.exports = router;
