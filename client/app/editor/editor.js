/**
 * Created by Leo on 20/05/2015.
 */
'use strict';

angular.module('webjsonizerApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/editor', {
        templateUrl: 'app/editor/editor.html',
        controller: 'EditorCtrl'
      });
  });
