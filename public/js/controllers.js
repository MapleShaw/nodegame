'use strict';
/*
	login controller
*/
function loginCtrl($scope, $http, $routeParams, $location){

	$scope.loginForm = {};

	//submit function
	$scope.loginPost = function(){
		$http.post('/login/login', $scope.loginForm).success(function(data, status, headers, config){
			
			var loginMark = data.err;
			var friendToJson = JSON.stringify(data.friendList);
			var myselfInfoToJson = JSON.stringify(data.myselfInfo);
			window.sessionStorage.setItem('friendList',friendToJson);
			window.sessionStorage.setItem('myselfInfo',myselfInfoToJson);
			if(loginMark == 1){
				$scope.userMsg = "User is not existed!";
				document.getElementById("errorLoginOfName").style.backgroundColor = "#FA787E";
			}else if(loginMark == 2){
				$scope.userMsg = "Password is wrong!";
				document.getElementById("errorLoginOfPw").style.backgroundColor = "#FA787E";
			}else if(loginMark == 0){
				window.location.href="/";
			}
		}).error(function(data, status, headers, config){
			
		});
	};

	
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];
/*
	loginOut controllers
*/
function loginOutController($scope, $http, $routeParams, $location) {
  $scope.loginOut = function(){
		$http.get('/login/loginout').success(function(data, status, headers, config){
			
			window.sessionStorage.clear();
			window.location.reload();
			
		}).error(function(data, status, headers, config){
			
		});
	};
}
/*
	register controller
*/
function registerCtrl($scope, $http, $routeParams, $location){
    var checkMarkName,checkMarkPw;
	$scope.registerForm = {};

	//submit function
	$scope.registerPost = function () {
		if(checkMarkName==1&&checkMarkPw==0){
			$http.post('/register/post', $scope.registerForm).success(function(data, status, headers, config){
				//do something if return success
				$scope.successMsg = data.data;	
				window.location.reload();
			}).error(function(data, status, headers, config){
				//do something if return error
			});
		}else{
			$scope.successMsg = "Please check your information!!";
		}
	}
	
	//check if the name is only
	//use with the "ng-change" of input=text
	$scope.registerCheck = function () {
		$http.post('/register/check', $scope.registerForm).success(function(data){
			//do something if return success
			//$scope.successMsg = data;	
			checkMarkName = data.data;
			if(checkMarkName == 0){
				$scope.usernameMsg = "Username already exists!";
				document.getElementById("errorTipsOfName").style.backgroundColor = "#FA787E";
			}else if(checkMarkName == 1){
				$scope.usernameMsg = "The username is available!";
				document.getElementById("errorTipsOfName").style.backgroundColor = "#78FA89";
			}else if(checkMarkName == 2){
				$scope.usernameMsg = "Please fill in your name!";
				document.getElementById("errorTipsOfName").style.backgroundColor = "#FA787E";
			}	

		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
			
		});
	};
	$scope.passwordCheck = function () {
		//檢驗用戶兩次輸入的口令是否一致
	    if($scope.registerForm.passwordRepeat != $scope.registerForm.password) {
	      document.getElementById("errorTipsOfPw").style.backgroundColor = "#FA787E";	      
	      $scope.error = "uncorrect!";
	      checkMarkPw = 1;
	    }else{
	      document.getElementById("errorTipsOfPw").style.backgroundColor = "#78FA89";
	      $scope.error = "Yeah!";
	      checkMarkPw = 0;
	    }
	}
}
registerCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

