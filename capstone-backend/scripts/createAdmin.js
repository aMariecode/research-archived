require('dotenv').config();
const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const [, , fullName, email, password] = process.argv;
    if (!fullName || !email || !password) {
      console.error('Usage: node scripts/createAdmin.js "Full Name" email@example.com password');
      process.exit(1);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.log(`User already exists: ${existing.email} (role: ${existing.role})`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email: normalizedEmail, password: hashed, role: 'Admin' });
    console.log('Admin user created:');
    console.log(`  id: ${user._id}`);
    console.log(`  email: ${user.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
})();
