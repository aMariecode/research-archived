require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async ()=>{
  try{
    await connectDB();
    const [, , email] = process.argv;
    if (!email) { console.error('Usage: node scripts/dumpUser.js email@example.com'); process.exit(1); }
    const u = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!u) { console.log('User not found:', email); process.exit(0); }
    const out = {
      id: u._id.toString(),
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      isDisabled: u.isDisabled,
      isDeleted: u.isDeleted,
      passwordHash: u.password ? u.password : null,
      createdAt: u.createdAt,
    };
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }catch(err){ console.error('Error:', err); process.exit(1); }
})();
