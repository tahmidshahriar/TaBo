var keyvaluestore = require('../models/keyvaluestore.js');
var kvsUser
var kvsPassword
var credential = require('credential');
var pw = credential();
async = require("async");

kvsNotif = new keyvaluestore('notifications');
kvsUser = new keyvaluestore('users');
kvsPassword = new keyvaluestore('passwords');
kvsStatus = new keyvaluestore('userStatuses');
kvsStatusContent = new keyvaluestore('statusContents');
kvsLatest = new keyvaluestore('latests');
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
kvsLatest.init(function(err, data) {
	console.log("Latest table loaded")
});
kvsNotif.init(function(err, data) {
	console.log("Latest table loaded")
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
					kvsStatus.put(user, JSON.stringify([]), function (err, data) {
						if (err) {
							route_callbck(null, "Put error: " + err);
						} else {
							route_callbck({
								translation : "Created",
								name: user
							}, null);
						}
					})
				})
			}
	};

var myDB_signin = function(username, password, route_callbck) {
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
			async.each(a,
		  // 2nd param is the function that each item is passed to
		  function(item, callback){
		    // Call an asynchronous function, often a save() to DB
				kvsStatusContent.get(item, function (err, data) {
					temp = JSON.parse(data[0]["value"])
					temp["key"] = item
					add.push( temp );
				  callback();
		    });
		  },
		  // 3rd param is the function to call when everything's done
		  function(err){
		    // All tasks are done now
				route_callbck({translation : add}, null);
		  }
		);
	}
})

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


var myDB_addStatus = function(host, creator, post, route_callbck) {
	kvsLatest.get("latest", function (err, data) {
		if (data == null) {
			kvsLatest.put("latest", "0", function(err, data) {
				kvsStatusContent.put("1", JSON.stringify({
					"content" : post, 
				  	"creator" : creator,
				  	"host": host,
				  	"comments": []
				}), function (err, data) {
					kvsStatus.get(host, function (err, data) {
						myVal = data[0]["value"]
						myInx  = data[0]["inx"]
						myVal.push("0")
						kvsStatus.updateValue(host, myInx, myVal, function(err, data) {
							if (host == creator) {
								kvsUser.get(host, function (err, data) {
									myVal = JSON.parse(data[0]["value"])
									myInx = data[0]["inx"]
									myVal["mostRecentUpdate"] = post
									kvsUser.update(host, myInx, myVal, function(err, data) {
										if (err) {
											route_callbck(null, "Lookup error: " + err);
										} else {
											route_callbck(null, null);
										}
									})
								})
							} else {
								if (err) {
									route_callbck(null, "Lookup error: " + err);
								} else {
									route_callbck(null, null);
								}
							}
						}) 
					})
				})
			})
		} else {
			val = parseInt(data[0]["value"]) + 1
			strVal = val.toString();
			kvsLatest.updateValue("latest", data[0]["inx"], val, function(err, data) {
				kvsStatusContent.put(strVal, JSON.stringify({
					"content" : post, 
				  	"creator" : creator,
				  	"host": host,
				  	"comments": []
				}), function (err, data) {
					kvsStatus.get(host, function (err, data) {
						myVal = JSON.parse(data[0]["value"])
						myInx  = data[0]["inx"]
						myVal.push(strVal);
						kvsStatus.updateValue(host, myInx, myVal, function(err, data) {
								if (host == creator) {
									kvsUser.get(host, function (err, data) {
										myVal = JSON.parse(data[0]["value"])
										myInx = data[0]["inx"]
										myVal.mostRecentUpdate = post
										kvsUser.update(host, myInx, myVal, function(err, data) {
											if (err) {
												route_callbck(null, "Lookup error: " + err);
											} else {
												route_callbck(null, null);
											}
										})
									})
								} else {
									if (err) {
										route_callbck(null, "Lookup error: " + err);
									} else {
										route_callbck(null, null);
									}
								}
							}) 
						}) 
					})
				})
		}
	})
};


