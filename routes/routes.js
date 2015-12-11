var db = require('../models/database.js');
var getMain = function(req, res) {
	res.render('main.ejs', {
		message : "",
		footer: "Tahmid Shahriar (tahmids)"
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
				footer : "Tahmid Shahriar (tahmids)"
			});
		} else if (data) {
			var sess = req.session
			sess.user = data.name
			if (data.translation == "Logged In") {
				res.redirect('/home');
			} else {
				res.render('main.ejs', {
					message : data.translation,
					footer : "Tahmid Shahriar (tahmids)"
				});
			}
		} else {
			res.render('main.ejs', {
				message : "Username Invalid",
				footer : "Tahmid Shahriar (tahmids)"
			});
		}
	});
};


var signup = function(req, res) {
			res.render('signup.ejs', {
				message : "",
				footer : "Tahmid Shahriar (tahmids)"
			});
};

var home = function(req, res) {
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}
	db.home(function (data, err) {
		if (err) {
			res.render('home.ejs', {
				message : err,
				val: null,
				footer : "Tahmid Shahriar (tahmids)",
				user : sess.user

			});
			
			
		} else if (data == null) {
			res.render('home.ejs', {
				message : "No users",
				val : null,
				footer : "Tahmid Shahriar (tahmids)",
					user : sess.user
			});
			
			
		} else {
			
			res.render('home.ejs', {
				message : "",
				val: data.translation,
				footer : "Tahmid Shahriar (tahmids)",
				user : sess.user
			});
			
		}
		
		
	})

};


var createaccount = function(req, res) {
	var user = req.body.user;
	var pass = req.body.pass;
	var name = req.body.fullname;
	db.signup(user, pass, name, function(data, err) {
		if (err) {
			res.render('signup.ejs', {
				message : err,
				footer : "Tahmid Shahriar (tahmids)"
			});
		} else if (data) {
			if (data.translation == "Created") {
				var sess = req.session
				sess.user = data.name
				res.redirect('/home');
			} else {
				res.render('signup.ejs', {
					message : data.translation,
					footer : "Tahmid Shahriar (tahmids)"
				});
			}
		}});
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
	get_signup : signup,
	get_signout : signout,
	get_home : home	
};

module.exports = routes;
