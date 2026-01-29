require('dotenv').config();
const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const [, , email, newPassword] = process.argv;
    
    if (!email || !newPassword) {
      console.error('Usage: node scripts/resetAdminPassword.js email@example.com newpassword');
      process.exit(1);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('User not found:', email);
      process.exit(1);
    }

    if (user.role !== 'Admin') {
      console.log('User is not an admin. Role:', user.role);
      process.exit(1);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    
    console.log('Password reset successfully for:', user.email);
    console.log('Role:', user.role);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset password:', err);
    process.exit(1);
  }
})();
