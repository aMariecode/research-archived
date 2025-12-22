const router = require("express").Router();
const AdminController = require("../controllers/AdminController.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.js");

router.get("/all", verifyToken, authorizeRoles("Admin"), AdminController.getAllUsers);
router.get("/roles/:role", verifyToken, authorizeRoles("Admin"), AdminController.getAllUsersByRole);
router.get("/archived/users", verifyToken, authorizeRoles("Admin"), AdminController.getAllArchivedUsers);
router.get("/archived/capstones", verifyToken, authorizeRoles("Faculty","Admin"), AdminController.getAllArchivedCapstones);
router.get("/capstones/:status", verifyToken, authorizeRoles("Admin"), AdminController.getAllSubmittedCapstonesByStatus);
router.patch("/user/disable/:userId", verifyToken, authorizeRoles("Admin"), AdminController.disableUserById);
router.patch("/user/enable/:userId", verifyToken, authorizeRoles("Admin"), AdminController.enableUserById);

router.patch("/capstone/approve/:capstoneId", verifyToken, authorizeRoles("Admin"), AdminController.approveCapstoneById);
router.patch("/capstone/reject/:capstoneId", verifyToken, authorizeRoles("Admin"), AdminController.rejectCapstoneById);
router.patch("/user/archive/:userId", verifyToken, authorizeRoles("Admin"), AdminController.deleteUserById);
router.patch("/user/restore/:userId", verifyToken, authorizeRoles("Admin"), AdminController.restoreUserById);

module.exports = router;