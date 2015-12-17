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

var passwordDBname = "passwords";
var userDBname = "users";
var userStatusDBname = "userStatuses";
var statusContentDBname = "statusContents";
var notificationDBname = "notifications";
var latestDBname = "latests";
var onlineOfflineDBname = "onlineOffline";

var credential = require('credential');
var pw = credential();


// UserID will be at most 15 (inclusive) in length, and only contain
// lowercase alphabets or 0 to 9

var latests = [["latest", "2"]]

var passwords = [
              ["changbo", "xdsdfsdgadf341"],
              ["tahmids", "dino"]
                 ]


var users = [
  [
	  "changbo",
	  JSON.stringify({"confirmedFriends" : ["tahmids"], 
		  	"pendingFriends" : [],
		  	"mostRecentUpdate": "finished hw4",
		  	"firstName": "Changbo",
		  	"lastName": "Li",
		  	"emailAddress": "lcbphilip@gmail.com",
		  	"affiliation": "Penn",
		  	"interestList": ["cycling", "singing"],
		  	"birthday": "1992.10.12"
	  })
  ],
  [
		"tahmids",
		JSON.stringify({"confirmedFriends" : ["changbo"], 
	  	"pendingFriends" : [],
	  	"mostRecentUpdate": "working on nets212",
	  	"firstName": "Tahmid",
	  	"lastName": "Shariar",
	  	"emailAddress": "tahmids@seas.upenn.edu",
	  	"affiliation": "Penn",
	  	"interestList": ["drinking", "partying"],
	  	"birthday": "2000.10.10"
		})
   
   ]
  
];

var userStatuses = [
    [
     	"changbo",
     	JSON.stringify(["0"])
	],
    [
  		"tahmids",
  		JSON.stringify(["1", "2"])
	]

]

var statusContents = [
    ["0",
		JSON.stringify({
		  	"content": "finished hw4",
		  	"creator": "changbo",
		  	"host": "changbo",
		  	"comments": [
		  	             	{"commentor": "tahmids",
		  	             	 "commentContent": "me too!"
		  	            	 },
		  	            	 {"commentor": "changbo",
			  	             "commentContent": "lol" 
		  	            	 }
		  	             ]
			})
     ],
    ["2",
		JSON.stringify({
		  	"content": "staring midterm now",
		  	"creator": "tahmids",
		  	"host": "tahmids",
		  	"comments": [
		  	             	{"commentor": "changbo",
		  	             	 "commentContent": "gl"
		  	            	 },
                       {"commentor": "tahmids",
                       "commentContent": "ty" 
                       }
		  	             ]
			})
	],
	["1",
		JSON.stringify({
		  	"content": "let's start final project...",
		  	"creator": "tahmids",
		  	"host": "tahmids",
		  	"comments": []
			})
	]           
]

// notification tracks the most recent status updates from a user's friends

var notifications = [
		["changbo", JSON.stringify(["1"])],
		["tahmids", JSON.stringify(["0"])]
]

var onlineOffline = [
                 ["changbo", "offline"],
                 ["tahmids", "offline"]
                    ]


/* This function uploads our data. Notice the use of 'async.forEach'
to do something for each element of an array... */

var uploadPasswords = function(table, callback) {
	async.forEach(passwords, function (password, callback) {
	 console.log("Adding password: " + password[0]);

  pw.hash(password[1], function (err, hash) {
     table.put(password[0], hash, function(err, data) {
     if (err)
       console.log("Oops, error when adding "+password[0]+": " + err);
    })   ;
  })



	}, callback);
	}

var uploadUsers = function(table, callback) {
async.forEach(users, function (user, callback) {
 console.log("Adding user: " + user[0]);
 table.put(user[0], user[1], function(err, data) {
   if (err)
     console.log("Oops, error when adding "+user[0]+": " + err);
 });
}, callback);
}

var uploadUserStatuses = function(table, callback) {
	async.forEach(userStatuses, function (userStatus, callback) {
	 console.log("Adding userStatus: " + userStatus[0]);
	 table.put(userStatus[0], userStatus[1], function(err, data) {
	   if (err)
	     console.log("Oops, error when adding "+ userStatus[0]+": " + err);
	 });
	}, callback);
}

var uploadStatusContents = function(table, callback) {
	async.forEach(statusContents, function (statusContent, callback) {
	 console.log("Adding statusContent: " + statusContent[0]);
	 table.put(statusContent[0], statusContent[1], function(err, data) {
	   if (err)
	     console.log("Oops, error when adding "+ statusContent[0]+": " + err);
	 });
	}, callback);
}

var uploadNotifications = function(table, callback) {
	async.forEach(notifications, function (notification, callback) {
	 console.log("Adding notification: " + notification[0]);
	 table.put(notification[0], notification[1], function(err, data) {
	   if (err)
	     console.log("Oops, error when adding "+ notification[0]+": " + err);
	 });
	}, callback);
}

