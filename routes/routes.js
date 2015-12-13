var db = require('../models/database.js');
var credential = require('credential');
var pw = credential();
var getMain = function(req, res) {
	var sess = req.session
	if ( (!sess.user  || sess.user == null) == false) {
		res.redirect("/home");
	}

	res.render('main.ejs', {
		message : "",
		footer: "TaBo"
	})
};

var signout = function(req, res) {
	
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/home')
	}
	
	sess.user = null
	res.redirect('/')
};

var checkLogin = function(req, res) {
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
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}

	db.status(sess.user, function (data, err) {
		current = data.translation;
		db.profile(sess.user, function(data, err) {
			if (err) {
				res.render('home.ejs', {
					message : err,
					news: null,
					footer : "TaBo",
					user : sess.user

				});
				
				
			} else if (data == null) {
				res.render('home.ejs', {
					message : "No users",
					news : null,
					footer : "TaBo",
						user : sess.user
				});
				
				
			} else {
				console.log(current);
				res.render('home.ejs', {
					message : "",
					news: current,
					footer : "TaBo",
					user : sess.user,
					prof : data.translation
				});	
			}
		})
	})
};

var homeOther = function(req, res) {
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}

	db.status(req.params.user, function (data, err) {
		if (data == null) {
			res.redirect("/");
		} else {
			console.log("HEREEE")
			current = data.translation;
			db.profile(req.params.user, function(data, err) {
				if (err) {
					res.render('home.ejs', {
						message : err,
						news: null,
						footer : "TaBo",
						user : req.params.user

					});
					
				} else if (data == null) {
					res.redirect("/");
				} else {
					console.log(current);
					res.render('home.ejs', {
						message : "",
						news: current,
						footer : "TaBo",
						user : req.params.user,
						prof : data.translation
					});	
				}
			})
		}
	})
};

var createaccount = function(req, res) {
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

var signout = function(req, res) {
	
	var sess = req.session
	if (!sess.user  || sess.user == null) {
		res.redirect('/restaurants')
	}
	
	sess.user = null
	res.redirect('/')
};

var routes = {
	get_main : getMain,
	post_login : checkLogin,
	post_createaccount : createaccount,
	get_signout : signout,
	get_home : home,
	get_homeOther : homeOther
};

module.exports = routes;
