'use strict';


// Declare app level module which depends on filters, and services
/*
angular.module('wReader', ['myApp.filters', 'wReader.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: MyCtrl1});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
*/ 

var wReader = angular.module('wReader', ['wReader.filters', 'wReader.services', 'wReader.directives']);


// wReader.config(['$routeProvider', function($routeProvider) {
// 		$routeProvider.otherwise({controller: AppController});
// 	}]);
