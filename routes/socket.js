/*
 * Serve content over a socket
 */

module.exports = function (socket) {

	//invite friend
	socket.on('invite friend', function (data) {
		socket.broadcast.emit(data.f_id, data);
	});
	/*
	setInterval(function () {
		socket.emit('send:time', {
			time: (new Date()).toString()
		});
  	}, 1000);
	*/
};
