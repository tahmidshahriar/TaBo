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
		res.redirect('/restaurants')
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
				res.redirect('/restaurants');
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

var restaurant = function(req, res) {
	sess = req.session;
	if (!sess.user  || sess.user == null) {
		res.redirect('/')
	}
	db.restaurant(function (data, err) {
		if (err) {
			res.render('restaurant.ejs', {
				message : err,
				val: null,
				footer : "Tahmid Shahriar (tahmids)",
				user : sess.user

			});
			
			
		} else if (data == null) {
			res.render('restaurant.ejs', {
				message : "No restaurant",
				val : null,
				footer : "Tahmid Shahriar (tahmids)",
					user : sess.user
			});
			
			
		} else {
			
			res.render('restaurant.ejs', {
				message : "",
				val: data.translation,
				footer : "Tahmid Shahriar (tahmids)",
				user : sess.user
			});
			
		}
		
		
	})

};

var ajaxr = function(req, res) {
	db.restaurant(function (data, err) {
		res.json(data.translation)	
	})
};

var delr = function(req, res) {
	var key = req.body.key;
	var inx = req.body.inx;
	console.log(key)
	console.log(inx)
	db.delr(key, inx, function (data, err) {
		res.json(data)
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
				res.redirect('/restaurants');
			} else {
				res.render('signup.ejs', {
					message : data.translation,
					footer : "Tahmid Shahriar (tahmids)"
				});
			}
		}});
};



var addrestaurant = function(req, res) {
	sess = req.session;
	if (!sess.user || sess.user == null) {
		res.redirect('/')
	}
	var long = req.body.long;
	var lat = req.body.lat;
	var name = req.body.name;
	var desc = req.body.desc;
	
	db.addrestaurant(long, lat, name, desc, sess.user, function(data, err) {
		if (err) {
			res.render('restaurant.ejs', {
				message : err,
				footer : "Tahmid Shahriar (tahmids)"
			});
		} else if (data) {
			if (data.translation == "Created") {
				res.redirect('/restaurants');
			} else {
				res.render('restaurant.ejs', {
					message : data.translation,
					footer : "Tahmid Shahriar (tahmids)"
				});
			}
		}});
};

var routes = {
	get_main : getMain,
	post_login : checkLogin,
	post_createaccount : createaccount,
	get_signup : signup,
	get_restaurant : restaurant,
	post_restaurant : addrestaurant,
	get_signout : signout,
	get_ajaxr : ajaxr,
	post_delr : delr
	
};

module.exports = routes;
