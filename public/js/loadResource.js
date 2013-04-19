
//load the resource of the game
//use the lib of PxLoader.js

;(function (win, undefined) {
	//arr of resource
	var _file = [
		'img/arrows.png',
		'img/back.png',
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
		'img/admin.png',
		'bg1*:sound/bg1.ogg||sound/bg1.mp3',
		'bg3*:sound/bg3.ogg||sound/bg3.mp3',
		'bg5*:sound/bg5.ogg||sound/bg5.mp3',
		'bg7*:sound/bg7.ogg||sound/bg7.mp3',
		'bg8*:sound/bg8.ogg||sound/bg8.mp3',
		'bg8*:sound/bg9.ogg||sound/bg9.mp3',
		'bg8*:sound/begin.ogg||sound/begin.mp3',
		'bg8*:sound/pk.ogg||sound/pk.mp3',
		'bg8*:sound/die.ogg||sound/die.mp3',
		'bg8*:sound/gameOver.ogg||sound/gameOver.mp3',
		's1*:sound/game/1.ogg||sound/game/1.mp3',
		's2*:sound/game/2.ogg||sound/game/2.mp3',
		's3*:sound/game/3.ogg||sound/game/3.mp3',
		's4*:sound/game/4.ogg||sound/game/4.mp3',
		's5*:sound/game/5.ogg||sound/game/5.mp3',
		's6*:sound/game/6.ogg||sound/game/6.mp3',
		's7*:sound/game/7.ogg||sound/game/7.mp3',
		's8*:sound/game/8.ogg||sound/game/8.mp3',
		's8*:sound/game/9.ogg||sound/game/9.mp3',
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
