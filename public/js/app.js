'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    	$routeProvider.
		when('/', {
			templateUrl : 'partials/index',
			controller : indexCtrl
		}).
		when('/login', {
			templateUrl : 'partials/login',
			controller : loginCtrl
		}).
		when('register', {
			templateUrl : 'partials/register',
			controller : registerCtrl
		}).
		when('/view1', {
			templateUrl : 'partials/partial1',
			controller : MyCtrl1
		}).
		when('/view2', {
			templateUrl : 'partials/partial2',
			controller: MyCtrl2
		}).
		otherwise({redirectTo: '/'});
	$locationProvider.html5Mode(true);
  }]);
