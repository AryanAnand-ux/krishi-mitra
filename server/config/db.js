// server/config/db.js

const mongoose = require('mongoose');

// This function will connect our app to the database
const connectDB = async () => {
  try {
    // We use process.env.DATABASE_URL which we defined in our .env file
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ MongoDB Connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;