// var myDB_addStatus = function(host, creator, post, route_callbck) {
// 	kvsLatest.get("latest", function (err, data) {
// 		if (data == null) {
// 			kvsLatest.put("latest", "0", function(err, data) {
// 				kvsStatusContent.put("1", JSON.stringify({
// 					"content" : post, 
// 				  	"creator" : creator,
// 				  	"host": host,
// 				  	"comments": []
// 				}), function (err, data) {
// 					kvsStatus.get(host, function (err, data) {
// 						myVal = data[0]["value"]
// 						myInx  = data[0]["inx"]
// 						myVal.push("0")
// 						kvsStatus.updateValue(host, myInx, myVal, function(err, data) {
// 							if (host == creator) {
// 								kvsUser.get(host, function (err, data) {
// 									myVal = JSON.parse(data[0]["value"])
// 									myInx = data[0]["inx"]
// 									myVal["mostRecentUpdate"] = post
// 									kvsUser.update(host, myInx, myInx, function(err, data) {
// 										if (err) {
// 											route_callbck(null, "Lookup error: " + err);
// 										} else {
// 											route_callbck(null, null);
// 										}
// 									})
// 								})
// 							} else {
// 								kvsNotif.get(host, function (err, data) {
// 									myVal = JSON.parse(data[0]["value"])
// 									myInx = data[0]["inx"]
// 									myVal.push(strVal)
// 									kvsNotif.update(host, myVal, myInx, function (err,data) {
// 										if (err) {
// 											route_callbck(null, "Lookup error: " + err);
// 										} else {
// 											route_callbck(null, null);
// 										}
// 									})
// 								})
// 							}
// 						}) 
// 					})
// 				})
// 			})
// 		} else {
// 			val = parseInt(data[0]["value"]) + 1
// 			strVal = val.toString();
// 			kvsLatest.updateValue("latest", data[0]["inx"], val, function(err, data) {
// 				kvsStatusContent.put(strVal, JSON.stringify({
// 					"content" : post, 
// 				  	"creator" : creator,
// 				  	"host": host,
// 				  	"comments": []
// 				}), function (err, data) {
// 					kvsStatus.get(host, function (err, data) {
// 						myVal = JSON.parse(data[0]["value"])
// 						myInx  = data[0]["inx"]
// 						myVal.push(strVal);
// 						kvsStatus.updateValue(host, myInx, myVal, function(err, data) {
// 								if (host == creator) {
// 									kvsUser.get(host, function (err, data) {
// 										myVal = JSON.parse(data[0]["value"])
// 										myInx = data[0]["inx"]
// 										myVal.mostRecentUpdate = post
// 										kvsUser.update(host, myInx, myVal, function(err, data) {
// 											if (err) {
// 												route_callbck(null, "Lookup error: " + err);
// 											} else {
// 												route_callbck(null, null);
// 											}
// 										})
// 									})
// 								} else {
// 									kvsNotif.get(host, function (err, data) {
// 										myVal = JSON.parse(data[0]["value"])
// 										myInx = data[0]["inx"]
// 										myVal.push(strVal)
// 										kvsNotif.update(host, myVal, myInx, function (err,data) {
// 											if (err) {
// 												route_callbck(null, "Lookup error: " + err);
// 											} else {
// 												route_callbck(null, null);
// 											}
// 										})
// 									})
// 								}
// 							}) 
// 						}) 
// 					})
// 				})
// 		}
// 	})
// };



var myDB_addInterest = function(user, post, route_callbck) {
	kvsUser.get(user, function (err, data) {
		myVal = JSON.parse(data[0]["value"])
		myInx = data[0]["inx"]
		myVal.interestList.push(post)
		kvsUser.update(user, myInx, myVal, function(err, data) {
			if (err) {
				route_callbck(null, "Lookup error: " + err);
			} else {
				route_callbck(null, null);
			}
		})
	})
};

var myDB_addFriend = function(fr, sender, route_callbck) {
	kvsUser.get(sender, function(err, data) {
		myVal = JSON.parse(data[0]["value"])
		myInx = data[0]["inx"]
		if (myVal.pendingFriends.indexOf(fr) != -1) {
			myVal.confirmedFriends.push(fr)
			myVal.pendingFriends.splice(myVal.pendingFriends.indexOf(fr), 1)
			kvsUser.update(sender, myInx, myVal, function(err, data) {
				kvsUser.get(fr, function(err, data) {
					myVal = JSON.parse(data[0]["value"])
					myInx = data[0]["inx"]
					myVal.confirmedFriends.push(sender)
					kvsUser.update(fr, myInx, myVal, function(err, data) {
						if (err) {
							route_callbck(null, "Lookup error: " + err);
						} else {
							route_callbck(null, null);
						}
					})
				})
			})
		} else {
			kvsUser.get(fr, function (err, data) {
				myVal = JSON.parse(data[0]["value"])
				myInx = data[0]["inx"]
				myVal.pendingFriends.push(sender)
				kvsUser.update(fr, myInx, myVal, function(err, data) {
					if (err) {
						route_callbck(null, "Lookup error: " + err);
					} else {
						route_callbck(null, null);
					}
				})
			})
		}
	})
};


