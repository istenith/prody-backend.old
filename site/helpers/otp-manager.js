emailer = require('./emailer');
OTP = require('../models/otp');
shortid = require('shortid');
path = require('path');

module.exports.sendOTP = async (email) => {
  const newOtp = shortid.generate();
  console.log('otp is %s', newOtp);

  OTP.updateOne(
    {
      email: email,
      otp: newOtp,
    },
    (err, res) => {},
  );

  const response = await emailer
    .send({
      template: path.join(__dirname, 'emails', 'otp'),
      message: { to: email },
      locals: {
        otp: newOtp,
      },
    })
    .then(() => console.log('OTP sent'));

  return response;
};

module.exports.verifyOTP = (email, otp) => {
  let isCorrect = false;
  OTP.findOne(
    {
      email: email,
    },
    (err, otpRecord) => {
      if (err) {
        console.log(err);
      }
      if (otpRecord) {
        if (otp === otpRecord.otp) {
          otpRecord.remove();
          isCorrect = true;
        } else {
          console.log('incorrect');
        }
      }
    },
  );
  return isCorrect;
};
