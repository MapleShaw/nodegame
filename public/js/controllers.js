'use strict';

/*loginOut Controllers */
function loginOutController($scope, $http, $routeParams, $location) {
  $scope.loginOut = function(){
		$http.get('/login/loginout').success(function(data, status, headers, config){
			//do something if return success
			
			$location.path('/');
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
			//$location.path('/');
			$location.reload();
		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
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
		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
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
	register controller
*/
function chatCtrl ($scope, $http, socket, global) {
	//produce the only "id"
	var _id = '';
	for (var i = 0; i < 10; i++) {
		_id += Math.ceil(Math.random()*9);
	}
	_id = _id + new Date().getTime();

	$scope.id = _id;

	//send id to server
	socket.emit('set nickname', _id);

    socket.on('ready', function () {
       //do something if server return ready
    });

    var chat = document.getElementById('chat');
    function _scrollTop () {
	    chat.scrollTop = chat.scrollHeight;
    }
    

    //get the data
    $scope.msgs = [];
    socket.on('chat_usermsg', function (data) {
       //do something if someone send "data" to you
       var data = eval(data);
       $scope.msgFrom = data.from;
       $scope.msgs.push({
			name : data.from + ' : ',
			time : global._getTime(),
			cnt : data.msg
		});
        setTimeout(_scrollTop, 10);
    });
    socket.on('chat_errmsg', function (data) {
    	//if the user is not exist
    	var data = eval(data);
       	//$scope.msgFrom = data.from;
       	$scope.msgs.push({
			name : data.from,
			time : global._getTime(),
			cnt : data.msg
		});
		setTimeout(_scrollTop, 10);
    })

    //the function of sending message
    var sendTo;
    var sendText;
    $scope.sendMsg = function(){
        sendTo = $scope.userId;
        sendText = $scope.userTxt;
        $scope.flag = true;
        $scope.msgFrom = sendTo;
        if(sendTo == ''){
            socket.emit('chat_publicmsg',sendText);
        }else{
            socket.emit('chat_privatemsg',{
            	'sendTo' : sendTo,
            	'sendText' : sendText
            });
        }
        
 	}
 	socket.on('chat_have_receive', function (data) {
    	//if error
    	var data = eval(data);
    	$scope.flag = data.flag;

        if ($scope.flag) {
        	$scope.msgs.push({
				name : 'Me : ',
				time : global._getTime(),
				cnt : sendText
			});
			setTimeout(_scrollTop, 10);
			//
			$scope.userTxt = '';
        }
        _scrollTop();
    });
}
chatCtrl.$inject = ['$scope', '$http', 'socket', 'global'];


/*
	index controller
*/
function indexCtrl($scope){
	//
	//
	
}
indexCtrl.$inject = ['$scope'];

/*
	gameRule controller
*/
function gameRuleCtrl ($scope) {
	// body...
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
