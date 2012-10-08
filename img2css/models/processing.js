/*
* Processing functions
*/

// box-shadow rendering mode. processing pixels data
exports.BoxShadowMode = function boxShadowProcess(rows, socket) {
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
	// send processed pixels data
	socket.emit('processedBoxShadow', pixels, nodesNum);
};

// div rendering mode. processing pixels data
exports.DivMode = function divProcess(rows, socket) {
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
	//send processed pixels data
	socket.emit('processedDiv', pixels, nodesNum);
};