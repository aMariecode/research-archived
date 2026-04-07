const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/NewsController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');
const { uploadImage } = require('../utils/uploadHelper');

// Public
router.get('/', NewsController.getAll);
router.get('/:id', NewsController.getOne);

// Admin (protected)
router.post('/', verifyToken, verifyAdmin, uploadImage.single('newsImageFile'), NewsController.create);
router.put('/:id', verifyToken, verifyAdmin, uploadImage.single('newsImageFile'), NewsController.update);
router.delete('/:id', verifyToken, verifyAdmin, NewsController.remove);
router.patch('/:id/toggle', verifyToken, verifyAdmin, NewsController.toggleVisibility);

module.exports = router;
