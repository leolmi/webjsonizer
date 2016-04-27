'use strict';

angular.module('webjsonizerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/test', {
        templateUrl: 'app/test/test.html',
        controller: 'TestCtrl'
      });
  });
