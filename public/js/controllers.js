'use strict';

/* Controllers */

//socket
function AppCtrl($scope, socket) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });
}

//login controller
function loginCtrl($scope, $http, $routeParmas, $location){

	$scope.loginForm = {};

	$scope.loginSubmit = function(){
		$http.post('/login/post').success(function(data, status, headers, config){
			$scope.data = data;	
		}).error(function(data, status, headers, config){
			$scope.error = error;
		});
	};
}
loginCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];

//register controller
function registerCtrl($scope, $http, $routeParmas, $location){

	$scope.registerForm = {};

	$http.post('/register/post', $scope.registerForm).success(function(data, status, headers, config){
		$scope.data = data;	
	}).error(function(data, status, headers, config){
		$scope.error = error;
	});

	$http.post('registerCheck', $scope.registerForm).success(function(data){
		//.......
	})
}
registerCtrl.$inject = ['$scope', '$http', '$routeParams', '$location'];





function MyCtrl1($scope, socket) {
  socket.on('send:time', function (data) {
    $scope.time = data.time;
  });
}
MyCtrl1.$inject = ['$scope', 'socket'];


function MyCtrl2() {
}
MyCtrl2.$inject = [];
