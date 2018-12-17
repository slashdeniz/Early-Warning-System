const Express = require("express");
const BodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const request = require("request")
const CONNECTION_URL = "mongodb+srv://admin:admin@cluster0-fqdfm.mongodb.net/test";
//const DATABASE_NAME = "example";

var app = Express();
var jsonObjs = [];
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(4000, function () {

  const { Client, logger } = require('camunda-external-task-client-js');
  const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger };

  const client = new Client(config);
  client.subscribe('monitor-students', async function({ task, taskService }) {
    console.log("Triggered");
    var p = new Promise(resolve => {
      MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, function (error, db) {
        if(error) {
          console.log("Error: " + error);
        }

        //Get studentIDs from class
        var dbo = db.db("UHDatabase");
        var studentIDs = [];
        var classQuery = {name: "COSC 1300"};
        var promise = new Promise (resolve => {
          dbo.collection("classes").find(classQuery).toArray(function(err, result) {
            if (err) throw err;
            studentIDs = result[0].studentIDs;
            //db.close();
          });
        }).then(function () {
          //Review process for each student
          for(var i = 0; i < studentIDs.length; i++) {
            var studentQuery = {studentID: studentIDs[i]};
            var promise = new Promise (function(resolve) {
              dbo.collection("students").find(studentQuery).toArray(function(err, result) {
                if (err) throw err;
                //console.log(result[1]);
                //console.log(result);
                //Variables
                var isFailing = false;
                var gpa = "";
                var attendance = "";
                var name = result[0].name;
                //Set gpa
                if (result[0].gpa < 3.0) {
                  gpa = name + " has a low gpa."
                  isFailing = true;
                } else {
                  gpa = name + " has a great gpa!"
                }

                //Set attendance
                if (result[0].attendance < 7) {
                  attendance = name + " has missed too many classes";
                  isFailing = true;
                } else {
                  attendance = name + " is doing great"
                }

                //Send post
                if (isFailing) {
                  var text = "{ \"" + name + "\": { \"gpa\" : { \"value\": \"" + gpa + "\" }, \"attendance\": { \"value\": \"" + attendance + "\"} } }";
                  var obj = JSON.parse(text);
                  jsonObj = obj;
                  //console.log("Sent: " + gpa + " and " + attendance);
                } else {
                  //console.log("No report needed");
                }
                resolve();
              }).catch((err) => {
                console.log(err);
              });
            }).then(function () {
              console.log(jsonObj);
            });
          }
        });

        //Search each student in class defined from classQuery
        //console.log(studentIDs.length);
        //console.log(studentIDs);
      });
    }).then(function () {
        console.log("**********Moving**************");
        // Complete the task
        //console.log(jsonObjs)
    });
    await taskService.complete(task, jsonObjs);
  });
});

function reviewProcess (studentID, databaseRef) {

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
