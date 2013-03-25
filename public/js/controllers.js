'use strict';
/*
    addfriend controller
*/
function gameRuleCtrl($scope, $http, $routeParams, $location){//friendCtrl目前借用gameRule那个页面

    $scope.topicForm = {};

    //加题目
    $scope.topicPost = function(){
        $scope.topicForm.words=$scope.topicForm.words.split("，");
        $http.post('/subjects/addSubject', $scope.topicForm).success(function(data, status, headers, config){
            console.log(data.data);
            $scope.msgTips = "You have sucessfully insert a kinds of words!!";
        }).error(function(data, status, headers, config){
            
        });
    };
    //更新用户信息测试函数
    $scope.updatePost = function(){
        var currentUser={
            systemid:"nodegame11377627961363776874746",
            winRate:"100%",
            level:100,
        };
        $http.post('/add_friend/update', currentUser).success(function(data, status, headers, config){
            console.log(data.data);
           
        }).error(function(data, status, headers, config){
            
        });
    };
}
gameRuleCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];//friendCtrl

/*
	login controller
*/
function loginCtrl($scope, $http, $routeParams, $location, localStorage){
    //var 
	$scope.loginForm = {};
	//submit function
	$scope.loginPost = function(){
		$http.post('/login/login', $scope.loginForm).success(function(data, status, headers, config){
			//var 
			var loginMark = data.err;
			var friendToJson = JSON.stringify(data.friendList);
			var myselfInfoToJson = JSON.stringify(data.myselfInfo);
            localStorage.put('nodeGameIsFirstLoad', true);
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
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'localStorage'];

/*
	loginOut controllers
*/
function loginOutController($scope, $http, $routeParams, $location, localStorage) {
  $scope.loginOut = function(){
		$http.get('/login/loginout').success(function(data, status, headers, config){
			//set storage
            localStorage.put('nodeGameIsFirstLoad', false)
			window.sessionStorage.clear();
			window.location.reload();
			
		}).error(function(data, status, headers, config){
			
		});
	};
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'localStorage'];

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
				window.location.href='/login';
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
function indexCtrl ($scope, $http, $location, $timeout, $compile, socket, localStorage, global) {

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
    
    var initFrientMsg = function () {
        //arr to obj
        for (var i = 0; i < $scope.friendList.length; i++) {
            usersObj[$scope.friendList[i].systemid] = $scope.friendList[i];
        };
        // init the msg arr
        for(var i=0; i < $scope.friendList.length; i++) {
            $scope.msgs[$scope.friendList[i].systemid] = [];
            $scope.count[$scope.friendList[i].systemid] = 0;
        }
    }

    // the list of all friends and myself
    if (getFriendList) {
        // get the friendList
        $scope.friendList = JSON.parse(getFriendList) || [];
        // arr to obj
        // init the msg arr
        initFrientMsg();
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
                        '<div id="chatScorll_', friend.systemid, '" class="content" on-scroller="msgs[\'', friend.systemid, '\']">',
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
                            '<span class="gray">&nbsp; or "Enter" key</span>',
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
            console.log('the user is not online...')
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
    });

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
    //success msg tip
    $scope.systemTips = 0;
    //error msg tip
    $scope.errorTips = 0;
    //user say msg tip
    $scope.sayMessageTips = 0;
    $scope.sayMessage = "";
    $scope.wordLength = null;
    $scope.word = '';
    $scope.isEditing = false;
    $scope.isFirstGet = 0;
    $scope.createRoomName = "";
    $scope.hovePeople = {};
    $scope.isAddRoom = 0;
    $scope.leaveMessage = 0;
    $scope.curRoom = "";
    $scope.curLocation = -1;
    $scope.timeLeave = 0;
    $scope.isYourTurn = 0;
    $scope.isReady = 0;
    $scope.isGameStart = 0;
    $scope.isDisplayVote = 0;
    $scope.isDisplayVoteCount = 0;
    $scope.isDisplayInfo = {};
    $scope.isYourFriend = {};
    $scope.isPlayerReady = {};
    $scope.isVoteOut = {};
    $scope.gameOverInfo = {};
    $scope.playVoteCount = {};

    //if is first into the index page,display the room box
    if (localStorage.get('nodeGameIsFirstLoad') == true) {
        if ($scope.isFirstGet === 0) {
            socket.emit('getRoomList',{});
            $scope.isFirstGet = 1;
        }
        $(".maskDiv").show();
        $("#roomBox").animate({"top" : "40px"}, 200, "ease");
        localStorage.put('nodeGameIsFirstLoad', false);
    }

    //以下是angular相关函数和操作

    //close tips div
    var _closeSystemTips;
    var closeSystemTips = function () {
        $timeout.cancel(_closeSystemTips);
        _closeSystemTips = $timeout(function () {
            $scope.systemTips = 0;
        }, 1500);
    };
    var _closeErrTips;
    var closeErrTips = function () {
        $timeout.cancel(_closeErrTips);
        _closeErrTips = $timeout(function () {
            $scope.errorTips = 0;
        }, 1500);
    };
    var _closeSayTips;
    var closeSayTips = function () {
        $timeout.cancel(_closeSayTips);
        _closeSayTips = $timeout(function () {
            $scope.sayMessageTips = 0;
        }, 3000);
    };
    $scope.editRoomName = function () {
        $scope.isEditing = true;
    }
    $scope.roomNameBlur = function () {
        if ($scope.createRoomName == '') {
            //tip : not exist
            $scope.errorTips = "房间名不能为空";
            closeErrTips();
            $scope.isEditing = false;
        } else {
            // create room
            createRoom($scope.createRoomName);
            $scope.isEditing = false;
            $scope.createRoomName = "";
        }
    }

    var _timeLeave;
    var timeLimit = 30;
    var timeLeave = function () {
        _timeLeave = $timeout(function () {
            timeLimit --;
            $scope.timeLeave = timeLimit;
            if (timeLimit <= 0) {
                timeLimit = 30;
                $timeout.cancel(_timeLeave);
                //callback
                socket.emit('onMakeStatement',{
                    _roomName: $scope.curRoom,
                    _userID : _myself.systemid,
                    _userName: _myself.name,
                    _statement: "规定时间内没有发言!!!"
                });
                $scope.isYourTurn = 0;
            } else {
                timeLeave();
            }
        }, 1000);
    }

    //以下是socket相关函数和操作

    var resetGame = function (isGameOver) {
        $scope.leaveMessage = 0;
        $scope.timeLeave = 0;
        $scope.isYourTurn = 0;
        $scope.isGameStart = 0;
        $scope.isDisplayVote = 0;
        $scope.isDisplayVoteCount = 0;
        $scope.isPlayerReady = {};
        $scope.isVoteOut = {};
        $scope.wordLength = null;
        $scope.word = '';
        //tips
        if (isGameOver) {
            $scope.isReady = 1;
            for (var item in $scope.playVoteCount) {
               $scope.playVoteCount[item] = false;
            }
        } else {
            initPlayerList();
            $scope.curRoom = "";
            $scope.isAddRoom = 0;
            $scope.isReady = 0;
            $scope.isDisplayInfo = {};
            $scope.isYourFriend = {};
            $scope.playVoteCount = {};
            //tips
            $scope.systemTips = "退出房间成功";
            closeSystemTips();
        }
    };
    var createRoom = function(roomName){
        if ($scope.isAddRoom == 0) {
            socket.emit('createRoom',{_roomName : roomName});
            /*
                when succeed create the room
            */
            socket.on('createRoomSuccess', function (data) {
                if (data.type == 1) {
                    $scope.isAddRoom = 1;
                    $scope.systemTips = "创建房间成功";
                    closeSystemTips();
                    $scope.curRoom = roomName;
                    if ($scope.isReady == 0) {
                        $scope.isReady = 1;
                    }
                    $timeout(function(){
                        $("#roomBox").animate({"top" : "-510px"}, 300, "ease", function () {
                            $(".maskDiv").hide();
                        });
                    }, 1200);
                    //join the room you create when you create it.(play1)
                    var _jID = _myself.systemid;
                    var _jUserInfo = {winRate : _myself.winRate || "", level : _myself.level || "", userName : _myself.name}
                    $scope.curLocation = 0;
                    socket.emit('joinRoom',{_roomName : roomName, _userName : _myself.name, _location : 0, _userID : _jID, _userInfo : _jUserInfo});
                }
            });
        } else {
            $scope.errorTips = "你已经加入了一个房间，不能创建房间";
            closeErrTips();
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
                var _jName = _myself.name;
                var _jRoom = roomName;
                var _jID = _myself.systemid;
                var _jUserInfo = {winRate : _myself.winRate || "", level : _myself.level || "", userName : _myself.name}
                $scope.curLocation = roomIndex;
                socket.emit('joinRoom',{_roomName : _jRoom, _userName : _jName, _location : roomIndex, _userID : _jID, _userInfo : _jUserInfo});
                /*
                    when succeed join the room
                */
                socket.on('joinRoomSuccess', function (data) {
                    if (data.type ==1) {
                        $scope.isAddRoom = 1;
                        $scope.systemTips = "加入房间成功";
                        closeSystemTips();
                        $scope.curRoom = roomName;
                        if ($scope.isReady == 0) {
                            $scope.isReady = 1;
                        }
                        //hide the dialog
                        $timeout(function(){
                            $("#roomBox").animate({"top" : "-510px"}, 300, "ease", function () {
                                $(".maskDiv").hide();
                            });
                        }, 1200);
                    }
                });
            } else {
                $scope.errorTips = "你已经加入了一个房间，不能再加入一个房间";
                closeErrTips();
            }
        } else {
            $scope.errorTips = "此桌子已经有人，请选择其他桌子";
            closeErrTips();
        }
    }
    //离开房间
    $scope.leaveRoom = function () {
        //init server
        socket.emit('leaveRoom',{_roomName : $scope.curRoom, _userName : _myself.name, _userID : _myself.systemid, _location : $scope.curLocation});
        //if succeed
        socket.on('leaveSuccess',function (data) {
            //reset
            resetGame(false);
        });
    }
    //是否为空房间
    socket.on('deleteRoom',function (data) {
        var _roomName = data._roomName;
        for (var i = 0; i < $scope.roomList.length; i++) {
            if ($scope.roomList[i].roomName == _roomName) {
                $scope.roomList.splice(i, 1);
            }
        }
    })
    //准备游戏
    $scope.prepareForGame = function(roomName){
        socket.emit('prepareForGame',{
            _roomName : roomName,
            _userID : _myself.systemid,
            _userName : _myself.name
        });
        if ($scope.isReady == 1) {
            $scope.isReady = 0;
        }
    }
    //发言
    $scope.makeStatement = function(roomName,statement){
        if ($scope.sayMessage = "") {
            return -1;
        } else {
            socket.emit('onMakeStatement',{
                _roomName: roomName,
                _userID : _myself.systemid,
                _userName: _myself.name,
                _statement: statement
            });
            $timeout.cancel(_timeLeave);
            timeLimit = 30;
            $scope.timeLeave = 0;
            $scope.sayMessage = "";
            $scope.isYourTurn = 0;
        } 
    }
    //投票
    $scope.playerList = [];
    var initPlayerList = function () {
        $scope.playerList = [
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}},
            {isOn : 0, info : {}}
        ];
    }
    initPlayerList();
    //更新房间内玩家
    socket.on('updateRoomMember',function (data) {
        var _member = data._list;
        var _type = data._type;
        initPlayerList();
        var _length = _member.length;
        for (var i = 0; i < _length; i++) {
            $scope.playerList[i].isOn = 1;
            $scope.playerList[i].info = _member[i];
            $scope.isPlayerReady[_member[i].systemID] = _member[i].isPrepare;
        }
        for (var i = 0; i < _member.length; i++) {
            if ($scope.playerList[i].info.systemID != _myself.systemid) {
                $scope.playerList.push($scope.playerList.shift());
                i--;
            } else {
                break;
            }
        }
        //join room
        if (_type = 0) {
            $scope.playVoteCount[_member[i].systemID] = 0;
        }
        //leave room
        if (_type = 1) {
            delete $scope.playVoteCount[_member[i].systemID];
        }
        //prepare game
        if (_type = 2) {}
    });
    //更新分数
    socket.on('updateVoteCount',function (data) {
        var _voteCount = data._count;
        for (var _playID in _voteCount) {
            $scope.playVoteCount[_playID] = _voteCount[_playID];
        }
    })
    //是否展示玩家信息(初始化isDisplayInfo)
    for (var i = 0; i < $scope.playerList.length; i++) {
        $scope.isDisplayInfo[$scope.playerList[i].info.systemID] = 0;
    }
    //是否为你的好友(初始化isYourFriend)
    for (var i = 0; i < $scope.friendList.length; i++) {
        $scope.isYourFriend[$scope.friendList[i].systemid] = 1;
    }
    //投票
    $scope.voteOne = function(roomName,voteToName,voteToID){
        socket.emit('voteOne',{
            _roomName: roomName,
            _userID : _myself.systemid,
            _userName: _myself.name,
            _voteToID : voteToID,
            _voteToName: voteToName
        });
        $scope.isDisplayVote = 0;
    }
    //mouse over
    $scope.faceMouseOver = function (userID) {
        $scope.isDisplayInfo[userID] = 1;
    }
    //mouse over
    $scope.faceMouseOut = function (userID) {
        $scope.isDisplayInfo[userID] = 0;
    }
    //鬼猜词
    $scope.guessWord = function () {
        //
    }
    //死后留遗言
    $scope.leaveMsg = function () {
        //
    }
    //添加好友
    $scope.addFriend = function (systemid, username) {
        var yourFriend = {
            username : username,
            systemid : systemid,
            selfName : _myself.name,
            selfId : _myself.systemid
        };
        $http.post('/add_friend/add', yourFriend).success(function(data, status, headers, config){
            //console.log(data.data); //{userName : "zhoonchen", "systemid" : "nodegame232232323"}
            var _data = data.data;
            if (typeof _data == "string") {
                $scope.errorTips = _data;
                closeErrTips();
            } else {
                if (_data.name && _data.systemid) {
                    $scope.friendList.push({
                        "name" : _data.name,
                        "systemid" : data.systemid
                    });
                } else {
                    $scope.errorTips = "添加好友失败";
                    closeErrTips();
                }
                //rewrite the friend msg
                initFrientMsg();
                //tips
                $scope.systemTips = "成功添加" + _data.name + "为好友";
                closeSystemTips();
                //session storage
                window.sessionStorage.setItem('friendList',JSON.stringify($scope.friendList));
                //update status
                $scope.isYourFriend[_data.systemid] = 1;
            }
        }).error(function(data, status, headers, config){
            //tip
            $scope.errorTips = "添加好友失败";
            closeErrTips();
        });
    };
    //删除好友
    $scope.removeFriend = function (systemid, username) {
        var yourFriend = {
            username : username,
            systemid : systemid,
            selfName : _myself.name,
            selfId : _myself.systemid
        };
        $http.post('/add_friend/remove', yourFriend).success(function(data, status, headers, config){
            var _data = data.data;
            if (typeof _data == "string") {
                $scope.errorTips = _data;
                closeErrTips();
            } else {
                if (_data.name && _data.systemid) {
                    //delete friend from $scope.friendList
                    for (var i = 0; i < $scope.friendList.length; i++) {
                        if ($scope.friendList[i].name == _data.name) {
                            $scope.friendList.splice(i, 1);
                            break;
                        }
                    };
                } else {
                    $scope.errorTips = "取消好友失败";
                    closeErrTips();
                }
                //rewrite the friend msg
                initFrientMsg();
                //tips
                $scope.systemTips = "成功取消好友" + _data.name;
                closeSystemTips();
                //session storage
                window.sessionStorage.setItem('friendList',JSON.stringify($scope.friendList));
                //update status
                $scope.isYourFriend[_data.systemid] = 0;
            }
        }).error(function(data, status, headers, config){
            //tip
            $scope.errorTips = "取消好友失败";
            closeErrTips();
        });
    }
    socket.on('createRoomErr',function () {
        
    })
    //其他人创建房间时
    socket.on('newRoom',function(data){
        $scope.roomList.push({
            roomName : data._roomName
        });
    });
    //收到房间列表时
    socket.on('onRoomList',function(data){
        var _roomList = data._list;
        $scope.roomList = [];
        //push the room list to the view
        for (var i = 0; i < _roomList.length; i++) {
            $scope.roomList.push({
                roomName : _roomList[i].roomName
            });
        }
        //设置所有房间内桌子的状态
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
    //更新所有房间内桌子的状态
    socket.on('updateRoomStatus',function(data){
        var _room = data;
        if (!$scope.hovePeople[_room._roomName]){
            $scope.hovePeople[_room._roomName] = [];
        }
        //leave room
        if (_room._type == -1) {
            $scope.hovePeople[_room._roomName][_room._location] = 0;
        }
        //join room 
        else {
            $scope.hovePeople[_room._roomName][_room._location] = 1;
        }
    });
    //游戏开始
    socket.on('gameStart',function(data){
        $scope.sysMessage.push('游戏开始');
        socket.emit('getIdentity',{_userName : _myself.name, _roomName : $scope.curRoom, _userID : _myself.systemid});
        $scope.isGameStart = 1;
    });
    $scope.addWords = function (userID, uername) {
        //Just test
    }
    //游戏结束
    socket.on('gameOver',function (data) {
        //leave room
        //socket.emit('leaveRoom',{_roomName : $scope.curRoom, _userName : _myself.name, _userID : _myself.systemid, _location : $scope.curLocation});
        //tips
        $timeout(function () {
            $scope.systemTips = data.msg;
            closeSystemTips();
        },1500);
        //reset game
        resetGame(true);
    });
    socket.on('gameOverResult',function (data) {
        $scope.gameOverInfo = data._result;
        $timeout(function () {
            $(".maskDiv").show();
            $("#gameOverBox").animate({"top" : "40px"}, 200, "ease");
        },3000);
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
        if(userName == _myself.name){
            //time leave
            timeLeave();
            $scope.isYourTurn = 1;
        }
    });
    //开始投票
    socket.on('startVote',function(data){
        $scope.isDisplayVote = 1;
        $scope.isDisplayVoteCount = 1;
        $scope.systemTips = "发言结束,请开始投票";
        closeSystemTips();
    });
    //玩家出局
    socket.on('voteOut',function(data){
        //init VoteOut
        $scope.isVoteOut[data._userID] = 1;
        //init VoteCount
        $scope.isDisplayVoteCount = 0;
    });
    //系统消息
    socket.on('Message',function(data){
        if (data.type == 4) {
            $scope.sayMessageTips = data.msg;
            closeSayTips();
        }
        if (data.type == 8 || data.type == 7 || data.type == 6 || data.type == 5 || data.type == 3 || data.type == 2 || data.type ==1) {
            $timeout(function () {
                $scope.systemTips = data.msg;
                closeSystemTips();
            }, 1000);
        }
        $scope.sysMessage.push(data.msg);
    });
    //错误消息
    socket.on('err',function(data){
        if (data.type == 2 || data.type == -1) {
            $scope.errorTips = data.msg;
            closeErrTips();
        };
        $scope.sysMessage.push(data.msg);
    });
    socket.on('rooms',function(data){
        //仅作测试用，可删除
    });

}
indexCtrl.$inject = ['$scope', '$http', '$location', '$timeout', '$compile', 'socket', 'localStorage', 'global'];




/*
	chat controller
*/
function chatCtrl($scope) {}
chatCtrl.$inject = ['$scope'];
/*
	gameRule controller
*/
// function gameRuleCtrl ($scope) {}
// gameRuleCtrl.$inject = ['$scope'];

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
