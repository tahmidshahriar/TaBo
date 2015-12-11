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

var userDBname = "users";
var restaurantDBname = "restaurants";

var users = [
  [
	  "mickey",
	  JSON.stringify({"password" : "mouse", "fullname" : "Mickey Mouse"})
  ]          
];

var restaurants = [
    [
     	"WhiteDog",
     	JSON.stringify({"latitude": "39.953637", "longitude" : "-75.192883", "description" : "Very delicious", "creator": "micket"})
	]

]


/* This function uploads our data. Notice the use of 'async.forEach'
to do something for each element of an array... */

var uploadUsers = function(table, callback) {
async.forEach(users, function (user, callback) {
 console.log("Adding user: " + user[0]);
 table.put(user[0], user[1], function(err, data) {
   if (err)
     console.log("Oops, error when adding "+user[0]+": " + err);
 });
}, callback);
}

var uploadRestaurants = function(table, callback) {
	async.forEach(restaurants, function (restaurant, callback) {
	 console.log("Adding restaurant: " + restaurant[0]);
	 table.put(restaurant[0], restaurant[1], function(err, data) {
	   if (err)
	     console.log("Oops, error when adding "+restaurant[0]+": " + err);
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






var i = 0;
function setupUsers(err, data) {
  i++;
  if (err && i != 2) {
    console.log("Error: " + err); 
  } else if (i==1) {
    console.log("Deleting table "+userDBname+" if it already exists...");
    params = {
        "TableName": userDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupUsers,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (i==2) {
    console.log("Creating table "+userDBname+"...");
    table = new kvs(userDBname)
    table.init(setupUsers)
  } else if (i==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupUsers,10000) // this may not be enough - increase if you're getting errors
  } else if (i==4) {
    console.log("Uploading")
    uploadUsers(table, function(){
      console.log("Done uploading!")
    });
  }
}

var j = 0;
function setupRestaurants(err, data) {
  j++;
  if (err && j != 2) {
    console.log("Error: " + err); 
  } else if (j==1) {
    console.log("Deleting table "+restaurantDBname+" if it already exists...");
    params = {
        "TableName": restaurantDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupRestaurants,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (j==2) {
    console.log("Creating table "+restaurantDBname+"...");
    tableR = new kvs(restaurantDBname)
    tableR.init(setupRestaurants)
  } else if (j==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupRestaurants,10000) // this may not be enough - increase if you're getting errors
  } else if (j==4) {
    console.log("Uploading")
    uploadRestaurants(tableR, function(){
      console.log("Done uploading!")
    });
  }
}


setupRestaurants(null, null)
setupUsers(null, null)









