
//load the resource of the game
//use the lib of PxLoader.js

;(function (win, undefined) {
	//arr of resource
	var _file = [
		'img/arrows.png',
		'img/back.png',
		'img/face1.png',
		'img/face2.png',
		'img/face3.png',
		'img/face4.png',
		'img/face5.png',
		'img/face6.png',
		'img/gameground.jpg',
		'img/grid.png',
		'img/icons.png',
		'img/image1.png',
		'img/image2.png',
		'img/image3.png',
		'img/image4.png',
		'img/image5.png',
		'img/info.png',
		'img/map.png',
		'img/unloginbg.png',
		'img/wordbg.png',
		'img/admin.png',
		'bg1*:sound/bg1.ogg||sound/bg1.mp3',
		'bg2*:sound/bg2.ogg||sound/bg2.mp3',
		'bg3*:sound/bg3.ogg||sound/bg3.mp3',
		'bg4*:sound/bg4.ogg||sound/bg4.mp3',
		'bg5*:sound/bg5.ogg||sound/bg5.mp3',
		'bg6*:sound/bg6.ogg||sound/bg6.mp3',
		'bg7*:sound/bg7.ogg||sound/bg7.mp3',
		'bg8*:sound/bg8.ogg||sound/bg8.mp3',
		'bg8*:sound/bg9.ogg||sound/bg9.mp3',
		'bg8*:sound/begin.ogg||sound/begin.mp3',
		'bg8*:sound/pk.ogg||sound/pk.mp3',
		'bg8*:sound/die.ogg||sound/die.mp3',
		'bg8*:sound/gameOver.ogg||sound/gameOver.mp3'
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

	//instance
	var loader = html5Preloader();
	//add file
	loader.addFiles(_file);
	//event
	loader.on('finish', function () { 
		console.log('资源预加载成功');
	});
	loader.on('error', function (e) { 
		console.log('资源预加载失败'); 
	}); 
	setTimeout(function () {
		$(".preMask").hide();
		$(".loading").hide();
	}, 2000);

})(window, undefined);
