const axios = require('axios');
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController.js');

// Admin login with reCAPTCHA verification
router.post('/login', async (req, res) => {
    const { username, password, recaptchaToken } = req.body;
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token is required.' });
    }

    // Verify reCAPTCHA token with Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
        const response = await axios.post(verifyUrl);
        if (!response.data.success) {
            return res.status(403).json({ message: 'reCAPTCHA verification failed.' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Error verifying reCAPTCHA.' });
    }

    // Finalize admin authentication logic
    const bcrypt = require('bcryptjs');
    const User = require('../models/User.js');
    const { createAccessToken } = require('../middlewares/auth.js');
    try {
        const admin = await User.findOne({
            fullName: username,
            role: 'Admin',
            isDeleted: false,
            isDisabled: false
        }).select('+password');
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        admin.lastLogin = new Date();
        await admin.save();
        const token = createAccessToken(admin);
        return res.status(200).json({
            message: 'Admin login successful',
            user: { id: admin._id, fullName: admin.fullName, email: admin.email, role: admin.role, lastLogin: admin.lastLogin },
            accessToken: token
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error during admin login.' });
    }
});

module.exports = router;
