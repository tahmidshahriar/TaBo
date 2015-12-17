var db = require('../models/database.js');
var credential = require('credential');
var pw = credential();
var wl = require('../whitelister.js');


// strict white listing for username so that it can only contain 
// lowercase letters and numbers (to avoid clashing of usernames etc.)
// Also, length is controlled to be at most 15 (inclusive) so that the database 
// will not be slowed down too much
// the callback function returns one value only: either error message OR null

var strict_wl = function(stringToCheck) {
	
	var allowedChars = "0123456789abcdefghijklmnopqrstuvwxyz";
	if (stringToCheck.length > 15 || stringToCheck.length < 1) {
		return true
	}
	else {
		    for(var index = 0; index < stringToCheck.length; index++){
		        if(allowedChars.indexOf(stringToCheck[index]) < 0){
		            return true
		        }
		    }
	    }
	    return false
};

var general_wl = function(stringToCheck, callback) {
	
	var allowedChars = "@0123456789abcdefghijklmnopqrstuvwxyz" + 
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ!?., ";
	
	if (stringToCheck.length > 140 || stringToCheck.length < 1) {
		return true
	}
	else {
	
		    for(var i = 0; i < stringToCheck.length; i++){
		        if(allowedChars.indexOf(stringToCheck[i]) <0){
		            return true
		        }
		    }
		return false
	}
};

var getMain = function(req, res) {
	console.log("GETTING MAIN PAGE")
	var sess = req.session
	if ( (!sess.user  || sess.user == null) == false) {
		res.redirect("/home");
	}
	else {
		res.render('main.ejs', {
			message : "",
			footer: "TaBo"
		})
	}
};

var signout = function(req, res) {
	console.log("SIGNING OUT")
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}
	else {
		sess.user = null
		res.redirect('/')
	}
};

var checkLogin = function(req, res) {
	console.log("LOGGING IN")
	var user = req.body.user;
	var pass = req.body.pass;
	if (general_wl(user) || general_wl(pass))  {
	  res.send("Invalid Post - Please go back");
	}
	
	else {
		db.signin(user, pass, function(data, err) {
			if (err) {
				res.render('main.ejs', {
					message : err,
					footer : "TaBo"
				});
			} else if (data) {
				var sess = req.session
				sess.user = data.name
				if (data.translation == "Logged In") {
					res.redirect('/home');
				} else {
					res.render('main.ejs', {
						message : data.translation,
						footer : "TaBo"
					});
				}
			} else {
				res.render('main.ejs', {
					message : "Username Invalid",
					footer : "TaBo"
				});
			}
		});
	}
};



var homeOther = function(req, res) {
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}
	else {
		db.status(req.params.user, function (data, err) {
				if (data != null) {
					current = data.translation;
					current.sort(function(a,b){
					    return (parseInt(a.key) - parseInt(b.key)) * -1;
					    }
					);
				} else {
					current = []
				}
				db.profile(req.params.user, function(data, err) {
					if (data == null) {
						res.redirect("/signout");
					} else {
						v = data.translation
						db.affiliation(data.translation["affiliation"], function(data, err) {
							if (((v["confirmedFriends"]).indexOf(sess.user)) != -1 || sess.user == req.params.user) {
									res.render('home.ejs', {
									message : "",
									news: current,
									footer : "TaBo",
									user : req.params.user,
									prof : v,
									host : sess.user,
									friends : "yes",
									added : "yes",
									aff : data.translation
								});	
							} else {
								if (((v["pendingFriends"]).indexOf(sess.user)) != -1) {
									res.render('home.ejs', {
										message : "",
										news: current,
										footer : "TaBo",
										user : req.params.user,
										prof : v,
										host : sess.user,
										friends : "no",
										added: "yes",
										aff : data.translation
									});
								} else {
										res.render('home.ejs', {
										message : "",
										news: current,
										footer : "TaBo",
										user : req.params.user,
										prof : v,
										host : sess.user,
										friends : "no",
										added: "no",
										aff : data.translation
									});
								}	
							}

						})
					}
				})

		})
	}
};

