// Script to remove duplicate capstones by title and year, keeping only the first
const mongoose = require('mongoose');
const Capstone = require('../models/Capstone');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone';

(async () => {
  await mongoose.connect(MONGO_URI);
  const all = await Capstone.find({});
  const seen = new Set();
  let removed = 0;
  for (const cap of all) {
    const key = `${cap.title.trim().toLowerCase()}|${cap.year}`;
    if (seen.has(key)) {
      await Capstone.deleteOne({ _id: cap._id });
      removed++;
      console.log('Removed duplicate:', cap.title, cap.year, cap._id);
    } else {
      seen.add(key);
    }
  }
  console.log(`Removed ${removed} duplicate capstones.`);
  await mongoose.disconnect();
})();