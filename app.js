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
app.get('/signup', routes.get_signup);
app.post('/createaccount', routes.post_createaccount);
app.get('/restaurants', routes.get_restaurant);
app.post('/addrestaurant', routes.post_restaurant);
app.get('/signout', routes.get_signout);
app.get('/ajaxr', routes.get_ajaxr);
app.post('/delr', routes.post_delr);




/* Run the server */

console.log('Author: Tahmid Shahriar (tahmids)');
app.listen(8080);
console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