var createaccount = function(req, res) {
	console.log("CREATING ACCOUNT")
	var user = req.body.user;
	var pass = req.body.pass;
	var first = req.body.first;
	var last = req.body.last;
	var email = req.body.email;
	var affiliation = req.body.affiliation;
	var interest = req.body.interest;
	var birthday = req.body.birthday;
	if (strict_wl(user)) {
		res.render('main.ejs', {
			message : "Username Illegal",
			footer: "TaBo"
		})
	}
	
	else if (general_wl(pass) || general_wl(first) || general_wl(last) || general_wl(email) || general_wl(affiliation) || general_wl(interest)) {
	  res.send("Invalid Post - Please go back");
	}

	else {
		pw.hash(pass, function (err, hash) {
			db.signupPassword(user, hash, function(data, err) {
				if (err) {
					res.render('main.ejs', {
						message : err,
						footer : "TaBo"
					});
				} else if (data) {
					if (data.translation == "Created") {
						var sess = req.session
						sess.user = data.name
						db.signupUser(user, first, last, email, affiliation, interest, birthday, function(data, err) {
							res.redirect('/home');
						})
					} else {
						res.render('main.ejs', {
							message : data.translation,
							footer : "TaBo"
						});
					}
				}});
		});
	}
};

var createstatus = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var user = req.body.user;
	var post = req.body.post;
	if (general_wl(post)) {
	  res.send("Invalid Post - Please go back");
	}
	else {
		db.addStatus(user, sess.user, post, function(data, err) {
			res.redirect("/profile/" + user)	
		});
	}	
};

var createinterest = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/restaurants')
	}


	var post = req.body.inter;
	if (general_wl(post)) {
	  res.send("Invalid Post - Please go back");
	}
	else {
		db.addInterest(sess.user, post, function(data, err) {
			res.redirect("/profile/" + sess.user)	
		});
	}	
};

var createcomment = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var post = req.body.com;
	if (general_wl(post)) {
	  res.send("Invalid Post - Please go back");
	}
	else {
		var i = req.body.i;
		var h = req.body.h;
		db.addComment(i, sess.user, post, function(data, err) {
			res.redirect("/profile/" + h)	
		});
	}
};

var createcommentNews = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var post = req.body.com;
	if (general_wl(post)) {
	  res.send("Invalid Post - Please go back");
	}
	else {
		var i = req.body.i;
		var h = req.body.h;
		db.addComment(i, sess.user, post, function(data, err) {
			res.redirect("/home")	
		});
	}
};

var addfriend = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}
	console.log(req.body)
	var friend = req.body.fr;
	db.addFriend(friend, sess.user, function(data, err) {
		res.redirect("/profile/" + friend)	
	});
};

var acceptfriend = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}
	console.log(req.body)
	var friend = req.body.fr;
	db.addFriend(friend, sess.user, function(data, err) {
		res.redirect("/profile/" + sess.user)	
	});
};


var signout = function(req, res) {
	console.log("SIGNING OUT")
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}
	
	sess.user = null
	res.redirect('/')
};

var news = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}
	else {
		console.log(sess.user)
		db.newsFeed(sess.user, function(data, err) {
				
				current = data.translation;
				current.sort(function(a,b){
				    return (parseInt(a.key) - parseInt(b.key)) * -1;
				    }
				);

				res.render('news.ejs', {
				message : "",
				news: current,
				footer : "TaBo",
				user : req.params.user,
				friends : "yes",
				host: sess.user
			});
		});
	}
};


var searchSuggest = function(req, res) {
	
	// res has two parts: err & data
	var searchTerm = req.params.input;
	
	wl.general_wl(searchTerm, function callback(err) {
		
		var doCheck = false;
		while (true) {
			// wait until the checking is complete
			if (err) {
				res.send(err, null);
				break;
			}
			else if (err == null){
				doCheck = true;
				break;				
			}
		}
		
	});
	
	if (doCheck) {
		db.getSuggestions(searchTerm, function route_callbck(info, err) {
				
			while (true) {
				// wait until the suggestion pulling is complete
				if (err) {
					res.send(err, null);
					break;
				}
				else if (info) {
					res.send(null, info);
					break;				
				}
			}
		});		
	}
};


var routes = {
	get_main : getMain,
	post_login : checkLogin,
	post_createaccount : createaccount,
	get_signout : signout,
	get_home : news,
	get_homeOther : homeOther,
	post_createstatus : createstatus,
	post_createinterest : createinterest,
	post_createcomment : createcomment,
	post_createcommentNews : createcommentNews,
	post_addfriend : addfriend,
	post_acceptfriend : acceptfriend,
	get_newsfeed : news,
	search_suggest: searchSuggest
};

module.exports = routes;
