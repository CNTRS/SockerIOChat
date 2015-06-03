var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var PORT = process.env.PORT || 8080;

server.listen(PORT, function() {
	console.log("Listening on port " + PORT)
});

app.set('view options', {
	layout: false
});
app.use(express.static(__dirname + '/static'));

io.configure(function() {
	io.disable('log');

	io.set('transports', ['websocket', 'xhr-polling']);
});

app.get('/', function(request, response) {
	response.render('main.jade');
});

require('./io')(io);
