//Define socket
var socket = io.connect('http://localhost');

// Input
var uploadImg = document.querySelector(".upload-img"),
	inputImg = document.querySelector(".input-img"),
	modeBoxShadow = document.querySelector('.box-shadow input'),
	cont = document.querySelector('.output > div'),
	notification = document.querySelector('.notification'),
	at, bt;

// Global canvas
var cnvs;

notification.innerText = 'Be careful with hi-res images. This may take awhile... and freez your browser.';


img2css = {
	// Get pixels
	run: function(result) {
		at = new Date();
		at = at.getTime();

		var a = document.querySelector('.output > div > div'),
			b = document.querySelector('.output > div');

		if(a) {
			b.removeChild(a);
		}
		notification.innerText = 'Processing...';
		cont.style.width = cont.style.height = '';

		var img = new Image();
		var canvas = document.createElement('canvas');
		img.src = result;
		cnvs = canvas;

		setTimeout(function() { // 50ms timeout for canvas size setup
			canvas.width = img.width;
			canvas.height = img.height;
			ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);

			var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
			var pxs = [];
			var rows = [];

			for(var i = 0; i < imgData.length; i += 4) {
				pxs[i / 4] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
			}
			for(var j = 0; j < canvas.height; j++) {
				rows[j] = pxs.splice(0, canvas.width);
			}
			if(modeBoxShadow.checked === true) {
				img2css.boxShadowMode(rows);
			} else {
				img2css.divMode(rows);
			}
		}, 50);
	},
	// BoxShadow rendering mode. Send pixels data
	boxShadowMode: function(canvas) {
		socket.emit('processBoxShadow', canvas);
	},
	// Div rendering mode. Send pixels data
	divMode: function(canvas) {
		socket.emit('processDiv', canvas);
	},
	// Render pixels data
	processed: function(mode, rows, nodesNum) {
		if(mode == 'boxShadow') {
			var initPixel = document.createElement('div');
			cont.style.width = cnvs.width + 'px';
			cont.style.height = cnvs.height + 'px';
			cont.style.position = 'relative';
			initPixel.style.height = initPixel.style.width = '1px';
			initPixel.style.position = 'absolute';
			initPixel.style.backgroundColor = rows[0].split('0px 0px ')[1];
			initPixel.style.boxShadow = rows.join(',');
			cont.appendChild(initPixel);
			img2css.stuff(nodesNum, 'shadow');
		} else {
			cont.style.width = cnvs.width + 'px';
			cont.style.height = cnvs.height + 'px';
			cont.style.position = 'relative';
			cont.innerHTML = rows.join('');
			img2css.stuff(nodesNum, 'div');
		}
	},
	// Stuff
	stuff: function(nodesNum, pixelType) {
		var area = document.querySelectorAll('textarea'),
			output = document.querySelector('.output').innerHTML,
			cont = document.querySelector('.output > div'),
			px = document.querySelector('.output > div > div'),
			shadow = px.style.boxShadow,
			text, bgColor;

		shadow = shadow.split('px,').join('px,&#10;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;');

		if(pixelType == 'shadow') {
			if(px.style.backgroundColor.length > 0) {
				bgColor = 'background-color: ' + px.style.backgroundColor + ';';
				area[1].innerHTML = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + ';&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;' + bgColor + '&#10;&#160;&#160;&#160;position: absolute;&#10;&#10;&#160;&#160;&#160;box-shadow: ' + shadow + '&#10;}';
			} else {
				area[1].innerHTML = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + ';&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;position: absolute;&#10;&#10;&#160;&#160;&#160;box-shadow: ' + shadow + '&#10;}';
			}
			text = 'Box-shadows created: ';
			area[0].innerHTML = '<div class="css-img">&#10;&#160;&#160;&#160;<div class="init-pixel"></div>&#10;</div>';
		}
		if(pixelType == 'div') {
			text = 'Nodes appended: ';
			area[0].innerHTML = output.match(/<(.|\n)*?>/g).join('&#10;');
			area[1].innerHTML = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + '&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;position: absolute;&#10;}';
		}
		notification.innerText = text + nodesNum;

		bt = new Date();
		bt = bt.getTime();

		notification.innerHTML += '<br>Processing time: ' + (bt - at - 50) / 1000 + 's';
	}
};

// BoxShadow rendering mode. Receive and render processed pixels data
socket.on('processedBoxShadow', function(rows, nodesNum) {
	img2css.processed('boxShadow', rows, nodesNum);
});

// Div rendering mode. Receive and render processed pixels data
socket.on('processedDiv', function(rows, nodesNum) {
	img2css.processed('div', rows, nodesNum);
});

// Read file
inputImg.onchange = function(event) {
	var files = event.target.files,
		file = files[0];
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		img2css.run(event.target.result);
	};
	fileReader.readAsDataURL(file);
};

// Input event listener
uploadImg.addEventListener("click", function(e) {
	inputImg.value = '';
	inputImg.click();
	e.preventDefault();
}, false);