var myDB_acceptFriend = function(fr, me, route_callbck) {
	kvsUser.get(me, function (err, data) {
		myVal = JSON.parse(data[0]["value"])
		myInx = data[0]["inx"]
		myVal.confirmedFriends.push(fr)
		myVal.pendingFriends.splice(myVal.pendingFriends.indexOf(fr), 1)
		kvsUser.update(me, myInx, myVal, function(err, data) {
			kvsUser.get(fr, function(err, data) {
				myVal = JSON.parse(data[0]["value"])
				myInx = data[0]["inx"]
				myVal.confirmedFriends.push(me)
				kvsUser.update(fr, myInx, myVal, function(err, data) {
					if (err) {
						route_callbck(null, "Lookup error: " + err);
					} else {
						route_callbck(null, null);
					}
				})
			})
		})
	})
};


var myDB_addComment = function(statusId, user, post, route_callbck) {
	kvsStatusContent.get(statusId, function (err, data) {
		myVal = JSON.parse(data[0]["value"])
		myInx = data[0]["inx"]
		myVal.comments.push({ "commentor" : user, "commentContent" : post})
		kvsStatusContent.update(statusId, myInx, myVal, function(err, data) {
			if (err) {
				route_callbck(null, "Lookup error: " + err);
			} else {
				route_callbck(null, null);
			}
		})
	})
};

var myDB_affiliation = function(aff, route_callbck) {
	kvsUser.scanKeys(function(err, data) {
		if (data == null) {
			route_callbck(null, null);
		}
		else {
			
			a = []
			for (var i = 0; i < data.length; i++) {
				a.push(data[i]["key"])
			}

			add = []
			async.each(a,
		  // 2nd param is the function that each item is passed to
		  function(item, callback){
		    // Call an asynchronous function, often a save() to DB
				kvsUser.get(item, function (err, data) {
					temp = (JSON.parse(data[0]["value"])).affiliation
					if (temp == aff) {
						add.push( item );
					}
				  callback();
		    });
		  },
		  // 3rd param is the function to call when everything's done
		  function(err){
		    // All tasks are done now
		    console.log(add)
			route_callbck({translation : add}, null);
		  }
		);
	}
})
};


var myDB_newsFeed = function(user, route_callbck) {
	kvsUser.get(user, function(err, data) {
		if (data == null) {
			route_callbck(null, null);
		}
		else {
			a = (JSON.parse(data[0]["value"])).confirmedFriends;
			add = []
			async.each(a,
		  // 2nd param is the function that each item is passed to
		  function(item, callback){
		    // Call an asynchronous function, often a save() to DB
				kvsStatus.get(item, function (err, data) {
					temp = JSON.parse(data[0]["value"])
					add = add.concat( temp );
				  callback();
		    });
		  },
		  // 3rd param is the function to call when everything's done
		  function(err){
		    // All tasks are done now
		    	helper(add, route_callbck)
		  }
		);
	}
})
};

function helper (add, route_callbck) {
		finalVal = []
		async.each(add,
		  // 2nd param is the function that each item is passed to
		  function(item, callback){
		    // Call an asynchronous function, often a save() to DB
				kvsStatusContent.get(item, function (err, data) {
					temp = JSON.parse(data[0]["value"])
					temp["key"] = item
					finalVal.push( temp );
				  callback();
		    });
		  },
		  // 3rd param is the function to call when everything's done
		  function(err){
		    // All tasks are done now
				route_callbck({translation : finalVal}, null);
		  }
		);

} 


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
	profile : myDB_profile,
	addStatus : myDB_addStatus,
	addInterest : myDB_addInterest,
	addComment : myDB_addComment,
	addFriend : myDB_addFriend,
	acceptFriend : myDB_acceptFriend,
	newsFeed : myDB_newsFeed,
	affiliation : myDB_affiliation
};

module.exports = database;
