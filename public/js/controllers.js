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
				window.location.href='/';
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
function indexCtrl ($scope, $http, $location, $timeout, $compile, socket, global) {
	
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
		// get the friendList
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

	// get the info of yourself
	var _myself = JSON.parse(getMyselfInfo);
    $scope._myself = _myself;

	//send id to server
	if (_myself) {
		socket.emit('set nickname', _myself);
	} else {
	}
    socket.on('ready', function () {
       //do something if server return ready
    });

    function _template (friend) {
    	// check if the dialog is exist
    	var _dialog = document.getElementById("dialog_" + friend.systemid);
    	if (_dialog) {
    		_dialog.style.display = "block";
    		return ;
    	}

    	// init info
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
		// compile the template
    	var chatTeml = $compile(_html)($scope);
   		document.getElementById('chatTemplate').appendChild(chatTeml[0]);
    }

    function _showTips (fromId, fromName) {
    	// show tips
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
    	// get _template to show the dialog
    	_template(friend);
	}

	//see the msg tips
	$scope.showWin = function (userId) {
		// get _template to show the dialog
		_template(usersObj[userId]);
		// rewrite the info
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
        	// if err
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
    	// init info 
    	$scope.flag = data.flag;
    	// update info to plane of yourself
        if ($scope.flag && $scope.userTxt[data.fromId] != "") {
        	$scope.msgs[data.fromId].push({
				name : 'Me : ',
				time : global._getTime(),
				cnt : $scope.userTxt[data.fromId]
			});
        	// scroll
        	clearTimeout(timeout);
			_scrollTop(data.fromId);
			// clear
			$scope.userTxt[data.fromId] = '';
			document.getElementById('chat_msg_' + data.fromId).focus();
        }
    });	

    socket.on('chat_usermsg', function (data) {
       // do something if someone send "data" to you
       var data = eval(data);
       var isIdExist = document.getElementById("dialog_" + data.fromId);
       // if dialog is exist and bolck
       if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "block") {
       		//if the window is display=block
	       	$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});
       } 
       // if dialog is exist and none
       else if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "none") {
       		//if the window is display=none
       		$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});
			//tips
			_showTips(data.fromId, data.fromName);

       } 
       // if dialog is not exist
       else if (usersObj[data.fromId] && !isIdExist) {
       		//if the window is not display yeat
       		$scope.msgs[data.fromId].push({
				name : data.fromName + ' : ',
				time : global._getTime(),
				cnt : data.msg
			});
       		//tips
       		_showTips(data.fromId, data.fromName);

       } 
       // err
       else {
       		console.log('the user is not exist...')
       }
       // scroll
       clearTimeout(timeout);
       if (isIdExist) {
       		_scrollTop(data.fromId);
       }
    });

    socket.on('chat_errmsg', function (data) {
    	// if the user is not exist
    	var data = eval(data);
       	$scope.msgs[data.fromId].push({
			name : data.fromName,
			time : global._getTime(),
			cnt : data.msg
		});
       	// scroll
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
	    	timeout = $timeout(function(){_scrollTop(id);}, 0);
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
    	// clear
    	$scope.msgs[userId] = [];
    }

    // minimize the window
    $scope.minDialog = function (userId) {
    	// min dialog
    	var dialog = document.getElementById("dialog_" + userId);
    	dialog.style.display = "none";
    }

    /*
		房间
    */
    $scope.roomList = [];
    $scope.sysMessage = [];
    $scope.systemTips = 0;
    $scope.wordLength = null;
    $scope.word = '';


    //以下是angular相关函数和操作

    $scope.isEditing = false;
    $scope.isFirstGet = 0;
    $scope.createRoomName = "";
    $scope.hovePeople = {};
    $scope.isAddRoom = 0;
    $scope.curRoom = "";

    $scope.editRoomName = function () {
    	$scope.isEditing = true;
    }
    $scope.roomNameBlur = function () {
    	if ($scope.createRoomName == '') {
    		//tip : not exist
            $scope.systemTips = "房间名不能为空";
            closeSystemTips();
    		$scope.isEditing = false;
    	} else {
    		// create room
    		createRoom($scope.createRoomName);
    		$scope.isEditing = false;
            $scope.createRoomName = "";
    	}
    }
    //close tips div
    var closeSystemTips = function () {
        $timeout(function () {
            $scope.systemTips = 0;
        }, 1000)
    }

    //以下是socket相关函数和操作

    var createRoom = function(roomName){
        if ($scope.isAddRoom == 0) {
            $scope.isAddRoom = 1;
        	socket.emit('createRoom',{_roomName : roomName});
            //tip : succeed (should be wrote in callback socket)
            $scope.systemTips = "创建房间成功";
            closeSystemTips();
            $scope.curRoom = roomName;
            //join the room you create when you create it.(play1)
            socket.emit('joinRoom',{_roomName : roomName, _userName : _myself.name, _location : 0});
        } else {
            $scope.systemTips = "你已经加入了一个房间，不能创建房间";
            closeSystemTips();
        }
    }
    //获取房间列表
    $scope.getRoomList = function(){
    	if ($scope.isFirstGet === 0) {
    		socket.emit('getRoomList',{});
    		$scope.isFirstGet = 1;
    	}
    }

    $scope.joinRoom = function(roomName, roomIndex){
        if (!$scope.hovePeople[roomName][roomIndex]) {
            if ($scope.isAddRoom == 0) {
                $scope.isAddRoom = 1;
                var _jName = _myself.name;
                var _jRoom = roomName;
            	socket.emit('joinRoom',{_roomName : _jRoom, _userName : _jName, _location : roomIndex});
                //tips
                $scope.systemTips = "加入房间成功";
                closeSystemTips();
                $scope.curRoom = roomName;
                //hide the dialog
                $timeout(function(){
                    $("#roomBox").animate({"top" : "-510px"}, 300, "ease");
                    $(".maskDiv").hide();
                }, 2000)
                
            } else {
                $scope.systemTips = "你已经加入了一个房间，不能再加入一个房间";
                closeSystemTips();
            }
        } else {
            $scope.systemTips = "此桌子已经有人，请选择其他桌子";
            closeSystemTips();
        }
    }
    $scope.leaveRoom = function (room) {
        
    }
    //准备游戏
    $scope.prepareForGame = function(roomName){
    	socket.emit('prepareForGame',{
    		_roomName : roomName,
    		_userName : _myself.name
    	});
    }
    //发言
    $scope.makeStatement = function(roomName,userName,statement){
    	socket.emit('onMakeStatement',{
    		_roomName: roomName,
    		_userName: userName,
    		_statement: statement
    	});
    }
    //投票
    $scope.voteOne = function(roomName,userName,voteToName){
    	socket.emit('voteOne',{
    		_roomName: roomName,
    		_userName: userName,
    		_voteToName: voteToName
    	});
    }
    //其他人创建房间时
    socket.on('newRoom',function(data){
    	$scope.roomList.push({
    		roomName : data._roomName
    	});
    });
    //收到房间列表时
    socket.on('onRoomList',function(data){
        var _roomList = data._list;
        console.log(_roomList);
        $scope.roomList = [];
        //push the room list to the view
        for (var i = 0; i < _roomList.length; i++) {
            $scope.roomList.push({
                roomName : _roomList[i].roomName
            });
        }
        //set desk status
        for (var i = 0; i < _roomList.length; i++) {
            if (!$scope.hovePeople[_roomList[i].roomName]) 
            {
                $scope.hovePeople[_roomList[i].roomName] = [];
            }
            for (var j =0; j < _roomList[i].index.length; j++) {
                if (_roomList[i].index[j] == 1) {
                    $scope.hovePeople[_roomList[i].roomName][j] = 1;
                }
            }
        }
    });
    //
    socket.on('updateRoomStatus',function(data){
        var _room = data;
        if (!$scope.hovePeople[_room._roomName]) 
        {
            $scope.hovePeople[_room._roomName] = [];
        }
        $scope.hovePeople[_room._roomName][_room._location] = 1;
    });
    //游戏开始
    socket.on('gameStart',function(data){
    	$scope.sysMessage.push('游戏开始');
    	socket.emit('getIdentity',{_userName : _myself.name, _roomName : $scope.curRoom});
    });
    //收到身份，词等
    socket.on('setIdentity',function(data){
    	$scope.word = data._word;
    	if(data._wordLength){
    		$scope.wordLength = data._wordLength;
    	}
    });
    //轮到用户user发言时
    socket.on('makeStatement',function(data){
    	var userName = data._userName;
    	if(userName == $scope.userName){
    	}
    });
    //开始投票
    socket.on('startVote',function(data){
    });
    //系统消息
    socket.on('Message',function(data){
    	$scope.sysMessage.push(data.msg);
    });
    //错误消息
    socket.on('err',function(data){
        if (data.msg == '房间已存在') {
            $scope.systemTips = "该房间已经存在";
            closeSystemTips();
        };
    	$scope.sysMessage.push(data.msg);
    });
    socket.on('rooms',function(data){
    	//仅作测试用，可删除
    	debugger ;
    });

}
indexCtrl.$inject = ['$scope', '$http', '$location', '$timeout', '$compile', 'socket', 'global'];




/*
	chat controller
*/
function chatCtrl($scope) {}
chatCtrl.$inject = ['$scope'];
/*
	gameRule controller
*/
function gameRuleCtrl ($scope) {}
gameRuleCtrl.$inject = ['$scope'];

/*
	contact controller
*/
function contactCtrl ($scope) {}
contactCtrl.$inject = ['$scope'];

/*
	about controller
*/
function aboutCtrl ($scope) {}
contactCtrl.$inject = ['$scope'];