var uploadLatests = function(table, callback) {
  async.forEach(latests, function (latest, callback) {
   console.log("Adding latest: " + latest[0]);
   table.put(latest[0], latest[1], function(err, data) {
     if (err)
       console.log("Oops, error when adding "+ latest[0]+": " + err);
   });
  }, callback);
}

var uploadOnlineOffline = function(table, callback) {
	async.forEach(onlines, function (online, callback) {
	 console.log("Adding user online/offline status: " + online[0]);
	 table.put(online[0], online[1], function(err, data) {
	   if (err)
	     console.log("Oops, error when adding "+online[0]+": " + err);
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
    setTimeout(setupUserStatuses,5000);
  }
}

var j = 0;
function setupUserStatuses(err, data) {
  j++;
  if (err && j != 2) {
    console.log("Error: " + err); 
  } else if (j==1) {
    console.log("Deleting table "+ userStatusDBname +" if it already exists...");
    params = {
        "TableName": userStatusDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupUserStatuses,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (j==2) {
    console.log("Creating table "+userStatusDBname+"...");
    tableR = new kvs(userStatusDBname)
    tableR.init(setupUserStatuses)
  } else if (j==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupUserStatuses,10000) // this may not be enough - increase if you're getting errors
  } else if (j==4) {
    console.log("Uploading")
    uploadUserStatuses(tableR, function(){
      console.log("Done uploading!")
    });
    setTimeout(setupStatusContents,5000);
  }
}

var k = 0;
function setupStatusContents(err, data) {
  k++;
  if (err && k != 2) {
    console.log("Error: " + err); 
  } else if (k==1) {
    console.log("Deleting table "+ statusContentDBname +" if it already exists...");
    params = {
        "TableName": statusContentDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupStatusContents,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (k==2) {
    console.log("Creating table "+statusContentDBname+"...");
    tableR = new kvs(statusContentDBname)
    tableR.init(setupStatusContents)
  } else if (k==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupStatusContents,10000) // this may not be enough - increase if you're getting errors
  } else if (k==4) {
    console.log("Uploading")
    uploadStatusContents(tableR, function(){
      console.log("Done uploading!")
    });
    setTimeout(setupNotifications,5000);
  }
}


var l = 0;
function setupNotifications(err, data) {
  l++;
  if (err && l != 2) {
    console.log("Error: " + err); 
  } else if (l==1) {
    console.log("Deleting table "+ notificationDBname +" if it already exists...");
    params = {
        "TableName": notificationDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupNotifications,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (l==2) {
    console.log("Creating table "+notificationDBname+"...");
    tableR = new kvs(notificationDBname)
    tableR.init(setupNotifications)
  } else if (l==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupNotifications,10000) // this may not be enough - increase if you're getting errors
  } else if (l==4) {
    console.log("Uploading")
    uploadNotifications(tableR, function(){
      console.log("Done uploading!")
    });
    setTimeout(setupLatests,5000);
  }
}

var m = 0;
function setupLatests(err, data) {
  m++;
  if (err && m != 2) {
    console.log("Error: " + err); 
  } else if (m==1) {
    console.log("Deleting table "+ latestDBname +" if it already exists...");
    params = {
        "TableName": latestDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupLatests,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (m==2) {
    console.log("Creating table "+latestDBname+"...");
    tableR = new kvs(latestDBname)
    tableR.init(setupLatests)
  } else if (m==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupLatests,10000) // this may not be enough - increase if you're getting errors
  } else if (m==4) {
    console.log("Uploading")
    uploadLatests(tableR, function(){
      console.log("Done uploading!")
    });
  }
}

var n = 0;
function setupOnlineOffline(err, data) {
  n++;
  if (err && n != 2) {
    console.log("Error: " + err); 
  } else if (n==1) {
    console.log("Deleting table "+ onlineOfflineDBname +" if it already exists...");
    params = {
        "TableName": onlineOfflineDBname
    }
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...")
      setTimeout(setupOnlineOffline,10000) // this may not be enough - increase if you're getting errors
    })
  } else if (n==2) {
    console.log("Creating table "+onlineOfflineDBname+"...");
    tableR = new kvs(onlineOfflineDBname)
    tableR.init(setupOnlineOffline)
  } else if (n==3) {
    console.log("Waiting 10s for the table to become active...")
    setTimeout(setupOnlineOffline,10000) // this may not be enough - increase if you're getting errors
  } else if (n==4) {
    console.log("Uploading")
    uploadOnlineOffline(tableR, function(){
      console.log("Done uploading!")
    });
  }
}

setupPasswords(null, null);


