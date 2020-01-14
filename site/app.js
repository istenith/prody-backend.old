var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var path = require('path');
var config = require('./config');
var bcrypt = require('bcrypt');
// var http = require('http');
// var https = require('https');
// var fs = require('fs');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

//leader mail extraction
// function search(nameKey, myArray) {
//     for (var i = 0; i < myArray.length; i++) {
//         if (myArray[i]._id === nameKey) {
//             return myArray[i];
//         }
//     }
// }

//loading models
var User = require('./models/user');
var Team = require('./models/team');
var Event = require('./models/event');

//hosting the front end
var app = new express();

//coneectiong to backend
mongoose.connect('mongodb://localhost/prodyDB', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', () =>
  console.log('error connecting to the database!'),
).once('open', () => console.log('connected to the database'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.redirect('https://istenith.com/prody');
});

app.use('/user', require('./routes/user'));
app.use('/team', require('./routes/team'));

//app.post('/regTeam', (req, res) => {
//  var recieved_data = req.body;
//  //console.log(recieved_data)
//  var data = {
//    name: recieved_data.team_name,
//    event: recieved_data.event,
//    team_limit: recieved_data.team_limit,
//    members: [],
//  };
//});

//app.post('/joinTeam', (req, res) => {
//});

module.exports = app;
