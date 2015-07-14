// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  // console.log('Server listening at port %d', port);
  logEvent('listen', null, port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    logEvent('new message', socket.username, data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    logEvent('add user', socket.username, numUsers);
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      logEvent('disconnect', socket.username, numUsers);
    }
  });
});
var logEvent = function(type, param1, param2){
	var mes = (new Date().getMonth()+1)
	if(mes<10){mes = "0" + mes.toString();}
	var day = new Date().getDate()
	if(day<10){day = "0" + day.toString();}
	var hour = new Date().getHours()
	if(hour<10){hout = "0" + hour.toString();}
	var min =new Date().getMinutes()
	if(min<10){min = "0" + min.toString();}
	var sec = new Date().getSeconds()
	if(sec<10){sec = "0" + sec.toString();}
	var date = ""+ new Date().getFullYear().toString() + "/" + mes + "/" + day + ", " + hour + ":" + min + ":" + sec;
	var logMess = "* " + date + " - ";
	switch(type){
    case 'add user':
      logMess += " USER \"" + param1 + "\" CONNECTED, there's ";
      if(param2>1 || param2==0){logMess +="" + param2 + " participants.";}
      else{logMess += "" + param2 + " participant.";}
      console.log(logMess);
      break;
    case 'new message':
      logMess += " MESSAGE FROM \"" + param1 +": " + param2 + ".";
      break;
    case 'disconnect':
      logMess += " USER \"" + param1 + "\" DISCONNECTED, there's ";
      if(param2>1){logMess +="" + param2 + " participants.";}
      else{logMess += "" + param2 + " participant.";}
      console.log(logMess);
      break;
    default:
      logMess += "-- SERVER listening at PORT " + param2 +".";
      console.log(logMess);
      break;
  }
  //console.log(logMess);
  fs.appendFile('./activity.log', logMess + '\r\n', function (err){
    if(err){throw err;}
  });
}
