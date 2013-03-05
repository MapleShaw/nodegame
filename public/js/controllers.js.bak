'use strict';

/* Controllers */

/*
	login controller
*/
function loginCtrl($scope, $http, $routeParams, $location){

	$scope.loginForm = {};

	//submit function
	$scope.loginPost = function(){
		$http.post('/login/post').success(function(data, status, headers, config){
			//do something if return success
			//$scope.successMsg = data;	
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
			//$scope.successMsg = data;	
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
		}).error(function(data, status, headers, config){
			//do something if return error
			//$scope.errorMsg = error;
		});
	};
	
}
registerCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

/*
	register controller
*/
function chatCtrl ($scope, $http, $routeParams, $location, socket) {
	//produce the only "id"
	var _id = '';
	for (var i = 0; i < 20; i++) {
		_id += Math.ceil(Math.random()*9);
	}
	$scope.id = _id;

	$scope.msgs = [];
	socket.on(_id, function (data) {
		$scope.msgs.push({
			username : data.f_id,
			time : new Date(),
			cnt : data.cnt
		});
	})

	$scope.userId = '';
	$scope.invite = function () {
		//console.log($scope.userId);
		socket.emit('invite friend', {
			f_id : $scope.userId,
			m_id : _id,
			cnt : "hello how are you."
		})
	}
}
chatCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'socket'];


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
