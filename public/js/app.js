'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    	$routeProvider.
		when('/', {
			templateUrl : 'partials/index',
			controller : indexCtrl
		}).
		when('/index', {
			templateUrl : 'partials/index',
			controller : indexCtrl
		}).
		when('/login', {
			templateUrl : 'partials/login',
			controller : loginCtrl
		}).
		when('/register', {
			templateUrl : 'partials/register',
			controller : registerCtrl
		}).
		when('/gameRule', {
			templateUrl : 'partials/gameRule',
			controller : gameRuleCtrl
		}).
		when('/contact', {
			templateUrl : 'partials/contact',
			controller : contactCtrl
		}).
		when('/about', {
			templateUrl : 'partials/about',
			controller : aboutCtrl
		}).
		when('/chat', {
			templateUrl : 'partials/chat',
			controller : chatCtrl
		}).
		otherwise({redirectTo: '/'});
	$locationProvider.html5Mode(true);
  }]);
