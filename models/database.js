var keyvaluestore = require('../models/keyvaluestore.js');
var kvsUser
var kvsRestaurants

kvsUser = new keyvaluestore('users');
kvsUser.init(function(err, data) {
	console.log("User table loaded")
});

kvsRestaurant = new keyvaluestore('restaurants');
kvsRestaurant.init(function(err, data) {
	console.log("Restaurant table loaded")
});


/*
 * The function below is an example of a database method. Whenever you need to
 * access your database, you should define a function (myDB_addUser,
 * myDB_getPassword, ...) and call that function from your routes - don't just
 * call DynamoDB directly! This makes it much easier to make changes to your
 * database schema.
 */

var myDB_signup = function(username, password, fullname, route_callbck) {
	if (username == "" || password == "" || fullname == "") {
		route_callbck({
			translation : "Fill out all the fields"
		}, null);
	} else {
		console.log('Looking up: ' + username);
		kvsUser.exists(username, function(err, data) {
			if (err) {
				route_callbck(null, "Exist error: " + err);
			} else if (data == false) {

				kvsUser.put(username, JSON.stringify({
					"password" : password,
					"fullname" : fullname
				}), function(err, data) {

					if (err) {
						route_callbck(null, "Put error: " + err);
					} else {
						route_callbck({
							translation : "Created",
							name: username
						}, null);

					}

				})

			} else {
				route_callbck({
					translation : "Username Exists"
				}, null);
			}
		});
	}
};

var myDB_signin = function(username, password, route_callbck) {
	console.log('Looking up: ' + username);
	kvsUser.get(username, function(err, data) {
		if (err) {
			route_callbck(null, "Lookup error: " + err);
		} else if (data == null) {
			route_callbck(null, null);
		} else {
			json = JSON.parse(data[0].value)
			if (json.password == password) {
				route_callbck({
					translation : "Logged In",
					name : username
				}, null);
			} else {
				route_callbck({
					translation : "Invalid Password"
				}, null);
			}
		}
	});
};




var myDB_restaurant = function(route_callbck) {
	kvsRestaurant.scanKeyVal(function(err, data) {
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

var myDB_addrestaurant = function(long, lat, name, desc, creator,route_callbck) {
	if (long == "" || lat == "" || name == "" || lat == "") {
		route_callbck({
			translation : "Fill out all the fields"
		}, null);
	} else {
				kvsRestaurant.put(name, JSON.stringify({
					"latitude" : lat,
					"longitude" : long,
					"description" : desc,
					"creator" : creator
				}), function(err, data) {
					if (err) {
						route_callbck(null, "Put error: " + err);
					} else {
						route_callbck({
							translation : "Created"
						}, null);
					}
				})

	}
};


var myDB_delrestaurant = function(key, inx, route_callbck) {
	kvsRestaurant.remove(key, inx, function(err, data) {
		route_callbck(null, err);
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
	signup : myDB_signup,
	restaurant : myDB_restaurant,
	addrestaurant : myDB_addrestaurant,
	delr : myDB_delrestaurant
};

module.exports = database;