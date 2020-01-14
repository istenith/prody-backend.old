var mongoose = require('mongoose');

var userScheema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      req: true,
    },
    password: {
      type: String,
      req: true,
    },
    teams: [String],
  },
  { versionKey: false },
);

module.exports = new mongoose.model('user', userScheema);
