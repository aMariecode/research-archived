// scripts/fix2024Capstones.js
// Script to ensure all 2024 capstones are approved and not deleted

const mongoose = require('mongoose');
const Capstone = require('../models/Capstone');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    const result = await Capstone.updateMany(
      { year: 2024 },
      { $set: { isApproved: true, isDeleted: false } }
    );
    console.log(`Updated ${result.nModified || result.modifiedCount} capstones for year 2024.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating 2024 capstones:', err);
    process.exit(1);
  }
}

main();
