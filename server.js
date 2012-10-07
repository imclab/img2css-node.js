var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs'),
	varSocket;

var imgSrc;

app.listen(80);

function handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if(err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}

io.sockets.on('connection', function(socket) {
	varSocket = socket;
	
	socket.on('processBoxShadow', function(rows) {
		processing.boxShadowProcess(rows);
	});
	socket.on('processDiv', function(rows) {
		processing.divProcess(rows);
	});
});

processing = {
	// BoxShadow rendering mode. Processing pixels data
	boxShadowProcess: function(rows) {
		var nodesNum = 0;
		var pixels = [];

		for(var i = 0; i < rows[0].length; i++) {
			for(var j = 0; j < rows.length; j++) {
				var data = rows[j][i],
					alpha;
				alpha = Math.round((data[3] / 255) * 100) / 100;
				if(alpha !== 0) {
					pixels.push(i + 'px' + ' ' + j + 'px' + ' rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + alpha + ')');
					nodesNum = nodesNum + 1;
				}
			}
		}
		//Send processed pixels data
		varSocket.emit('processedBoxShadow', pixels, nodesNum);
	},
	// Div rendering mode. Processing pixels data
	divProcess: function(rows) {
		var nodesNum = 0;
		var pixels = [];

		for(var i = 0; i < rows[0].length; i++) {
			for(var j = 0; j < rows.length; j++) {
				var data = rows[j][i],
					alpha;

				alpha = Math.round((data[3] / 255) * 100) / 100;
				if(alpha !== 0) {
					pixels.push('<div style="position: absolute; width: 1px; height: 1px; top: ' + j + 'px; left: ' + i + 'px; background-color: rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + alpha + ');"></div>');
					nodesNum = nodesNum + 1;
				}
			}
		}
		//Send processed pixels data
		varSocket.emit('processedDiv', pixels, nodesNum);
	}
}