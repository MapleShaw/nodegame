
//load the resource of the game
//use the lib of PxLoader.js

;(function (win, undefined) {

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
	var loader = new html5Preloader();

	//add file
	loader.addFiles(
		'sBg1*:../../sBg1.ogg||../../sBg1.mp3',
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
	);

	//event
	loader.on('finish', function () { 
		debugger;
		console.log('资源预加载成功');
		setTimeout(function () {
			$(".preMask").hide();
			$(".loading").hide();
		}, 1000);
	});
	loader.on('error', function (e) { 
		debugger;
		console.log('资源预加载失败'); 
	}); 

})(window, undefined);
