var db = require('../models/database.js');
var credential = require('credential');
var pw = credential();
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
};


var home = function(req, res) {
	console.log("GOING TO PROFILE")
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}

	else {
		res.redirect('/profile/' + sess.user)
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
						if (((data.translation["confirmedFriends"]).indexOf(sess.user)) != -1 || sess.user == req.params.user) {
								res.render('home.ejs', {
								message : "",
								news: current,
								footer : "TaBo",
								user : req.params.user,
								prof : data.translation,
								host : sess.user,
								friends : "yes",
								added : "yes"
							});	
						} else {
							if (((data.translation["pendingFriends"]).indexOf(sess.user)) != -1) {
								res.render('home.ejs', {
									message : "",
									news: current,
									footer : "TaBo",
									user : req.params.user,
									prof : data.translation,
									host : sess.user,
									friends : "no",
									added: "yes"
								});
							} else {
									res.render('home.ejs', {
									message : "",
									news: current,
									footer : "TaBo",
									user : req.params.user,
									prof : data.translation,
									host : sess.user,
									friends : "no",
									added: "no"
								});
							}	
						}

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
};

var createstatus = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var user = req.body.user;
	var post = req.body.post;
	db.addStatus(user, sess.user, post, function(data, err) {
		res.redirect("/profile/" + user)	
	});
};

var createinterest = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/restaurants')
	}

	var post = req.body.inter;
	db.addInterest(sess.user, post, function(data, err) {
		res.redirect("/profile/" + sess.user)	
	});
};

var createcomment = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var post = req.body.com;
	var i = req.body.i;
	var h = req.body.h;
	db.addComment(i, sess.user, post, function(data, err) {
		res.redirect("/profile/" + h)	
	});
};

var createcommentNews = function(req, res) {
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}

	var post = req.body.com;
	var i = req.body.i;
	var h = req.body.h;
	db.addComment(i, sess.user, post, function(data, err) {
		res.redirect("/home")	
	});
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
		res.redirect('/home')
	}
	else {
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
};

module.exports = routes;
