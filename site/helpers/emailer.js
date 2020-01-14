var nodemailer = require('nodemailer');
var Email = require('email-templates');
var config = require('../config');

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: config.gmail.email,
    pass: config.gmail.password,
  },
});
// Email Template
const emailer = new Email({
  message: {
    from: 'Team ISTE',
  },
  // uncomment below to send emails in development/test env:
  send: true,
  preview: false,
  transport: transporter,
});

module.exports = emailer;
