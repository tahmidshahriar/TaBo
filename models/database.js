var keyvaluestore = require('../models/keyvaluestore.js');
var kvsUser
var kvsPassword
var credential = require('credential');
var pw = credential();

kvsUser = new keyvaluestore('users');
kvsPassword = new keyvaluestore('passwords');
kvsStatus = new keyvaluestore('userStatuses');
kvsStatusContent = new keyvaluestore('statusContents');
kvsUser.init(function(err, data) {
	console.log("User table loaded")
});
kvsPassword.init(function(err, data) {
	console.log("Password table loaded")
});
kvsStatus.init(function(err, data) {
	console.log("Status table loaded")
});
kvsStatusContent.init(function(err, data) {
	console.log("Status Content table loaded")
});
/*
 * The function below is an example of a database method. Whenever you need to
 * access your database, you should define a function (myDB_addUser,
 * myDB_getPassword, ...) and call that function from your routes - don't just
 * call DynamoDB directly! This makes it much easier to make changes to your
 * database schema.
 */

var myDB_signup_password = function(username, password, route_callbck) {
	if (username == "" || password == "") {
		route_callbck({
			translation : "Fill out all the fields"
		}, null);
	} else {
				kvsPassword.put(username, password, function(err, data) {
					if (err) {
						route_callbck(null, "Put error: " + err);
					} else {
						route_callbck({
							translation : "Created",
							name: username
						}, null);
					}
			})
		}};


var myDB_signup_user = function(user, first, last, email, affiliation, interest, birthday, route_callbck) {
	if (user == "" || first == ""|| last == ""|| email == "" || affiliation == "" || interest == "" || birthday == "") {
		route_callbck({
			translation : "Fill out all the fields"
		}, null);
	} else {
		kvsUser.put(user, JSON.stringify({
					"confirmedFriends" : [], 
				  	"pendingFriends" : [],
				  	"mostRecentUpdate": "",
				  	"firstName": first,
				  	"lastName": last,
				  	"emailAddress": email,
				  	"affiliation": affiliation,
				  	"interestList": [interest],
				  	"birthday": birthday
				}), function(err, data) {
					if (err) {
						route_callbck(null, "Put error: " + err);
					} else {
						route_callbck({
							translation : "Created",
							name: user
						}, null);
					}
				})
			}
	};

var myDB_signin = function(username, password, route_callbck) {
	console.log('Looking up: ' + username);
	kvsPassword.get(username, function(err, data) {
		if (err) {
			route_callbck(null, "Lookup error: " + err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {
			json = JSON.parse(data[0].value)
			pw.verify(JSON.stringify(json), password, function (err, isValid) {
	  			if (err) {
					route_callbck({
						translation : "Invalid Password"
					}, null)
				}
				if (isValid) {
					route_callbck({
						translation : "Logged In",
						name : username
					}, null);
				} else {
					route_callbck({
						translation : "Invalid Password"
					}, null);
				}
			});
		}
	});
};

var myDB_home = function(route_callbck) {
	kvsUser.scanKeyVal(function(err, data) {
		if (err) {
			route_callbck(null, "Lookup error: " + err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {
			route_callbck({
				translation : data
			}, null);
		}
	});
};

var myDB_status = function(user, route_callbck) {
	kvsStatus.get(user, function(err, data) {
		if (data == null) {
			route_callbck(null, null);
		}
		else {
			a = JSON.parse(data[0]["value"]);
			left = a.length;
			add = []
			for (var i = 0; i < a.length; i++ ) {
				kvsStatusContent.get(a[i], function (err, data) {
					add.push(JSON.parse(data[0]["value"]));
					left = left - 1;
					if (left == 0) {
						if (err) {
							route_callbck(null, "Lookup error: " + err);
						} else if (data == null) {
							route_callbck(null, null);
						} else {
							route_callbck({
								translation : add
							}, null);
						} 
					}
				})
			}
		}
	});
};

var myDB_profile = function(user, route_callbck) {
	kvsUser.get(user, function(err, data) {
		if (err) {
			route_callbck(null, "Lookup error: " + err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {
			route_callbck({
				translation : JSON.parse(data[0]["value"])
			}, null);
		}
	});
};

/*
 * We define an object with one field for each method. For instance, below we
 * have a 'lookup' field, which is set to the myDB_lookup function. In
 * routes.js, we can then invoke db.lookup(...), and that call will be routed to
 * myDB_lookup(...).
 */

var database = {
	signin : myDB_signin,
	signupPassword : myDB_signup_password,
	signupUser : myDB_signup_user,
	home : myDB_home,
	status : myDB_status,
	profile : myDB_profile
};

module.exports = database;
