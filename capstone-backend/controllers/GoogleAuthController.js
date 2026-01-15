const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { createAccessToken } = require('../middlewares/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid Google token' });

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        fullName: payload.name || payload.email,
        email: payload.email,
        password: '', // No password for Google users
        role: 'Viewer',
      });
    }
    if (user.isDisabled || user.isDeleted) {
      return res.status(403).json({ message: 'Account is disabled or deleted' });
    }
    return res.status(200).json({
      message: 'Google login successful',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken: createAccessToken(user),
    });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ message: 'Server error during Google login' });
  }
};
