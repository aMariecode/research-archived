const router = require("express").Router();
const UserController = require("../controllers/UserController.js");
const { verifyToken } = require("../middlewares/auth.js");

router.get("/me", verifyToken, UserController.getMe);
router.put("/me", verifyToken, UserController.updateMe);
router.patch("/me/password", verifyToken, UserController.changeMyPassword);
router.patch("/me/delete", verifyToken, UserController.deleteMe);

module.exports = router;