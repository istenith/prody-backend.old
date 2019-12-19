var mongoose = require('mongoose');

var eventScheema = new mongoose.Schema({
    name : String,
    participants : [String]
},{versionKey : false});

var Event = new mongoose.model('event',eventScheema);

module.exports = Event;