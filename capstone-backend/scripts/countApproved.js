const mongoose = require('mongoose');
const Capstone = require('../models/Capstone');

const MONGO_URI = 'mongodb://localhost:27017/capstone';

async function countApproved() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const approved = await Capstone.find({
      isDeleted: false,
      isApproved: true
    }).select('title year').sort({ year: -1 });

    console.log(`Total approved capstones: ${approved.length}\n`);
    
    const byYear = {};
    approved.forEach(cap => {
      if (!byYear[cap.year]) byYear[cap.year] = [];
      byYear[cap.year].push(cap.title);
    });

    Object.keys(byYear).sort((a, b) => b - a).forEach(year => {
      console.log(`${year}: ${byYear[year].length} projects`);
      byYear[year].forEach(title => console.log(`  - ${title}`));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

countApproved();
