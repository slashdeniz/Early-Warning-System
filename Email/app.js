//Express app
var express = require('express');
var app = express();
//Nodemailer
var nodemailer = require('nodemailer');
//Transporter for email
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'frendsheep911@gmail.com',
    pass: 'Xtrondenden1'
  }
});
//Content for email
var mailOptions = {
  from: 'frendsheep911@gmail.com',
  to: 'slashdeniz911@gmail.com',
  subject: 'You have been flagged',
  text: 'Recently you have been flagged as failing to meet standards of your class. Please visit the link below to set an appointment with your instructor: https://doodle.com/poll/r759mqcricrqabw3'
};

const { Client, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };

const client = new Client(config);
client.subscribe('send-email', async function({ task, taskService }) {
  // Get a process variable
  //console.log(task);
  //console.log(taskService);
  //const gpa = task.report.get('gpa');
  //const attendance = task.report.get('attendance');
  console.log("Triggered");
  console.log(task);
  //console.log(gpa);
  //console.log(attendance);
  // //Send email
  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });

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
