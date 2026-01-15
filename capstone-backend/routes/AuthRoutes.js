const router = require("express").Router();
const AuthController = require("../controllers/AuthController.js");
const GoogleAuthController = require("../controllers/GoogleAuthController.js");
const { verifyToken } = require("../middlewares/auth.js");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google-login", GoogleAuthController.googleLogin);

module.exports = router;