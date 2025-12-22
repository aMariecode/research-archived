const router = require("express").Router();
const AnalyticsController = require("../controllers/AnalyticsController.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.js");

router.get("/overview", verifyToken, authorizeRoles("Admin"), AnalyticsController.getOverview);
router.get("/capstones/by-year", verifyToken, authorizeRoles("Admin"), AnalyticsController.getApprovedCapstonesByYear);
router.get("/capstones/by-adviser", verifyToken, authorizeRoles("Admin"), AnalyticsController.getApprovedCapstonesByAdviser);
router.get("/capstones/submissions-trend", verifyToken, authorizeRoles("Admin"), AnalyticsController.getSubmissionsTrendByMonth);

module.exports = router;