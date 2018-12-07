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
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

const { Client, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };

const client = new Client(config);
client.subscribe('send-email', async function({ task, taskService }) {
  // Get a process variable
  const amount = task.variables.get('amount');
  const item = task.variables.get('item');

  //Send email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  //Charge credit card
  console.log(`Charging credit card with an amount of ${amount}€ for the item '${item}'...`);

  // Complete the task
  await taskService.complete(task);
});

//Host index.html
app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});

//Host on localhost:3000
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
