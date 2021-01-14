const mongoose = require('mongoose');

const VerifiedEmailSchema = new mongoose.Schema({
  email: String,
});

module.exports = new mongoose.model('verified-email', VerifiedEmailSchema);
