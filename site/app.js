var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Email = require('email-templates');
var path = require('path');
var config = require('./config')

//leader mail extraction
function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
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

//hosting the front end
var app = new express();
var port = 3000;

//coneectiong to backend
mongoose.connect('mongodb://localhost/myDb', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error',()=>console.log('error connecting to the database!'))
.once('open',()=>console.log('connected to the database'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.set('view engine', 'pug')

app.post('/regPlayer',(req,res)=>{
    var data = new User(req.body);
    var mailid;
    //////validation code

    User.findOne({'email':data.email},(err,result)=>{
        if(result == null){
            data.save()
            .then((item)=>{
            mailid = item._id;
            res.render('register',{title: "User Registration", id: item._id});
            console.log(item);
            })
            .then(()=>{
                email.send({
                    template: path.join(__dirname,'emails','user'),
                    message: {
                        to: data.email
                        },
                        locals: {
                            id: mailid,
                            name: data.name,
                        }
                })
            })
            .then(()=>console.log("email sent"))
            .catch(err=>console.log(err));
        }
        else{
            //res.send("The email has already been registered");
            res.render('error',{title:"Error",message:"The email has already been registered"})
        }
    })
});

app.post('/regTeam',(req,res)=>{
    var recieved_data = req.body;
    var memArray = [recieved_data.team_member_2, recieved_data.team_member_3, recieved_data.team_member_4 ,recieved_data.team_member_5]

    for( var i = 0; i < memArray.length; i++){ 
        if ( memArray[i] === '') {
          memArray.splice(i, 1); 
          i--;
        }
    }
    memArray.push(recieved_data.team_leader_id);

    var duplicateFlag = false;

    for(var i=0;i<memArray.length;i++){
        for(var j=i+1;j<memArray.length;j++){
            if(memArray[i]==memArray[j]){
                duplicateFlag = true;
                break;
            }
        }
    }

    if(duplicateFlag == false){
        User.find({'_id':{$in:memArray}},(err,docs)=>{
            var leaderDoc;
            var leadMail;
            var tid;
            if(docs.length == memArray.length){
                leaderDoc = search(recieved_data.team_leader_id,docs);
                leadMail = leaderDoc.email;
                tid;leaderDoc = search(recieved_data.team_leader_id,docs);
                leadMail = leaderDoc.email;
                tid;
                var data = {
                    name : recieved_data.team_name,
                    leader :recieved_data.team_leader_id,
                    members : memArray,
                    event : recieved_data.event
                }
                team = new Team(data)
            
                team.save()
                .then((item)=>{
                    //res.send("your Team_id is "+item._id);
                    res.render('teamRegister',{title:"Team Registration", id:item._id, name:item.name});
                    tid =item._id;
                    console.log(item);
                    console.log('leader : '+leaderDoc);
                })
                .then(()=>{
                    email.send({
                        template: path.join(__dirname,'emails','team'),
                        message: {
                            to: leadMail
                            },
                            locals: {
                                Tid: tid,
                                Tname: data.name,
                            }
                    })
                })
                .then(()=>console.log("email sent"))
                .catch(err=>console.log(err));
            }
            else{
                // res.send("Invalid Ids entered")
                res.render('error',{title:"Error",message:"Invalid Ids entered"});
            }
        })
    }else{
        // res.send('Duplicate Ids have been entered')
        res.render('error',{title:"Error",message:"Duplicate Ids have been entered"});
    }
});

app.listen(port);
