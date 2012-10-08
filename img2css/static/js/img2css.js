// Define socket
var socket = io.connect('http://localhost');

// Input/Output
var uploadImg = document.querySelector(".upload-img"),
	inputImg = document.querySelector(".input-img"),
	mode = document.querySelector('.box-shadow input'),
	cont = document.querySelector('.output > div'),
	at, bt, cnvs;


/*
* img2css object
*
* functions: run(), renderingMode.boxShadow(), renderingMode.div(), render.boxShadow(), render.div(), stuff(), message()
*
*/

img2css = {

	// Get pixels
	run: function(result) {

		// catch processing start time
		at = new Date();
		at = at.getTime();

		var a = document.querySelector('.output > div > div'),
			b = document.querySelector('.output > div');

		if(a) {b.removeChild(a);} // remove previously processed output
		this.fillForm(0, '');
		this.fillForm(1, '');

		this.message('Processing...'); // display message
		cont.style.width = cont.style.height = ''; // refresh output container size

		var img = new Image();
		var canvas = document.createElement('canvas');
		img.src = result;
		cnvs = canvas; // global canvas

		setTimeout(function() { // 50ms timeout for canvas size setup
			canvas.width = img.width;
			canvas.height = img.height;
			ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);

			var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
			var pxs = []; // pixels
			var rows = []; // rows

			// get pixels
			for(var i = 0; i < imgData.length; i += 4) {
				pxs[i / 4] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];
			}

			// get rows
			for(var j = 0; j < canvas.height; j++) {
				rows[j] = pxs.splice(0, canvas.width);
			}

			// init processing
			if(mode.checked === true) {
				img2css.renderingMode.boxShadow(rows);
			} else {
				img2css.renderingMode.div(rows);
			}

		}, 50);
	},

	// Rendering mode
	renderingMode: {
		// box-shadow rendering mode. send image data
		boxShadow: function(canvas) {
			socket.emit('processBoxShadow', canvas);
		},

		// div rendering mode. send image data
		div: function(canvas) {
			socket.emit('processDiv', canvas);
		}
	},

	// Render image data
	render: {
		boxShadow: function(rows, nodesNum) {
			var initPixel = document.createElement('div'),
					wrapper = document.createElement('div');
			cont.style.width = cnvs.width + 'px';
			cont.style.height = cnvs.height + 'px';
			cont.style.position = 'relative';
			initPixel.style.height = initPixel.style.width = '1px';
			initPixel.style.position = 'absolute';
			initPixel.style.backgroundColor = rows[0].split('0px 0px ')[1];
			initPixel.style.boxShadow = rows.join(',');
			wrapper.appendChild(initPixel);
			cont.appendChild(wrapper);
			img2css.stuff(nodesNum, 'shadow');
		},

		div: function(rows, nodesNum) {
			var wrapper = document.createElement('div');
			cont.style.width = cnvs.width + 'px';
			cont.style.height = cnvs.height + 'px';
			cont.style.position = 'relative';
			cont.appendChild(wrapper);
			wrapper.innerHTML = rows.join('');
			img2css.stuff(nodesNum, 'div');
		}
	},

	// Stuff. display messages, fill forms
	stuff: function(nodesNum, pixelType) {
		var output = document.querySelector('.output').innerHTML,
			cont = document.querySelector('.output > div'),
			px = document.querySelector('.output > div > div > div'),
			shadow = px.style.boxShadow,
			text, bgColor, htmlOutput, cssOutput;

		shadow = shadow.split('px,').join('px,&#10;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;');
		
		if(pixelType == 'shadow') {

			htmlOutput = '<div class="css-img">&#10;&#160;&#160;&#160;<div class="init-pixel"></div>&#10;</div>';

			text = 'Box-shadows created: ';
			this.fillForm(0, htmlOutput);

			if(px.style.backgroundColor.length > 0) {
				cssOutput = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + ';&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;' + bgColor + '&#10;&#160;&#160;&#160;position: absolute;&#10;&#10;&#160;&#160;&#160;box-shadow: ' + shadow + '&#10;}';
				bgColor = 'background-color: ' + px.style.backgroundColor + ';';
			} else {
				cssOutput = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + ';&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;position: absolute;&#10;&#10;&#160;&#160;&#160;box-shadow: ' + shadow + '&#10;}';
			}
			this.fillForm(1, cssOutput);
		}

		if(pixelType == 'div') {

			htmlOutput = output.match(/<(.|\n)*?>/g).join('&#10;'),
			cssOutput = '.css-img {&#10;&#160;&#160;&#160;position: relative;&#10;&#160;&#160;&#160;width: ' + cont.style.width + ';&#10;&#160;&#160;&#160;height: ' + cont.style.height + '&#10;}&#10;&#10;.pixel {&#10;&#160;&#160;&#160;height: 1px;&#10;&#160;&#160;&#160;width: 1px;&#10;&#160;&#160;&#160;position: absolute;&#10;}';

			text = 'Nodes appended: ';
			this.fillForm(0, htmlOutput);
			this.fillForm(1, cssOutput);

		}

		// catch processing end time
		bt = new Date();
		bt = bt.getTime();

		// display processing time
		processedMsg = text + nodesNum + '<br>Processing time: ' + (bt - at - 50) / 1000 + 's';
		this.message(processedMsg);
	},

	// Notifications
	message: function(message) {
		var notification = document.querySelector('.notification');
		notification.innerHTML = message;
	},

	fillForm: function(formNum, message) {
		var form = document.querySelectorAll('textarea');
		form[formNum].innerHTML = message;
	}
};

// Warning message
img2css.message('Be careful with hi-res images. This may take awhile... and freez your browser.');


/*
* Listen for incoming processed data
*/

// box-shadow rendering mode. receive and render processed image data
socket.on('processedBoxShadow', function(rows, nodesNum) {
	img2css.render.boxShadow(rows, nodesNum);
});

// div rendering mode. receive and render processed image data
socket.on('processedDiv', function(rows, nodesNum) {
	img2css.render.div(rows, nodesNum);
});


/*
* Getting input file
*/

// read file
inputImg.onchange = function(event) {
	var files = event.target.files,
		file = files[0];
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		img2css.run(event.target.result);
	};
	fileReader.readAsDataURL(file);
};

// input event listener
uploadImg.addEventListener("click", function(e) {
	inputImg.value = '';
	inputImg.click();
	e.preventDefault();
}, false);