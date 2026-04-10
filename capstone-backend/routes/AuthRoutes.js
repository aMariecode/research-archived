const router = require("express").Router();
const AuthController = require("../controllers/AuthController.js");
const GoogleAuthController = require("../controllers/GoogleAuthController.js");
const { authLoginRateLimit, forgotPasswordRateLimit } = require("../middlewares/rateLimit.js");
const { verifyToken } = require("../middlewares/auth.js");

router.post("/register", AuthController.register);
router.post("/login", authLoginRateLimit, AuthController.login);
router.post("/google-login", GoogleAuthController.googleLogin);
router.post("/forgot-password", forgotPasswordRateLimit, AuthController.requestPasswordReset);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;