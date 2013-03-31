
//load the resource of the game
//use the lib of PxLoader.js

;(function (win, undefined) {
	//arr of resource
	var _images = [
		'../img/arrows.png',
		'../img/back.png',
		'../img/face1.png',
		'../img/face2.png',
		'../img/face3.png',
		'../img/face4.png',
		'../img/face5.png',
		'../img/face6.png',
		'../img/gameground.jpg',
		'../img/grid.png',
		'../img/icons.png',
		'../img/image1.png',
		'../img/image2.png',
		'../img/image3.png',
		'../img/image4.png',
		'../img/image5.png',
		'../img/info.png',
		'../img/map.png',
		'../img/unloginbg.png',
		'../img/wordbg.png',
		'../img/admin.png'
	];
	var _sound = [/*
		'../img/s1.ogg',
		'../img/s2.ogg',
		'../img/s3.ogg',
		'../img/s4.ogg',
		'../img/s5.ogg',
		'../img/s6.ogg',
		'../img/s7.ogg',
		'../img/s8.ogg',
		'../img/s9.ogg',
		'../img/s10.ogg'*/
	]; 

	//template
	var _html = [
		'<div class="preMask"></div>',
		'<div class="loading">',
			'<p>Welcome</p>',
			'<div class="v"></div>',
			'<div class="i"></div>',
			'<div class="l">Loading...</div>',
		'</div>'
	].join("");
	$('body').append($(_html));

	//array
	var arr = _images.concat(_sound);

	//instance
	var loader = html5Preloader();
	//add file
	loader.addFiles(arr);
	//event
	loader.on('finish', function () { 
		console.log('资源预加载成功');
		setTimeout(function () {
			$(".preMask").hide();
			$(".loading").hide();
		}, 5000);
	});
	loader.on('error', function (e) { 
		console.log('资源预加载失败'); 
	}); 

})(window, undefined);
