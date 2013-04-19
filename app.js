
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	register = require('./routes/register'),
	login = require('./routes/login'),
	add_friend = require('./routes/add_friend'),
	subjects = require('./routes/subjects');
	MongoStore = require('connect-mongo')(express),
	settings = require('./settings'),
	socketHandle = require('./routes/socket.js');

var app = module.exports = express();
var server = require('http').createServer(app);

// Hook Socket.io into Express
var io = require('socket.io').listen(server);

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: settings.cookieSecret,
		store: new MongoStore({
			db: settings.db
		})
	}));
	app.use(express.static(__dirname + '/public'));
	app.use(function(req, res, next){
	  res.locals.csrf = req.session ? req.session._csrf : '';
	  res.locals.req = req;
	  //res.locals.user = req.session.user;  //想要什么值在这里补
	  next();
	});
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

//API

//check the username
app.post('/register/check', register.check);
//register submit
app.post('/register/post', register.post);
//check the username
app.post('/login/login', login.login);

app.get('/login/loginout', login.loginout);
//add subjects
app.post('/subjects/addSubject', subjects.addSubject);
//add friends
app.post('/add_friend/add', add_friend.add);
//remove friends
app.post('/add_friend/remove', add_friend.remove);
//user update
app.post('/add_friend/update', add_friend.update);
// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/*
	chat socket
*/

io.sockets.on('connection', function(socket){
	socketHandle.onConnect(socket,io);
});

//test








// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
