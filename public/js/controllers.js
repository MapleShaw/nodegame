'use strict';
/*
    addfriend controller
*/
function gameRuleCtrl($scope, $http, $routeParams, $location){//friendCtrl目前借用gameRule那个页面
}
gameRuleCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];//friendCtrl

/*
	login controller
*/
function loginCtrl($scope, $http, $routeParams, $location, localStorage, sessionStorage){
    //var 
	$scope.loginForm = {};
	//submit function
	$scope.loginPost = function(){
		$http.post('/login/login', $scope.loginForm).success(function (data) {
			var loginMark = data.err;
			var friendToJson = data.friendList;
			var myselfInfoToJson = data.myselfInfo;
            localStorage.set('nodeGameIsFirstLoad', true);
			sessionStorage.set('friendList', friendToJson);
			sessionStorage.set('myselfInfo', myselfInfoToJson);
			if(loginMark == 1){
				$scope.userMsg = "User is not existed!";
				document.getElementById("errorLoginOfName").style.backgroundColor = "#FA787E";
			}else if(loginMark == 2){
				$scope.userMsg = "Password is wrong!";
				document.getElementById("errorLoginOfPw").style.backgroundColor = "#FA787E";
			}else if(loginMark == 0){
				window.location.href="/";
			}
		}).error(function (data) {
			
		});
	};

	
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'localStorage', 'sessionStorage'];

