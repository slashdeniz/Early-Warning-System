const Express = require("express");
const BodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
const request = require("request")
const CONNECTION_URL = "mongodb+srv://admin:admin@cluster0-fqdfm.mongodb.net/test";
//const DATABASE_NAME = "example";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(4000, function () {
  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, function (error, db) {
    if(error) {
        console.log("Error: " + error);
    }
    var dbo = db.db("UHDatabase");
    dbo.collection("students").find({}).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      console.log(result.length);
      var gpa = "";
      var attendance = "";
      for(var i = 0; i < result.length; i++) {
        //console.log(result[i]);
        if (result[i].gpa < 3.0) {
          gpa = result[i].name + " has a low gpa."
        } else {
          gpa = result[i].name + " has a great gpa!"
        }
        if (result[i].attendance < 7) {
          attendance = result[i].name + " has missed too many classes";
        } else {
          attendance = result[i].name + " is doing great"
        }
        post(gpa, attendance);

      }
      db.close();
    });
  });
});

function post(gpa, attendance) {
  request.post('http://localhost:8080/engine-rest/process-definition/key/send-email/start', {
    json: {
      "variables": {
    		"amount": {
    			"value":30005,
    			"type":"long"
    		},
    		"item": {
    			"value": "Deniz"
    		}
      }
    }
  }, (error, res, body) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)
  })
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
