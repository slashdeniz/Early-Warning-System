//Declare const references to libraries
const Express = require("express");
const BodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const request = require("request")
const CONNECTION_URL = "mongodb+srv://admin:admin@cluster0-fqdfm.mongodb.net/test";
//const DATABASE_NAME = "example";

//Create express app and set rules
var app = Express();
var jsonObjs = [];
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.listen(4000, function () {});

//Camunda task client & global variables to use outside of calls
const { Client, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };
var students = [];
var studentIDs = [];
var reviews = [];
var reviewObj = {};
const client = new Client(config);
//Subscribe as task 'monitor-students' (will poll for activity until terminated)
client.subscribe('monitor-students', function({ task, taskService }) {
  console.log("Task Triggered");
  var promise = new Promise(resolve => { //Promise for async execution
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, function (error, db) {
      if(error) {
        console.log("Error: " + error);
      }

      /* ~~~ Might want to edit in the case that there are more than one class ~~~ */
      var dbo = db.db("UHDatabase");
      var classQuery = {name: "COSC 1300"};

      //Get studentIDs from class
      dbo.collection("classes").find(classQuery).toArray(function(err, result) {
        if (err) throw err;
        studentIDs = result[0].studentIDs;
        console.log("Acquiring Student IDs");
      });

      //Get all students information then resolve promise
      dbo.collection("students").find({}).toArray(function(err,result) {
        if (err) throw err;
        students = result;
        console.log("Acquiring Student Information")
        resolve();
      });
    });
  }).then(function () {
    console.log("Start reviewProcess for students");

    //Start reviewProcess for students
    for(var i = 0; i < students.length; i++) {
      var review = reviewProcess(studentIDs[i], students);
      if(review != -1) {
        var index = searchStudents(studentIDs[i], students);
        reviewObj[students[index].email] = review; //Create objects of the review process with student email as their keys and review report as value
        reviews.push(reviewObj); //Append reviewObj to an array of reviews
        reviewObj = {};
      }
    }
  }).then(function () {
    console.log("Begin Posting Review Reports to Next Task");
    //Http POST each reviewObj in reviews to next task
    for(var i = 0; i < reviews.length; i++) {
      post(JSON.stringify(reviews[i]));
    }
    reviews = []; //Clear out reviews
  }).then(function () {
    //Mark task as complete
    taskService.complete(task);
  }).catch(function (error) {
    //Handle any errors with promise
    console.log(error);
  });
});

//Match studentID in array of students, return index number
function searchStudents (studentID, students) {
  for(var i = 0; i < students.length; i++) {
    if(students[i].studentID == studentID) {
      //console.log(students[i].name);
      return i;
    }
  }
}

//Review students based on gpa and attendance
function reviewProcess (studentID, students) {
  //Set variables
  var index = searchStudents(studentID, students);
  var isFailing = false;
  var gpa = "";
  var attendance = "";
  var name = students[index].name;

  //Set gpa report
  if (students[index].gpa < 2.5) {
    gpa = name + " is not fullfilling the course requirement of a 2.5 gpa. Currently has a gpa of " + students[index].gpa;
    isFailing = true;
  } else {
    gpa = name + " is doing well with a gpa of " + students[index].gpa;
  }

  //Set attendance report
  if (students[index].attendance < 3) {
    attendance = name + " has missed too many classes(" + (4-students[index].attendance) + "). Must attend atleast 3 out of the 4 past classes.";
    isFailing = true;
  } else {
    attendance = name + " is doing great attendance wise.";
  }

  //Return final report if attendance or gpa is below requirements
  if (isFailing) {
    var report = gpa + "\n" + attendance;
    return report;
    //console.log("Sent: " + gpa + " and " + attendance);
  } else {
    //console.log("No report needed");
    return -1;
  }
}

function post(value) {
  var request = require('request');
  request.post(
      'http://localhost:3000/',
      { json: { key: value } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body)
          }
      }
  );
  // var http = require('http');
  //
  // var options = {
  //   host: 'localhost',
  //   path: '/',
  //   port: '3000',
  //   method: 'POST'
  // };
  //
  // var req = http.request(options, function(response) {
  //   var str = ''
  //   response.on('data', function (chunk) {
  //     str += chunk;
  //   });
  //
  //   response.on('end', function () {
  //     console.log(str);
  //   });
  // });
  // //This is the data we are posting, it needs to be a string or a buffer
  // var text = "This is text"
  // req.write(text);
  // req.end();
}

// //Create Collection for teachers and students
// var dbo = client.db("UHDatabase");
// dbo.createCollection("students", function(err, res) {
//   if (err) throw err;
//   console.log("Collection created!");
//   client.close();
// });
// dbo.createCollection("teachers", function(err, res) {
//   if (err) throw err;
//     console.log("Collection created!");
//     client.close();
// })

// //Insert myobj into database collection (will repeat if already exists)
// var dbo = db.db("UHDatabase");
// var myobj = { name: "Abraham Lincoln", studentID: 6341237, gpa: 3.1, attendance: 7 };
// dbo.collection("students").insertOne(myobj, function(err, res) {
//   if (err) throw err;
//   console.log("1 document inserted");
//   db.close();
// });

// //Update one field (can add as well)
// var dbo = db.db("UHDatabase");
// var myquery = { studentID: 1272221 };
// var newvalues = { $set: { gpa: 3.05 } };
// dbo.collection("students").updateOne(myquery, newvalues, function(err, res) {
//   if(err) throw err;
//   console.log("done");
//   db.close();
// });