/*
	loginOut controllers
*/
function loginOutController($scope, $http, $routeParams, $location, localStorage, sessionStorage, socket) {
  $scope.loginOut = function(){
		$http.get('/login/loginout').success(function (data) {
            //get info
            var myInfo = sessionStorage.get('myselfInfo');
            //socket
            socket.emit('loginOut',{userId : myInfo.systemid});
            //loginOut
            localStorage.clear();
			sessionStorage.clear();
			window.location.reload();
		}).error(function (data) {
			//err
		});
	};
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'localStorage', 'sessionStorage', 'socket'];

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
function indexCtrl ($scope, $http, $location, $timeout, $compile, socket, localStorage, sessionStorage, global) {
    //聊天好友对象
    $scope.msgFrom = {};
    //聊天内容
    $scope.userTxt = {};
    //收信人id
    $scope.sendToId = {};
    //收信人姓名
    $scope.sendToName = {};
    //聊天内容数组
    $scope.msgs = {};
    //消息提示
    $scope.tipsMsg = [];
    //消息提示数量
    $scope.msgCount = 0;
    //单个玩家的消息数
    $scope.count = {};
    //好友列表
    $scope.friendList = [];
    //将好友数组转为对象
    var usersObj = {};
    //是否显示橙色条
    $scope.sT = false;

    // 取出当前用户的好友列表
    var getFriendList = sessionStorage.get('friendList');
    var getMyselfInfo = sessionStorage.get('myselfInfo');

    //初始化好友信息和好友信息数
    var initFrientMsg = function (id) {
        for (var i = 0; i < $scope.friendList.length; i++) {
            usersObj[$scope.friendList[i].systemid] = $scope.friendList[i];
        }
        for(var i=0; i < $scope.friendList.length; i++) {
            $scope.msgs[$scope.friendList[i].systemid] = [];
            $scope.count[$scope.friendList[i].systemid] = 0;
        }
        if (id) {   //remove friend
            delete usersObj[id];
        }
    }

    //获取好友信息
    if (getFriendList) {
        //将好友列表赋值给angular对象
        $scope.friendList = getFriendList || [];
        //调用初始化函数
        initFrientMsg();
    } else {
        console.log("获取友列信息失败");
        $scope.friendList = [];
    }

    //获取自己的信息
    if (getMyselfInfo) {
        var _myself = getMyselfInfo;
        $scope._myself = _myself;
        //到服务器注册聊天socket
        socket.emit('setNickname', _myself);
        //注册聊天socket成功
        socket.on('ready', function () {
           console.log("注册聊天socket成功");
        });
    } else {
        console.log("获取个人信息失败");
        var _myself = {};
        $scope._myself = _myself;
    }

    //聊天窗口模板
    function _template (friend) {
        //如果窗口存在,则显示
        var _dialog = document.getElementById("dialog_" + friend.systemid);
        if (_dialog) {
            _dialog.style.display = "block";
            return 1;
        }
        //否则初始化信息
        $scope.sendToId[friend.systemid] = friend.systemid;
        $scope.sendToName[friend.systemid] = friend.name;
        $scope.msgFrom[friend.systemid] = $scope.sendToName[friend.systemid];
        //模板html
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
        //编译模板
        var chatTeml = $compile(_html)($scope);
        document.getElementById('chatTemplate').appendChild(chatTeml[0]);
    }

    //新信息提醒的橙色条
    function _showTips (fromId, fromName) {
        $scope.msgCount++;
        if ($scope.count[fromId] === 0) {
            $scope.tipsMsg.push({
                fromId : fromId,
                fromName : fromName
            });
        }
        $scope.count[fromId]++;
    };

    /*
        angular 函数
    */

    //点击橙色条显示具体信息
    $scope.showTip = function() {
        if ($scope.sT == false) {
            $scope.sT = true;
        } else {
            $scope.sT = false;
        }
    };

    //初始化聊天窗口（点击好友头像弹出聊天窗口的）
    $scope.initChat = function (friend) {
        //调用函数构造模板
        _template(friend);
    };

    //初始化聊天窗口（点击橙色条里面的信息）
    $scope.showChatWin = function (userId) {
        //调用函数构造模板
        _template(usersObj[userId]);
        //reset信息数
        $scope.msgCount -= $scope.count[userId];
        $scope.count[userId] = 0;
        for (var i = 0; i < $scope.tipsMsg.length; i++) {
            if($scope.tipsMsg[i].fromId === userId) {
                $scope.tipsMsg.splice(i, 1);
            }
        }
    };

    //发送聊天信息
    $scope.sendMsg = function(userId){
        //非空
        if ($scope.userTxt[userId] == undefined || $scope.userTxt[userId] == "") {
            document.getElementById('chat_msg_' + data.fromId).focus();
            return -1;
        } else {
            $scope.flag = true;
            socket.emit('chatPrivateMsg', {
                'sendTo' : $scope.sendToId[userId],
                'sendText' : $scope.userTxt[userId]
            });
        }
    };

    //关闭聊天窗口
    $scope.closeDialog = function (userId) {
        var dialog = document.getElementById("dialog_" + userId);
        var dParent = document.getElementById("chatTemplate");
        $scope.msgs[userId] = [];
        dParent.removeChild(dialog);
    };

    //清除聊天记录
    $scope.clearMsg = function (userId) {
        $scope.msgs[userId] = [];
    };

    //最小化窗口
    $scope.minDialog = function (userId) {
        var dialog = document.getElementById("dialog_" + userId);
        dialog.style.display = "none";
    };

    /*
        接收socket
    */

    //后台是否接收到信息
    socket.on('chatHaveReceive', function (data) {
        var data = data;
        $scope.flag = data.flag;
        if ($scope.flag) {
            $scope.msgs[data.fromId].push({
                name : 'Me : ',
                time : global._getTime(),
                cnt : $scope.userTxt[data.fromId]
            });
            $scope.userTxt[data.fromId] = '';
            document.getElementById('chat_msg_' + data.fromId).focus();
        } else {
            $scope.msgs[data.fromId].push({
                name : 'Me : ',
                time : global._getTime(),
                cnt : '发送信息失败.'
            });
        }
    }); 

    //接收对方发送信息
    socket.on('chatUserMsg', function (data) {
       var data = data;
       var isIdExist = document.getElementById("dialog_" + data.fromId);
       // if dialog is exist and bolck
       if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "block") {
            //display=block
            $scope.msgs[data.fromId].push({
                name : data.fromName + ' : ',
                time : global._getTime(),
                cnt : data.msg
            });
       } 
       // if dialog is exist and none
       else if (usersObj[data.fromId] && isIdExist && isIdExist.style.display == "none") {
            //display=none
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
            //not display yet
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

    //接收错误信息
    socket.on('chatErrMsg', function (data) {
        var data = data;
        $scope.msgs[data.fromId].push({
            name : data.fromName,
            time : global._getTime(),
            cnt : data.msg
        });
    });

    /*
        房间
    */

    //所有房间的列表
    $scope.roomList = [];
    //系统信息存储数组
    $scope.sysMessage = [];
    //成功时的tips
    $scope.systemTips = 0;
    //错误时的tips
    $scope.errorTips = 0;
    //玩家发言内容的tips
    $scope.sayMessageTips = 0;
    //玩家发出去的内容，即textarea里面的内容
    $scope.sayMessage = "";
    //词语长度
    $scope.wordLength = null;
    //词语
    $scope.word = '';
    //创建房间是否处于编辑状态
    $scope.isEditing = false;
    //是否第一次获取所有房间的列表
    $scope.isFirstGet = 0;
    //创建房间的名字
    $scope.createRoomName = "";
    //房间内的桌子是否有人
    $scope.hovePeople = {};
    //是否已经加入了一个房间
    $scope.isAddRoom = 0;
    //是否可以写遗言
    $scope.leaveMessage = 0;
    //当前所在的房间
    $scope.curRoom = "";
    //当前所在房间的位置
    $scope.curLocation = -1;
    //剩余时间
    $scope.timeLeave = 0;
    //是否轮到你发言
    $scope.isYourTurn = 0;
    //是否已经准备游戏
    $scope.isReady = 0;
    //游戏是否开始了
    $scope.isGameStart = 0;
    //是否显示投票
    $scope.isDisplayVote = 0;
    //是否显示投票情况
    $scope.isDisplayVoteCount = 0;
    //是否显示玩家mouseover信息
    $scope.isDisplayInfo = {};
    //是否是你的朋友
    $scope.isYourFriend = {};
    //已经准备游戏的玩家列表
    $scope.isPlayerReady = {};
    //是否已经被投死了
    $scope.isVoteOut = {};
    //游戏结束后的弹出信息列表
    $scope.gameOverInfo = {};
    //每个玩家的票数
    $scope.playVoteCount = {};
    //当前房间玩家列表
    $scope.playerList = [];
    //是否开启游戏声音
    $scope.sound = false;
    //是否开启游戏背景音乐
    $scope.bgSound = false;
    //猜词语
    $scope.obGuessWord = '';
    //留遗言
    $scope.obLeaveMsg = '';
    //添加词语
    $scope.obAddWord = {};
    //当前玩家数
    $scope.curPlayerNum = 1;
    //时间限制常量
    var TIME_LIMIT = 30;
    //系统提示定时器
    var _closeSystemTips;
    //错误提示定时器
    var _closeErrTips;
    //发言提示定时器
    var _closeSayTips;
    //剩余时间定时器
    var _timeLeave;
    //时间限制
    var timeLimit = TIME_LIMIT;
    //敏感词
    var LIMIT_WORDS = ['A片','龟头','台独','法轮功','阿扁','黄片','三级片','3级片','大跃进','新疆','西藏','六四','安全套','打飞机','勃起','私处','泽民','动乱','阴茎','平反'];



    /* 
     * Function 
     */

     //获取所有房间列表
     var getRoomList = function () {
        //仅调用一次
         if ($scope.isFirstGet === 0) {
            socket.emit('getRoomList',{});
            $scope.isFirstGet = 1;
        }
     };

     //显示系统信息
     var showSystemTips = function (msg) {
        //赋值给angular变量
        $scope.systemTips = msg;
        //定时器
        $timeout.cancel(_closeSystemTips);
        _closeSystemTips = $timeout(function () {
            $scope.systemTips = 0;
        }, 1500);
    };
    
    //显示错误信息
    var showErrTips = function (msg) {
        //赋值给angular变量
        $scope.errorTips = msg;
        //定时器
        $timeout.cancel(_closeErrTips);
        _closeErrTips = $timeout(function () {
            $scope.errorTips = 0;
        }, 1500);
    };

    //显示发言信息
    var showSayTips = function (msg) {
        //赋值给angular变量
        $scope.sayMessageTips = msg;
        //定时器
        $timeout.cancel(_closeSayTips);
        _closeSayTips = $timeout(function () {
            $scope.sayMessageTips = 0;
        }, 3000);
    };

    //重置玩家票数
    var resetVoteCount = function () {
        for (var item in $scope.playVoteCount) {
           $scope.playVoteCount[item] = 0;
        }
    }

    //重置游戏所有变量
    var resetGame = function (type) {
        $scope.leaveMessage = 0;
        $scope.timeLeave = 0;
        $scope.isYourTurn = 0;
        $scope.isGameStart = 0;
        $scope.isDisplayVote = 0;
        $scope.isDisplayVoteCount = 0;
        $scope.isPlayerReady = {};
        $scope.isVoteOut = {};
        $scope.wordLength = null;
        $scope.word = "";
        //离开房间和游戏结束的重置不同
        if (type === "gameOver") {
            //重置票数
            resetVoteCount();
            $scope.isReady = 1;
        } else if (type === "leaveRoom") {
            //重置房间内的玩家状态
            initPlayerList();
            $scope.curRoom = "";
            $scope.isAddRoom = 0;
            $scope.isReady = 0;
            $scope.isDisplayInfo = {};
            $scope.playVoteCount = {};
            //系统信息
            showSystemTips("退出房间成功");
        } else {
            //others
        }
    };

    //创建房间
    var createRoom = function(roomName){
        if ($scope.isAddRoom == 0) {
            socket.emit('createRoom',{_roomName : roomName});
            //创建成功
            socket.on('createRoomSuccess', function (data) {
                if (data.type == 1) {
                    //系统信息
                    showSystemTips("创建房间成功");
                    //局部重置
                    $scope.isAddRoom = 1;
                    $scope.curRoom = roomName;
                    $scope.curLocation = 0;
                    if ($scope.isReady === 0) {
                        $scope.isReady = 1;
                    }
                    //弹出框
                    $timeout(function(){
                        $("#roomBox").animate({"top" : "-510px"}, 300, "ease", function () {
                            $(".maskDiv").hide();
                        });
                    }, 1200);
                    //加入房间
                    var _jID = _myself.systemid;
                    var _jUserInfo = {winRate : _myself.winRate || null, level : _myself.level || null, userName : _myself.name, totalTimes : _myself.totalTimes || null, winTimes : _myself.winTimes || null, failTimes : _myself.failTimes || null, score : _myself.score || 0};
                    socket.emit('joinRoom',{_roomName : roomName, _userName : _myself.name, _location : 0, _userID : _jID, _userInfo : _jUserInfo});
                }
            });
        } else {
            //显示错误信息
            showErrTips("你已经加入了一个房间，不能创建房间");
        }
    };

    //重置剩余时间
    var initLeaveTime = function () {
        $timeout.cancel(_timeLeave);
        timeLimit = TIME_LIMIT;
        $scope.timeLeave = 0;
    };

    //发言剩余时间
    var timeLeave = function (type) {
        _timeLeave = $timeout(function () {
            timeLimit --;
            $scope.timeLeave = timeLimit;
            if (timeLimit <= 0) {
                timeLimit = 30;
                $timeout.cancel(_timeLeave);
                //callback
                if (type === 'say') {
                    socket.emit('onMakeStatement',{
                        _roomName: $scope.curRoom,
                        _userID : _myself.systemid,
                        _userName: _myself.name,
                        _statement: "规定时间内没有发言!!!"
                    });
                    //局部重置
                    $scope.isYourTurn = 0;
                } else if (type === 'vote') {
                    socket.emit('voteOne',{
                        _roomName: $scope.curRoom,
                        _userID: _myself.systemid,
                        _userName: _myself.name,
                        _voteToID: null,
                        _voteToName: null
                    });
                    //显示错误信息
                    showErrTips("规定时间内没有投票，相当于弃权");
                    //隐藏投票
                    $scope.isDisplayVote = 0;
                    //重置定时器
                    initLeaveTime();
                }
                
            } else {
                timeLeave(type);
            }
        }, 1000);
    };

    //当前房间玩家列表
    var initPlayerList = function () {
        $scope.playerList = [
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}},
            {isOn : 0, num : 0, info : {}}
        ];
    };
    //invote
    initPlayerList();

    //初始化对象（是否展示玩家信息）
    var initDisplayInfo = function () {
        //默认不展示
        for (var i = 0; i < $scope.playerList.length; i++) {
            $scope.isDisplayInfo[$scope.playerList[i].info.systemID] = 0;
        }
    };
    //invote
    initDisplayInfo();

    //初始化好友对象（isYourFriend），后面用来判断游戏区里面的玩家是否为你的好友
    var intiYourFriend = function () {
        //好友默认为１
        for (var i = 0; i < $scope.friendList.length; i++) {
            $scope.isYourFriend[$scope.friendList[i].systemid] = 1;
        }
    };
    //invote
    intiYourFriend();

    //如果是登录进来的而不是刷新
    var isFirstLoad = function () {
        if (localStorage.get('nodeGameIsFirstLoad') == true) {
            localStorage.set('nodeGameIsFirstLoad', false);
            //调用房间列表函数
            getRoomList();
            //弹出框
            $(".maskDiv").show();
            $("#roomBox").animate({"top" : "40px"}, 200, "ease");
        }
    };
    //invote
    isFirstLoad();

    //游戏声音
    var bgSound = document.getElementById('bgSound');
    var audio = document.getElementById('sound');
    var _bgSoundIndex = 0;
    var audioPlayting = 0;
    var audioList = [];
    bgSound.volume = 0.7;
    var playAudio = function (_src, _type,  _delay, _last) {
        if (_src !== null) {
            if ($scope.sound && (audioPlayting === 0 || _type == "begin" || _type == "over" || _type == "die" || _type == "pk" || _type == "vote" || _type == "out")) {
                audioPlayting = 1;
                var _delay = _delay || 0;
                $timeout(function () {
                    audio.children[0].src = _src.mp3;
                    audio.children[1].src = _src.ogg;
                    audio.load();
                }, _delay);
                if (_last) {
                    $timeout(function () {
                        audio.pause();
                    }, _delay + _last);
                }
                //event
                audio.addEventListener('play', function(){
                    audioPlayting = 1;
                    bgSound.pause();
                }, false);
                audio.addEventListener('pause', function(){
                    audioPlayting = 0;
                    bgSound.play();
                }, false);
                audio.addEventListener('ended', function(){
                    audioPlayting = 0;
                    bgSound.play();
                }, false);
            }
        } else {
            return 0;
        }
    };
    var audioRoute = function (type, delay, last) {
        switch(type) {
            case "begin":
                playAudio({ogg:'sound/begin.ogg',mp3:'sound/begin.mp3'}, type, delay, last);
                break;
            case "over":
                playAudio({ogg:'sound/gameOver.ogg',mp3:'sound/gameOver.mp3'}, type, delay, last);
                break;
            case "die":
                playAudio({ogg:'sound/die.ogg',mp3:'sound/die.mp3'}, type, delay, last);
                break;
            case "pk":
                playAudio({ogg:'sound/pk.ogg',mp3:'sound/pk.mp3'}, type, delay, last);
                break;
            case "vote":
                playAudio({ogg:'sound/vote.ogg',mp3:'sound/vote.mp3'}, type, delay, last);
                break;
            case "out":
                playAudio({ogg:'sound/out.ogg',mp3:'sound/out.mp3'}, type, delay, last);
                break;
            case 1:
                playAudio({ogg:'sound/game/1.ogg',mp3:'sound/game/1.mp3'}, type, delay, last);
                break;
            case 2:
                playAudio({ogg:'sound/game/2.ogg',mp3:'sound/game/2.mp3'}, type, delay, last);
                break;
            case 3:
                playAudio({ogg:'sound/game/3.ogg',mp3:'sound/game/3.mp3'}, type, delay, last);
                break;
            case 4:
                playAudio({ogg:'sound/game/4.ogg',mp3:'sound/game/4.mp3'}, type, delay, last);
                break;
            case 5:
                playAudio({ogg:'sound/game/5.ogg',mp3:'sound/game/5.mp3'}, type, delay, last);
                break;
            case 6:
                playAudio({ogg:'sound/game/6.ogg',mp3:'sound/game/6.mp3'}, type, delay, last);
                break;
            case 7:
                playAudio({ogg:'sound/game/7.ogg',mp3:'sound/game/7.mp3'}, type, delay, last);
                break;
            case 8:
                playAudio({ogg:'sound/game/8.ogg',mp3:'sound/game/8.mp3'}, type, delay, last);
                break;
            case 9:
                playAudio({ogg:'sound/game/9.ogg',mp3:'sound/game/9.mp3'}, type, delay, last);
                break;
            default:
                playAudio(null);
        }
    };

    //切换背景音乐
    var _bgSoundList = [
        {ogg:'sound/bg5.ogg',mp3:'sound/bg5.mp3'},
        {ogg:'sound/bg1.ogg',mp3:'sound/bg1.mp3'},
        {ogg:'sound/bg9.ogg',mp3:'sound/bg9.mp3'},
        {ogg:'sound/bg3.ogg',mp3:'sound/bg3.mp3'},
        {ogg:'sound/bg7.ogg',mp3:'sound/bg7.mp3'},
        {ogg:'sound/bg8.ogg',mp3:'sound/bg8.mp3'}
    ];
    $scope.changeBgSound = function () {
        if ($scope.bgSound) {
            _bgSoundIndex ++;
            if (_bgSoundIndex >= _bgSoundList.length) {
                _bgSoundIndex = 0;
            }
            bgSound.pause();
            bgSound.children[0].src = _bgSoundList[_bgSoundIndex].mp3;
            bgSound.children[1].src = _bgSoundList[_bgSoundIndex].ogg;
            bgSound.load();
        }
    };

    //是否开启背景音乐
    if (!$scope.bgSound) {
        bgSound.pause();
    }
    $scope.toggleBgSound = function () {
        var bgSound = document.getElementById('bgSound');
        if ($scope.bgSound) {
            bgSound.play();
        } else {
            bgSound.pause();
        }
    };

    //以下是angular相关函数和操作
    
    //改变房间名编辑状态
    $scope.editRoomName = function () {
        $scope.isEditing = true;
    };

    //房间名编辑框失去焦点
    $scope.roomNameBlur = function () {
        if ($scope.createRoomName == '') {
            //显示错误信息
            showErrTips("房间名不能为空");
            $scope.isEditing = false;
        } else {
            //创建房间函
            createRoom($scope.createRoomName);
            //局部重置
            $scope.isEditing = false;
            $scope.createRoomName = "";
        }
    };

    //获取房间列表
    $scope.getRoomList = function () {
        //调用房间列表函数
        getRoomList();
    };

    //加入房间
    $scope.joinRoom = function (roomName, roomIndex) {
        //房间要没有人
        if (!$scope.hovePeople[roomName][roomIndex]) {
            //还没有加入其他房间
            if ($scope.isAddRoom == 0) {
                $scope.curLocation = roomIndex;
                var _jName = _myself.name;
                var _jRoom = roomName;
                var _jID = _myself.systemid;
                var _jUserInfo = {winRate : _myself.winRate || null, level : _myself.level || null, userName : _myself.name, totalTimes : _myself.totalTimes || null, winTimes : _myself.winTimes || null, failTimes : _myself.failTimes || null, score : _myself.score || 0};
                socket.emit('joinRoom',{_roomName : _jRoom, _userName : _jName, _location : roomIndex, _userID : _jID, _userInfo : _jUserInfo});
                //加入成功
                socket.on('joinRoomSuccess', function (data) {
                    if (data.type ==1) {
                        //系统信息
                        showSystemTips("加入房间成功");
                        //局部重置
                        $scope.isAddRoom = 1;
                        $scope.curRoom = roomName;
                        if ($scope.isReady === 0) {
                            $scope.isReady = 1;
                        }
                        //弹出框
                        $timeout(function(){
                            $("#roomBox").animate({"top" : "-510px"}, 300, "ease", function () {
                                $(".maskDiv").hide();
                            });
                        }, 1200);
                    }
                });
            } else {
                //显示错误信息
                showErrTips("你已经加入了一个房间，不能再加入一个房间");
            }
        } else {
            //显示错误信息
            showErrTips("此桌子已经有人，请选择其他桌子");
        }
    };

    //准备游戏
    $scope.prepareForGame = function (roomName) {
        socket.emit('prepareForGame', {
            _roomName : roomName,
            _userID : _myself.systemid,
            _userName : _myself.name
        });
        if ($scope.isReady === 1) {
            $scope.isReady = 0;
        }
    };

    //发言
    $scope.makeStatement = function (roomName,statement) {
        if ($scope.sayMessage == "") {
            showErrTips("发言不能为空");
            return 0;
        } else {
            var _word = $scope.word.split("");
            for (var i = 0; i < LIMIT_WORDS.length; i++) {
                if($scope.sayMessage.indexOf(LIMIT_WORDS[i]) > -1){
                    showErrTips("您的发言中包含敏感信息，请从新输入");
                    return 0;
                    break;
                }
            }
            for (var j = 0; j < _word.length; j++) {
                if($scope.sayMessage.indexOf(_word[j]) > -1){
                    showErrTips("发言中不能包含词语中相关字或者词，请从新输入");
                    return 0;
                    break;
                }
            }
            socket.emit('onMakeStatement',{
                _roomName: roomName,
                _userID : _myself.systemid,
                _userName: _myself.name,
                _statement: statement
            });
            //重置定时器
            initLeaveTime();
            $scope.sayMessage = "";
            $scope.isYourTurn = 0;
        } 
    };

    //投票
    $scope.voteOne = function (roomName,voteToName,voteToID) {
        socket.emit('voteOne',{
            _roomName: roomName,
            _userID: _myself.systemid,
            _userName: _myself.name,
            _voteToID: voteToID,
            _voteToName: voteToName
        });
        //隐藏投票
        $scope.isDisplayVote = 0;
        //重置定时器
        initLeaveTime();
    };

    //显示玩家信息
    $scope.faceMouseOver = function (userID) {
        $scope.isDisplayInfo[userID] = 1;
    };

    //隐藏玩家信息
    $scope.faceMouseOut = function (userID) {
        $scope.isDisplayInfo[userID] = 0;
    };

    //鬼猜词
    $scope.submitGuessWord = function () {
        //socket
        if ($scope.obGuessWord != '') {
            socket.emit('guessWord', {
                _word : $scope.obGuessWord,
                _roomName : $scope.curRoom,
                _userName : _myself.name,
                _userID : _myself.systemid
            });
        }
    };

    //死后留遗言
    $scope.submitLeaveMsg = function () {
        //socket
        if ($scope.obLeaveMsg != '') {
            socket.emit('lastWord', {
                _lastWord : $scope.obLeaveMsg,
                _roomName : $scope.curRoom,
                _userName : _myself.name,
                _userID : _myself.systemid
            });
        }
    };

    //为游戏添加词语
    $scope.submitAddWord = function () {
        var reg = /[,\.，';"\/\\]/ig;
        if (!$scope.obAddWord.words || !$scope.obAddWord.feature) {
            showErrTips("表单不能为空");
            return false;
        } else if (reg.test($scope.obAddWord.words) || reg.test($scope.obAddWord.feature)) {
            showErrTips("你输入的内容包含特殊字符，请检查重新输入");
            return false;
        } else {
            var _words = $scope.obAddWord.words.replace(/\s{2,}/ig, " ").split(" ");
            var _feature = $scope.obAddWord.feature;
            $http.post('/subjects/addSubject', {words : _words, feature : _feature}).success(function (data) {
                if(data.repeatMark === 0){
                    showSystemTips("恭喜添加词语成功");
                    $scope.obAddWord = {};
                } else if(data.repeatMark === 1){
                    //showErrTips("以下词语在数据库中已经存在：" + data.repeatWords);
                    showSystemTips("恭喜添加词语成功");
                    $scope.obAddWord = {};
                } else {
                    showErrTips("添加失败，请重试");
                }
            }).error(function (data) {
                //showErrTips("添加失败，请重试");
            });
        }
    };

    //添加好友
    $scope.addFriend = function (systemid, username) {
        var yourFriend = {
            username : username,
            systemid : systemid,
            selfName : _myself.name,
            selfId : _myself.systemid
        };
        $http.post('/add_friend/add', yourFriend).success(function (data, status, headers, config) {
            //{userName : "zhoonchen", "systemid" : "nodegame232232323"}
            var _data = data.data;
            if (typeof _data == "string") {
                //显示错误信息
                showErrTips(_data);
            } else {
                if (_data.name && _data.systemid) {
                    $scope.friendList.push({
                        name : _data.name,
                        systemid : _data.systemid
                    });
                } else {
                    //显示错误信息
                    showErrTips("添加好友失败");
                }
                //重置好友列表
                initFrientMsg();
                //系统信息
                showSystemTips("成功添加" + _data.name + "为好友");
                //重置session
                sessionStorage.set('friendList', $scope.friendList);
                //update isYourFriend
                $scope.isYourFriend[_data.systemid] = 1;
            }
        }).error(function (data, status, headers, config) {
            //显示错误信息
            showErrTips("添加好友失败");
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
        $http.post('/add_friend/remove', yourFriend).success(function (data, status, headers, config) {
            var _data = data.data;
            if (typeof _data == "string") {
                //显示错误信息
                showErrTips(_data);
            } else {
                if (_data.name && _data.systemid) {
                    for (var i = 0; i < $scope.friendList.length; i++) {
                        if ($scope.friendList[i].name == _data.name) {
                            $scope.friendList.splice(i, 1);
                            break;
                        }
                    };
                } else {
                    //显示错误信息
                    showErrTips("取消好友失败");
                }
                //重置好友列表
                initFrientMsg(_data.systemid);
                //系统信息
                showSystemTips("成功取消好友" + _data.name);
                //重置session
                sessionStorage.set('friendList', $scope.friendList);
                //update isYourFriend
                $scope.isYourFriend[_data.systemid] = 0;
            }
        }).error(function (data, status, headers, config) {
            //显示错误信息
            showErrTips("取消好友失败");
        });
    };

    //离开房间
    $scope.leaveRoom = function () {
        socket.emit('leaveRoom',{_roomName : $scope.curRoom, _userName : _myself.name, _userID : _myself.systemid, _location : $scope.curLocation});
        //离开成功
        socket.on('leaveSuccess',function (data) {
            //游戏重置
            resetGame("leaveRoom");
        });
    };

    //监听来自服务器的Socket

    //是否为空房间
    socket.on('deleteRoom',function (data) {
        var _roomName = data._roomName;
        for (var i = 0; i < $scope.roomList.length; i++) {
            if ($scope.roomList[i].roomName == _roomName) {
                $scope.roomList.splice(i, 1);
            }
        }
    });
    
    //更新房间内玩家
    socket.on('updateRoomMember',function (data) {
        var _member = data._list;
        var _type = data._type;
        $scope.curPlayerNum = 1;
        //重置当前玩家数组
        initPlayerList();
        //把服务器传来的信息赋值给本地变量
        var _length = _member.length;
        for (var i = 0; i < _length; i++) {
            $scope.playerList[i].isOn = 1;
            $scope.playerList[i].num = $scope.curPlayerNum++;
            $scope.playerList[i].info = _member[i];
            $scope.isPlayerReady[_member[i].systemID] = _member[i].isPrepare;
        }
        //第二次排序
        for (var i = 0; i < _member.length; i++) {
            if ($scope.playerList[i].info.systemID != _myself.systemid) {
                $scope.playerList.push($scope.playerList.shift());
                i--;
            } else {
                break;
            }
        }
        //join room
        if (_type == 0) {}
        //leave room
        if (_type == 1) {}
        //prepare game
        if (_type == 2) {}
    });

    //更新票数
    socket.on('updateVoteCount',function (data) {
        var _voteCount = data._count;
        for (var _playID in _voteCount) {
            $scope.playVoteCount[_playID] = _voteCount[_playID];
        }
    });

    //收到房间列表时
    socket.on('onRoomList',function (data) {
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

    //其他人创建房间时
    socket.on('newRoom',function (data) {
        $scope.roomList.push({
            roomName : data._roomName
        });
    });

    //更新所有房间内桌子的状态
    socket.on('updateRoomStatus',function (data) {
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
    socket.on('gameStart',function (data) {
        $scope.isGameStart = 1;
        $scope.sysMessage.push('游戏开始');
        socket.emit('getIdentity',{_userName : _myself.name, _roomName : $scope.curRoom, _userID : _myself.systemid});
        audioRoute("begin", 0, 16000)
    });

    //玩家猜词错误
    socket.on('guessWordFail', function (data) {
        showSystemTips(data.msg);
        //出局
        $scope.isVoteOut[data._userID] = 1;
    });

    //玩家的遗言
    socket.on('onlastWord', function (data) {
        var lastWord = data._lastWord;
        var userName = data._userName;
        showSystemTips('玩家［' + userName + '］遗言 : ' + lastWord);
        $scope.sysMessage.push('玩家［' + userName + '］遗言 : ' + lastWord);
    })
    
    //游戏结束
    socket.on('gameOver',function (data) {
        $timeout(function () {
            //系统信息
            showSystemTips(data.msg);
        },1500);
        //重置游戏
        resetGame("gameOver");
        audioRoute("over", 3000);
    });

    //游戏结束返回的数据
    socket.on('gameOverResult',function (data) {
        $scope.gameOverInfo = data._result;
        $timeout(function () {
            //弹出框
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
        var turn = data._userNum;
        if(userName == _myself.name){
            //time leave
            timeLeave('say');
            $scope.isYourTurn = 1;
        }
        debugger;
        console.log(turn);
        audioRoute(turn, 500);
    });

    //开始投票
    socket.on('startVote',function(data){
        $scope.isDisplayVote = 1;
        $scope.isDisplayVoteCount = 1;
        //系统信息
        showSystemTips("发言结束,请开始投票");
        initLeaveTime();
        timeLeave('vote');
    });

    //玩家出局
    socket.on('voteOut',function(data){
        //init VoteOut
        $scope.isVoteOut[data._userID] = 1;
        //init VoteCount
        $scope.isDisplayVoteCount = 0;
        //重置票数
        resetVoteCount();
        audioRoute("die", 200);
    });

    //进入pk状态
    socket.on('pkTurn', function (data) {
        //_userName : vote_data.max_vote_name
        var member = data._userName,
            _name = '玩家 : ';
        for (var i=0; i < member.length; i++) {
            _name += member[i] + ' , ';
        }
        _name += '票数相等，现在进入PK环节，请票数相等的玩家按顺序发言';
        //系统信息
        showSystemTips(_name);
        $scope.sysMessage.push(_name);
        //init VoteOut
        $scope.isVoteOut[data._userID] = 1;
        //init VoteCount
        $scope.isDisplayVoteCount = 0;
        //重置票数
        resetVoteCount();
        audioRoute("pk", 200, 15000);
    })

    //系统消息
    socket.on('Message',function (data) {
        if (data.type == 4) {
            //显示发言信息
            showSayTips(data.msg);
        }
        if (data.type == 8 || data.type == 7 || data.type == 5 || data.type == 2 || data.type ==1) {
            $timeout(function () {
                //系统信息
                showSystemTips(data.msg);
            }, 1000);
        }
        $scope.sysMessage.push(data.msg);
    });

    //错误消息
    socket.on('err',function(data){
        if (data.type == 4 || data.type == 3 || data.type == 2 || data.type == 1 || data.type == -1) {
            //显示错误信息
            showErrTips(data.msg);
        };
        $scope.sysMessage.push(data.msg);
    });
}
//
indexCtrl.$inject = ['$scope', '$http', '$location', '$timeout', '$compile', 'socket', 'localStorage', 'sessionStorage', 'global'];

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
