module.exports = function(io) {
	io.sockets.on('connection', function(socket) {
		console.log("Client connected");
	
		socket.on('set_nickname', function(nickname, callback) {
			var nick = nickname;
			if(nickname.toString().indexOf('>'||'&'||'%'||'/')>0){
				nick=encodeURI(nick).replace(/%3E/g,' ').replace(/%3C/g,' ').replace(/%20/g,' ');
				//nick=nick.replace(/%20/g,' ');
				//nick = nick.toString().replace((/>/g&&/&/g&&/%/g&&/\//g),' ');
			}
			console.log('Trying to set nickname ' + nick);
			
			var isAvailable = isNicknameAvailable(nick);
			
			if (isAvailable){
				socket.nickname = nick;
				sendMessage("SERVER", "User @" + nick + " has connected.");
			}
			callback(isAvailable);
			
			//sendMessage("SERVER", "User @" + nickname + " has connected.");
		});
		
		socket.on('message', function(message) {
			sendMessage(socket.nickname, message);
		});
		
		socket.on('disconnect', function() {
			sendMessage("SERVER", "User @" + socket.nickname + " has disconnected.");
		});
	});
	
	var sendMessage = function(nickname, message) {
		var mess = message;
		if(nickname!="SERVER" && (mess.toString().indexOf('>'||'&'||'%'||'/')>0)){
			mess=encodeURI(mess).replace(/%3E/g,' ').replace(/%3C/g,' ').replace(/%20/g,' ');
			//mess=mess.replace(/%20/g,' ');
			//mess = mess.toString().replace((/>/g&&/&/g&&/%/g&&/\//g),' ');
			//console.log(mess);
		}
 		io.sockets.emit('message', nickname, mess);
	};
	
	var isNicknameAvailable = function(nickname) {
		var clients = io.sockets.clients();
		
		for (var client in clients) {
			if (clients.hasOwnProperty(client)) {
				client = clients[client];
				
				if (client.nickname == nickname)
					return false;
			}
		}
		
		return true;
	};
}