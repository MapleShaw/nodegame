'use strict';

/*
	loginOut controllers
*/
function loginOutController($scope, $http, $routeParams, $location) {
  $scope.loginOut = function(){
		$http.get('/login/loginout').success(function(data, status, headers, config){
			//do something if return success
			window.location.reload();
		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
		});
	};
}
/*
	login controller
*/
function loginCtrl($scope, $http, $routeParams, $location){

	$scope.loginForm = {};

	//submit function
	$scope.loginPost = function(){
		$http.post('/login/login', $scope.loginForm).success(function(data, status, headers, config){
			//do something if return success
			$scope.userMsg = data.data;	
			window.location.reload();
		}).error(function(data, status, headers, config){
			//do something if return error
		});
	};

	
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

/*
	register controller
*/
function registerCtrl($scope, $http, $routeParams, $location){

	$scope.registerForm = {};

	//submit function
	$scope.registerPost = function () {
		$http.post('/register/post', $scope.registerForm).success(function(data, status, headers, config){
			//do something if return success
			$scope.successMsg = data.data;	
			window.location.reload();
		}).error(function(data, status, headers, config){
			//do something if return error
		});
	}
	
	//check if the name is only
	//use with the "ng-change" of input=text
	$scope.registerCheck = function () {
		$http.post('/register/check', $scope.registerForm).success(function(data){
			//do something if return success
			//$scope.successMsg = data;	
			$scope.usernameMsg = data.data;
		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
			
		});
	};
	$scope.passwordCheck = function () {
		//檢驗用戶兩次輸入的口令是否一致
	    if ($scope.registerForm.passwordRepeat != $scope.registerForm.password) {	      
	      $scope.error = "uncorrect!";
	    }else{
	      $scope.error = "Yeah!";
	    }
	}
}
registerCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

/*
	index controller
*/
function indexCtrl ($scope, $http, $location, $compile, socket, global) {
	//produce the only "id"
	$scope.users = [];
	$scope.users = [
		{
			id : 'a1111111111',
			username : 'zhoon_1'
		},
		{
			id : 'a2222222222',
			username : 'zhoon_2'
		},
		{
			id : 'a3333333333',
			username : 'zhoon_3'
		},
		{
			id : 'a4444444444',
			username : 'zhoon_4'
		},
		{
			id : 'a5555555555',
			username : 'zhoon_5'
		}
	];

	//send id to server
	var _hash = $location.hash();
	if(_hash) {
		socket.emit('set nickname', $scope.users[_hash]);
	}

    socket.on('ready', function () {
       //do something if server return ready
    });

    
    $scope.msgFrom = {};
    $scope.userTxt = {};
    $scope.sendToId = {};
    $scope.sendToName = {};
    $scope.msgs = {};

    //the function of init message
    $scope.initName = function (user) {

    	var _dialog = document.getElementById("dialog_" + user.id);
    	if (_dialog) {
    		_dialog.style.display = "block";
    		return ;
    	}

    	//chat_users[user.id] = socket;
    	$scope.sendToId[user.id] = user.id;
    	$scope.sendToName[user.id] = user.username;
    	$scope.msgFrom[user.id] = $scope.sendToName[user.id];

    	//template string
    	var _html = ['<div class="chat chatDialog" id="dialog_', user.id, '" style="left:500px;top: 100px;" data-left="500" data-top="100">',
    					'<div on-draggable="on-draggable" class="userMsgg">',
    						'<div class="title">',
    							'<h3>与{{msgFrom["', user.id, '"]}}聊天中</h3>',
    							'<a href="javascript:;" class="close" ng-click="closeDialog(\'', user.id, '\')">关闭</a>',
    							'<a href="javascript:;" class="min" ng-click="minDialog(\'', user.id, '\')">最小化</a>',
    						'</div>',
    					'</div>',
    					'<div id="chatScorll_', user.id, '" class="content">',
							'<ul class="items">',
								'<li ng-repeat="msg in msgs[\'', user.id, '\']">',
	            					'<div class="chatCnt">',
		              					'<p class="c_name">',
							                '<span class="username">{{msg.name}}</span>',
		                					'<span class="gray">{{msg.time}}</span>',
		              					'<p class="c_cnt">{{msg.cnt}}</p>',
		              				'</div>',
	              				'</li>',
							'</ul>',
						'</div>',
						'<p class="user_id">',
							'<input id="firend_id" type="text" ng-model="userId" placeholder="input your friend\'s id..." class="">',
							'<span class="yourId">Your ID : </span></p>',
						'<p class="user_txt">',
							'<textarea class="chat_msg" id="chat_msg_', user.id, '" ng-model="userTxt.', user.id, '" on-enter="sendMsg(\'', user.id, '\')" placeholder="input your message..." class=""></textarea>',
						'</p>',
						'<p class="user_ctrl">',
							'<input type="button" value="send message" ng-click="sendMsg(\'', user.id, '\')" class="btn">',
							'<span class="gray">&nbsp; or press "Enter" key</span>',
							'<a href="javascript:;" class="clearTxt" ng-click="clearMsg(\'', user.id, '\')">清除记录</a>',
						'</p>',
					'</div>'].join("");
    	var chatTeml = $compile(_html)($scope);
   		document.getElementById('chatTemplate').appendChild(chatTeml[0]);
    	
    	//get the data 
	    $scope.msgs[user.id] = [];

	}

	$scope.sendMsg = function(_userId){
   		// send the message to server
        if ($scope.userTxt[_userId] == undefined || $scope.userTxt[_userId] == "") {
        	document.getElementById('chat_msg').focus();
        	return false;
        } else {
        	$scope.flag = true;
	        if($scope.sendToId[_userId] == ''){
	            chat_users[_userId].emit('chat_publicmsg',$scope.userTxt[_userId]);
	        }else{
	            //chat_users[_userId].emit('chat_privatemsg',{
	            socket.emit('chat_privatemsg', {
	            	'sendTo' : $scope.sendToId[_userId],
	            	'sendText' : $scope.userTxt[_userId]
	            });
	        }
        }
 	}

	//chat_users[$scope.sendToId[user.id]].on('chat_have_receive', function (data) {
 	socket.on('chat_have_receive', function (data) {

    	// if return error
    	var data = eval(data);

    	$scope.flag = data.flag;

        if ($scope.flag && $scope.userTxt[data.fromId] != "") {
        	$scope.msgs[data.fromId].push({
				name : 'Me : ',
				time : global._getTime(),
				cnt : $scope.userTxt[data.fromId]
			});

        	clearTimeout(timeout);
			_scrollTop(data.fromId);
			
			$scope.userTxt[data.fromId] = '';
			document.getElementById('chat_msg_' + data.fromId).focus();
        }
    });	

	//chat_users[$scope.sendToId[user.id]].on('chat_usermsg', function (data) {
    socket.on('chat_usermsg', function (data) {

       //do something if someone send "data" to you
       var data = eval(data);

       $scope.msgs[data.fromId].push({
			name : data.fromName + ' : ',
			time : global._getTime(),
			cnt : data.msg
		});

       clearTimeout(timeout);
       _scrollTop(data.fromId);

    });

    //chat_users[user.id].on('chat_errmsg', function (data) {
    socket.on('chat_errmsg', function (data) {

    	// if the user is not exist
    	var data = eval(data);

       	$scope.msgs[data.fromId].push({
			name : data.fromName,
			time : global._getTime(),
			cnt : data.msg
		});

       	clearTimeout(timeout);
		_scrollTop(data.fromId);

    });
    

    //scroll
    var oldHeight = -1;    
    var timeout;
    function _scrollTop (id) {
    	var chatScorll = document.getElementById('chatScorll_' + id);
    	if (oldHeight != chatScorll.scrollHeight) {
    		chatScorll.scrollTop = chatScorll.scrollHeight;
    		oldHeight = chatScorll.scrollHeight;
    	}
    	timeout = setTimeout(function(){_scrollTop(id);}, 0);
    }

    // close the dialog
    $scope.closeDialog = function (userId) {

    	var dialog = document.getElementById("dialog_" + userId);
    	var dParent = document.getElementById("chatTemplate");

    	dParent.removeChild(dialog);

    }

    // clear the msg
    $scope.clearMsg = function (userId) {
    	
    	$scope.msgs[userId] = [];

    }

    // minimize the window
    $scope.minDialog = function (userId) {

    	var dialog = document.getElementById("dialog_" + userId);

    	dialog.style.display = "none";

    }

}
indexCtrl.$inject = ['$scope', '$http', '$location', '$compile', 'socket', 'global'];

/*
	chat controller
*/
function chatCtrl($scope) {
	//.............
	//.............
}

/*
	gameRule controller
*/
function gameRuleCtrl ($scope) {
	// body...
	debugger;
}
gameRuleCtrl.$inject = ['$scope'];

/*
	contact controller
*/
function contactCtrl ($scope) {
	// body...
}
contactCtrl.$inject = ['$scope'];

/*
	about controller
*/
function aboutCtrl ($scope) {
	// body...
}
contactCtrl.$inject = ['$scope'];
