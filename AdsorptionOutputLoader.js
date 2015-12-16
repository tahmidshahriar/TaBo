/* This is a simple example of a program that creates the database and puts some 
   initial data into it. You don't strictly need this (you can always edit the
   database using the DynamoDB console), but it may be convenient, e.g., when you
   need to reset your application to its initial state during testing. */

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var db = new AWS.DynamoDB();
var kvs = require('./models/keyvaluestore.js');

var async = require('async');

/* Here is our initial data. */

var friendRecDBname = "friendRec";


var fs = require('fs');
var LineArray = fs.readFileSync('./AWSAdsorptionExchange/test.txt').toString().split("\n");
for(i in LineArray) {
    console.log(LineArray[i]);
}

// notification tracks the most recent status updates from a user's friends

var notifications = [
		["changbo", JSON.stringify(["1"])],
		["tahmids", JSON.stringify(["0"])]
]


/* This function uploads our data. Notice the use of 'async.forEach'
to do something for each element of an array... */

var uploadLatests = function(table, callback) {
  async.forEach(latests, function (latest, callback) {
   console.log("Adding latest: " + latest[0]);
   table.put(latest[0], latest[1], function(err, data) {
     if (err)
       console.log("Oops, error when adding "+ latest[0]+": " + err);
   });
  }, callback);
}


/* This function uploads our data. Notice the use of 'async.forEach'
   to do something for each element of an array... */



/* This function does the actual work. Since it needs to perform blocking
   operations at various points (create table, delete table, etc.), it 
   somewhat messily uses itself as a callback, along with a counter to
   distinguish which part of the function is called. In other words, 'i'
   starts out being 0, so the first thing the function does is delete the
   table; then, when that call returns, 'i' is incremented, and the 
   function creates the table; etc. */


/* So far we've only defined functions - the line below is the first line that
   is actually executed when we start the program. */   

var h = 0;
function setupPasswords(err, data) {
  h++;
  if (err && h != 2) {
    console.log("Error: " + err); 
  } else if (h==1) {
    console.log("Deleting table " + passwordDBname+" if it already exists...");
    params = {
        "TableName": passwordDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupPasswords,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (h==2) {
    console.log("Creating table "+ passwordDBname +"...");
    table = new kvs(passwordDBname)
    table.init(setupPasswords)
  } else if (h==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupPasswords,10000) // this may not be enough - increase if you're getting errors
  } else if (h==4) {
    console.log("Uploading")
    uploadPasswords(table, function(){
      console.log("Done uploading!")
    });
    setTimeout(setupUsers,5000);
  }
}


//setupPasswords(null, null);


