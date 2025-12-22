const router = require("express").Router();
const SearchController = require("../controllers/SearchController.js");
const { verifyToken, authorizeRoles } = require("../middlewares/auth.js");

router.get("/search", verifyToken, SearchController.searchCapstones);
router.get("/filter", verifyToken, SearchController.filterCapstones);

module.exports = router;