const router = require("express").Router();
const AuthController = require("../controllers/AuthController.js");
const { verifyToken } = require("../middlewares/auth.js");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;