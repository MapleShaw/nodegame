'use strict';

/* Controllers */

/*
	login controller
*/
function loginCtrl($scope, $http, $routeParmas, $location){

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
function registerCtrl($scope, $http, $routeParmas, $location){

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
