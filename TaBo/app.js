/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var app = express();
var session= require('express-session')

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(session( {secret : 'hw', user : ""  } ))
/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

app.get('/', routes.get_main);
app.post('/checklogin', routes.post_login);
app.post('/createaccount', routes.post_createaccount);
app.get('/home', routes.get_home);
app.get('/signout', routes.get_signout);
app.get('/profile/:user', routes.get_homeOther);
app.post('/createstatus', routes.post_createstatus);
app.post('/createinterest', routes.post_createinterest);
app.post('/createcomment', routes.post_createcomment);
app.post('/createcomment/news', routes.post_createcommentNews);
app.post('/addfriend', routes.post_addfriend);
app.post('/acceptfriend', routes.post_acceptfriend);
app.get('/getnews', routes.get_newsfeed);
/* Run the server */

app.listen(8080);
console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
