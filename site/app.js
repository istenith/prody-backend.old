var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Email = require('email-templates');
var path = require('path');
var config = require('./config');
var bcrypt = require('bcrypt');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//leader mail extraction
function search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i]._id === nameKey) {
            return myArray[i];
        }
    }
}

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.pw
    }
});
//Email Template
const email = new Email({
    message: {
        from: 'Team ISTE'
    },
    // uncomment below to send emails in development/test env:
    send: true,
    preview: false,
    transport: transporter
});

//loading models
var User = require('./models/user');
var Team = require('./models/team');
var Event = require('./models/event');

//hosting the front end
var app = new express();
var port = 3000;

//coneectiong to backend
mongoose.connect('mongodb://localhost/myDb', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', () => console.log('error connecting to the database!'))
    .once('open', () => console.log('connected to the database'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'pug')

app.post('/regPlayer', (req, res) => {
    var data = new User(req.body);
    var mailid;

    //////validation code
    User.findOne({ 'email': data.email }, (err, result) => {
        if (result == null) {
            if (req.body.pw == req.body.confpw) {
                bcrypt.hash(data.pw, 10, (err, hash) => {
                    data.pw = hash;
                    data.save()
                        .then((item) => {
                            mailid = item._id;
                            res.render('register', { title: "User Registration", id: item._id });
                            console.log(item);
                        })
                        .then(() => {
                            email.send({
                                template: path.join(__dirname, 'emails', 'user'),
                                message: {
                                    to: data.email
                                },
                                locals: {
                                    id: mailid,
                                    name: data.name,
                                }
                            });
                        })
                        .then(() => console.log("email sent"))
                        .catch(err => console.log(err));
                })
            } else {
                res.render('error', { title: "Error", message: "password and conformation password must be the same" })
            }
        }
        else {
            //res.send("The email has already been registered");
            res.render('error', { title: "Error", message: "The email has already been registered" })
        }
    })
});

app.post('/regTeam', (req, res) => {
    var recieved_data = req.body;
    console.log(recieved_data)
    var data = {
        name: recieved_data.team_name,
        event: recieved_data.event,
        team_limit: recieved_data.team_limit,
        members: []
    }
    User.findOne({ 'email': recieved_data.team_leader_email }, (err, userDoc) => {
        if (userDoc == null) {
            res.render('error', { title: "Error", message: "The team leader email is not registered" })
        } else {
            bcrypt.compare(recieved_data.leader_pw, userDoc.pw, (err, resp) => {
                if (resp) {
                    Event.findOne({ 'name': recieved_data.event }, (err, doc) => {
                        var participants = doc != null ? doc.participants : [];
                        var participationFlag = participants.includes(userDoc.id);
                        if (participationFlag == true) {
                            res.render('error', { title: "Error", message: "Team leader has already registered for this event" });
                        }
                        else {
                            data.members.push(userDoc._id);
                            var team = new Team(data);
                            var tid;
                            team.save().then((item) => {
                                tid = item._id;
                                res.render('teamRegister', { title: "Team Registration", id: item._id, name: item.name })
                                email.send({
                                    template: path.join(__dirname, 'emails', 'team'),
                                    message: {
                                        to: userDoc.email
                                    },
                                    locals: {
                                        Tid: tid,
                                        Tname: data.name,
                                    }
                                })
                            })
                            Event.findOneAndUpdate({ 'name': data.event }, { $push: { 'participants': userDoc._id } }, { new: true, upsert: true }, (err, docs) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                        }
                    })
                }
                else {
                    res.render('error', { title: "Error", message: "Invalid Team Leader Password" })
                }
            })
        }
    })
});

app.post('/joinTeam', (req, res) => {
    var recieved_data = req.body;

    User.findOne({ 'email': recieved_data.email }, (err, userDoc) => {
        if (userDoc == null) {
            res.render('error', { title: "Error", message: "This email is not registered" })
        }
        else {
            bcrypt.compare(recieved_data.pw, userDoc.pw, (err, resp) => {
                if (resp) {
                    Team.findOne({ '_id': recieved_data.team_id }, (err, teamDoc) => {
                        if (teamDoc != null) {
                            var event = teamDoc.event;
                            var limit = teamDoc.team_limit;
                            Event.findOne({ 'name': event }, (err, eventDoc) => {
                                var participants = eventDoc != null ? eventDoc.participants : [];
                                var participationFlag = participants.includes(userDoc.id);
                                if (participationFlag == true) {
                                    res.render('error', { title: "Error", message: "You have already registered for this event" });
                                }
                                else {
                                    if (teamDoc.members.length < limit) {
                                        teamDoc.members.push(userDoc._id);
                                        eventDoc.participants.push(userDoc._id);
                                        teamDoc.save();
                                        eventDoc.save();
                                        res.render('error', { title: "Error", message: "Congratulations You have now joined the team" })
                                    } else {
                                        res.render('error', { title: "Error", message: "Max number of members reached" });
                                    }
                                }
                            })
                        }
                        else {
                            res.render('error', { title: "Error", message: "Invalid Team Id" })
                        }
                    })
                } else {
                    res.render('error', { title: "Error", message: "Invalid Password" });
                }
            })
        }
    })
})

app.listen(port);
