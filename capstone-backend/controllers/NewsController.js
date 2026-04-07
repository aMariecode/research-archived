const News = require('../models/News');
const { uploadToCloudinary } = require('../utils/uploadHelper');

// Get all news (optionally filter by visibility)
exports.getAll = async (req, res) => {
  try {
    const filter = req.query.visible ? { visible: req.query.visible === 'true' } : {};
    const news = await News.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single news item
exports.getOne = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create news
exports.create = async (req, res) => {
  try {
    const { title, date, description, image, visible } = req.body;
    let imageUrl = image || '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'news', 'image', req.file.originalname);
        imageUrl = result.url;
      } catch (err) {
        console.error('News image upload failed:', err);
      }
    }
    const news = new News({
      title,
      date,
      description,
      image: imageUrl,
      visible: visible !== undefined ? (visible === 'true' || visible === true) : true
    });
    await news.save();
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// Update news
exports.update = async (req, res) => {
  try {
    const { title, date, description, image, visible } = req.body;
    let imageUrl = image;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'news', 'image', req.file.originalname);
        imageUrl = result.url;
      } catch (err) {
        console.error('News image upload failed:', err);
      }
    }
    const updateData = { title, date, description, updatedAt: Date.now() };
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (visible !== undefined) updateData.visible = (visible === 'true' || visible === true);
    const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid data' });
  }
};

// Delete news
exports.remove = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle visibility
exports.toggleVisibility = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    news.visible = !news.visible;
    await news.save();
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
