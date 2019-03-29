//Express app
var express = require('express');
var app = express();
//Nodemailer
var nodemailer = require('nodemailer');
//Transporter for email
//~~~Might need to change for specific teachers for specific classes~~~
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'frendsheep911@gmail.com',
    pass: 'Xtrondenden1'
  }
});

//Camunda task client & global variables to use outside of calls
const { Client, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };
const client = new Client(config);

//Create express app and set rules
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handle Http POSTS, receives reports from previous task and stores it into an array to be used by the client
var reports = [];
app.post('/', function (req, res) {
  console.log("Receiving Reports");
  var body = eval(req.body);
  reports.push(JSON.parse(body.key));
  res.set('Content-Type', 'text/plain')
  res.send(`You sent: ${body} to Express`)
});

client.subscribe('send-email', async function({ task, taskService, report }) {
  console.log("Task Triggered");
  //Loop through reports array and send email with nodemailer
  for(var i = 0; i < reports.length; i++) {
    console.log(reports[i]);
    var key = Object.keys(reports[i]);
    //Content for email
    var mailOptions = {
      from: 'slashdeniz911@gmail.com',
      to: key[0],
      subject: 'You have been flagged',
      text: 'Recently you have been flagged as failing to meet standards of your class. Please visit the link below to set an appointment with your instructor: https://doodle.com/meetme/qc/4XLtfHNylk. '
      + reports[i][key[0]]
    };
    //Send email
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
  //Reset reports
  reports = [];

  // Complete the task
  await taskService.complete(task);
});


// //Send email function
// function sendEmail (user, pass, from, to, subject, text) {
//   //Nodemailer
//   var nodemailer = require('nodemailer');
//   //Transporter for email
//   var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: user,
//       pass: pass
//     }
//   });
//   //Content for email
//   var mailOptions = {
//     from: from,
//     to: to,
//     subject: subject,
//     text: text
//   };
//   //Send email
//   transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// }

//Host index.html
app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});

//Host on localhost:3000
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
