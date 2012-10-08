/*
* Listen for incoming image data and fire appropriate processing mode function
*/

var process = require('./processing');

exports.listenForFile = function(socket) {

	// Run box-shadow mode processing
	socket.on('processBoxShadow', function(rows) {
		console.log('Start processing with box-shadow mode!');
		process.BoxShadowMode(rows, socket);
	});

	// Run div mode processing
	socket.on('processDiv', function(rows) {
		console.log('Start processing with div mode!');
		process.DivMode(rows, socket);
	});

};