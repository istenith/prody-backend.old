var mongoose = require('mongoose');
var shortid = require('shortid');

var teamScheema = new mongoose.Schema({
    _id : {
        type : String,
        default : shortid.generate
    },
    name : String,
    leader : String,
    members : [String],
    event : String
},{versionKey : false});

var Team = new mongoose.model('team',teamScheema);

module.exports = Team;