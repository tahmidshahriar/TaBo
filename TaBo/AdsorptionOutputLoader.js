/*
 *
Sample output to be uploaded & reformatted
changbo	tahmids~changbo~lcbphilip~test~test2
lcbphilip	tahmids~changbo~lcbphilip~test~test2
tahmids	tahmids~lcbphilip~changbo~test~test2
test	tahmids~changbo~lcbphilip~test~test2
test2	tahmids~changbo~lcbphilip~test~test2


Sample uploaded content to the table:
Key:
changbo

Value: 
{"0":"tahmids","1":"changbo","2":"lcbphilip","3":"test","4":"test2"}

 */

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var db = new AWS.DynamoDB();
var kvs = require('./models/keyvaluestore.js');

var async = require('async');

/* Here is our initial data. */

var friendRecDBname = "friendRec";

var fs = require('fs');
var LineArray = fs.readFileSync('./AWSAdsorptionExchange/part-r-00000').toString().split("\n");
var output = [];
for(i in LineArray) {
    console.log(LineArray[i]);
}

/* This function uploads our data. Notice the use of 'async.forEach'
to do something for each element of an array... */

var uploadFriendRec = function(table, callback) {
  async.forEach(LineArray, function (line, callback) {
	  
	  var kv = line.split('\t');
	  
	  if (kv.length == 2) {
		  var userKey = kv[0];
		  var vs = kv[1].split('~');
		  if (vs.length > 0) {
			  if (vs[0].length > 0) {
				  
			  var outV = {};
			  for (var i = 0; i < vs.length; i++) {
				  outV[i] = vs[i];
			  }
			  var outVString = JSON.stringify(outV);
			  
				  
			   console.log("Adding friend recommendations for: " + userKey 
					   + " and that is: " + outVString);
			   
			   table.put(userKey, outVString, function(err, data) {
			     if (err)
			       console.log("Oops, error when adding "+ userKey +": " + err);
			   });
			  }
		  }
	  }
	  
  }, callback);
}



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
function setupFriendRec(err, data) {
  h++;
  if (err && h != 2) {
    console.log("Error: " + err); 
  } else if (h==1) {
    console.log("Deleting table " + friendRecDBname +" if it already exists...");
    params = {
        "TableName": friendRecDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...");
      setTimeout(setupFriendRec,10000); // this may not be enough - increase if you're getting errors
    })
  } else if (h==2) {
    console.log("Creating table "+ friendRecDBname +"...");
    table = new kvs(friendRecDBname);
    table.init(setupFriendRec);
  } else if (h==3) {
    console.log("Waiting 10s for the table to become active...");
    setTimeout(setupFriendRec,10000) // this may not be enough - increase if you're getting errors
  } else if (h==4) {
    console.log("Uploading")
    uploadFriendRec(table, function(){
      console.log("Done uploading!")
    });
  }
}


setupFriendRec(null, null);
