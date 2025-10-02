// server/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true, // Each mobile number must be unique
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date, // We'll store a timestamp for when the OTP expires
  },
});

// A "Model" is a tool we use to interact with a specific collection in the database
module.exports = mongoose.model('User', UserSchema);