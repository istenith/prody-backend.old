const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
});

module.exports = new mongoose.model('otp', otpSchema);
