'use strict';
const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config');

const User = require('../models/user');

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
  '/checkmeout',
  [check('email', 'Please enter a valid email').isEmail()],
  async (req, res) => {
	  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid Email',
      });
    }
    const { email } = req.body;
    let user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(200).json({
        userExists: true,
      });
    } else {
      sendOTP(email);

      return res.status(200).json({
        userExists: false,
      });
    }
  },
);

router.post(
  '/signup',
  [
    check('name', 'Please enter a valid name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('phone', 'Please enter a valid phone').isMobilePhone(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().toString(),
      });
    }

    const { name, phone, email, password, otp } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }

      if (verifyOTP(email, otp)) {
        user = new User({
          name,
          phone,
          email,
          password,
        });

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(payload, config.jwt.encodingKey, {}, (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        });
      } else {
        res.status(400).json({
          error: 'Wrong OTP',
        });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Error in Saving');
    }
  },
);

router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (!user)
        return res.status(400).json({
          message: 'User Not Exist',
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          error: 'Incorrect Password !',
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, config.jwt.encodingKey, {}, (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
        });
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: 'Server Error',
      });
    }
  },
);

const { sendOTP, verifyOTP } = require('../helpers/otp-manager');

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({
      email: email,
    });

    if (user) {
      sendOTP(email);
      res.status(200).json({
        otpSent: true,
      });
    } else {
      res.status(403).json({
        error: 'unregistered email',
      });
    }
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post('/reset-password', async (req, res) => {
  const { otp, email, newPassword } = req.body;

  try {
    if (verifyOTP(email, otp)) {
      const salt = await bcrypt.genSalt();

      let user = await User.findOne({
        email: email,
      });
      if (user) {
        user.password = await bcrypt.hash(newPassword, salt);
        user.save();
      } else {
        res.json({
          error: 'Email unregistered',
        });
      }
    }
  } catch (e) {
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

/**
 * @method - GET
 * @description - Get LoggedIn User
 * @param - /user/me
 */

const jwtAuth = require('../middleware/jwt-auth');

router.get('/me', jwtAuth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.json({ error: 'Error in Fetching user' });
  }
});

module.exports = router;
