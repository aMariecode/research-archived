// Script to print all capstones and their status for debugging
const mongoose = require('mongoose');
const Capstone = require('../models/Capstone');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone';

async function main() {
  await mongoose.connect(MONGO_URI);
  const capstones = await Capstone.find({});
  console.log('All Capstones:');
  capstones.forEach(c => {
    console.log({
      id: c._id,
      title: c.title,
      status: c.status,
      isApproved: c.isApproved,
      isDeleted: c.isDeleted,
      year: c.year
    });
  });
  await mongoose.disconnect();
}

main().catch(console.error);