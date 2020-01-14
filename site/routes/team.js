'use strict';
const router = require('express').Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('./config');

const User = require('../models/User');
const Team = require('../models/team');
const Event = require('./models/event');

const emailer = require('../helpers/emailer');

const teamLimit = {
  'crazy-crawler': 4,
  'molecular-mystery': 4,
  'compact-condo': 1,
  'risk-reduction': 4,
  'lost-lander': 4,
  'spaghetti-bridge': 5,
  'ropeway-design': 5,
  'dev-dash': 1,
};

router.post(
  '/make-team',
  [
    check('email', 'Invalid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
    check('name', 'Please enter a name')
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array().toString(),
      });
    }

    const { name, email, password, event } = req.body;

    User.findOne({ email: email }, (err, userDoc) => {
      if (err) {
        consolse.log(err);
      } else if (userDoc == null) {
        res.json({
          error: 'Your email is not registered',
        });
        // res.render('error', {
        //   title: 'Error',
        //   message: 'The team leader email is not registered',
        // });
      } else {
        bcrypt.compare(password, userDoc.password, (err, res) => {
          if (err) {
            console.log(err);
          } else if (res) {
            Event.findOne({ name: event }, (err, doc) => {
              var participants = doc != null ? doc.participants : [];
              var participationFlag = participants.includes(userDoc.id);
              if (err) {
                console.log(err);
              } else if (participationFlag) {
                res.send({
                  error: 'You have already registered for this event',
                });
                // res.render('error', {
                //   title: 'Error',
                //   message: 'Team leader has already registered for this event',
                // });
              } else {
                let data = {
                  name: name,
                  event: event,
                  members: [],
                };
                data.members.push(userDoc._id);
                var team = new Team(data);
                team
                  .save()
                  .then((item) => {
                    tid = item._id;
                    res.send({
                      id: item._id,
                      name: item.name,
                      event: item.event,
                    });
                    // res.render('teamRegister', {
                    //   title: 'Team Registration',
                    //   id: item._id,
                    //   name: item.name,
                    // });
                  })
                  .then(() => {
                    emailer.send({
                      template: path.join(__dirname, 'emails', 'team'),
                      message: {
                        to: userDoc.email,
                      },
                      locals: {
                        Tid: tid,
                        Tname: data.name,
                      },
                    });
                  })
                  .then(() => console.log('email sent'))
                  .catch((err) => console.log(err));

                Event.findOneAndUpdate(
                  { name: data.event },
                  { $push: { participants: userDoc._id } },
                  { new: true, upsert: true },
                  (err, docs) => {
                    if (err) {
                      console.log(err);
                    }
                  },
                );
              }
            });
          } else {
            res.send({
              error: 'Invalid Password',
            });
            // res.render('error', {
            //   title: 'Error',
            //   message: 'Invalid Team Leader Password',
            // });
          }
        });
      }
    });
  },
);

router.post('/join-team', [], (req, res) => {
  const { email, password, teamid } = req.body;

  User.findOne({ email: email }, (err, userDoc) => {
    if (err) {
      console.log(err);
    } else if (userDoc == null) {
      res.send({
        error: 'Your email is not registered',
      });
      // res.render('error', {
      //   title: 'Error',
      //   message: 'This email is not registered',
      // });
    } else {
      bcrypt.compare(password, userDoc.password, (err, resp) => {
        if (err) {
          console.log(err);
        } else if (resp) {
          Team.findOne({ _id: teamid }, (err, teamDoc) => {
            if (err) {
              console.log(err);
            } else if (teamDoc != null) {
              var event = teamDoc.event;
              Event.findOne({ name: event }, (err, eventDoc) => {
                var participants =
                  eventDoc != null ? eventDoc.participants : [];
                var participationFlag = participants.includes(userDoc.id);
                if (err) {
                  console.log(err);
                } else if (participationFlag == true) {
                  res.send({
                    error: 'Already Registered for the event',
                  });
                  // res.render('error', {
                  //   title: 'Error',
                  //   message: 'You have already registered for this event',
                  // });
                } else {
                  if (teamDoc.members.length < teamLimit[event]) {
                    teamDoc.members.push(userDoc._id);
                    eventDoc.participants.push(userDoc._id);
                    teamDoc.save();
                    eventDoc.save();

                    res.send({
                      id: teamid,
                      name: teamDoc.name,
                      participants: teamDoc.participants,
                    });
                    // res.render('joinTeam', {
                    //   title: 'Done!',
                    //   team: teamDoc.name,
                    // });
                    User.findOne(
                      { id: teamDoc.members[0].email },
                      (err, lead) => {
                        console.log('Email not sent to Leader');
                        emailer
                          .send({
                            template: path.join(
                              __dirname,
                              'emails',
                              'memberJoin',
                            ),
                            message: {
                              to: lead.email,
                            },
                            locals: {
                              team: teamDoc.name,
                              member: userDoc.name,
                              event: teamDoc.event,
                            },
                          })
                          .then(() => console.log('email sent'))
                          .catch((err) => console.log(err));
                      },
                    );
                  } else {
                    res.send({
                      error: 'Max number of members reached',
                    });
                    // res.render('error', {
                    //   title: 'Error',
                    //   message: 'Max number of members reached',
                    // });
                  }
                }
              });
            } else {
              res.send({
                error: 'Invalid Team Id',
              });
              // res.render('error', {
              //   title: 'Error',
              //   message: 'Invalid Team Id',
              // });
            }
          });
        } else {
          // res.render('error', { title: 'Error', message: 'Invalid Password' });
          res.send({
            error: 'Invalid Team Id',
          });
        }
      });
    }
  });
});
