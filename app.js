
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	register = require('./routes/register'),
	socket = require('./routes/socket.js');

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
	app.use(express.static(__dirname + '/public'));
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

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/*
	chat socket
*/

io.sockets.on('connection', socket.chat);


// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
