var mongoose = require('mongoose');
var shortid = require('shortid');

var userScheema = new mongoose.Schema({
    _id : {
        type : String,
        default : shortid.generate
    },
    name : String,
    phone : Number,
    email : String
},{versionKey : false});

var User = new mongoose.model('user',userScheema);

module.exports = User;