/*
	index controller
*/
function indexCtrl ($scope, $http, $location, $compile, socket, global) {
	
	$scope.msgFrom = {};
    $scope.userTxt = {};
    $scope.sendToId = {};
    $scope.sendToName = {};
    $scope.msgs = {};
    $scope.tipsMsg = [];
    $scope.msgCount = 0;
    $scope.count = {};
    $scope.friendList = [];

    var usersObj = {};

	// 取出当前用户的好友列表
	var getFriendList = window.sessionStorage.getItem('friendList');
	var getMyselfInfo = window.sessionStorage.getItem('myselfInfo');
	
	// the list of all friends and myself
	if (getFriendList) {

		var _friendList = JSON.parse(getFriendList) || [];

		// pass the friend list to $scope.users
		$scope.friendList = _friendList;

		// arr to obj
		for (var i = 0; i < _friendList.length; i++) {
			usersObj[_friendList[i].systemid] = _friendList[i];
		};

		// init the msg arr
	    for(var i=0; i < $scope.friendList.length; i++) {
	    	$scope.msgs[$scope.friendList[i].systemid] = [];
	    	$scope.count[$scope.friendList[i].systemid] = 0;
	    }

	}

	var _myself = JSON.parse(getMyselfInfo);

	

	//send id to server
	if (_myself) {
		socket.emit('set nickname', _myself);
	} else {
		// 
	}

    socket.on('ready', function () {
       //do something if server return ready
    });

    function _template (friend) {

    	var _dialog = document.getElementById("dialog_" + friend.systemid);
    	if (_dialog) {
    		_dialog.style.display = "block";
    		return ;
    	}

    	//chat_users[friend.id] = socket;
    	$scope.sendToId[friend.systemid] = friend.systemid;
    	$scope.sendToName[friend.systemid] = friend.name;
    	$scope.msgFrom[friend.systemid] = $scope.sendToName[friend.systemid];

    	//template string
    	var _html = ['<div class="chat chatDialog" id="dialog_', friend.systemid, '" style="left:500px;top:100px;display:block;" data-left="500" data-top="100">',
    					'<div on-draggable="on-draggable" class="userMsgg">',
    						'<div class="title">',
    							'<h3>与{{msgFrom["', friend.systemid, '"]}}聊天中</h3>',
    							'<a href="javascript:;" class="close", title="关闭", ng-click="closeDialog(\'', friend.systemid, '\')"></a>',
    							'<a href="javascript:;" class="min", title="最小化", ng-click="minDialog(\'', friend.systemid, '\')"></a>',
    						'</div>',
    					'</div>',
    					'<div id="chatScorll_', friend.systemid, '" class="content">',
							'<ul class="items">',
								'<li ng-repeat="msg in msgs[\'', friend.systemid, '\']">',
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
							'<textarea class="chat_msg" id="chat_msg_', friend.systemid, '" ng-model="userTxt.', friend.systemid, '" on-enter="sendMsg(\'', friend.systemid, '\')" placeholder="input your message..." class=""></textarea>',
						'</p>',
						'<p class="user_ctrl">',
							'<input type="button" value="send message" ng-click="sendMsg(\'', friend.systemid, '\')" class="btn">',
							'<span class="gray">&nbsp; or press "Enter" key</span>',
							'<a href="javascript:;" class="clearTxt" ng-click="clearMsg(\'', friend.systemid, '\')">清除记录</a>',
						'</p>',
					'</div>'].join("");
    	var chatTeml = $compile(_html)($scope);
   		document.getElementById('chatTemplate').appendChild(chatTeml[0]);
    	
    }

    function _showTips (fromId, fromName) {
    	//
    	$scope.msgCount++;
    	if ($scope.count[fromId] === 0) {
	    	$scope.tipsMsg.push({
	    		fromId : fromId,
	    		fromName : fromName
	    	});
	    }

	    $scope.count[fromId]++;

    }

    $scope.sT = false;
    $scope.showTip = function() {
    	if ($scope.sT == false) {
	    	$scope.sT = true;
	    } else {
	    	$scope.sT = false;
	    }
    }

    //the function of init message
    $scope.initName = function (friend) {

    	_template(friend);

	}

	//see the msg tips
	$scope.showWin = function (userId) {
		
		_template(usersObj[userId]);

		$scope.msgCount -= $scope.count[userId];
		$scope.count[userId] = 0;

		for (var i = 0; i < $scope.tipsMsg.length; i++) {
			if($scope.tipsMsg[i].fromId === userId) {
				$scope.tipsMsg.splice(i, 1);
			}
		}

	}

	$scope.sendMsg = function(userId){
   		// send the message to server
        if ($scope.userTxt[userId] == undefined || $scope.userTxt[userId] == "") {
        	document.getElementById('chat_msg').focus();
        	return false;
        } else {
        	$scope.flag = true;
	        if($scope.sendToId[userId] == ''){
	            socket.emit('chat_publicmsg',$scope.userTxt[userId]);
	        }else{
	            socket.emit('chat_privatemsg', {
	            	'sendTo' : $scope.sendToId[userId],
	            	'sendText' : $scope.userTxt[userId]
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

    socket.on('chat_usermsg', function (data) {

       //do something if someone send "data" to you
       var data = eval(data);
       var isIdExist = document.getElementById("dialog_" + data.fromId);

       if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "block") {
       		//if the window is display=block
	       	$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});
       } else if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "none") {
       		//if the window is display=none
       		$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});

			//tips
			_showTips(data.fromId, data.fromName);

       } else if (usersObj[data.fromId] && !isIdExist) {
       		//if the window is not display yeat
       		$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});

       		//tips
       		_showTips(data.fromId, data.fromName);

       } else {
       		console.log('the user is not exist...')
       }

       clearTimeout(timeout);
       if (isIdExist) {
       		_scrollTop(data.fromId);
       }

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
    	if (chatScorll) {
	    	if (oldHeight != chatScorll.scrollHeight) {
	    		chatScorll.scrollTop = chatScorll.scrollHeight;
	    		oldHeight = chatScorll.scrollHeight;
	    	}
	    	timeout = setTimeout(function(){_scrollTop(id);}, 0);
	    } else {
	    	clearTimeout(timeout);
	    }
    }

    // close the dialog
    $scope.closeDialog = function (userId) {
    	var dialog = document.getElementById("dialog_" + userId);
    	var dParent = document.getElementById("chatTemplate");

    	$scope.msgs[userId] = [];

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
