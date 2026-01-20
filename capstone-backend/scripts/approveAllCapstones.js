const mongoose = require('mongoose');
const Capstone = require('../models/Capstone');

// MongoDB connection string
const MONGO_URI = 'mongodb://localhost:27017/capstone';

async function approveAllCapstones() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all capstones that are not deleted and not approved
    const unapprovedCapstones = await Capstone.find({
      isDeleted: false,
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } }
      ]
    });

    console.log(`Found ${unapprovedCapstones.length} unapproved capstones`);

    if (unapprovedCapstones.length === 0) {
      console.log('All capstones are already approved!');
      process.exit(0);
    }

    // Update all to approved
    const result = await Capstone.updateMany(
      {
        isDeleted: false,
        $or: [
          { isApproved: false },
          { isApproved: { $exists: false } }
        ]
      },
      {
        $set: {
          isApproved: true,
          status: 'approved'
        }
      }
    );

    console.log(`✅ Successfully approved ${result.modifiedCount} capstones`);
    
    // Display the approved capstones
    const allApproved = await Capstone.find({
      isDeleted: false,
      isApproved: true
    }).select('title year');
    
    console.log('\nAll approved capstones:');
    allApproved.forEach(cap => {
      console.log(`  - ${cap.title} (${cap.year})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error approving capstones:', error);
    process.exit(1);
  }
}

approveAllCapstones();
